import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveTenantId } from '@/lib/tenant';
import { TrustStrip } from '@/components/store/TrustStrip';
import { ProseReader } from '@/components/store/ProseReader';
import { CrossLinker } from '@/components/store/CrossLinker';

export const revalidate = 60;

export default async function TrustDetailPage(props: { params: Promise<{ tenantSlug: string, id: string }> }) {
  const params = await props.params;
  const tenantId = await resolveTenantId(params.tenantSlug);
  if (!tenantId) return notFound();

  const { data: content, error } = await supabaseAdmin
    .from('universal_content_assets')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !content) return notFound();

  const payload = content.json_payload || {};
  
  let sourcesArray = ['Internal Clinical Database', 'Dermatology Verified'];
  if (typeof payload.sources === 'string' && payload.sources.trim() !== '') {
    sourcesArray = payload.sources.split(',').map((s: string) => s.trim());
  } else if (Array.isArray(payload.sources) && payload.sources.length > 0) {
    sourcesArray = payload.sources;
  }
  
  let reviewerLink = undefined;
  const reviewerName = payload.reviewer || 'R&D Research Center';
  
  if (reviewerName && reviewerName !== 'R&D Research Center') {
     const { data: matchedExpert } = await supabaseAdmin
       .from('universal_content_assets')
       .select('id')
       .eq('tenant_id', tenantId)
       .eq('type', 'expert')
       .eq('title', reviewerName)
       .single();
     if (matchedExpert) {
        reviewerLink = `/${params.tenantSlug}/trust/experts/${matchedExpert.id}`;
     }
  }

  const resolveRelations = async (relationData: any) => {
     if (!relationData) return [];
     const ids = Array.isArray(relationData) ? relationData : [relationData].filter(Boolean);
     if (ids.length === 0) return [];
     const { data } = await supabaseAdmin.from('universal_content_assets').select('id, title').in('id', ids);
     return data || [];
  };

  const crossTopics = await resolveRelations(payload.related_topics);
  const crossAnswers = await resolveRelations(payload.related_answers); // for trusts, they link to answers. But CrossLinker schema accepts experts, evidence, topics.

  // Let's pass crossAnswers as topics for now, or expand CrossLinker.
  // We'll map crossAnswers to topics prop in CrossLinker to reuse the UI component.

  return (
    <article className="container mx-auto py-12 text-[var(--theme-text)] px-4 md:px-0 max-w-4xl">
      <Link href={`/${params.tenantSlug}/trust`} className="text-sm font-medium border border-[var(--theme-border)] px-4 py-2 rounded-full mb-12 inline-block hover:bg-black/5 transition-colors">
        &larr; 신뢰 허브로 돌아가기
      </Link>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <h1 className="text-2xl font-bold font-[family-name:var(--theme-font)] tracking-tight uppercase text-[var(--theme-primary)]">
          {payload.evidenceType || payload.type || 'Verified Document'}
        </h1>
      </div>

      <h2 className="text-4xl md:text-5xl font-light leading-tight mb-8">
        {content.title}
      </h2>

      <TrustStrip 
        sources={sourcesArray} 
        reviewerName={reviewerName} 
        reviewerLink={reviewerLink}
        updatedAt={new Date(content.updated_at || content.created_at).toLocaleDateString()} 
      />

      <div className="mt-12 p-8 md:p-12 bg-white border border-[var(--theme-border)] shadow-sm rounded-xl">
        <ProseReader html={payload.body || '<p>자세한 연구/문헌 데이터가 없습니다.</p>'} />
      </div>

      <CrossLinker 
        tenantSlug={params.tenantSlug}
        topics={crossTopics}
      />
    </article>
  );
}