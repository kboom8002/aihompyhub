import { t } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveTenantId } from '@/lib/tenant';
import { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ tenantSlug: string, locale?: string }> }): Promise<Metadata> {
  const params = await props.params;
  const tenantId = await resolveTenantId(params.tenantSlug);
  
  if (!tenantId) {
    const brandName = params.tenantSlug.replace('-', ' ').toUpperCase();
    return { title: `${brandName} Official Answers`, description: 'Verified official answers collection' };
  }

  const { data: dbBrandProfile } = await supabaseAdmin.from('brand_profiles').select('brand_name').eq('tenant_id', tenantId).single();
  const brandName = dbBrandProfile?.brand_name || params.tenantSlug.replace('-', ' ').toUpperCase();

  return {
    title: `${brandName} Official Answers Hub`,
    description: `Browse verified canonical answers and official SSoT documents from ${brandName}.`,
    openGraph: {
      title: `${brandName} Official Answers Hub`,
      description: `Browse verified canonical answers and official SSoT documents from ${brandName}.`,
      type: 'website'
    }
  }
}

export default async function AnswersIndexPage(props: { params: Promise<{ tenantSlug: string, locale?: string }> }) {
  const params = await props.params;
  const tenantSlug = params.tenantSlug;
  const locale = params.locale || 'ko';
  const tenantId = await resolveTenantId(tenantSlug);
  
  if (!tenantId) return notFound();

  // Fetch true universal assets of type 'answers'
  const { data: assets } = await supabaseAdmin
    .from('universal_content_assets')
    .select('id, title, updated_at, created_at, json_payload')
    .eq('tenant_id', tenantId)
    .eq('type', 'answer')
    .order('created_at', { ascending: false });

  function applyTranslations(record: any, currentLocale: string) {
    if (!record || !record.translations || !record.translations[currentLocale]) return record;
    const translated = record.translations[currentLocale];
    if (record.structured_body) return { ...record, structured_body: { ...record.structured_body, ...translated } };
    if (record.json_payload) return { ...record, json_payload: { ...record.json_payload, ...translated } };
    return { ...record, ...translated };
  }

  const localizedAssets = assets?.map(a => applyTranslations(a, locale)) || [];

  // If DB call failed but we have mock data logic in API, we can't easily rely on that here in RSC.
  // We'll rely directly on DB.

  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <Link href={`/${locale}/${params.tenantSlug}`} className="text-sm font-medium mb-12 inline-block hover:opacity-70 transition-opacity">
        &larr; {t(locale, '홈으로 돌아가기')}
      </Link>
      
      <div className="mb-12 border-b border-[var(--theme-border)] pb-8">
        <h1 className="text-4xl font-light tracking-tight font-[family-name:var(--theme-font)] mb-4">{t(locale, '공식 답변 허브')}</h1>
        <p className="opacity-70">{t(locale, '브랜드에서 직접 검증하고 서명한 Canonical Answer 리스트입니다.')}</p>
      </div>

      <div className="flex flex-col gap-4">
        {(!localizedAssets || localizedAssets.length === 0) && (
           <div className="py-12 text-center border rounded-lg bg-[var(--theme-surface)]">
             <p className="opacity-60">{t(locale, '아직 작성된 항목이 없습니다.')}</p>
           </div>
        )}
        
        {localizedAssets?.map((answer) => (
          <Link href={`/${locale}/${params.tenantSlug}/answers/${answer.id}`} key={answer.id}>
             <div className="group bg-[var(--theme-surface)] p-6 rounded-[var(--theme-radius)] border border-[var(--theme-border)] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col gap-2">
                 <div className="text-xs font-bold text-[var(--theme-primary)] tracking-widest uppercase mb-1">
                    {answer.json_payload?.category || 'Answer SSoT'}
                 </div>
                 <h2 className="text-xl font-semibold font-[family-name:var(--theme-font)] group-hover:underline decoration-[var(--theme-border)] underline-offset-4">
                   {answer.title}
                 </h2>
                 <p className="text-sm opacity-60 mt-2">
                   {new Date(answer.updated_at || answer.created_at).toLocaleDateString()} {t(locale, '업데이트됨')}
                 </p>
             </div>
          </Link>
        ))}
      </div>
    </div>
  );
}