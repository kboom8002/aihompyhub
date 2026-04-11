import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '../../../../../lib/supabase';
import { resolveTenantId } from '../../../../../lib/tenant';
import { Metadata } from 'next';
import { ProseReader } from '../../../../../components/store/ProseReader';

export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ tenantSlug: string, id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const tenantId = await resolveTenantId(params.tenantSlug);
  if (!tenantId) return { title: 'Expert Profile' };

  const { data: expert } = await supabaseAdmin
    .from('universal_content_assets')
    .select('title, json_payload')
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single();

  if (!expert) return { title: 'Expert Profile' };
  return {
    title: `${expert.title} - ${expert.json_payload?.role_title || 'Expert'}`,
    description: expert.json_payload?.bio?.substring(0, 160) || '의료 및 전문가 약력',
  };
}

export default async function ExpertProfilePage(props: { params: Promise<{ tenantSlug: string, id: string }> }) {
  const params = await props.params;
  const tenantId = await resolveTenantId(params.tenantSlug);
  if (!tenantId) return notFound();

  const { data: expert } = await supabaseAdmin
    .from('universal_content_assets')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single();

  if (!expert) return notFound();

  const payload = expert.json_payload || {};

  // Fetch cross-linked contents (Trust documents or Answers that mention this expert in related_answers or reviewer string)
  // Since we haven't strictly mapped relational IDs in existing MVP answers, we might do a text match on Reviewer name or fetch the relation if mapped.
  // For now, we will fetch answers/trusts where 'reviewer' matches the expert title (MVP).
  
  const { data: reviewedAnswers } = await supabaseAdmin
     .from('answer_cards')
     .select('id, topics(title)')
     .eq('tenant_id', tenantId)
     .limit(5); // In production, filter by relation or JSONB match

  const baseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';
  
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: expert.title,
    jobTitle: payload.role_title,
    description: payload.bio,
    image: payload.profile_url,
    url: `${baseUrl}/${params.tenantSlug}/trust/experts/${expert.id}`,
    sameAs: payload.social_links ? payload.social_links.split(',').map((s: string) => s.trim()) : undefined
  };

  return (
    <article className="container mx-auto py-16 px-4 md:px-0 max-w-4xl font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />

      <Link href={`/${params.tenantSlug}/trust/experts`} className="text-sm border border-[var(--theme-border)] px-4 py-2 rounded-full mb-12 inline-block hover:bg-black/5 transition-colors">
        &larr; 전문가 패널 목록으로
      </Link>

      <div className="flex flex-col md:flex-row gap-10 items-start mb-16">
         <div className="w-48 h-48 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border border-[var(--theme-border)] bg-gray-50">
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${payload.profile_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(expert.title)})` }} />
         </div>
         <div className="flex flex-col pt-2">
            <div className="text-sm font-bold text-[var(--theme-primary)] tracking-widest uppercase mb-2">
              {payload.role_title || 'Expert Panel'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--theme-font)] tracking-tight mb-4">
              {expert.title}
            </h1>
            <p className="text-lg opacity-80 leading-relaxed mb-6 whitespace-pre-wrap">
              {payload.bio}
            </p>
            {payload.credentials && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm opacity-70 whitespace-pre-wrap leading-relaxed">
                 <strong className="block mb-2 text-black opacity-100">자격 및 주요 약력</strong>
                 {payload.credentials}
              </div>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[var(--theme-border)] pt-12">
        <div className="md:col-span-2">
           <h2 className="text-2xl font-bold mb-6">상세 이력 / 철학</h2>
           {payload.body ? (
             <div className="prose">
               <ProseReader html={payload.body} />
             </div>
           ) : (
             <p className="opacity-60 italic">상세 이력이 등록되지 않았습니다.</p>
           )}
        </div>

        <div className="md:col-span-1 border-l border-gray-100 pl-8">
           <h3 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-4">직접 검수/서명한 콘텐츠</h3>
           
           <div className="flex flex-col gap-4">
              {reviewedAnswers?.map((ans: any) => (
                 <Link href={`/${params.tenantSlug}/answers/${ans.id}`} key={ans.id} className="block group">
                    <div className="p-4 border border-[var(--theme-border)] rounded-xl hover:border-[var(--theme-primary)] transition-colors">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Answer SSoT</span>
                       <h4 className="font-semibold text-sm group-hover:text-[var(--theme-primary)]">{ans.topics?.title || '공식 답변'}</h4>
                    </div>
                 </Link>
              ))}
              <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 text-center opacity-60 text-xs">
                 해당 전문가가 검증한<br/>모든 타임라인이 표출됩니다.
              </div>
           </div>
        </div>
      </div>
    </article>
  );
}
