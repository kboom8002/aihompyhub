import { notFound } from 'next/navigation';
import { resolveTenantId, resolveTenant } from '@/lib/tenant';
import { supabaseAdmin } from '@/lib/supabase';
import { BrandHero } from '@/components/store/BrandHero';
import { AnswerCardGrid } from '@/components/store/AnswerCardGrid';
import { getTenantDesignConfig } from '@/lib/designConfig';
import { BlockRenderer } from '@/components/store/blocks/BlockRenderer';
import { Metadata } from 'next';
import { t } from '@/lib/i18n';

export const revalidate = 0; // Edge Caching: 개발/테스트 중이므로 캐시 비활성화 (프로덕션 시 3600 등 조절)

export async function generateMetadata(props: { params: Promise<{ tenantSlug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { tenantSlug } = params;
  
  const tenantId = await resolveTenantId(tenantSlug);
  if (!tenantId) {
    const title = `${tenantSlug.replace('-', ' ').toUpperCase()} Official Store`;
    return { title, description: 'AI-Crafted canonical storefront' };
  }

  const { data: dbBrandProfile } = await supabaseAdmin.from('brand_profiles').select('*').eq('tenant_id', tenantId).single();
  const { data: payload } = await supabaseAdmin.from('universal_content_assets').select('title, json_payload').eq('tenant_id', tenantId).eq('type', 'curation_config').single();
  
  const brandName = dbBrandProfile?.brand_name || tenantSlug.replace('-', ' ').toUpperCase();
  const description = dbBrandProfile?.brand_story || payload?.json_payload?.description || 'AI-Crafted canonical storefront ensuring absolute trust and transparency.';

  return {
    title: `${brandName} Official SSoT`,
    description,
    openGraph: {
      title: `${brandName} Official SSoT`,
      description,
      type: 'website',
      siteName: brandName,
    }
  };
}

export default async function TenantB2CHomepage(props: { params: Promise<{ tenantSlug: string, locale?: string }> }) {
  const params = await props.params;
  const { tenantSlug, locale = 'ko' } = params;
  
  const tenantInfo = await resolveTenant(tenantSlug);
  console.log(`[DEBUG PAGE] Request for Tenant: ${tenantSlug}, Locale: ${locale}, Found: ${!!tenantInfo}`);
  if (!tenantInfo) {
    console.log(`[DEBUG PAGE] Tenant -> not found`);
    notFound();
  }
  const tenantId = tenantInfo.id;
  const industryType = tenantInfo.industry_type;

  // Fetch the design config to get layout schema
  const designConfig = await getTenantDesignConfig(tenantSlug);
  
  let layoutSettings = designConfig.layout?.homepage || [];

  // Fetch Brand Profile and Answer Cards
  const { data: dbBrandProfile } = await supabaseAdmin.from('brand_profiles').select('*').eq('tenant_id', tenantId).single();
  const { data: dbAnswerCards } = await supabaseAdmin.from('answer_cards').select('*, topics(title)').eq('tenant_id', tenantId);

  // Fetch Brand Hero injected separately
  let { data: dbBrandHero } = await supabaseAdmin.from('universal_content_assets').select('*, json_payload').eq('tenant_id', tenantId).eq('type', 'brand_hero').single();

  function applyTranslations(record: any, currentLocale: string) {
    if (!record || !record.translations || !record.translations[currentLocale]) return record;
    const translated = record.translations[currentLocale];
    if (record.structured_body) return { ...record, structured_body: { ...record.structured_body, ...translated } };
    if (record.json_payload) return { ...record, json_payload: { ...record.json_payload, ...translated } };
    return { ...record, ...translated };
  }

  let brandProfile = dbBrandProfile ? applyTranslations(dbBrandProfile, locale) : null;
  let answerCards = dbAnswerCards?.map((c: any) => applyTranslations(c, locale)) || [];
  if (dbBrandHero) dbBrandHero = applyTranslations(dbBrandHero, locale);

// Template Routing: inject custom presets if specific template is selected
  if (designConfig.homeTemplate === 'question-first' || industryType === 'consulting') {
     designConfig.homeTemplate = 'question-first'; // Ensure activeHeroConfig resolver knows
     layoutSettings = [
        { type: 'SemanticSearchHero' },
        { type: 'BlockHeading', props: { title: t(locale, 'Consultation & SSoT Guide'), subtitle: t(locale, '검증된 케이스와 명확한 진단 기준을 우선 확인하세요.') } },
        { type: 'SituationCurationGrid', props: { 
             situations: industryType === 'consulting' ? [
                 { id: 'strategy', title: '전략 기획 및 구조화', desc: '초기 매출 부진 시 빠른 리빌딩 전략' },
                 { id: 'marketing', title: '마케팅 / CRM 세일즈', desc: 'VIP 유치 및 객단가 상승 최적화 가이드' }
             ] : [
                 { id: 'clinic', title: t(locale, '시술 후 관리 Q&A'), desc: t(locale, '집에서 시술 효과를 극대화하는 법') },
                 { id: 'trouble', title: t(locale, '응급 트러블 진정'), desc: t(locale, '열감, 붉은기 등 빠른 대처가 필요할 때') }
             ]
        } },
        { type: 'AnswerCardGrid' }
     ];
  }

  // Fetch Curation Config (Overrides logic using two-track template layouts)
  let { data: dbCuration } = await supabaseAdmin.from('universal_content_assets').select('json_payload').eq('tenant_id', tenantId).eq('type', 'curation_config').single();
  
  if (dbCuration && dbCuration.json_payload) {
      dbCuration = applyTranslations(dbCuration, locale);
      
      const templateKey = designConfig.homeTemplate || 'universal';
      if (dbCuration?.json_payload?.layouts && dbCuration.json_payload.layouts[templateKey]) {
          layoutSettings = dbCuration.json_payload.layouts[templateKey];
      } else if (templateKey === 'universal' && dbCuration?.json_payload?.layout && dbCuration.json_payload.layout.length > 0) {
          // Backward compatibility for legacy flat layout
          layoutSettings = dbCuration.json_payload.layout;
      }
  }

  const isPreparing = (!brandProfile && !dbBrandHero);

  const baseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';
  
  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brandProfile?.brand_name || tenantSlug,
    url: `${baseUrl}/${tenantSlug}`,
    description: brandProfile?.brand_story || 'Brand SSoT Official Interface',
    logo: designConfig.hero?.heroImage || '',
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (answerCards || []).map((card: any) => ({
      '@type': 'Question',
      name: card.structured_body?.title || card.topics?.title || 'Common Question',
      acceptedAnswer: {
        '@type': 'Answer',
        text: (card.structured_body?.content || 'Verified Information').replace(/(<([^>]+)>)/gi, "")
      }
    }))
  };

  const jsonLdScripts = [
    { type: 'application/ld+json', dangerouslySetInnerHTML: { __html: JSON.stringify(organizationLd) } },
    { type: 'application/ld+json', dangerouslySetInnerHTML: { __html: JSON.stringify(faqLd) } }
  ];

  return (
    <div className="flex flex-col font-sans">
      {jsonLdScripts.map((scriptProps, idx) => (
        <script key={idx} {...scriptProps} />
      ))}

      {isPreparing && (
        <div className="m-auto text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Storefront Preparing</h1>
          <p className="text-muted-foreground">The SSoT components for this tenant have not been published yet.</p>
        </div>
      )}

      {!isPreparing && (() => {
        let activeHeroConfig = designConfig.homeTemplate === 'question-first' ? designConfig.semanticHero : designConfig.hero;
        if (dbBrandHero && dbBrandHero.json_payload) {
             activeHeroConfig = { ...(activeHeroConfig || {}), ...dbBrandHero.json_payload };
        }
        return (
          <BlockRenderer 
            layoutSettings={layoutSettings}
            context={{ tenantSlug, locale, brandProfile, answerCards: answerCards || [], heroConfig: activeHeroConfig }}
          />
        );
      })()}
    </div>
  );
}
