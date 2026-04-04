import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '../../../../lib/supabase';
import { resolveTenantId } from '../../../../lib/tenant';
import { ProseReader } from '../../../../components/store/ProseReader';

export const revalidate = 60;

export default async function ProductDetailPage(props: { params: Promise<{ tenantSlug: string, id: string }> }) {
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
    <article className="container mx-auto py-12 text-[var(--theme-text)] px-4 md:px-0">
      <Link href={`/${params.tenantSlug}/products`} className="text-sm border border-[var(--theme-border)] px-4 py-2 rounded-full mb-8 inline-block hover:bg-black/5 transition-colors">
        &larr; 쇼핑 계속하기
      </Link>
      
      <div className="flex flex-col md:flex-row gap-12 lg:gap-16 mt-8">
         {/* Left: Product Image */}
         <div className="w-full md:w-1/2">
            <div className="aspect-square bg-[#f8fafc] rounded-2xl overflow-hidden border border-[var(--theme-border)] flex items-center justify-center p-8 relative">
               {payload.thumbnail ? (
                  <img src={payload.thumbnail} alt={content.title} className="w-full h-full object-contain mix-blend-multiply" />
               ) : (
                  <span className="text-gray-400 font-medium">제품 이미지를 등록해주세요 (Thumbnail)</span>
               )}
            </div>
         </div>

         {/* Right: Product Meta & Checkout */}
         <div className="w-full md:w-1/2 flex flex-col justify-center">
            <span className="text-sm font-bold text-[var(--theme-primary)] tracking-widest uppercase mb-3 block">
               {payload.type === 'bundle' ? 'Official Bundle' : 'Single Product'}
            </span>
            <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight font-[family-name:var(--theme-font)] mb-4 leading-tight">{content.title}</h1>
            <p className="text-xl opacity-80 mb-8 leading-relaxed">{payload.summary || '가장 최적화된 조합으로 제안하는 브랜드 공식 커머스 라인업입니다.'}</p>
            
            <div className="text-3xl font-light mb-8">
               {payload.price ? `₩${payload.price.toLocaleString()}` : '가격 미정'}
            </div>

            <div className="flex gap-4">
               <button className="flex-1 bg-[var(--theme-text)] text-[var(--theme-surface)] font-bold py-4 rounded-xl hover:opacity-90 transition-opacity">
                  장바구니 담기
               </button>
               <button className="flex-1 bg-[var(--theme-primary)] text-white font-bold py-4 rounded-xl hover:brightness-110 transition-all">
                  바로 구매
               </button>
            </div>

            <div className="mt-8 pt-8 border-t border-[var(--theme-border)] flex flex-col gap-3 text-sm opacity-70">
               <div className="flex justify-between"><span>배송정보</span><span>오후 2시 이전 결제 시 당일발송</span></div>
               <div className="flex justify-between"><span>루틴호환성</span><span className="text-[var(--theme-primary)] font-medium">100% 매칭됨</span></div>
            </div>
         </div>
      </div>

      <div className="mt-24 pt-16 border-t border-[var(--theme-border)] max-w-4xl mx-auto">
         <h3 className="text-2xl font-bold font-[family-name:var(--theme-font)] mb-12 text-center">상세 설명</h3>
         <ProseReader html={payload.body || '<p>상세 설명이 등록되지 않았습니다.</p>'} />
      </div>

    </article>
  );
}