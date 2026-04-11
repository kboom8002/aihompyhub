'use server';

import { createClient } from '@supabase/supabase-js';
import { generateObject, embed } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const intentSchema = z.object({
  primary_intent: z.enum(['information_seeking', 'consultation_request', 'purchase_intent', 'problem_solving', 'other']),
  budget_range: z.string().optional().describe('Estimated budget range if mentioned (e.g. $10K-$50K)'),
  urgency: z.enum(['low', 'medium', 'high', 'immediate']).describe('How urgent is the user requesting response or solution'),
  core_requirement: z.string().describe('A 1-sentence summary of the required capability or solution'),
  deal_probability_score: z.number().min(0).max(100).describe('Estimated score 0-100 indicating likelihood of converting to a B2B/B2C deal based on the memo content'),
  industry_keywords: z.array(z.string()).describe('List of 3-5 keywords extracted for semantic SEO/matching')
});

export async function submitPodMemoAction(
  userId: string,
  podId: string,
  rawText: string,
  visibility: 'public' | 'private_match'
) {
  try {
    // 1. Generate Structured Intent using Gemini
    const { object: structuredIntent } = await generateObject({
      model: google('gemini-2.5-pro') as any,
      schema: intentSchema,
      prompt: `Analyze the following user memo and extract its structured business intent, requirements, and deal potential.\n\nMemo:\n"${rawText}"`,
      system: `You are an expert matchmaking AI that identifies B2B/B2C deal probabilities and specific capability requirements from unstructured user notes. Be highly accurate in analyzing the text.`,
    });

    // 2. Generate Semantic Embedding Vector for the raw text
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004') as any,
      value: rawText,
    });

    // 3. Insert into Database
    const { data: memoData, error: insertErr } = await supabaseAdmin
      .from('pod_memos')
      .insert({
        pod_id: podId,
        sender_id: userId,
        raw_text: rawText,
        structured_intent: structuredIntent,
        embedding: embedding,
        visibility: visibility,
      })
      .select('id')
      .single();

    if (insertErr) throw new Error(insertErr.message);

    revalidatePath('/hub');

    return { success: true, memoId: memoData.id, structuredIntent };
  } catch (err: any) {
    console.error('Error in submitPodMemoAction:', err);
    return { success: false, error: err.message };
  }
}

export async function getPodMatchmakingAction(memoId: string, industryType: string, limit = 5) {
  try {
    const { data: memo, error: fetchErr } = await supabaseAdmin
      .from('pod_memos')
      .select('embedding')
      .eq('id', memoId)
      .single();

    if (fetchErr) throw new Error('Memo not found');

    const { data: matches, error: rpcErr } = await supabaseAdmin.rpc('match_memo_to_tenant_assets', {
      query_embedding: memo.embedding,
      target_industry: industryType,
      match_threshold: 0.3,
      match_count: limit
    });

    if (rpcErr) throw new Error(rpcErr.message);

    return { success: true, matches };
  } catch (err: any) {
    console.error('Error in getPodMatchmakingAction:', err);
    return { success: false, error: err.message };
  }
}

export async function ensureVerticalPodAction(industry: string) {
  let { data: pod } = await supabaseAdmin.from('vertical_pods').select('id').eq('industry_type', industry).single();
  if (!pod) {
     const { data: newPod, error } = await supabaseAdmin.from('vertical_pods').insert({ industry_type: industry, title: industry + ' Hub' }).select('id').single();
     if (error || !newPod) return null;
     return newPod.id;
  }
  return pod.id;
}
