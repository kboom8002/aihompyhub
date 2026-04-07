import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // Make sure process.env contains local keys if run via TSX locally

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'stub-service-key'
);

async function run() {
  try {
      const tId = '00000000-0000-0000-0000-000000000002';
      
      console.log('Seeding extended mock data for VEGAN ROOT (id: ' + tId + ')...');

      // 1. Answer Card
      await supabaseAdmin.from('universal_content_assets').insert({
         tenant_id: tId, category: 'brand_ssot', type: 'answer', title: '비건 샴푸로 두피 열감을 내릴 수 있나요?',
         json_payload: { 
             answer: "네, VEGAN ROOT의 주요 성분인 쿨링 멘톨과 로즈마리 잎 추출물이 즉각적으로 두피 온도를 약 3도 가량 낮춰주는 임상 테스트를 완료했습니다. 일반 화학 샴푸와 달리 인공 쿨링제가 아닌 자연 유래 성분으로 자극 없이 열감을 진정시킵니다.",
             source: "한국피부과학연구원 2025 임상 세션"
         }
      });

      // 2. Trust (신뢰/보증)
      await supabaseAdmin.from('universal_content_assets').insert({
         tenant_id: tId, category: 'brand_ssot', type: 'trust', title: '유럽 EVE VEGAN 공식 인증 획득',
         json_payload: { 
             badgeUrl: "/images/eve-vegan-badge.png",
             description: "원료부터 시작해 제조 과정, 포장 동물성 원료 배제까지 매우 까다로운 프랑스 EVE VEGAN 협회의 공식 인증을 획득하였습니다. 제품 상단의 마크를 확인하세요."
         }
      });

      // 3. STORY (Media SSoT)
      await supabaseAdmin.from('universal_content_assets').insert({
         tenant_id: tId, category: 'media_ssot', type: 'story', title: '자연에서 온 비건 루트의 탄생 배경',
         json_payload: { 
             body: "<p>창립자는 어릴 적부터 심한 지루성 두피염을 앓고 있었습니다. 독한 화학 샴푸들이 오히려 두피 보호막을 파괴한다는 사실을 깨달은 후, 오직 식물성 단백질과 아마존 피토 콤플렉스만으로 기적의 포뮬러를 만들어 냈습니다. 그것이 VEGAN ROOT의 시작입니다.</p>",
             author: "VEGAN ROOT 창립자, Jane Doe"
         }
      });

      // 4. INSIGHT (Media SSoT)
      await supabaseAdmin.from('universal_content_assets').insert({
         tenant_id: tId, category: 'media_ssot', type: 'insight', title: '화학 계면활성제가 두피에 미치는 치명적 영향',
         json_payload: { 
             body: "<h2>설페이트의 경고</h2><p>강력한 세정력을 지닌 설페이트 성분은 사실 자동차 세정제에도 들어갈 만큼 독합니다. 두피의 필수 피지마저 모조리 씻어내어 오히려 더 많은 유분을 분비하게 만들고 악순환을 유발합니다. VEGAN ROOT는 100% 코코넛 유래 계면활성제 기포를 사용합니다.</p>",
             tags: ["두피건강", "계면활성제", "비건케어"]
         }
      });

      console.log('Seed extended successfully!');
  } catch (e: any) {
      console.error('Seed Error:', e.message);
  }
}
run();
