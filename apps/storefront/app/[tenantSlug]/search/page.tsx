import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '../../../lib/supabase';
import { resolveTenantId } from '../../../lib/tenant';
import { AnswerCardGrid } from '../../../components/store/AnswerCardGrid';
import { PortfolioCard } from '../../../components/store/PortfolioCard';

export const revalidate = 0; // Dynamic route

export default async function UniversalSearchPage(props: { 
  params: Promise<{ tenantSlug: string }>; 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';

  const tenantId = await resolveTenantId(params.tenantSlug);
  if (!tenantId) return notFound();

  let answers: any[] = [];
  let assets: any[] = [];

  if (query.trim() !== '') {
    // Perform parallel ILIKE search
    const [answersRes, assetsRes] = await Promise.all([
      supabaseAdmin
        .from('answer_cards')
        .select('*, topics(title)')
        .eq('tenant_id', tenantId)
        .or(`structured_body->>title.ilike.%${query}%,structured_body->>content.ilike.%${query}%`)
        .eq('status', 'published'),
      supabaseAdmin
        .from('universal_content_assets')
        .select('id, type, title, json_payload')
        .eq('tenant_id', tenantId)
        .in('type', ['portfolio', 'insight', 'solution', 'product', 'offer'])
        .or(`title.ilike.%${query}%,json_payload->>body.ilike.%${query}%,json_payload->>client_or_context.ilike.%${query}%`)
        .eq('status', 'active')
    ]);

    answers = answersRes.data || [];
    assets = assetsRes.data || [];
  }

  // To display results neatly, we separate portfolio from other assets
  const portfolios = assets.filter(a => a.type === 'portfolio');
  const otherAssets = assets.filter(a => a.type !== 'portfolio');

  return (
    <div className="container mx-auto py-16 px-4 max-w-6xl min-h-[75vh]">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-[family-name:var(--theme-font)] mb-6 text-slate-900">
           Universal Search
        </h1>
        {/* Main Search Input Form for this page */}
        <form action={`/${params.tenantSlug}/search`} method="GET" className="relative group">
           <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
             <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[var(--theme-primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </div>
           <input
             type="text"
             name="q"
             defaultValue={query}
             className="w-full pl-14 pr-32 py-4 rounded-xl bg-white border-2 border-slate-200 shadow-sm text-lg outline-none focus:ring-0 focus:border-[var(--theme-primary)] transition-all font-medium text-slate-800"
             placeholder="궁금한 내용을 자유롭게 검색해보세요..."
           />
           <button type="submit" className="absolute inset-y-2 right-2 px-6 bg-slate-900 text-white rounded-lg font-bold hover:bg-[var(--theme-primary)] transition-colors text-sm">
             검색
           </button>
        </form>
      </div>

      {!query.trim() ? (
         <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100 mb-10">
            <p className="text-slate-500 font-medium">검색창에 키워드를 입력하여 검증된 답변과 사례를 확인하세요.</p>
         </div>
      ) : (
         <div className="flex flex-col gap-16">
            <div className="mb-4">
              <p className="text-lg font-medium text-slate-700">
                <strong className="text-[var(--theme-primary)]">"{query}"</strong> 에 대한 통합 검색 결과 <span className="opacity-60 text-sm">({answers.length + assets.length}건)</span>
              </p>
            </div>

            {/* Answer Cards Section */}
            {answers.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6 border-b pb-2 border-slate-200">
                   <h2 className="text-2xl font-bold tracking-tight text-slate-900">공식 가이드 및 답변</h2>
                   <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{answers.length}</span>
                </div>
                <AnswerCardGrid cards={answers} tenantSlug={params.tenantSlug} />
              </section>
            )}

            {/* Portfolio Section */}
            {portfolios.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6 border-b pb-2 border-slate-200">
                   <h2 className="text-2xl font-bold tracking-tight text-slate-900">관련 레퍼런스 및 포트폴리오</h2>
                   <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{portfolios.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {portfolios.map(p => (
                     <PortfolioCard key={p.id} portfolio={p} tenantSlug={params.tenantSlug} industryType="consulting" />
                  ))}
                </div>
              </section>
            )}

            {/* Other SSoT Assets */}
            {otherAssets.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6 border-b pb-2 border-slate-200">
                   <h2 className="text-2xl font-bold tracking-tight text-slate-900">관련 칼럼 및 오퍼</h2>
                   <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{otherAssets.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {otherAssets.map(asset => (
                     <Link href={`/${params.tenantSlug}/${asset.type === 'insight' ? 'media' : 'solutions'}/${asset.id}`} key={asset.id} className="block">
                       <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[var(--theme-primary)] hover:shadow-md transition-all h-full group">
                         <div className="text-[10px] font-bold bg-slate-100 text-slate-500 max-w-fit px-2 py-1 rounded-sm uppercase tracking-widest mb-2 group-hover:bg-[var(--theme-primary)] group-hover:text-white transition-colors">{asset.type}</div>
                         <h3 className="font-bold text-lg text-slate-900">{asset.title}</h3>
                         <p className="text-sm text-slate-500 mt-1 line-clamp-2">{asset.json_payload?.one_liner || asset.json_payload?.body || '문서 요약 없음'}</p>
                       </div>
                     </Link>
                  ))}
                </div>
              </section>
            )}

            {(answers.length === 0 && assets.length === 0) && (
              <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                 <p className="text-slate-500">정확히 일치하는 공식 데이터가 없습니다. 다른 질문으로 검색해보세요.</p>
              </div>
            )}
         </div>
      )}
    </div>
  );
}