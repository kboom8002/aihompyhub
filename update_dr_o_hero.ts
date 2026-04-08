import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: 'apps/storefront/.env.local' });

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  const tenantId = '00000000-0000-0000-0000-000000000001'; // dr-oracle

  // Fetch current design_config
  const { data: dConf } = await s.from('universal_content_assets')
    .select('json_payload')
    .eq('tenant_id', tenantId)
    .eq('type', 'design_config')
    .single();

  if (dConf && dConf.json_payload) {
     const payload = dConf.json_payload;
     if (payload.overrides && payload.overrides.layout && payload.overrides.layout.homepage) {
        // Find BrandHero block
        const heroBlock = payload.overrides.layout.homepage.find((b: any) => b.type === 'BrandHero');
        if (heroBlock) {
           heroBlock.props = {
              ...heroBlock.props,
              heroImage: '/dr_o_hero_wide.png'
           };
        }
        
        // Update the design config
        await s.from('universal_content_assets').update({
           json_payload: payload
        }).eq('tenant_id', tenantId).eq('type', 'design_config');
        
        console.log('Successfully applied new Wide image (cache bust)!');
     }
  } else {
     console.log('Design config not found');
  }
}
run();
