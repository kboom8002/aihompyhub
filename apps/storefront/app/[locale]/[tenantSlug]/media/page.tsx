import { t } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveTenantId } from '@/lib/tenant';

export const revalidate = 60;

export default async function MediaIndexPage(props: { params: Promise<{ tenantSlug: string, locale?: string }> }) {
  const params = await props.params;
  const locale = params.locale || 'ko';
  const tenantId = await resolveTenantId(params.tenantSlug);
  if (!tenantId) return notFound();

  const { data: assets } = await supabaseAdmin
    .from('universal_content_assets')
    .select('id, title, updated_at, created_at, json_payload, translations')
    .eq('tenant_id', tenantId)
    .eq('category', 'media_ssot')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-16 px-4 max-w-5xl">
      <Link href={`/${locale}/${params.tenantSlug}`} className="text-sm font-medium mb-12 inline-block hover:opacity-70 transition-opacity">
        &larr; {t(locale, '홈으로 돌아가기')}
      </Link>
      
      <div className="mb-12 border-b border-[var(--theme-border)] pb-8">
        <h1 className="text-4xl font-light tracking-tight font-[family-name:var(--theme-font)] mb-4">{t(locale, '매거진/스토리')}</h1>
        <p className="opacity-70">{t(locale, '더 나은 선택을 돕는 가이드와 실제 사용자들의 리뷰.')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {(!assets || assets.length === 0) && (
           <div className="col-span-full py-12 text-center border rounded-lg bg-[var(--theme-surface)]">
             <p className="opacity-60">{t(locale, '아직 작성된 항목이 없습니다.')}</p>
           </div>
        )}
        
        {assets?.map((asset: any) => (
          <Link href={`/${locale}/${params.tenantSlug}/media/${asset.id}`} key={asset.id}>
             <div className="group h-full bg-[var(--theme-surface)] p-6 rounded-[var(--theme-radius)] border border-[var(--theme-border)] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col gap-2">
                 
                 
                 {asset.json_payload?.thumbnail ? (
                   <div className="w-full h-48 bg-gray-200 rounded-md mb-4 overflow-hidden">
                     <img src={asset.json_payload.thumbnail} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   </div>
                 ) : (
                   <div className="w-full h-48 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                     <span className="text-gray-400">No Image</span>
                   </div>
                 )}
                 

                 <div className="text-xs font-bold text-[var(--theme-primary)] tracking-widest uppercase mb-1">
                    {asset.json_payload?.type || 'MEDIA SSoT'}
                 </div>
                 <h2 className="text-xl font-semibold font-[family-name:var(--theme-font)] group-hover:underline decoration-[var(--theme-border)] underline-offset-4">
                   {asset.title}
                 </h2>
                 <p className="text-sm opacity-60 mt-auto pt-2">
                   {new Date(asset.updated_at || asset.created_at).toLocaleDateString()}
                 </p>
             </div>
          </Link>
        ))}
      </div>
    </div>
  );
}