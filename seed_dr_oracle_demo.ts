import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: 'apps/storefront/.env.local' });

// 1. Setup client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'stub'
);

const { v4: uuidv4 } = require('uuid');

async function run() {
  try {
    const tenantId = '00000000-0000-0000-0000-000000000001'; // dr-oracle
    console.log(`Seeding demo data for DR.O (tenant: ${tenantId})...`);

    // Foundation: Brand Voice JSON update 
    // We already fixed this in code, but let's make sure the brand_voice is proper JSON
    await supabaseAdmin.from('brand_profiles').upsert({
      id: 'a1a447d4-6b2f-4c4b-b770-acefdf9d2c4b',
      tenant_id: tenantId,
      brand_id: '11111111-1111-1111-1111-111111111111',
      positioning_summary: 'Premium botanical anti-aging solutions targeting sensitive skin demographics.',
      brand_voice: { "tone": "Expert yet Relatable", "forbidden_terms": ["magic", "instant cure", "miracle"] }
    });

    // Level 2: Taxonomy (Cluster and Topics)
    const cluster1 = '1c1c1c1c-1c1c-1c1c-1c1c-1c1c1c1c1c1c';
    await supabaseAdmin.from('question_clusters').upsert({
      id: cluster1,
      tenant_id: tenantId,
      cluster_name: 'The Interval (시술 후 빈틈없는 리셋 케어)',
      intent_type: 'routine_discovery',
      priority_score: 99
    });

    const t_routine = '2c2c2c2c-2c2c-2c2c-2c2c-2c2c2c2c2c21';
    const t_compare = '2c2c2c2c-2c2c-2c2c-2c2c-2c2c2c2c2c22';
    const t_trust = '2c2c2c2c-2c2c-2c2c-2c2c-2c2c2c2c2c23';

    const content_status = 'published';

    const et = await supabaseAdmin.from('topics').upsert([
      { id: t_routine, tenant_id: tenantId, cluster_id: cluster1, title: '메디텐션 하이드로겔 리프팅 리셋 프로토콜', content_status },
      { id: t_compare, tenant_id: tenantId, cluster_id: cluster1, title: '메디텐션 vs 메디글로우, 내 피부 리셋 타이밍은?', content_status },
      { id: t_trust, tenant_id: tenantId, cluster_id: cluster1, title: '오라클 피부과 20년 임상 네트워크의 정수', content_status }
    ]);
    if (et.error) console.error('Topics error: ', et.error);

    // Level 3 & 4: AnswerCards (Linked to Topics)
    console.log('Inserting Answer Cards (Content)...');
    
    // We fetch existing answer cards for dr-oracle to update them or insert new ones
    // We will clear existing answer cards to re-seed beautifully without the messy blocks payload
    await supabaseAdmin.from('answer_cards').delete().eq('tenant_id', tenantId);

    const answerInsert = await supabaseAdmin.from('answer_cards').insert([
      {
        id: uuidv4(),
        tenant_id: tenantId,
        topic_id: t_routine,
        content_status: 'published',
        structured_body: {
          type: 'Routine SSoT',
          title: '붙이는 순간 밀착 리프팅 홈 트리트먼트',
          content: '캐롭검 겔 네트워크가 피부에 밀착되어 늘어진 페이스라인을 조여줍니다. 울쎄라 등 리프팅 시술 후 탄력 공백을 완벽하게 커버하며, 중요한 약속 전 아침에 15분만 투자해 보세요.',
          sources: ['Oracle R&D Center 2025']
        }
      },
      {
        id: uuidv4(),
        tenant_id: tenantId,
        topic_id: t_compare,
        content_status: 'published',
        structured_body: {
          type: 'Compare SSoT',
          title: '탄력 리셋(텐션) vs 톤 리셋(글로우)',
          content: '✔ 리프팅 후나 중요 일정 전 탄력 고정이 필요하다면 [메디텐션]을 선택하세요.\n✔ 토닝 시술 후나 열감으로 칙칙해진 피부를 빠르게 밝히고 진정시켜 광채를 원한다면 쿨링 모델링인 [메디글로우]를 선택하세요.',
          sources: ['Interval Skin Protocol']
        }
      },
      {
        id: uuidv4(),
        tenant_id: tenantId,
        topic_id: t_trust,
        content_status: 'published',
        structured_body: {
          type: 'Verified Trust',
          title: 'Clinic-Level Logic 설계',
          content: '아무거나 매일 많이 바르는 일반 데일리 팩이 아닙니다. 20년간 수백만 누적 시술 경과를 축적한 피부과 전문의 그룹이 설계한 구조적 피부 리셋 포뮬러입니다.',
          sources: ['최종 임상 검증 완료']
        }
      }
    ]);
    if (answerInsert.error) console.error('Answer Insert Error:', answerInsert.error);

    // Level 5: Homepage Design Override
    console.log('Updating design_config...');
    const dConf = await supabaseAdmin.from('universal_content_assets').upsert({
      tenant_id: tenantId,
      category: 'system',
      type: 'design_config',
      title: 'DR.O Layout Settings',
      json_payload: {
        base_theme: 'clinical_premium',
        overrides: {
          primary_color: "#18181B",
          bg: "#ffffff",
          radius: "12px",
          layout: {
            homepage: [
              {
                type: "BrandHero",
                props: {
                   alignment: "center",
                   heroImage: "/dr_o_hero.png" // placeholder relative path (if missing, it uses original default or throws 404 on browser nicely)
                }
              },
              {
                type: "BlockHeading",
                props: {
                  title: "Clinic-derived Home Derma",
                  subtitle: "시술과 시술 사이, 완벽한 피부 리셋을 위한 The Interval 카탈로그"
                }
              },
              {
                type: "AnswerCardGrid",
                props: {
                  columns: 3
                }
              }
            ]
          }
        }
      }
    }, { onConflict: 'tenant_id,type,category' });
    if(dConf.error) console.error(dConf.error);

    console.log('DR.O demo seeding successfully executed!');
  } catch(e) {
    console.error('Error during seeding: ', e);
  }
}

run();
