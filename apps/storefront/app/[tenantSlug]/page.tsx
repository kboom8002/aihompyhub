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
  const { data: dbAnswerCards } = await supabaseAdmin.from('answer_cards').select('*').eq('tenant_id', tenantId);

  let brandProfile = dbBrandProfile;
  let answerCards = dbAnswerCards;

  if (!brandProfile && tenantSlug === 'dr-oracle') {
      brandProfile = {
         positioning_summary: 'Premium botanical anti-aging targeting sensitive demographics.',
         brand_voice: 'Empathetic Clinical'
      };
      answerCards = [
         { structured_body: { type: 'AnswerCard', title: 'Gentle Anti-aging Routine', content: 'Our revitalizing serum is clinically designed to minimize irritation. We use a bakuchiol plant extract that mimics retinol without the harshness.', sources: ['Internal R&D Lab'] } },
         { structured_body: { type: 'CompareCard', title: 'Retinol vs Bakuchiol', content: 'While Retinol is stronger, Bakuchiol offers 80% similar results with 0% irritation. Ideal for sensitive barriers.', sources: ['Dermatological Study 2025'] } }
      ];
  } else if (!brandProfile && tenantSlug === 'vegan-root') {
      brandProfile = {
         positioning_summary: '100% Plant-Derived Restorative Scalp Care',
         brand_voice: 'Earth-conscious Clinical'
      };
      answerCards = [
         { structured_body: { type: 'AnswerCard', title: '두피 열감 쿨링 가이드', content: '쿨링 멘톨과 로즈마리 성분이 즉각적으로 3도 쿨링 효과를 제공합니다.', sources: ['임상 테스트 완료'] } },
         { structured_body: { type: 'TrustCard', title: 'EVE VEGAN 인증 획득', content: '프랑스 EVE VEGAN으로부터 동물성 원료 배제 공식 인증을 받았습니다.', sources: ['EVE VEGAN Certificate'] } },
         { structured_body: { type: 'InsightCard', title: '설페이트프리 샴푸의 중요성', content: '화학 성분이 두피를 민감하게 만듭니다. 코코넛 유래 성분으로 안전하게 보호하세요.', sources: ['보태니컬 저널 2025'] } }
      ];
  }

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
          context={{ tenantSlug, brandProfile, answerCards: answerCards || [] }}
        />
      )}
    </div>
  );
}
