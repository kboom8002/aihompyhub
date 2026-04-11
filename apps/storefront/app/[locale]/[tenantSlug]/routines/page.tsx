import { t } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveTenantId } from '@/lib/tenant';

export const revalidate = 60;

export default async function RoutinesIndexPage(props: { params: Promise<{ tenantSlug: string, locale?: string }> }) {
  const params = await props.params;
  const locale = params.locale || 'ko';
  const tenantId = await resolveTenantId(params.tenantSlug);
  
  if (!tenantId) return notFound();

  // Fetch true universal assets of type 'routines'
  const { data: assets } = await supabaseAdmin
    .from('universal_content_assets')
    .select('id, title, updated_at, created_at, json_payload, translations')
    .eq('tenant_id', tenantId)
    .eq('type', 'routine')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <Link href={`/${locale}/${params.tenantSlug}`} className="text-sm border border-[var(--theme-border)] px-4 py-2 rounded-full mb-12 inline-block hover:bg-black/5 transition-colors font-medium">
        &larr; {t(locale, '홈으로 돌아가기')}
      </Link>
      
      <div className="mb-12 border-b border-[var(--theme-border)] pb-8">
        <h1 className="text-4xl font-bold tracking-tight font-[family-name:var(--theme-font)] mb-4 text-blue-600">내 루틴/리셋 찾기</h1>
        <p className="opacity-70">상황과 목적에 맞는 검증된 루틴 가이드를 따라가세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(!assets || assets.length === 0) && (
           <div className="col-span-full py-12 text-center border rounded-lg bg-[var(--theme-surface)]">
             <p className="opacity-60">{t(locale, '아직 작성된 항목이 없습니다.')}</p>
           </div>
        )}
        
        {assets?.map((routine) => (
          <Link href={`/${locale}/${params.tenantSlug}/routines/${routine.id}`} key={routine.id}>
             <div className="group h-full bg-[var(--theme-surface)] p-6 rounded-[var(--theme-radius)] border border-[var(--theme-border)] shadow-sm hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer flex flex-col">
                 <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold mb-4">R</div>
                 <h2 className="text-xl font-bold font-[family-name:var(--theme-font)] mb-2 group-hover:text-blue-600 transition-colors">
                   {routine.title}
                 </h2>
                 <p className="text-sm opacity-60 mt-auto pt-4 border-t border-[var(--theme-border)]">
                   {new Date(routine.updated_at || routine.created_at).toLocaleDateString()}
                 </p>
             </div>
          </Link>
        ))}
      </div>
    </div>
  );
}