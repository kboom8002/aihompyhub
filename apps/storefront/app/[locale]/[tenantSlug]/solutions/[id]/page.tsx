import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveTenantId } from '@/lib/tenant';
import { ProseReader } from '@/components/store/ProseReader';

export const revalidate = 60;

export default async function SolutionsDetailPage(props: { params: Promise<{ tenantSlug: string, id: string }> }) {
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
  
  return (
    <article className="container mx-auto py-12 text-[var(--theme-text)] px-4 md:px-0 max-w-4xl">
      <Link href={`/${params.tenantSlug}/solutions`} className="text-sm font-medium border border-[var(--theme-border)] px-4 py-2 rounded-full mb-12 inline-block hover:bg-black/5 transition-colors">
        &larr; 다른 솔루션 찾기
      </Link>
      
      <div className="bg-[#f8fafc] border border-[var(--theme-border)] rounded-2xl p-8 md:p-12 mb-16 shadow-sm">
         <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest uppercase bg-[var(--theme-primary)] text-white rounded-md">
            Customer Concern
         </span>
         <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-snug font-[family-name:var(--theme-font)] mb-6 text-gray-900">
            {content.title}
         </h1>
         {payload.summary && (
            <p className="text-lg md:text-xl opacity-80 border-l-4 border-[var(--theme-primary)] pl-5 py-2 leading-relaxed text-gray-700">
               {payload.summary}
            </p>
         )}
      </div>

      <div className="flex items-center gap-4 mb-8">
         <div className="flex-1 h-px bg-[var(--theme-border)]"></div>
         <span className="text-sm font-bold tracking-widest uppercase text-gray-400">Our Solution</span>
         <div className="flex-1 h-px bg-[var(--theme-border)]"></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-0">
        <ProseReader html={payload.body || '<p>상세 솔루션 가이드가 제공되지 않았습니다.</p>'} />
      </div>

      <div className="mt-24 text-center">
         <p className="mb-6 opacity-70">이 솔루션을 직접 실천하고 싶으신가요?</p>
         <Link href={`/${params.tenantSlug}/products`} className="bg-[var(--theme-text)] text-[var(--theme-surface)] px-8 py-4 rounded-xl font-bold hover:opacity-90 inline-block transition-opacity">
            관련 추천 제품 보기
         </Link>
      </div>

    </article>
  );
}