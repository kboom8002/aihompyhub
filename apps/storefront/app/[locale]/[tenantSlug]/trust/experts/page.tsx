import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveTenantId } from '@/lib/tenant';
import { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ tenantSlug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const brandName = params.tenantSlug.replace('-', ' ').toUpperCase();
  return {
    title: `${brandName} | 전문가 위원회 (Expert Panel)`,
    description: `${brandName} 콘텐츠를 검수하고 제작하는 의료 및 전문가 집단을 확인하세요.`,
  };
}

export default async function ExpertsIndexPage(props: { params: Promise<{ tenantSlug: string }> }) {
  const params = await props.params;
  const tenantId = await resolveTenantId(params.tenantSlug);
  if (!tenantId) return notFound();

  const { data: experts } = await supabaseAdmin
    .from('universal_content_assets')
    .select('id, title, updated_at, created_at, json_payload')
    .eq('tenant_id', tenantId)
    .eq('type', 'expert')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-16 px-4 max-w-5xl">
       <Link href={`/${params.tenantSlug}/trust`} className="text-sm border border-[var(--theme-border)] px-3 py-1 rounded-full mb-8 inline-block hover:bg-black/5 transition-colors">
        &larr; 신뢰 허브 홈
      </Link>
      
      <div className="mb-16 border-b border-[var(--theme-border)] pb-8">
        <h1 className="text-4xl font-light tracking-tight font-[family-name:var(--theme-font)] mb-4 uppercase">Medical Board & Expert Panel</h1>
        <p className="opacity-70 text-lg">모든 콘텐츠와 R&D 데이터의 투명성을 검증하는 공식 전문가/리뷰어 위원회입니다.</p>
      </div>

      {(!experts || experts.length === 0) && (
         <div className="col-span-full py-16 text-center border rounded-xl bg-white shadow-sm">
           <div className="text-4xl mb-4">🩺</div>
           <p className="opacity-60 text-lg">아직 등록된 전문가 프로필이 없습니다.</p>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experts?.map((expert: any) => {
          const payload = expert.json_payload || {};
          return (
            <Link href={`/${params.tenantSlug}/trust/experts/${expert.id}`} key={expert.id} className="group block">
              <div className="bg-white p-6 rounded-2xl border border-[var(--theme-border)] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 h-full flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-100 border-2 border-[var(--theme-primary)]/20 p-1">
                  <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${payload.profile_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(expert.title)})` }} />
                </div>
                <div className="text-xs font-bold text-[var(--theme-primary)] tracking-widest uppercase mb-1">
                  {payload.role_title || 'Expert'}
                </div>
                <h2 className="text-xl font-bold font-[family-name:var(--theme-font)] group-hover:text-[var(--theme-primary)] transition-colors">
                  {expert.title}
                </h2>
                <p className="opacity-70 text-sm mt-3 line-clamp-3">
                  {payload.bio || payload.credentials || '상세 약력을 확인해보세요.'}
                </p>
                <div className="mt-6 text-sm font-medium text-[var(--theme-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                  프로필 및 검수 이력 보기 &rarr;
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
