import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: './apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function injectGNBContent() {
  // 1. Get Welby Tenant ID
  const { data: tenantData, error: tErr } = await supabaseAdmin.from('tenants').select('id').eq('slug', 'welby').single();
  if (tErr || !tenantData) {
      console.error('Failed to resolve Welby tenant:', tErr);
      process.exit(1);
  }
  const tenantId = tenantData.id;

  const assetsToInject = [
      // ----- SOLUTIONS / OFFERS -----
      {
          id: uuidv4(),
          tenant_id: tenantId,
          category: 'brand_ssot',
          type: 'offer',
          title: 'A-to-Z Clinic Set-up Consulting',
          json_payload: {
              one_liner: '입지 선정부터 개원 런칭, 내부 SOP 세팅까지 토탈 솔루션',
              fit_summary: '신규 개원을 앞둔 대표원장님',
              body: '막대한 자본이 들어가는 메디컬 개원, 이제 시행착오 없이 엑셀러레이팅하세요. 웰비는 글로벌 스탠다드 SOP를 기반으로...'
          },
          status: 'active'
      },
      {
          id: uuidv4(),
          tenant_id: tenantId,
          category: 'brand_ssot',
          type: 'offer',
          title: 'VIP CRM & Retention Architecture',
          json_payload: {
              one_liner: '단회성을 넘어서는 VIP 멤버십 및 재방문 동선 재설계',
              fit_summary: '성장 정체기에 있는 기존 병원/웰니스 센터',
              body: '신환에 대한 의존도를 줄이고 충성 고객을 락인(Lock-in)하기 위한 최적의 응대 스크립트와 예약 동선 개편안입니다.'
          },
          status: 'active'
      },
      // ----- TRUST / WHY WELBY -----
      {
          id: uuidv4(),
          tenant_id: tenantId,
          category: 'brand_ssot',
          type: 'trust',
          title: 'Welby Consulting Methodology',
          json_payload: {
              evidenceType: 'Methodology',
              body: '일반 마케팅 대행사가 아닙니다. 메디컬 필드에서 오랜 경험을 쌓은 전문가들이 기획-오퍼레이션-결과 분석까지 밀착 방어합니다.'
          },
          status: 'active'
      },
      {
          id: uuidv4(),
          tenant_id: tenantId,
          category: 'brand_ssot',
          type: 'trust',
          title: 'Global Reference Power',
          json_payload: {
              evidenceType: 'Achievement',
              body: '청두 럭셔리 스파 런칭, 발리 NULOOK 글로벌 리조트 총괄 등 극강의 퀄리티 컨트롤이 필요한 해외 거대 브랜드들과 작업했습니다.'
          },
          status: 'active'
      }
  ];

  console.log(`Injecting ${assetsToInject.length} GNB items for Welby...`);
  
  for (const asset of assetsToInject) {
      const { error } = await supabaseAdmin.from('universal_content_assets').insert(asset);
      if (error) {
          console.error(`Failed to inject: ${asset.title}`, error);
      } else {
          console.log(`✅ Injected: ${asset.title}`);
      }
  }
}

injectGNBContent();
