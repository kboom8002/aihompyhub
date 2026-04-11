'use server';

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin for DB mutations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Gemini initialization
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Interfaces
export interface RawIntakeQuestion {
  id: string;
  tenant_id: string | null;
  industry_type: string;
  text: string;
  source: string;
  count: number;
  status: string;
  created_at: string;
}

export interface ClusteringResult {
  proposed_id: string;
  canonical_intent: string;
  category: string;
  matched_raw_count: number;
}

/**
 * 1. AI Clustering Action
 * Groups raw strings into an optimal Canonical Question.
 */
export async function runGeminiClusteringAction(rawQuestions: RawIntakeQuestion[], industryType: string = 'skincare'): Promise<{ success: boolean; data?: ClusteringResult[]; error?: string }> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    const questionTexts = rawQuestions.map(q => `- ${q.text} (Occurrences: ${q.count})`).join('\n');

    const prompt = `
    You are an expert taxonomy engineer for the ${industryType} industry.
    Your system is receiving scattered, raw questions from clients.
    Please analyze the following raw questions and cluster them into formal "Canonical Intents" (standardized standard operating procedures or broad questions).

    Raw Questions:
    ${questionTexts}

    Respond strictly with a JSON object in this format (no markdown):
    {
      "clusters": [
        {
          "proposed_id": "CQ_XXX",
          "canonical_intent": "A formal, high-quality generalization of the question",
          "category": "Broad category name (e.g. Procedure, Post-Care, Pricing)",
          "matched_raw_count": 0 // Sum of occurrences you grouped here
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
         responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return { success: true, data: parsed.clusters || [] };
  } catch (error: any) {
    console.error("AI Clustering Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Approve AI Proposal & Create Question Cluster
 * Mutates `question_clusters` table, and marks raw intents as CLUSTERED.
 */
export async function createCanonicalIntentAction(
  tenantId: string, 
  industryType: string, 
  suggestion: ClusteringResult, 
  rawIds: string[]
) {
  try {
    // 1. Insert into question_clusters
    const { data: clusterData, error: clusterErr } = await supabaseAdmin
      .from('question_clusters')
      .insert({
         tenant_id: tenantId,
         cluster_name: suggestion.canonical_intent,
         intent_type: suggestion.category,
         priority_score: suggestion.matched_raw_count
      })
      .select('id')
      .single();

    if (clusterErr) throw new Error(clusterErr.message);

    // 2. Mark raw questions as CLUSTERED
    const { error: markErr } = await supabaseAdmin
      .from('raw_intake_questions')
      .update({ status: 'CLUSTERED' })
      .in('id', rawIds);
      
    if (markErr) throw new Error(markErr.message);

    return { success: true, clusterId: clusterData.id };
  } catch (error: any) {
    console.error("Approve CQ error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. FACTORY ADMIN: Fetch Global Raw Inbox
 */
export async function fetchGlobalRawInbox() {
  try {
      const { data, error } = await supabaseAdmin
          .from('raw_intake_questions')
          .select('*')
          .eq('status', 'UNSORTED')
          .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      return { success: true, data };
  } catch (e: any) {
      return { success: false, error: e.message };
  }
}

/**
 * 5. FACTORY ADMIN: Approve & Distribute
 * Creates cluster, marks as clustered.
 */
export async function createGlobalCanonicalIntentAction(
  industryType: string, 
  suggestion: ClusteringResult, 
  rawIds: string[]
) {
  try {
    // 1. Insert into question_clusters (No tenant_id means GLOBAL PLATFORM STANDARD)
    const { data: clusterData, error: clusterErr } = await supabaseAdmin
      .from('question_clusters')
      .insert({
         tenant_id: null,
         cluster_name: suggestion.canonical_intent,
         intent_type: industryType, // Using intent_type to store industry mapping for SSoT
         priority_score: suggestion.matched_raw_count
      })
      .select('id')
      .single();

    if (clusterErr) throw new Error(clusterErr.message);

    // 2. Mark raw questions as CLUSTERED
    const { error: markErr } = await supabaseAdmin
      .from('raw_intake_questions')
      .update({ status: 'CLUSTERED' })
      .in('id', rawIds);
      
    if (markErr) throw new Error(markErr.message);

    return { success: true, clusterId: clusterData.id };
  } catch (error: any) {
    console.error("Approve Global CQ error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 6. FACTORY ADMIN: Push to Tenants (Top-down)
 */
export async function pushClusterToTenantsAction(clusterId: string, industryType: string) {
  try {
    // 1. Get all tenants in industry
    const { data: tenants, error: tErr } = await supabaseAdmin
       .from('tenants')
       .select('id')
       .eq('industry_type', industryType);

    if (tErr) throw new Error(tErr.message);
    if (!tenants || tenants.length === 0) return { success: true, pushedCount: 0 };

    // 2. Insert draft 'topics' for each tenant
    const { data: cluster } = await supabaseAdmin.from('question_clusters').select('cluster_name').eq('id', clusterId).single();
    if (!cluster) throw new Error("Cluster not found");

    const topicsToInsert = tenants.map(t => ({
       tenant_id: t.id,
       cluster_id: clusterId,
       title: cluster.cluster_name,
       content_status: 'draft' // The "homework" task
    }));

    const { error: insertErr } = await supabaseAdmin.from('topics').insert(topicsToInsert);
    if (insertErr) throw new Error(insertErr.message);

    return { success: true, pushedCount: tenants.length };
  } catch (e: any) {
    console.error("Push cluster error:", e);
    return { success: false, error: e.message };
  }
}

/**
 * 7. TENANT ADMIN: Fetch Global QIS Pool (Bottom-up Pull)
 */
export async function fetchIndustryQuestionPool(industryType: string, tenantId: string) {
  try {
     // Get all global clusters for this industry
     const { data: clusters, error: err } = await supabaseAdmin
        .from('question_clusters')
        .select('*')
        .is('tenant_id', null)
        .eq('intent_type', industryType);
     
     if (err) throw new Error(err.message);

     // Check which ones the tenant already pulled
     const { data: myTopics } = await supabaseAdmin
        .from('topics')
        .select('cluster_id')
        .eq('tenant_id', tenantId);

     const pulledSet = new Set((myTopics || []).map(t => t.cluster_id));

     const pool = (clusters || []).map(c => ({
        ...c,
        isPulled: pulledSet.has(c.id)
     }));

     return { success: true, data: pool };
  } catch (e: any) {
     return { success: false, error: e.message };
  }
}

/**
 * 8. TENANT ADMIN: Pull Cluster
 */
export async function pullClusterToTenantAction(tenantId: string, clusterId: string, clusterName: string) {
  try {
     // Insert purely draft topic
     const { error } = await supabaseAdmin.from('topics').insert({
        tenant_id: tenantId,
        cluster_id: clusterId,
        title: clusterName,
        content_status: 'draft'
     });
     if (error) throw new Error(error.message);
     return { success: true };
  } catch (e: any) {
     return { success: false, error: e.message };
  }
}


/**
 * 3. Fetch Raw Inbox
 */
export async function fetchRawInbox(tenantId: string, industryType: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('raw_intake_questions')
            .select('*')
            .eq('status', 'UNSORTED')
            .or(`tenant_id.eq.${tenantId},industry_type.eq.${industryType}`)
            .order('created_at', { ascending: false });
        
        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
