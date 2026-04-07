import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  const tId = '00000000-0000-0000-0000-000000000002';
  
  await supabaseAdmin.from('tenants').delete().eq('id', tId); // clear if exists
  await supabaseAdmin.from('tenants').insert({ id: tId, name: 'Vegan Haircare Brand' });
  await supabaseAdmin.from('brands').insert({ tenant_id: tId, name: 'VEGAN ROOT' });

  await supabaseAdmin.from('universal_content_assets').insert([
    {
       tenant_id: tId, category: 'brand_ssot', type: 'topic_hub', title: '설페이트프리 샴푸란?',
       json_payload: { body: '<p>설페이트 계면활성제를 첨가하지 않아 두피 자극을 최소화한 제품입니다.</p>' }
    },
    {
       tenant_id: tId, category: 'brand_ssot', type: 'topic_hub', title: '올바른 헤어 트리트먼트 사용법',
       json_payload: { body: '<p>물기를 꽉 짠 상태에서 모발 끝 쪽에 도포한 뒤 5분 후 씻어냅니다.</p>' }
    },
    {
       tenant_id: tId, category: 'brand_ssot', type: 'compare', title: '일반 샴푸 vs 비건 트리트먼트 샴푸',
       json_payload: {
           profileA: { name: '일반 약산성 샴푸', targetFit: '가벼운 피지 컨트롤', description: '기본적인 두피 pH 밸런싱을 돕는 일반 라인' },
           profileB: { name: '비건 제로샴푸', targetFit: '극손상모 집중 영양', description: '비건 인증 성분으로 손상모에 단백질 충전' },
           body: '<p>민감성 두피라면 반드시 비건 인증된 트리트먼트 결합형 샴푸를 권장합니다.</p>'
       }
    }
  ]);
  
  console.log('Seed injected successfully!');
}

run();
