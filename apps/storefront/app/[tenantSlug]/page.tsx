import { notFound } from 'next/navigation';
import { resolveTenantId } from '../../lib/tenant';
import { supabaseAdmin } from '../../lib/supabase';
import { BrandHero } from '../../components/store/BrandHero';
import { AnswerCardGrid } from '../../components/store/AnswerCardGrid';
import { getTenantDesignConfig } from '../../lib/designConfig';
import { BlockRenderer } from '../../components/store/blocks/BlockRenderer';
import { Metadata } from 'next';

export const revalidate = 0; // Edge Caching: 개발/테스트 중이므로 캐시 비활성화 (프로덕션 시 3600 등 조절)

// Phase 2: Dynamic SEO Metadata
export async function generateMetadata({ params }: { params: { tenantSlug: string } }): Promise<Metadata> {
  const { tenantSlug } = await params;
  const title = tenantSlug === 'dr-oracle' ? 'Dr.Oracle Official' : `${tenantSlug.replace('-', ' ').toUpperCase()} Official Store`;
  
  return {
    title,
    description: 'AI-Crafted canonical storefront ensuring absolute trust and transparency.',
    openGraph: {
      title,
      description: 'Experience verified aesthetics and zero trust-gap commerce.',
      type: 'website',
    }
  };
}

export default async function TenantB2CHomepage({ params }: { params: { tenantSlug: string } }) {
  const { tenantSlug } = await params;
  
  const tenantId = await resolveTenantId(tenantSlug);
  if (!tenantId) {
    notFound();
  }

  // Fetch the design config to get layout schema
  const designConfig = await getTenantDesignConfig(tenantSlug);
  let layoutSettings = designConfig.layout?.homepage || [];

  // Fetch Curation Config (Overrides YAML Layout if set)
  const { data: dbCuration } = await supabaseAdmin.from('universal_content_assets').select('json_payload').eq('tenant_id', tenantId).eq('type', 'curation_config').single();
  if (dbCuration && dbCuration.json_payload?.layout?.length > 0) {
      layoutSettings = dbCuration.json_payload.layout;
  }

  const { data: dbBrandProfile } = await supabaseAdmin.from('brand_profiles').select('*').eq('tenant_id', tenantId).single();
  const { data: dbAnswerCards } = await supabaseAdmin.from('answer_cards').select('*, topics(title)').eq('tenant_id', tenantId);

  let brandProfile = dbBrandProfile;
  let answerCards = dbAnswerCards;


  const isPreparing = !brandProfile;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (answerCards || []).map((card: any) => ({
      '@type': 'Question',
      name: card.structured_body?.title || 'Common Question',
      acceptedAnswer: {
        '@type': 'Answer',
        text: card.structured_body?.content || 'Verified Information'
      }
    }))
  };

  return (
    <div className="flex flex-col font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {isPreparing && (
        <div className="m-auto text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Storefront Preparing</h1>
          <p className="text-muted-foreground">The SSoT components for this tenant have not been published yet.</p>
        </div>
      )}

      {!isPreparing && (
        <BlockRenderer 
          layoutSettings={layoutSettings}
          context={{ tenantSlug, brandProfile, answerCards: answerCards || [], heroConfig: designConfig.hero }}
        />
      )}
    </div>
  );
}
