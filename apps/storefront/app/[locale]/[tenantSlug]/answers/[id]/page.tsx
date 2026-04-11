import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveTenantId } from '@/lib/tenant';

import { HeroQuestionBlock } from '@/components/store/HeroQuestionBlock';
import { TrustStrip } from '@/components/store/TrustStrip';
import { ProseReader } from '@/components/store/ProseReader';
import { CrossLinker } from '@/components/store/CrossLinker';

import { Metadata } from 'next';

export const revalidate = 60; // 1 min ISR caching

interface Props {
  params: Promise<{
    tenantSlug: string;
    id: string;
    locale?: string;
  }>;
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const tenantId = await resolveTenantId(params.tenantSlug);
  
  if (!tenantId) {
    return { title: 'Answer Detail', description: 'SSoT Document' };
  }

  const { data: answerData } = await supabaseAdmin
    .from('answer_cards')
    .select('*, topics(title)')
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single();

  let title = 'Brand SSoT Document';
  let desc = 'Official verified answer from the brand.';

  if (answerData) {
     title = answerData.structured_body?.title || answerData.topics?.title || title;
     desc = answerData.structured_body?.summary?.substring(0, 160) || answerData.structured_body?.content?.substring(0, 160) || desc;
  } else {
    const { data: content } = await supabaseAdmin
      .from('universal_content_assets')
      .select('*')
      .eq('id', params.id)
      .eq('tenant_id', tenantId)
      .single();
    if (content) {
      title = content.title || title;
      desc = content.json_payload?.body?.substring(0, 160) || content.json_payload?.answer?.substring(0, 160) || desc;
    }
  }

  // Strip HTML for desc
  desc = desc.replace(/(<([^>]+)>)/gi, "").substring(0, 160);

  return {
    title: `${title} | SSoT Answer`,
    description: desc,
    openGraph: {
       title,
       description: desc,
       type: 'article',
    }
  };
}

export default async function AnswerDetailPage(props: Props) {
  const params = await props.params;
  const { tenantSlug, id, locale = 'ko' } = params as any;
  const tenantId = await resolveTenantId(tenantSlug);
  
  if (!tenantId) return notFound();

  function applyTranslations(record: any, currentLocale: string) {
    if (!record || !record.translations || !record.translations[currentLocale]) return record;
    const translated = record.translations[currentLocale];
    if (record.structured_body) return { ...record, structured_body: { ...record.structured_body, ...translated } };
    if (record.json_payload) return { ...record, json_payload: { ...record.json_payload, ...translated } };
    return { ...record, ...translated };
  }

  // 1. Try fetching from answer_cards (Standard Schema)
  let title = '';
  let htmlBody = '';
  let payload: any = {};
  let updatedAt = '';

  let { data: answerData } = await supabaseAdmin
    .from('answer_cards')
    .select('*, topics(title)')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single();

  if (answerData) {
     answerData = applyTranslations(answerData, locale);
     payload = answerData.structured_body || {};
     title = payload.title || answerData.topics?.title || 'Brand SSoT Document';
     // 블록형 지원 및 일반 content 속성 지원
     htmlBody = payload.content
                  ? `<p>${payload.content}</p>`
                  : (Array.isArray(payload.blocks) ? payload.blocks.map((b: any) => `<p>${b.content}</p>`).join('') : '');
     updatedAt = answerData.updated_at || answerData.created_at || new Date().toISOString();
  } else {
    // 2. Fetch from Universal CMS payload (Fallback Schema)
    let { data: content, error } = await supabaseAdmin
      .from('universal_content_assets')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !content) return notFound();
    content = applyTranslations(content, locale);

    payload = content.json_payload || {};
    htmlBody = payload.body || payload.answer || '';
    title = content.title || 'Brand SSoT Document';
    updatedAt = content.updated_at || content.created_at || new Date().toISOString();
  }

  const summary = payload.summary || '';
  const cautions = payload.cautions || '';

  const baseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';
  const escapedBody = summary ? summary.replace(/(<([^>]+)>)/gi, "") : htmlBody.replace(/(<([^>]+)>)/gi, "");

  let reviewerLink = undefined;
  const reviewerName = payload.reviewer || "Brand Official";
  let matchedExpertId = null;
  
  if (reviewerName && reviewerName !== "Brand Official") {
     const { data: matchedExpert } = await supabaseAdmin
       .from('universal_content_assets')
       .select('id')
       .eq('tenant_id', tenantId)
       .eq('type', 'expert')
       .eq('title', reviewerName)
       .single();
     if (matchedExpert) {
        matchedExpertId = matchedExpert.id;
        reviewerLink = `/${params.tenantSlug}/trust/experts/${matchedExpert.id}`;
     }
  }

  // Cross-linking logic
  const resolveRelations = async (relationData: any) => {
     if (!relationData) return [];
     const ids = Array.isArray(relationData) ? relationData : [relationData].filter(Boolean);
     if (ids.length === 0) return [];
     const { data } = await supabaseAdmin.from('universal_content_assets').select('id, title').in('id', ids);
     return data || [];
  };

  const crossExperts = await resolveRelations(payload.related_experts);
  const crossEvidence = await resolveRelations(payload.related_evidence);
  const crossTopics = await resolveRelations(payload.related_topics);

  const JSON_LD_AUTHOR = matchedExpertId 
    ? { "@type": "Person", "@id": `${baseUrl}/${params.tenantSlug}/trust/experts/${matchedExpertId}`, name: reviewerName } 
    : { "@type": "Organization", name: params.tenantSlug };

  const JSON_LD_CITATIONS = crossEvidence.map((ev: any) => ({
    "@type": "WebPage", "@id": `${baseUrl}/${params.tenantSlug}/trust/${ev.id}`, name: ev.title
  }));

  const qaLd = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: title,
      text: title,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: escapedBody,
        url: `${baseUrl}/${params.tenantSlug}/answers/${params.id}`,
        author: JSON_LD_AUTHOR,
        citation: JSON_LD_CITATIONS.length > 0 ? JSON_LD_CITATIONS : undefined
      }
    }
  };

  return (
    <article className="container mx-auto py-8 text-[var(--theme-text)] px-4 md:px-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(qaLd) }} />
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
        reviewerName={reviewerName}
        reviewerLink={reviewerLink}
        updatedAt={new Date(updatedAt).toLocaleDateString()}
      />

      <div className="mt-12 pt-8 border-t border-[var(--theme-border)]">
        {summary && (
           <div className="mb-8 p-6 bg-[var(--theme-border)]/20 rounded-xl border-l-4 border-black" itemProp="abstract">
              <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-2">Direct Answer</h3>
              <p className="text-lg font-medium leading-relaxed">{summary}</p>
           </div>
        )}
        <ProseReader html={htmlBody} />
        
        {cautions && (
           <div className="mt-12 p-6 bg-red-50 border border-red-100 rounded-xl text-red-800">
              <div className="flex items-center gap-2 mb-2 font-bold">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 의학적 주의사항 및 참고
              </div>
              <p className="text-sm leading-relaxed opacity-90 whitespace-pre-wrap">{cautions}</p>
           </div>
        )}
      </div>

      <CrossLinker 
        tenantSlug={params.tenantSlug}
        experts={crossExperts}
        evidence={crossEvidence}
        topics={crossTopics}
      />

      <div className="mt-16 bg-gradient-to-r from-indigo-50 to-pink-50 p-8 rounded-2xl border border-indigo-100 flex flex-col items-center text-center mb-10">
        <h3 className="text-xl font-bold text-slate-800 mb-2">방금 읽으신 공식 답변에 대해 더 궁금한 점이 있으신가요?</h3>
        <p className="text-slate-600 mb-6">AI 수석 실장이 고객님의 고민에 맞춰 즉시 상담해 드립니다.</p>
        <Link 
            href={`/${params.tenantSlug}/contact/dm?contextType=answer&contextId=${params.id}&contextTitle=${encodeURIComponent(title)}`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-full flex items-center gap-2 transition-transform hover:scale-105 shadow-lg"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            수석 실장에게 질문하기 (AI 상담)
        </Link>
      </div>

    </article>
  );
}
