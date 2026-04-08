import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: 'apps/storefront/.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const tenantId = '00000000-0000-0000-0000-000000000002'; // vegan-root
  const brandId = '22222222-2222-2222-2222-222222222222';

  // Make sure tenant exists
  await s.from('tenants').upsert({ id: tenantId, name: 'Vegan Root', is_active: true });
  // Make sure brand exists
  await s.from('brands').upsert({ id: brandId, name: 'Vegan Root Brand', website_url: 'https://vegan-root.com' });

  const { error } = await s.from('brand_profiles').upsert({
    id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
    tenant_id: tenantId,
    brand_id: brandId,
    positioning_summary: 'VEGAN ROOT: 프리미엄 비건 뷰티의 새로운 기준',
    brand_voice: { tone: 'Friendly and Pure', forbidden_terms: ['chemical', 'artificial'] }
  });
  
  if (error) { console.error('Error inserting brand_profiles:', error); }
  else { console.log('Successfully inserted brand profile.'); }
}
run();
