import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'stub-service-key'
);

async function run() {
  try {
      const tId = '00000000-0000-0000-0000-000000000002';
      
      console.log('Ensuring Tenant 2 exists...');
      const { error: tErr } = await supabaseAdmin.from('tenants').select('id').eq('id', tId).single();
      if (tErr) {
          console.log('Inserting tenant 2...');
          await supabaseAdmin.from('tenants').insert({ id: tId, name: 'Vegan Root' });
      }

      console.log('Ensuring Brand exists...');
      const brandId = '00000000-0000-0000-0000-000000000002';
      const { error: bErr } = await supabaseAdmin.from('brands').select('id').eq('id', brandId).single();
      if (bErr) {
          console.log('Inserting Brand...');
          await supabaseAdmin.from('brands').insert({ id: brandId, tenant_id: tId, name: 'Vegan Root Brand' });
      }

      console.log('Upserting Brand Profile...');
      const profileData = {
          tenant_id: tId,
          brand_id: brandId,
          positioning_summary: '100% Plant-Derived Restorative Scalp Care',
          brand_voice: 'Earth-conscious Clinical'
      };
      const { data, error } = await supabaseAdmin.from('brand_profiles').select('id').eq('tenant_id', tId).maybeSingle();
      if (data) {
          await supabaseAdmin.from('brand_profiles').update(profileData).eq('id', data.id);
      } else {
          await supabaseAdmin.from('brand_profiles').insert(profileData);
      }
      
      console.log('Brand Profile seed success!');
  } catch (e: any) {
      console.error('Error:', e.message);
  }
}
run();
