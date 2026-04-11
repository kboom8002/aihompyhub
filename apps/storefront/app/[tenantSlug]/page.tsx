import { notFound } from 'next/navigation';
import { resolveTenantId } from '../../lib/tenant';
import { supabaseAdmin } from '../../lib/supabase';
import { BrandHero } from '../../components/store/BrandHero';
import { AnswerCardGrid } from '../../components/store/AnswerCardGrid';
import { getTenantDesignConfig } from '../../lib/designConfig';
import { BlockRenderer } from '../../components/store/blocks/BlockRenderer';
import { Metadata } from 'next';

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

export default async function TenantB2CHomepage(props: { params: Promise<{ tenantSlug: string }> }) {
  const params = await props.params;
  const { tenantSlug } = params;
  
  const tenantId = await resolveTenantId(tenantSlug);
  if (!tenantId) {
    notFound();
  }

  // Fetch the design config to get layout schema
  const designConfig = await getTenantDesignConfig(tenantSlug);
  
  let layoutSettings = designConfig.layout?.homepage || [];

  // Template Routing: inject custom presets if specific template is selected
  if (designConfig.homeTemplate === 'question-first') {
     layoutSettings = [
        { type: 'SemanticSearchHero' },
        { type: 'BlockHeading', props: { title: 'Your SSoT Guide', subtitle: '전문가가 제안하는 검증된 답변과 루틴' } },
        { type: 'SituationCurationGrid' },
        { type: 'AnswerCardGrid' }
     ];
  }

  // Fetch Curation Config (Overrides logic using two-track template layouts)
  const { data: dbCuration } = await supabaseAdmin.from('universal_content_assets').select('json_payload').eq('tenant_id', tenantId).eq('type', 'curation_config').single();
  
  if (dbCuration && dbCuration.json_payload) {
      const templateKey = designConfig.homeTemplate || 'universal';
      if (dbCuration.json_payload.layouts && dbCuration.json_payload.layouts[templateKey]) {
          layoutSettings = dbCuration.json_payload.layouts[templateKey];
      } else if (templateKey === 'universal' && dbCuration.json_payload.layout?.length > 0) {
          // Backward compatibility for legacy flat layout
          layoutSettings = dbCuration.json_payload.layout;
      }
  }

  const { data: dbBrandProfile } = await supabaseAdmin.from('brand_profiles').select('*').eq('tenant_id', tenantId).single();
  const { data: dbAnswerCards } = await supabaseAdmin.from('answer_cards').select('*, topics(title)').eq('tenant_id', tenantId);

  let brandProfile = dbBrandProfile;
  let answerCards = dbAnswerCards;


  const isPreparing = !brandProfile;

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
        const activeHeroConfig = designConfig.homeTemplate === 'question-first' ? designConfig.semanticHero : designConfig.hero;
        return (
          <BlockRenderer 
            layoutSettings={layoutSettings}
            context={{ tenantSlug, brandProfile, answerCards: answerCards || [], heroConfig: activeHeroConfig }}
          />
        );
      })()}
    </div>
  );
}
