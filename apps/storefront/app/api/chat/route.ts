import { google } from '@ai-sdk/google';
import { streamText, Message } from 'ai';
import { createClient } from '@supabase/supabase-js';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
  const { messages, tenantSlug, contextType, contextId, userIdentity } = await req.json();

  if (!tenantSlug) {
      return new Response('Missing tenantSlug', { status: 400 });
  }

  // 1. Resolve Tenant ID
  let tenantId = tenantSlug;
  if (tenantSlug.length !== 36 || !tenantSlug.includes('-')) {
      const { data } = await supabaseAdmin.from('tenants').select('id, name').eq('slug', tenantSlug).single();
      if (!data) return new Response('Tenant not found', { status: 404 });
      tenantId = data.id;
  }

  // 2. Fetch Context & RAG data (Parallel)
  const [tenantRes, topicRes, ragRes, personaRes] = await Promise.all([
      supabaseAdmin.from('tenants').select('name').eq('id', tenantId).single(),
      (contextType === 'answer' && contextId) 
          ? supabaseAdmin.from('topics').select('title, json_payload').eq('id', contextId).single()
          : Promise.resolve({ data: null }),
      supabaseAdmin.from('topics').select('title, json_payload').eq('tenant_id', tenantId).eq('content_status', 'published').limit(10),
      supabaseAdmin.from('prompt_templates').select('system_prompt').eq('prompt_key', 'chat_consultant_persona').is('tenant_id', null).single()
  ]);

  const tenantName = tenantRes.data?.name || '우리 브랜드';
  const topicContext = topicRes.data 
      ? `\n[고객의 현재 맥락 (방금 읽은 글)]\n제목: ${topicRes.data.title}\n내용: ${topicRes.data.json_payload?.body?.substring(0, 300) || ''}\n\n위 맥락을 바탕으로 고객이 해당 내용에 대해 잘 이해했는지, 혹은 더 궁금한 점이 있는지 선제적으로 묻고 상담을 부드럽게 시작하세요.`
      : '';
      
  let knowledgeBase = "=== 브랜드 내부 공식 지식 ===\n";
  ragRes.data?.forEach(topic => {
      knowledgeBase += `- [${topic.title}]: ${topic.json_payload?.body?.substring(0, 300) || ''}\n`;
  });

  const identityContext = userIdentity 
      ? `현재 고객은 시스템에 로그인되어 있으며 이름은 '${userIdentity.name}', 연락처는 '${userIdentity.contact}' 입니다. 이름과 연락처를 묻는 단계를 생략하세요.`
      : `고객의 이름과 연락처는 아직 알 수 없습니다.`;

  const basePersona = personaRes.data?.system_prompt || `
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
당신은 '${tenantName}'에 소속되어 있습니다.
${basePersona}

${identityContext}
${topicContext}

[보유한 공식 지식(SSoT)]
${knowledgeBase}
`;

  const result = await streamText({
    // @ts-ignore - mismatch between generic LanguageModel versions
    model: google('gemini-2.5-pro'),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
