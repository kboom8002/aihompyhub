import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: 'apps/storefront/.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const tenantId = '00000000-0000-0000-0000-000000000001';

  // 1. Fetch existing Compare and Routine data to inject into homepage props
  const { data: compareAssets } = await s.from('universal_content_assets').select('id, json_payload').eq('tenant_id', tenantId).eq('type', 'compare').limit(1);
  const compareData = compareAssets?.[0]?.json_payload;

  const { data: routineAssets } = await s.from('universal_content_assets').select('id, json_payload').eq('tenant_id', tenantId).eq('type', 'routine').limit(1);
  const routineData = routineAssets?.[0]?.json_payload;

  // Profile fallbacks in case DB doesn't have it
  const pA = compareData?.profileA || { name: '메디텐션 하이드로겔', targetFit: '리프팅(탄력) 피부', description: '하이드로겔 기반의 강력한 밀착 리프팅 솔루션' };
  const pB = compareData?.profileB || { name: '메디글로우 모델링', targetFit: '열감 / 칙칙한 피부', description: '즉각적인 쿨링과 안색 관리를 위한 모델링 팩' };
  
  const steps = routineData?.steps || [
     { stepNumber: 1, title: 'Step 1: Prep & Reset', timing: 'D+0', instruction: '워시리셋마스크로 자극 없는 세정 결 정돈.' },
     { stepNumber: 2, title: 'Step 2: Core Treatment', timing: 'D+0', instruction: '메디텐션 하이드로겔 마스크로 텐션 부여.' }
  ];

  const homepageLayout = [
    {
      type: "BrandHero",
      props: {
        heroImage: "/dr_o_hero.png"
      }
    },
    {
      type: "BlockHeading",
      props: {
        title: "결정적 차이, 내 피부에 맞는 리셋 솔루션",
        subtitle: "모든 피부를 위한 만병통치약은 없습니다. 상황과 타이밍에 맞는 전문가의 처방을 확인하세요."
      }
    },
    {
      type: "CompareQuickDecision",
      props: {
        profileA: pA,
        profileB: pB
      }
    },
    {
      type: "BlockHeading",
      props: {
        title: "D-DAY 카운트다운 리셋 루틴",
        subtitle: "중요한 날을 위한 72시간 골든타임 프로토콜"
      }
    },
    {
      type: "RoutineStepCard",
      props: {
        steps: steps
      }
    },
    {
      type: "BlockHeading",
      props: {
        title: "AEO Verified SSoT Answers",
        subtitle: "전문가 그룹이 검증한 브랜드 단일 진실 공급원(SSoT) 공식 답변입니다."
      }
    },
    {
      type: "AnswerCardGrid",
      props: {
        columns: 3
      }
    }
  ];

  const { data: dConf, error } = await s.from('universal_content_assets').update({
     json_payload: {
       base_theme: 'clinical_premium',
       overrides: {
         primary_color: "#18181B",
         bg: "#ffffff",
         radius: "12px",
         layout: {
           homepage: homepageLayout
         }
       }
     }
  }).eq('tenant_id', tenantId).eq('type', 'design_config');

  if(error) console.error(error);
  else console.log('Successfully updated homepage layout design config!');
}
run();
