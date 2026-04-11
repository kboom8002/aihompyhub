'use server';

import { createClient } from '@supabase/supabase-js';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const TARGET_LANGUAGES = ['en', 'ja', 'zh', 'es', 'ko'];

/**
 * Sends a message to the deal room and automatically generates translations.
 * 
 * @param inquiryId The ID of the existing inquiry/deal room thread
 * @param senderType Who is sending the message ('customer' | 'tenant')
 * @param content The original text content
 * @param baseLanguage The language the sender wrote the text in (e.g. 'ko' for tenant, 'en' for customer)
 * @param senderId Auth UUID of the sender (customer mapping or tenant admin)
 */
export async function sendDealRoomMessageAction(
    inquiryId: string | null,
    tenantId: string,
    senderType: 'customer' | 'tenant',
    content: string,
    baseLanguage: string = 'ko',
    senderId?: string
) {
    try {
        console.log(`Sending Deal Room Message. Existing ID: ${inquiryId}`);
        
        // 1. Generate translations async
        const translationDrafts: Record<string, string> = {
            [baseLanguage]: content
        };

        const targetLangsToTranslate = TARGET_LANGUAGES.filter(lang => lang !== baseLanguage);

        if (targetLangsToTranslate.length > 0) {
            let translatedObj = {};
            const systemPrompt = `You are an enterprise AI Translator for an omnichannel Live Chat system.
Translate the following single message from its original language (${baseLanguage.toUpperCase()}) into the following languages: ${targetLangsToTranslate.join(', ')}.
Respond ONLY with a valid JSON document containing the language tags as keys. No markdown blocks.`;

            const prompt = `Message: "${content}"`;

            const { text } = await generateText({
                model: google('gemini-2.5-pro'),
                system: systemPrompt,
                prompt: prompt,
                temperature: 0.1
            });

            try {
                const cleanText = text.replace(/```json\n?|\n?```/gi, '').trim();
                translatedObj = JSON.parse(cleanText);
                
                for (const lang of targetLangsToTranslate) {
                    if ((translatedObj as any)[lang]) translationDrafts[lang] = (translatedObj as any)[lang];
                }
            } catch (err) {
                console.error('Failed to parse translation JSON', err, text);
            }
        }

        // 2. Resolve Inquiry ID
        let activeInquiryId = inquiryId;
        if (!activeInquiryId) {
            const { data: newInq, error: inqErr } = await supabaseAdmin.from('inquiries').insert({
                tenant_id: tenantId,
                customer_name: 'Storefront Client',
                status: 'in_progress'
            }).select('id').single();
            if (inqErr) throw new Error('Failed to create deal thread: ' + inqErr.message);
            activeInquiryId = newInq.id;
        }

        // 3. Insert into DB
        const { error: insertErr } = await supabaseAdmin
            .from('deal_messages')
            .insert({
                inquiry_id: activeInquiryId,
                sender_type: senderType,
                sender_id: senderId || null,
                content: content,
                translations: translationDrafts,
                is_read: false
            });

        if (insertErr) throw new Error(`Failed to save message: ${insertErr.message}`);

        await supabaseAdmin
            .from('inquiries')
            .update({ status: 'in_progress', updated_at: new Date().toISOString() })
            .eq('id', activeInquiryId);

        revalidatePath(`/inquiry/${activeInquiryId}`);
        
        return { success: true, inquiryId: activeInquiryId };
    } catch (e: any) {
        console.error('sendDealRoomMessageAction Error:', e);
        return { success: false, error: e.message || 'Unknown error' };
    }
}
