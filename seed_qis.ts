import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function runSeeder() {
  // 1. Get Welby Tenant ID (Skincare)
  const { data: tenantData, error: tErr } = await supabaseAdmin.from('tenants').select('id, industry_type').eq('slug', 'welby').single();
  if (tErr || !tenantData) {
      console.error('Failed to resolve Welby (Skincare) tenant:', tErr);
      process.exit(1);
  }
  const tenantId = tenantData.id;
  const industryType = tenantData.industry_type || 'skincare';

  console.log(`Injecting Fake Raw Intake Questions for Tenant: ${tenantId} (${industryType})`);

  const fakeIntakes = [
    { tenant_id: tenantId, industry_type: industryType, source: 'storefront_search', count: 12, text: '레이저 시술 받고 얼굴이 너무 뜨겁고 붉어지는데 이거 정상인가요?' },
    { tenant_id: tenantId, industry_type: industryType, source: 'storefront_search', count: 8, text: '피부과 다녀온 날 저녁에 수분크림 발라도 따가워요' },
    { tenant_id: tenantId, industry_type: industryType, source: 'storefront_search', count: 5, text: '프락셀 후 붉은기 언제쯤 가라앉나요 ㅠ' },
    { tenant_id: tenantId, industry_type: industryType, source: 'dm', count: 3, text: '시술하고 일주일 뒤에 화장해도 되나요?' },
    { tenant_id: tenantId, industry_type: industryType, source: 'dm', count: 2, text: '모공 줄이는 화장품 추천좀 해주세요' },
    { tenant_id: tenantId, industry_type: industryType, source: 'storefront_search', count: 18, text: '각질이 자꾸 올라오는데 필링 패드 써도 될까요' },
    { tenant_id: tenantId, industry_type: industryType, source: 'storefront_search', count: 10, text: '피부결 거친데 어떻게 관리하나요' }
  ];

  for (const item of fakeIntakes) {
     const { error } = await supabaseAdmin.from('raw_intake_questions').insert(item);
     if (error) {
       console.error("Failed to insert:", item.text, error.message);
     } else {
       console.log("Inserted:", item.text);
     }
  }

  console.log("Seed complete.");
}

runSeeder();
