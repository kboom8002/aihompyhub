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

  // 1. Fetch the physical asset from the Universal CMS payload
  const { data: content, error } = await supabaseAdmin
    .from('universal_content_assets')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !content) return notFound();

  // 2. Parse the schema-less JSON wrapper
  const payload = content.json_payload || {};
  const htmlBody = payload.body || '';

  return (
    <article className="container mx-auto py-8 text-[var(--theme-text)] px-4 md:px-0">
      <Link href={`/${params.tenantSlug}/answers`} className="text-sm border border-[var(--theme-border)] px-3 py-1 rounded-full mb-8 inline-block hover:bg-black/5 transition-colors">
        &larr; 모든 질문 목록
      </Link>
      
      {/* Dynamic SSoT Rendering */}
      <HeroQuestionBlock 
        category="공식 답변"
        question={content.title}
        snippet="아래는 브랜드 SSoT(Single Source of Truth) 기반으로 검증된 공식 답변입니다."
      />

      <TrustStrip 
        sources={payload.sources || []}
        reviewerName={payload.reviewer || "Brand Official"}
        updatedAt={new Date(content.updated_at || content.created_at).toLocaleDateString()}
      />

      <div className="mt-12 pt-8 border-t border-[var(--theme-border)]">
        <ProseReader html={htmlBody} />
      </div>

    </article>
  );
}
