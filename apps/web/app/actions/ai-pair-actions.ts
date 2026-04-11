'use server';

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// 1. Fetch Active Prompt (Fallback: Tenant Override -> Global Default)
export async function fetchActivePromptAction(tenantId: string | null, promptKey: string) {
    try {
        // Fetch Global
        const { data: globalPrompt } = await supabaseAdmin.from('prompt_templates').select('system_prompt').eq('prompt_key', promptKey).is('tenant_id', null).single();
        
        let activePrompt = globalPrompt?.system_prompt || '';

        // If Tenant, check for override
        if (tenantId) {
            const { data: tenantPrompt } = await supabaseAdmin.from('prompt_templates').select('system_prompt').eq('prompt_key', promptKey).eq('tenant_id', tenantId).single();
            if (tenantPrompt) activePrompt = tenantPrompt.system_prompt;
        }

        return { success: true, activePrompt };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// 2. Save Prompt (Supports both Global factory save, and Tenant override save)
export async function savePromptAction(tenantId: string | null, promptKey: string, systemPrompt: string) {
    try {
        // Upsert behavior
        const { data } = await supabaseAdmin.from('prompt_templates').select('id').eq('prompt_key', promptKey).is('tenant_id', tenantId).single();
        
        if (data) {
            // Update
            await supabaseAdmin.from('prompt_templates').update({ system_prompt: systemPrompt }).eq('id', data.id);
        } else {
            // Insert
            await supabaseAdmin.from('prompt_templates').insert({ tenant_id: tenantId, prompt_key: promptKey, system_prompt: systemPrompt });
        }
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// 3. E-to-E Generation Pipeline
export async function generateAiPairDraftAction(tenantId: string, topicId: string, promptKey: string) {
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing");

        // A. Load Content (Topic)
        const { data: topic } = await supabaseAdmin.from('topics')
            .select('*, question_clusters(cluster_name, intent_type)')
            .eq('id', topicId)
            .single();
        if (!topic) throw new Error("Topic not found.");
        
        const qisIntent = topic.question_clusters?.cluster_name || topic.title;
        const qisIntentType = topic.question_clusters?.intent_type || 'general';

        // B. Context Gathering (Simple RAG simulation: take 2 latest published topics as context)
        const { data: knowledgeGraph } = await supabaseAdmin.from('topics')
             .select('title, json_payload')
             .eq('tenant_id', tenantId)
             .eq('content_status', 'published')
             .limit(2);
             
        let contextKnowledge = "===== 지식 그래프 (과거 작성 문서 일부) =====\n";
        knowledgeGraph?.forEach(k => {
             contextKnowledge += `- ${k.title}: ${k.json_payload?.body?.substring(0, 200) || '내용 없음'}...\n`;
        });
        
        // C. Fetch System Prompt
        const promptRes = await fetchActivePromptAction(tenantId, promptKey);
        if (!promptRes.success || !promptRes.activePrompt) {
             throw new Error("System prompt not found for " + promptKey);
        }

        // QIS Compliance Guardrails (Phase 2)
        let complianceGuardrails = "";
        if (qisIntentType === 'medical' || qisIntentType === 'safety') {
            complianceGuardrails = "\n[의료법/안전 가드레일 (필수 준수)]: 이 주제는 의료/안전 카테고리입니다. '부작용 0%', '통증 없음', '100% 영구적', '국내 최고/최상'과 같은 허위, 과장, 절대적 표현을 작성하지 마십시오. 부작용이 있을 수 있음을 간접적으로라도 인지시켜야 합니다.";
        } else if (qisIntentType === 'pricing' || qisIntentType === 'sales') {
             complianceGuardrails = "\n[영업/가격 가드레일 (필수 준수)]: 이 주제는 가격/영업 카테고리입니다. '세상에서 제일 싼', '원가 수준' 등의 기만적 표현을 삼가고, '개인의 상태에 따라 추가 비용이 발생할 수 있습니다'를 안내하세요.";
        }

        // D. Construct User Prompt
        const userPrompt = `
지금 작성해야 할 주제(QIS Intent)는 다음과 같습니다:
[ ${qisIntent} ] (분류: ${qisIntentType})
${complianceGuardrails}

다음은 우리 테넌트의 기존 지식(데이터베이스) 일부입니다. 참고할 내용이 있다면 브랜드 톤앤매너를 유지하는 데 사용하세요:
${contextKnowledge}

위 시스템 프롬프트(AEO 규칙)에 맞추어 마크다운(HTML 태그를 섞어 사용 가능)으로 본문을 생성해 주세요.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using strong model for content generation
            contents: promptRes.activePrompt + "\n\n" + userPrompt,
        });

        return { success: true, result: response.text };
    } catch (e: any) {
        console.error("AI-Pair error:", e);
        return { success: false, error: e.message };
    }
}
