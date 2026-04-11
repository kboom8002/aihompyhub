import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveTenantId } from '@/lib/tenant';
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function PortfolioDetailPage(props: { params: Promise<{ tenantSlug: string, id: string }> }) {
  const params = await props.params;
  const { tenantSlug, id } = params;

  const tenantId = await resolveTenantId(tenantSlug);
  if (!tenantId) notFound();

  // Fetch portfolio item
  const { data: item } = await supabaseAdmin
    .from('universal_content_assets')
    .select('structured_body')
    .eq('tenant_id', tenantId)
    .eq('type', 'portfolio')
    .eq('id', id)
    .single();

  if (!item || !item.structured_body) {
     return (
       <div className="container mx-auto py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">케이스 스터디를 찾을 수 없습니다</h1>
          <p className="text-slate-500">요청하신 포트폴리오 에셋이 삭제되었거나 존재하지 않습니다.</p>
       </div>
     );
  }

  const { client_or_context, challenge, approach, outcome, visual_assets, body } = item.structured_body;
  const assets: string[] = visual_assets ? visual_assets.split(',').map((s: string) => s.trim()) : [];

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] pb-24">
      {/* Portfolio Hero */}
      <div className="relative w-full h-[50vh] min-h-[400px] border-b border-[var(--theme-border)]">
        {assets.length > 0 ? (
           <Image src={assets[0]} alt="Hero" fill className="object-cover" />
        ) : (
           <div className="w-full h-full bg-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <Badge variant="outline" className="text-white border-white/30 bg-black/20 backdrop-blur-md mb-4 bg-white/10 text-xs px-3 py-1">
             Case Study
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md">
            {client_or_context || '상세 사례 보고서'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mt-16 max-w-5xl">
         {/* Meta Grid (PAR Framework) */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 p-8 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl shadow-sm">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">도전 과제 (Problem)</h3>
              <p className="font-medium text-slate-800 leading-relaxed">{challenge || '-'}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--theme-primary)] mb-2">접근 방식 (Approach)</h3>
              <p className="font-medium text-slate-800 leading-relaxed">{approach || '-'}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">최종 결과 (Outcome)</h3>
              <p className="font-medium text-slate-800 leading-relaxed">{outcome || '-'}</p>
            </div>
         </div>

         {/* RichText Body */}
         {body && (
           <div className="prose prose-slate max-w-none prose-lg mb-16" dangerouslySetInnerHTML={{ __html: body }} />
         )}

         {/* Visual Assets Lightbox / Grid */}
         {assets.length > 1 && (
           <div className="mt-16">
             <h2 className="text-2xl font-bold mb-8 font-[family-name:var(--theme-font)]">시각적 증빙 (Visual Proof)</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assets.slice(1).map((src, idx) => (
                   <div key={idx} className="relative h-64 md:h-80 w-full overflow-hidden rounded-lg border shadow-sm group">
                      <Image src={src} alt="Visual Proof" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                   </div>
                ))}
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
