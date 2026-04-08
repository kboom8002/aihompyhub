import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: 'apps/storefront/.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const tenantId = '00000000-0000-0000-0000-000000000002'; // vegan-root

  await s.from('brand_profiles').upsert({
    id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
    tenant_id: tenantId,
    brand_id: '22222222-2222-2222-2222-222222222222',
    positioning_summary: 'VEGAN ROOT: 프리미엄 비건 뷰티의 새로운 기준',
    brand_voice: { tone: 'Friendly and Pure', forbidden_terms: ['chemical', 'artificial'] }
  });

  const homepageLayout = [
    {
      type: "BrandHero",
      props: {
        summary: "자연이 허락한 단 하나의 프리미엄 비건 솔루션",
        voice: "Natural & Ethical",
        heroImage: "" // Default image fallback
      }
    },
    {
      type: "BlockHeading",
      props: {
        title: "VEGAN ROOT Official Answers",
        subtitle: "모든 궁금증, 단일 진실 공급원(SSoT)으로 투명하게 공개합니다."
      }
    },
    {
      type: "AnswerCardGrid",
      props: {
        columns: 3
      }
    }
  ];

  await s.from('universal_content_assets').upsert({
     tenant_id: tenantId,
     type: 'design_config',
     category: 'system',
     title: 'Vegan Root Layout config',
     json_payload: {
       base_theme: 'nature_green',
       overrides: {
         primary_color: "#166534",
         bg: "#fdfdfd",
         radius: "16px",
         layout: {
           homepage: homepageLayout
         }
       }
     }
  }, { onConflict: 'tenant_id,type,category' });

  const clusterId = '3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c';
  await s.from('question_clusters').upsert({
     id: clusterId,
     tenant_id: tenantId,
     cluster_name: 'Vegan Certification',
     intent_type: 'trust_inquiry',
     priority_score: 100
  });

  const topicId = '4c4c4c4c-4c4c-4c4c-4c4c-4c4c4c4c4c4c';
  await s.from('topics').upsert({
     id: topicId,
     tenant_id: tenantId,
     cluster_id: clusterId,
     title: '유럽 EVE VEGAN 공식 인증이란?',
     content_status: 'published'
  });

  await s.from('answer_cards').upsert({
     id: '5c5c5c5c-5c5c-5c5c-5c5c-5c5c5c5c5c5c',
     tenant_id: tenantId,
     topic_id: topicId,
     content_status: 'published',
     structured_body: {
        type: 'Verified Trust',
        title: '동물 윤리와 순수 식물성의 기준',
        content: '원료부터 시작해 제조 과정, 동물 실험 전면 배제까지. 세상에서 가장 엄격한 프랑스 EVE VEGAN 협회의 공식 인증을 획득하였습니다. 제품 상단의 마크를 확인하세요.',
        sources: ['프랑스 EVE VEGAN 협회']
     }
  });

  console.log('Vegan-root initialized successfully!');
}
run();
