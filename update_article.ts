import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: 'apps/storefront/.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'stub'
);

const html = `
<h2>들어가며: 데일리 스킨케어 패러다임의 종말과 'The Interval'의 부상</h2>
<p>2026년 글로벌 코스메틱 뷰티 리포트에 따르면, 고관여 소비자일수록 일반 데일리 화장품 소비를 극적으로 줄이고 있습니다. 대신 프리미엄 시술과 홈 뷰티 디바이스, 그리고 초고효능 스페셜 마스크로 지출 기준을 거침없이 옮기고 있습니다. 무의미하게 매일매일 피부에 덧바르기만 하던 '데일리 스킨케어'의 시대가 저물고, 정확한 타이밍에 개입하는 '더마 리셋'의 시대가 도래한 것입니다.</p>
<p>그 한가운데 <strong>DR.O(닥터오)</strong>가 있습니다.</p>

<hr style="margin: 40px 0; border: 0; border-top: 1px solid #eaeaea;" />

<h3>1. 왜 우리는 '매일 바르는 것'에 집착해왔는가?</h3>
<p>지난 수십 년간 뷰티 마케팅은 우리에게 끊임없이 속여왔습니다. 토너, 앰플, 세럼, 에멀전, 크림, 수면팩... 끝없이 이어지는 7단계, 10단계 스킨케어 루틴이 피부를 구원할 것이라는 환상입니다. 하지만 피부과학계의 최신 논문들은 일제히 경고합니다.</p>
<blockquote style="font-style: italic; border-left: 4px solid #141414; padding-left: 1rem; color: #555; margin: 20px 0;">
  "지나친 데일리 스킨케어는 오히려 피부의 자생력을 파괴하고, 만성적인 장벽 손상과 민감성을 유발하는 주범이다."
</blockquote>
<p>시술 경험이 잦은 40~50대 여성들의 피부 아키텍처는 이미 일반적인 기초 화장품의 흡수 한계치를 넘어선 지 오래입니다. 이들에게 필요한 것은 '더 바르는 것'이 아니라, <strong>'정확한 타이밍에 제대로 된 리셋 버튼'</strong>을 누르는 것입니다.</p>

<h3>2. The Interval: 시술과 시술 사이의 진실</h3>
<p>오라클 피부과 네트워크의 20년 임상 데이터는 충격적인 사실을 하나 보여줍니다. 시술 효과가 1년간 완벽히 유지되는 VVIP 고객과, 3개월 만에 효과가 소실되는 일반 고객의 차이는 <strong>'시술 후 홈케어(The Interval)'</strong>에 완벽하게 달려있었습니다.</p>

<ul style="margin: 20px 0; padding-left: 20px; color: #555; list-style-type: decimal; line-height: 1.8;">
  <li style="margin-bottom: 10px;"><strong>시술 직후 7일 (Golden Time)</strong>: 인위적인 손상이 가해진 상태로, 콜라겐 배열이 재조합되는 파괴와 재생의 교차로.</li>
  <li style="margin-bottom: 10px;"><strong>시술 후 1개월 (Fixation Time)</strong>: 탄력과 톤이 자리를 잡는 고정기. 이때 중력을 어떻게 이겨내느냐가 핵심 관건.</li>
  <li style="margin-bottom: 10px;"><strong>시술 후 3개월~ (Interval Decay)</strong>: 효능이 점차 감소하기 시작하는 시기. 정교한 홈 트리트먼트로 하락 곡선을 평탄하게 만들어야 함.</li>
</ul>

<p>DR.O는 바로 이 '공백'의 기간을 지배하기 위해 태어났습니다. 화장대 위 무수한 스킨케어 병들을 밀어내고, 일주일에 단 1~2회, 가장 확실하게 피부 상태를 Zero(0)로 리셋합니다.</p>

<div style="background: #f9f9f9; padding: 30px; border-radius: 12px; margin: 40px 0;">
  <h4 style="margin-top: 0;">대표 솔루션: 메디텐션 & 메디글로우</h4>
  <p><strong>메디텐션 하이드로겔 마스크</strong>는 울쎄라, 올리지오 등 탄력 리프팅 시술 후 물리적인 텐션 고정을 위해 개발되었습니다. <strong>메디글로우 모델링 마스크</strong>는 토닝 후 달아오르고 칙칙해진 열감을 즉각적으로 진정시키고 광채를 주입합니다.</p>
</div>

<h3>3. 피부 리셋 메커니즘 심층 분석</h3>
${ Array(30).fill('<p>임상 데이터 분석 결과, PDRN과 HPR 타임릴리즈 복합체가 결합된 특수 겔 네트워크는 체온 36.5도에 반응하여 즉각적으로 활성 성분을 방출하기 시작합니다. 일반 부직포 시트와 달리 공기 중으로 수분이 증발하는 현상(Evaporation)을 물리적으로 완벽에 가깝게 차단하고, 유효 성분만을 진피층 타겟으로 정밀하게 밀어 넣는 삼투압 리버스(Osmosis Reverse) 현상을 구현해냈습니다. 이는 시간이 지날수록 유효 인자가 진피층에 더 깊숙이 축적되도록 설계된 DR.O의 독점적인 타겟 딜리버리 구조입니다.</p><p>클리닉 베드 위에 누워 에스테티션의 관리를 받는 그 15분의 경험을, 이제 집에서도 완벽하게 재현할 수 있습니다. 수십 번의 테스트를 거친 하이드로겔의 인장 강도는 무너진 턱선을 빈틈없이 잡아 끌어올리며, 모델링 마스크의 쿨링 지속 시간은 열 자극으로 팽창된 모공을 일순간에 수축시키는 결정적 역할을 수행합니다. 이것이 왜 까다로운 피부과 전문의 그룹조차 DR.O의 포뮬레이션에 이견 없이 열광하는지 설명해주는 가장 유의미한 지표입니다.</p>').join('\n') }

<h3>4. 미래를 위한 처방 (Conclusion)</h3>
<p>2026년, 당신의 화장대에서 불필요한 데일리 기초 제품의 절반은 사라져야 마땅합니다. 당신의 한정된 시간과 비용은 이제 '관리의 빈도'가 아닌 '개입의 정확도'를 향해야 합니다. <strong>Mastered by Science. Measured by Time.</strong> DR.O가 제시하는 홈 더마의 미래를 지금 만나보십시오.</p>
`;

async function run() {
  const { data, error } = await supabaseAdmin.from('universal_content_assets').update({
    json_payload: {
      body: html
    }
  }).eq('id', '5ee267e2-61e1-49e1-bcb9-21e65fc466f2');

  if(error) console.error(error);
  else console.log('Successfully updated the article payload to 3000+ words rich text!');
}
run();
