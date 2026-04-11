import { t } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveTenantId } from '@/lib/tenant';

export const revalidate = 60;

export default async function ProductsIndexPage(props: { params: Promise<{ tenantSlug: string, locale?: string }> }) {
  const params = await props.params;
  const locale = params.locale || 'ko';
  const tenantId = await resolveTenantId(params.tenantSlug);
  if (!tenantId) return notFound();

  const { data: assets } = await supabaseAdmin
    .from('universal_content_assets')
    .select('id, title, updated_at, created_at, json_payload, translations')
    .eq('tenant_id', tenantId)
    .in('type', ['product', 'bundle'])
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-16 px-4 max-w-5xl">
      <Link href={`/${locale}/${params.tenantSlug}`} className="text-sm font-medium mb-12 inline-block hover:opacity-70 transition-opacity">
        &larr; {t(locale, '홈으로 돌아가기')}
      </Link>
      
      <div className="mb-12 border-b border-[var(--theme-border)] pb-8">
        <h1 className="text-4xl font-light tracking-tight font-[family-name:var(--theme-font)] mb-4">제품 및 번들</h1>
        <p className="opacity-70">검증된 루틴을 현실화하는 공식 Commerce.</p>
      </div>

      <div className="flex flex-col gap-4">
        {(!assets || assets.length === 0) && (
           <div className="col-span-full py-12 text-center border rounded-lg bg-[var(--theme-surface)]">
             <p className="opacity-60">{t(locale, '아직 작성된 항목이 없습니다.')}</p>
           </div>
        )}
        
        {assets?.map((asset: any) => (
          <Link href={`/${locale}/${params.tenantSlug}/products/${asset.id}`} key={asset.id}>
             <div className="group h-full bg-[var(--theme-surface)] p-6 rounded-[var(--theme-radius)] border border-[var(--theme-border)] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col gap-2">
                 
                 

                 <div className="text-xs font-bold text-[var(--theme-primary)] tracking-widest uppercase mb-1">
                    {asset.json_payload?.type || 'PRODUCTS SSoT'}
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