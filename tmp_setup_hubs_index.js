const fs = require('fs');
const path = require('path');

const HUBS = [
  { slug: 'solutions', title: '솔루션 허브', desc: '고민별 상황별 최적의 솔루션을 제안합니다.', typeMatch: ".eq('type', 'solutions')" },
  { slug: 'compare', title: '비교(VS) 허브', desc: '당신에게 더 잘 맞는 제품/루틴을 객관적으로 비교합니다.', typeMatch: ".eq('type', 'compare')" },
  { slug: 'media', title: '매거진/스토리', desc: '더 나은 선택을 돕는 가이드와 실제 사용자들의 리뷰.', typeMatch: ".eq('category', 'Media SSoT')" },
  { slug: 'trust', title: '신뢰/R&D', desc: '모든 답변의 근간이 되는 논문, 성분, 특허 데이터베이스.', typeMatch: ".eq('type', 'trust')" },
  { slug: 'products', title: '제품 및 번들', desc: '검증된 루틴을 현실화하는 공식 Commerce.', typeMatch: ".eq('type', 'products')" }
];

HUBS.forEach(hub => {
  const dirPath = path.join('apps', 'storefront', 'app', '[tenantSlug]', hub.slug);
  fs.mkdirSync(dirPath, { recursive: true });

  const indexCode = `import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '../../../../lib/supabase';
import { resolveTenantId } from '../../../../lib/tenant';

export const revalidate = 60;

export default async function ${hub.slug.charAt(0).toUpperCase() + hub.slug.slice(1)}IndexPage(props: { params: Promise<{ tenantSlug: string }> }) {
  const params = await props.params;
  const tenantId = await resolveTenantId(params.tenantSlug);
  if (!tenantId) return notFound();

  const { data: assets } = await supabaseAdmin
    .from('universal_content_assets')
    .select('id, title, updated_at, created_at, json_payload')
    .eq('tenant_id', tenantId)
    ${hub.typeMatch}
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-16 px-4 max-w-5xl">
      <Link href={\`/\${params.tenantSlug}\`} className="text-sm font-medium mb-12 inline-block hover:opacity-70 transition-opacity">
        &larr; 홈으로 돌아가기
      </Link>
      
      <div className="mb-12 border-b border-[var(--theme-border)] pb-8">
        <h1 className="text-4xl font-light tracking-tight font-[family-name:var(--theme-font)] mb-4">${hub.title}</h1>
        <p className="opacity-70">${hub.desc}</p>
      </div>

      <div className="${hub.slug === 'media' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6' : 'flex flex-col gap-4'}">
        {(!assets || assets.length === 0) && (
           <div className="col-span-full py-12 text-center border rounded-lg bg-[var(--theme-surface)]">
             <p className="opacity-60">아직 작성된 항목이 없습니다.</p>
           </div>
        )}
        
        {assets?.map((asset: any) => (
          <Link href={\`/\${params.tenantSlug}/${hub.slug}/\${asset.id}\`} key={asset.id}>
             <div className="group h-full bg-[var(--theme-surface)] p-6 rounded-[var(--theme-radius)] border border-[var(--theme-border)] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col gap-2">
                 
                 ${hub.slug === 'media' ? `
                 {asset.json_payload?.thumbnail ? (
                   <div className="w-full h-48 bg-gray-200 rounded-md mb-4 overflow-hidden">
                     <img src={asset.json_payload.thumbnail} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   </div>
                 ) : (
                   <div className="w-full h-48 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                     <span className="text-gray-400">No Image</span>
                   </div>
                 )}
                 ` : ''}

                 <div className="text-xs font-bold text-[var(--theme-primary)] tracking-widest uppercase mb-1">
                    {asset.json_payload?.type || '${hub.slug.toUpperCase()} SSoT'}
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
}`;

  fs.writeFileSync(path.join(dirPath, 'page.tsx'), indexCode);
});
console.log('Hub index pages created.');
