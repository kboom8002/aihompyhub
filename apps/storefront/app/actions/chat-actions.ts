'use server';

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function getTenantIdFromSlug(slugOrId: string) {
    if (slugOrId.length === 36 && slugOrId.includes('-')) return slugOrId;
    const { data } = await supabaseAdmin.from('tenants').select('id').eq('slug', slugOrId).single();
    if (data) return data.id;
    throw new Error('Tenant not found');
}

export type ChatMessage = { role: 'user' | 'model'; text: string };

/**
 * 1. AI Chat Turn Handling
 * Drives the conversation towards extracting name, contact, and specific concerns.
 */
export async function converseWithAgentAction(
    tenantSlug: string, 
    offerId: string | null, 
    history: ChatMessage[], 
    newMessage: string,
    userIdentity?: { name: string, contact: string } | null,
    contextParams?: { type: string, id: string } | null
) {
    try {
        const tenantId = await getTenantIdFromSlug(tenantSlug);
        
        // 1. Fetch Tenant Context
        const { data: tenant } = await supabaseAdmin.from('tenants').select('name').eq('id', tenantId).single();
        let topicContextStr = '';
        
        if (contextParams?.type === 'answer' && contextParams.id) {
             const { data: topic } = await supabaseAdmin.from('topics').select('title, json_payload').eq('id', contextParams.id).single();
             if (topic) {
                 topicContextStr = `\n[고객의 현재 맥락 (방금 읽은 글)]\n제목: ${topic.title}\n내용: ${topic.json_payload?.body?.substring(0, 300) || ''}\n\n위 맥락을 바탕으로 고객이 해당 내용에 대해 잘 이해했는지, 혹은 더 궁금한 점이 있는지 선제적으로 묻고 상담을 부드럽게 시작하세요.`;
             }
        }

        // 2. Fetch RAG Context (SSoT)
        // To empower the agent with real-time knowledge
        const { data: publishedTopics } = await supabaseAdmin.from('topics')
            .select('title, json_payload')
            .eq('tenant_id', tenantId)
            .eq('content_status', 'published')
            .limit(10);
            
        let knowledgeBase = "=== 브랜드 내부 공식 지식 ===\n";
        publishedTopics?.forEach(topic => {
             knowledgeBase += `- [${topic.title}]: ${topic.json_payload?.body?.substring(0, 300) || ''}\n`;
        });

        // 3. User Identity Integration
        const identityContext = userIdentity 
            ? `현재 고객은 시스템에 로그인되어 있으며 이름은 '${userIdentity.name}', 연락처는 '${userIdentity.contact}' 입니다. 이름과 연락처를 묻는 단계를 생략하세요.`
            : `고객의 이름과 연락처는 아직 알 수 없습니다.`;

        // 4. Fetch Global Persona Prompt
        const { data: personaTemplate } = await supabaseAdmin.from('prompt_templates').select('system_prompt').eq('prompt_key', 'chat_consultant_persona').is('tenant_id', null).single();
        const basePersona = personaTemplate?.system_prompt || `
당신은 수석 뷰티 컨설턴트/상담 실장입니다.
방금 고객이 서비스에 관심을 가지고 채팅을 걸었습니다.
당신의 목표는 자연스러운 대화(Turn)를 통해 고객을 접수시키는 것입니다.
규칙:
1. 이름과 연락처를 물어본다. (아직 모르는 경우)
2. 가장 중요한 고민(의도)에 대조적인 지식(SSoT)을 통해 Objection Handling을 진행한다.
3. 충분히 답변이 되었다면 "상담을 접수해 드릴까요?"라고 묻는다.
4. 고객이 최종 접수(동의)하면 "[END_CHAT]" 이라는 특수 문자를 끝에 붙인다.
`;

        const systemPrompt = `
당신은 '${tenant?.name || '우리 브랜드'}'에 소속되어 있습니다.
${basePersona}

${identityContext}
${topicContextStr}

[보유한 공식 지식(SSoT)]
${knowledgeBase}
`;

        const contents = history.map(h => ({
            role: h.role, // 'user' or 'model'
            parts: [{ text: h.text }]
        }));
        
        // Add new user message
        contents.push({ role: 'user', parts: [{ text: newMessage }] });

        const response = await ai.models.generateContent({
             model: 'gemini-2.5-pro',
             config: { systemInstruction: systemPrompt },
             contents: contents as any,
        });

        const textResponse = response.text || '';
        const isComplete = textResponse.includes('[END_CHAT]');
        
        const cleanResponse = textResponse.replace('[END_CHAT]', '').trim();

        return { success: true, reply: cleanResponse, isComplete };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * 2. Finalize Conversation and Export to Deal Room
 */
export async function finalizeInquiryAction(
    tenantSlug: string, 
    offerId: string | null, 
    history: ChatMessage[]
) {
    try {
        const tenantId = await getTenantIdFromSlug(tenantSlug);
        
        const fullTranscript = history.map(h => `${h.role === 'user' ? '고객' : 'AI'}: ${h.text}`).join('\n');

        // Extract Inquiry Data (Deal Room)
        const extractionPrompt = `
다음 고객 상담 대화(Transcript)를 읽고, 아래 정보를 JSON으로만 출력하세요:
- "customer_name": 고객 이름
- "customer_contact": 전화번호나 연락처
- "raw_message": 고객의 우려사항 및 질문을 짧게 하나의 문장으로 요약
- "intents": 고객 의도 배열 (예: ["통증 우려", "가격 문의"])
- "coach_recommendation": 상담 실장이 전화를 걸기 전 알아야 할 대응 요약 (1~2줄)

대화 내역:
${fullTranscript}
`;

        const response = await ai.models.generateContent({
             model: 'gemini-2.5-pro',
             contents: extractionPrompt,
        });

        const resultText = response.text || "{}";
        const cleanJsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResult = JSON.parse(cleanJsonStr);

        const aiStructuredBrief = {
             intents: jsonResult.intents || [],
             matched_ssot: "Front-end Agent 1차 필터링 완료", // Simplified directly mapped context
             coach_recommendation: jsonResult.coach_recommendation || "상담 준비 완료"
        };

        // Insert into Inquiries
        const { error } = await supabaseAdmin.from('inquiries').insert({
             tenant_id: tenantId,
             deal_id: offerId || null,
             customer_name: jsonResult.customer_name || '익명 고객',
             customer_contact: jsonResult.customer_contact || '연락처 미상',
             raw_message: jsonResult.raw_message || '추가 문의 사항 없음',
             ai_structured_brief: aiStructuredBrief,
             status: 'structured' // Starts as structured since AI handled it entirely!
        });

        if (error) throw new Error(error.message);

        // QIS Extraction Pipeline (Background process essentially)
        await extractAndInsertQisQuestionsAction(tenantId, fullTranscript);

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * 3. Extract Unresolved/Curious Questions and Inject into QIS Inbox
 */
async function extractAndInsertQisQuestionsAction(tenantId: string, fullTranscript: string) {
    try {
        const { data: qisTemplate } = await supabaseAdmin.from('prompt_templates').select('system_prompt').eq('prompt_key', 'chat_qis_extractor').is('tenant_id', null).single();
        const extractorPrompt = qisTemplate?.system_prompt || `
다음 챗봇 대화 기록을 읽고, 고객이 던진 '질문 형태'의 순수 정보/호기심 관련 문장들을 추출해 주세요.
단, 이름이나 연락처를 알려주는 행위, 예약 스케줄 등을 잡기 위한 단순 대화를 제외하고,
시술, 증상, 가격, 절차, 효과 등 **브랜드 차원에서 SSoT 답변(지식)으로 만들 가치가 있는 질문들**만 추출해야 합니다. 
결과는 다음과 같은 순수 JSON 문자열 배열로만 응답하세요:
["질문 1", "질문 2"]
        `;

        const res = await ai.models.generateContent({
             model: 'gemini-2.5-pro',
             contents: extractorPrompt + "\n\n대화 내역:\n" + fullTranscript,
        });

        const cleanJson = (res.text || '[]').replace(/```json/g, '').replace(/```/g, '').trim();
        const extractedQuestions: string[] = JSON.parse(cleanJson);

        if (extractedQuestions && extractedQuestions.length > 0) {
            const inserts = extractedQuestions.map(q => ({
                tenant_id: tenantId,
                industry_type: 'skincare', // Assume skincare default for demo, or fetch from tenant
                text: q,
                source: 'AI 상담챗봇',
                count: 1,
                status: 'UNSORTED'
            }));

            await supabaseAdmin.from('raw_intake_questions').insert(inserts);
        }
    } catch (error) {
        console.error("QIS Extraction failed (post-chat):", error);
    }
}
