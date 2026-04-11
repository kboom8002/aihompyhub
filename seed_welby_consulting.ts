import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: './apps/web/.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'stub-service-key'
);

async function seedWelby() {
  console.log('🌱 Welby Consulting Tenant Seeding Initialized...');

  const tenantId = '00000000-0000-0000-0000-000000000003';
  const adminEmail = 'ceo@welby.expert';

  // 1. Create Tenant (IndustryType = consulting)
  console.log('1. Creating Welby Tenant...');
  const { error: tErr } = await supabaseAdmin.from('tenants').upsert({
    id: tenantId,
    name: 'Welby Consulting',
    slug: 'welby',
    industry_type: 'consulting',
    status: 'active'
  });
  if (tErr) throw new Error(`Tenant Error: ${tErr.message}`);

  // 2. Create Admin Auth User and Profile
  console.log('2. Creating Welby Admin User...');
  let adminUserId = '';
  // Check if auth user exists
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = users.users.find(u => u.email === adminEmail);
  
  if (existingUser) {
    adminUserId = existingUser.id;
  } else {
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: 'Test1234!',
      email_confirm: true
    });
    if (authErr && !authErr.message.includes('already registered')) throw authErr;
    if (authData.user) adminUserId = authData.user.id;
  }

  // Update profile role
  if (adminUserId) {
    await supabaseAdmin.from('user_profiles').upsert({
      id: adminUserId,
      email: adminEmail,
      role: 'brand_admin',
      tenant_id: tenantId
    });
  }

  // 3. Clear existing conflicting assets for this tenant idempotency
  await supabaseAdmin.from('universal_content_assets').delete().eq('tenant_id', tenantId);

  const assetsToInject: any[] = [
     {
        id: uuidv4(),
        tenant_id: tenantId,
        category: 'brand_ssot',
        type: 'brand_hero',
        title: 'Brand Hero Configuration',
        json_payload: {
            title: '좋은 메디컬·웰니스 프로젝트는 왜 런칭 전부터 달라야 할까요?',
            subtitle: '웰비는 메디컬의 신뢰와 웰니스의 감성을 운영 시스템으로 연결해, 런칭 가능한 구조로 완성하도록 돕습니다.',
            cta_primary_label: '프로젝트 진단 요청하기',
            cta_primary_link: '/consultation',
            cta_secondary_label: '사례 보기',
            cta_secondary_link: '/portfolio'
        },
        status: 'active'
     },
     {
        id: uuidv4(),
        tenant_id: tenantId,
        category: 'system_config',
        type: 'design_config',
        title: 'Design Config',
        json_payload: {
          brand_name: "Welby",
          theme: "dark",
          primary_color: "#1e293b",
          font_family: "Noto Serif"
        },
        status: 'active'
     },
     {
        id: uuidv4(),
        tenant_id: tenantId,
        category: 'system_config',
        type: 'ia_config',
        title: 'IA Config',
        json_payload: {
           nodes: [
             { id: 'solutions', label: '해결 과제', enabled: true },
             { id: 'services', label: '제공 서비스', enabled: true },
             { id: 'portfolio', label: '포트폴리오', enabled: true },
             { id: 'trust', label: 'Why Welby', enabled: true },
             { id: 'consultation', label: '진단/상담', enabled: true }
           ]
        },
        status: 'active'
     }
  ];

  // 5. Inject Expertise Specific Assets
  console.log('4. Injecting Industry Specific Readiness & Portfolios...');
  assetsToInject.push({
      id: uuidv4(),
      tenant_id: tenantId,
      category: 'brand_ssot',
      type: 'readiness_checker',
      title: 'Consultation Readiness Matrix',
      json_payload: {
         not_fit: '의료행위 및 진료 자체 모델 설계 요구,단기적 광고 대행을 통한 빠른 매출 폭발 희망,결과에 대한 맹목적 개런티 요구',
         prerequisites: '최고 의사결정자의 프로젝트 참여 의지,내부 실무진(또는 병원장)과의 정기적 논의 시간 확보,런칭 타임라인 수립 단계',
         expected_budget: '월 자문료 최소 500만원 ~ / 프로젝트 규모 상이'
      },
      status: 'active'
  });

  assetsToInject.push({
      id: uuidv4(),
      tenant_id: tenantId,
      category: 'brand_ssot',
      type: 'portfolio',
      title: 'Chengdu Clinic Launch Portfolio',
      json_payload: {
         client_or_context: '중국 성도 S호텔 내 2,000평 클리닉 런칭 총괄 PM',
         challenge: '건물 인테리어는 완공되었으나, 실제 고객 유입부터 상담-결제-시술-VIP관리에 이르는 운영 동선과 시스템이 전무한 상태.',
         approach: '한국형 VIP 메디컬 운영 시스템(SOP)을 현지화하여 이식. 부서별 매뉴얼 구축 및 KPI 연동 달력 도입.',
         outcome: '오픈 3개월 내 일 매출 안정화 궤도 진입 및 전 직원 프로세스 숙지도 95% 달성',
         visual_assets: '/gallery_1.png,/gallery_2.png',
         body: '<p>중국 스파/호텔 운영진과 한국 메디컬 시스템의 철학 차이를 조율하는 것이 핵심이었습니다. 웰비는 <b>양국의 강점을 병합한 하이브리드 SOP</b>를 개발했습니다.</p>'
      },
      status: 'active'
  });

  assetsToInject.push({
      id: uuidv4(),
      tenant_id: tenantId,
      category: 'brand_ssot',
      type: 'portfolio',
      title: 'NULOOK Bali GM Portfolio',
      json_payload: {
         client_or_context: '발리 NULOOK 글로벌 런칭 GM 및 웰니스 리조트 통합 세팅',
         challenge: '의료 리스크를 최소화하면서 럭셔리 웰니스 관광 수요를 소화할 수 있는 안전한 프리미엄 시술 체계 부족',
         approach: 'Medical + Wellness 결합 시나리오 100종 설계. 1:1 전담 컨시어지 CRM 도입.',
         outcome: '현지 로컬 병원 대비 VIP 고객 재방문율 300% 달성 및 안정적 운영 체계 안착',
         visual_assets: '/gallery_3.png'
      },
      status: 'active'
  });

  for (const a of assetsToInject) {
      const { error } = await supabaseAdmin.from('universal_content_assets').insert(a);
      if (error) console.error(`Error inserting asset ${a.type}:`, error);
  }

  console.log('✅ Welby Consulting Tenant Seeding COMPLETED!');
}

seedWelby().catch(console.error);
