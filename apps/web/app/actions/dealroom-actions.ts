'use server';

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Helper to get UUID from slug
async function getTenantIdFromSlug(slugOrId: string) {
    if (slugOrId.length === 36 && slugOrId.includes('-')) return slugOrId; // Assuming UUID format
    const { data } = await supabaseAdmin.from('tenants').select('id').eq('slug', slugOrId).single();
    if (data) return data.id;
    throw new Error('Tenant not found');
}

/**
 * 1. Fetch Inquiries for the CRM Deal Room
 */
export async function fetchInquiriesAction(tenantSlug: string) {
    try {
        const tenantId = await getTenantIdFromSlug(tenantSlug);

        const { data, error } = await supabaseAdmin
            .from('inquiries')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * 2. Run Pre-Visit Coach Analysis
 */
export async function runPreVisitCoachAction(tenantSlug: string, inquiryId: string) {
    try {
        const tenantId = await getTenantIdFromSlug(tenantSlug);

        // A. Load raw inquiry
        const { data: inquiry, error: inqErr } = await supabaseAdmin.from('inquiries').select('*').eq('id', inquiryId).single();
        if (inqErr || !inquiry) throw new Error("Inquiry not found.");
        
        // B. Fetch Tenant's Knowledge Graph (SSoT Topic Hub & Answers)
        const { data: topics } = await supabaseAdmin.from('topics')
            .select('title, json_payload')
            .eq('tenant_id', tenantId)
            .eq('content_status', 'published')
            .limit(10);
            
        let knowledgeContext = "==== 우리 브랜드의 지식(SSoT) 베이스 ====\n";
        topics?.forEach(t => {
            knowledgeContext += `- [${t.title}]: ${t.json_payload?.body?.substring(0, 300) || ''}\n`;
        });

        // C. System Prompt for Pre-Visit Coach
        const systemPrompt = `
당신은 고관여 서비스(예: 피부과, 부동산 등) 분야의 최고 수석 상담 코치(Pre-Visit Coach)입니다.
상담사가 고객과 통화하기 전에, 고객의 길고 두서없는 문의를 읽고 '상담 브리핑(Briefing)'을 JSON으로 도출해야 합니다.

출력 JSON 형식:
{
  "intents": ["시술 단가 문의", "통증 우려"],
  "matched_ssot": "고객이 우려하는 부분에 대해 우리 지식스토어에서 찾은 팩트 매칭 1~2줄",
  "coach_recommendation": "이 고객을 확실히 클로징(전환)하기 위해 상담사가 첫 마디로 꺼내면 좋은 전술적인 조언"
}

반드시 순수 JSON 문자열만 리턴하세요 (\`\`\`json 등의 마크다운 불필요).
`;

        const userPrompt = `
${knowledgeContext}

==== 고객 원시 문의내역 ====
고객명: ${inquiry.customer_name}
문의내용: ${inquiry.raw_message}

위 고객의 문의를 분석하여, JSON 구조체로 브리핑을 보고하세요.
`;

        // D. Request Gemini
        const response = await ai.models.generateContent({
             model: 'gemini-2.5-pro',
             contents: systemPrompt + "\n\n" + userPrompt,
        });

        const resultText = response.text || "{}";
        const cleanJsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResult = JSON.parse(cleanJsonStr);

        // E. Update DB with Structured Analysis
        const { error: updErr } = await supabaseAdmin.from('inquiries').update({
             ai_structured_brief: jsonResult,
             status: 'structured'
        }).eq('id', inquiryId);
        
        if (updErr) throw new Error(updErr.message);

        return { success: true, ai_brief: jsonResult };
    } catch (e: any) {
        console.error("AI Coach Error:", e);
        return { success: false, error: e.message };
    }
}

/**
 * 3. Manual HITL Update action
 * Allows admin staff to edit the raw message or AI structured brief manually.
 */
export async function updateInquiryManualAction(
    tenantId: string,
    inquiryId: string,
    updates: { raw_message?: string; ai_structured_brief?: any }
) {
    try {
        const { error } = await supabaseAdmin.from('inquiries')
            .update(updates)
            .eq('id', inquiryId)
            .eq('tenant_id', tenantId);

        if (error) throw new Error(error.message);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
