'use server';

import { createClient } from '@supabase/supabase-js';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const TARGET_LANGS = ['en', 'ja'];

/**
 * Batch translates a set of text/payload data to targeted languages using Gemini.
 */
export async function batchTranslateContentAction(
  tenantId: string,
  tableName: 'topics' | 'answer_cards' | 'universal_content_assets' | 'brand_profiles',
  recordId: string,
  fieldsToTranslate: Record<string, string> // e.g., { title: "Title", content: "Some long text" }
) {
    try {
        console.log(`Starting batch translation for ${tableName} ID: ${recordId}`);
        const translationDrafts: Record<string, any> = {};

        // Fetch current record to preserve existing translations
        const { data: record, error: fetchErr } = await supabaseAdmin
            .from(tableName)
            .select('translations')
            .eq('id', recordId)
            .single();

        if (fetchErr) throw new Error(`Failed to fetch record: ${fetchErr.message}`);
        
        const existingTranslations = record?.translations || {};

        for (const targetLang of TARGET_LANGS) {
            let translatedFields = {};
            
            // System instruction for the LLM
            const systemPrompt = `You are a professional localization expert for a premium global brand. 
Translate the provided JSON content into ${targetLang.toUpperCase()} language.
Ensure the translation sounds natural, professional, and retains any original formatting, line breaks, or Markdown syntax.
Respond ONLY with a valid JSON document containing the translated keys and values. Do not wrap with markdown ticks if it breaks JSON parsing.`;

            const prompt = `Translate the following JSON object values to ${targetLang}:\n\n${JSON.stringify(fieldsToTranslate, null, 2)}`;

            const { text } = await generateText({
                model: google('gemini-2.5-pro'),
                system: systemPrompt,
                prompt: prompt,
                temperature: 0.2
            });

            try {
                // Remove potential markdown wrappers like ```json ... ```
                const cleanText = text.replace(/```json\n?|\n?```/gi, '').trim();
                translatedFields = JSON.parse(cleanText);
            } catch (err) {
                console.error('Failed to parse translation JSON', err, text);
                return { success: false, error: 'Failed to parse AI translation output.' };
            }

            translationDrafts[targetLang] = translatedFields;
        }

        // Merge with existing translations
        const updatedTranslations = {
            ...existingTranslations,
            ...translationDrafts
        };

        // Update database
        const { error: updateErr } = await supabaseAdmin
            .from(tableName)
            .update({ translations: updatedTranslations })
            .eq('id', recordId);

        if (updateErr) throw new Error(`Failed to save translations: ${updateErr.message}`);

        revalidatePath(`/tenant/${tenantId}`);
        
        return { success: true, updatedTranslations };
    } catch (e: any) {
        console.error('batchTranslateContentAction Error:', e);
        return { success: false, error: e.message || 'Unknown error during translation' };
    }
}
