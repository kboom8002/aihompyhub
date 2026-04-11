import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: './apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function applyLogo() {
  const tenantId = '00000000-0000-0000-0000-000000000003'; // Welby
  
  // Try to find existing design_config
  const { data: existingConfig } = await supabaseAdmin
    .from('universal_content_assets')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('type', 'design_config')
    .eq('category', 'system_config')
    .single();

  if (existingConfig) {
      existingConfig.json_payload.overrides = existingConfig.json_payload.overrides || {};
      existingConfig.json_payload.overrides.logo_url = '/welby-logo.png';

      const { error } = await supabaseAdmin
          .from('universal_content_assets')
          .update({ json_payload: existingConfig.json_payload })
          .eq('id', existingConfig.id);
      
      console.log(error ? 'Error updating:' + error.message : 'Successfully updated logo_url in existing config.');
  } else {
      // Create new design_config
      const { error } = await supabaseAdmin
          .from('universal_content_assets')
          .insert({
              tenant_id: tenantId,
              title: 'Welby Overall Design Config',
              category: 'system_config',
              type: 'design_config',
              json_payload: {
                  base_theme: 'clinical_premium',
                  overrides: {
                      logo_url: '/welby-logo.png'
                  }
              },
              status: 'active'
          });
      console.log(error ? 'Error inserting:' + error.message : 'Successfully inserted new logo_url config.');
  }
}

applyLogo();
