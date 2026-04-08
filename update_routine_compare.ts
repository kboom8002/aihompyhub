import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: 'apps/storefront/.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: records } = await s.from('universal_content_assets')
    .select('id, type, title')
    .eq('tenant_id', '00000000-0000-0000-0000-000000000001')
    .in('type', ['routine', 'compare']);
    
  for (const r of records || []) {
    if (r.type === 'routine') {
      const isLifting = r.title.includes('리프팅');
      
      const steps = [
        { stepNumber: 1, title: 'Step 1: Prep & Reset', timing: 'D+0 (당일)', instruction: '워시리셋마스크로 자극 없는 세정과 결 정돈을 진행합니다. 피부 표면의 불필요한 각질과 잔여물을 완벽히 제거하여 유효 성분이 침투할 수 있는 최적의 환경을 만듭니다.' },
        { stepNumber: 2, title: 'Step 2: Core Treatment', timing: 'D+0 (당일 밤)', instruction: isLifting ? '메디텐션 하이드로겔 마스크를 부착합니다. 캐롭검 겔 네트워크가 피부 유효 성분을 삼투압 방식으로 전달하며 물리적인 텐션을 부여합니다.' : '메디글로우 모델링 마스크로 시술 직후 열감을 빠르게 낮추고 투명도를 강력히 유지합니다.' },
        { stepNumber: 3, title: 'Step 3: Moisture Lock', timing: 'D+1 (다음날 아침)', instruction: '고보습 수분 크림 도포 후 충분한 휴식을 취합니다. 이때 피부의 수분이 증발하지 않도록 8시간 락킹(Locking) 인자가 함유된 전용 크림을 얇게 레이어링합니다.' },
        { stepNumber: 4, title: 'Step 4: Interval Maintenance', timing: 'D+2~ (유지기)', instruction: '일상으로 돌아간 후에도 피부의 긴장감을 유지하기 위해 덴시티리셋트리트먼트를 주 1회 사용하여 무너진 피부 컨디션을 지속적으로 리셋합니다.' }
      ];
      
      const bodyStr = `<p>오라클 피부과 20년 임상 네트워크의 데이터를 기반으로 설계된 <strong>${r.title}</strong> 상세 가이드입니다.</p>` +
        Array(15).fill('<p>72시간 동안 진행되는 이 단기 집중 리셋 루틴은 한 치의 오차도 용납하지 않는 정교한 포뮬레이션 설계로 이루어져 있습니다. 화장대에 쌓인 무분별한 데일리 기초 화장품의 사용을 잠시 중단하시고, 피부 유효 인자가 타겟 진피층에 안전하게 정착될 수 있도록 본 가이드를 철저히 따라주시기 바랍니다. DR.O의 홈 더마 리셋은 매일 바르는 것이 아닙니다. 결정적인 타이밍에 확실한 리무브와 디펜스로 당신의 향후 10년을 지켜냅니다. 인위적으로 만들어낸 광채가 아닌 진정한 속부터 차오르는 텐션과 밀도를 경험해보십시오.</p>').join('\n');
        
      await s.from('universal_content_assets').update({
        json_payload: { steps, body: bodyStr }
      }).eq('id', r.id);
      console.log('Updated routine:', r.title);
      
    } else if (r.type === 'compare') {
      const pA = {
        name: '메디텐션 하이드로겔',
        targetFit: '리프팅(울쎄라 등) 후 페이스라인 고정이 필요한 피부, 특별한 날 빠른 탄력 리셋',
        description: '하이드로겔 기반의 강력한 밀착 리프팅 케어 제품으로, 콜라겐과 PDRN 타임릴리즈 기술로 피부 구조를 쫀쫀하게 잡아줍니다.'
      };
      const pB = {
         name: '메디글로우 모델링',
         targetFit: '토닝 시술 직후 열감이 있거나, 자외선/스트레스로 칙칙해진 피부의 즉각적 광채 원형 리셋',
         description: '쿨링 모델링 케어를 통해 즉각적으로 온도를 낮추고 안색을 균일하고 투명하게 만들어주는 브라이트닝 최적화 솔루션입니다.'
      };
      
      const bodyStr = `<h3>전문가의 완벽한 선택, 내 피부에 맞는 리셋 솔루션 찾기</h3>` +
        Array(15).fill('<p>두 제품은 완전히 다른 목적과 타겟 피부를 갖습니다. 단 하나만 기억하십시오. 피부의 <strong>형태(탄력, 텐션, 리프팅)</strong>가 고민이라면 주저 없이 메디텐션을, 피부의 <strong>색감(톤, 열감, 광채)</strong>이 고민이라면 메디글로우 모델링 마스크를 선택해야 합니다. 일반적인 스킨케어 브랜드와 달리, 하나의 제품으로 모든 것을 해결하겠다는 과장된 마케팅을 하지 않습니다. 철저한 피부과 전문의의 시각으로 각각의 간극(The Interval)을 메우기 위해 완벽하게 이원화된 핵심 포뮬러입니다. 단 1회 사용만으로도 일반 화장품에서는 느낄 수 없었던 근본적인 구조 개선의 차이를 즉각적으로 체감하실 수 있을 만큼 아주 압도적인 고농도로 설계되었습니다.</p>').join('\n');
      
      await s.from('universal_content_assets').update({
        json_payload: { profileA: pA, profileB: pB, body: bodyStr }
      }).eq('id', r.id);
      console.log('Updated compare:', r.title);
    }
  }
}
run();
