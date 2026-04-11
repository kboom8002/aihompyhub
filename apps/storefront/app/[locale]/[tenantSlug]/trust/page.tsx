import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveTenantId } from '@/lib/tenant';

export const revalidate = 60;

export default async function TrustIndexPage(props: { params: Promise<{ tenantSlug: string }> }) {
  const params = await props.params;
  const tenantId = await resolveTenantId(params.tenantSlug);
  if (!tenantId) return notFound();

  const { data: assets } = await supabaseAdmin
    .from('universal_content_assets')
    .select('id, title, updated_at, created_at, json_payload')
    .eq('tenant_id', tenantId)
    .eq('type', 'trust')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-16 px-4 max-w-5xl">
      <Link href={`/${params.tenantSlug}`} className="text-sm font-medium mb-12 inline-block hover:opacity-70 transition-opacity">
        &larr; 홈으로 돌아가기
      </Link>
      
      <div className="mb-12 border-b border-[var(--theme-border)] pb-8">
        <h1 className="text-4xl font-light tracking-tight font-[family-name:var(--theme-font)] mb-4">신뢰/R&D</h1>
        <p className="opacity-70">모든 답변의 근간이 되는 논문, 성분, 특허 데이터베이스.</p>
      </div>

      <div className="flex flex-col gap-4">
        {(!assets || assets.length === 0) && (
           <div className="col-span-full py-12 text-center border rounded-lg bg-[var(--theme-surface)]">
             <p className="opacity-60">아직 작성된 항목이 없습니다.</p>
           </div>
        )}
        
        {assets?.map((asset: any) => (
          <Link href={`/${params.tenantSlug}/trust/${asset.id}`} key={asset.id}>
             <div className="group h-full bg-[var(--theme-surface)] p-6 rounded-[var(--theme-radius)] border border-[var(--theme-border)] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col gap-2">
                 
                 

                 <div className="flex items-center gap-2 mb-2">
                   <div className="text-xs font-bold bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] px-2 py-1 rounded-full tracking-widest uppercase inline-block">
                      {asset.json_payload?.evidenceType || asset.json_payload?.type || 'TRUST SSoT'}
                   </div>
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