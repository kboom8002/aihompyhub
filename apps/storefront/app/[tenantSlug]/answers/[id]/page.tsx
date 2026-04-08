import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '../../../../lib/supabase';
import { resolveTenantId } from '../../../../lib/tenant';

import { HeroQuestionBlock } from '../../../../components/store/HeroQuestionBlock';
import { TrustStrip } from '../../../../components/store/TrustStrip';
import { ProseReader } from '../../../../components/store/ProseReader';

export const revalidate = 60; // 1 min ISR caching

interface Props {
  params: Promise<{
    tenantSlug: string;
    id: string;
  }>;
}

export default async function AnswerDetailPage(props: Props) {
  const params = await props.params;
  const tenantId = await resolveTenantId(params.tenantSlug);
  
  if (!tenantId) return notFound();

  // 1. Try fetching from answer_cards (Standard Schema)
  let title = '';
  let htmlBody = '';
  let payload: any = {};
  let updatedAt = '';

  const { data: answerData } = await supabaseAdmin
    .from('answer_cards')
    .select('*, topics(title)')
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single();

  if (answerData) {
     payload = answerData.structured_body || {};
     title = payload.title || answerData.topics?.title || 'Brand SSoT Document';
     // 블록형 지원 및 일반 content 속성 지원
     htmlBody = payload.content
                  ? `<p>${payload.content}</p>`
                  : (Array.isArray(payload.blocks) ? payload.blocks.map((b: any) => `<p>${b.content}</p>`).join('') : '');
     updatedAt = answerData.updated_at || answerData.created_at || new Date().toISOString();
  } else {
    // 2. Fetch from Universal CMS payload (Fallback Schema)
    const { data: content, error } = await supabaseAdmin
      .from('universal_content_assets')
      .select('*')
      .eq('id', params.id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !content) return notFound();

    payload = content.json_payload || {};
    htmlBody = payload.body || payload.answer || '';
    title = content.title || 'Brand SSoT Document';
    updatedAt = content.updated_at || content.created_at || new Date().toISOString();
  }

  return (
    <article className="container mx-auto py-8 text-[var(--theme-text)] px-4 md:px-0">
      <Link href={`/${params.tenantSlug}/answers`} className="text-sm border border-[var(--theme-border)] px-3 py-1 rounded-full mb-8 inline-block hover:bg-black/5 transition-colors">
        &larr; 모든 질문 목록
      </Link>
      
      {/* Dynamic SSoT Rendering */}
      <HeroQuestionBlock 
        category="공식 답변"
        question={title}
        snippet="아래는 브랜드 SSoT(Single Source of Truth) 기반으로 검증된 공식 답변입니다."
      />

      <TrustStrip 
        sources={payload.sources || []}
        reviewerName={payload.reviewer || "Brand Official"}
        updatedAt={new Date(updatedAt).toLocaleDateString()}
      />

      <div className="mt-12 pt-8 border-t border-[var(--theme-border)]">
        <ProseReader html={htmlBody} />
      </div>

    </article>
  );
}
