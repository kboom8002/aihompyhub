import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'stub-service-key'
);

async function run() {
  try {
      const tId = '00000000-0000-0000-0000-000000000002';
      console.log('Setting up Vegan Root Homepage & Hero Image...');

      // 1. Insert/Update Brand Profile for Hero Copy
      const { data: existingProfile } = await supabaseAdmin.from('brand_profiles').select('id').eq('tenant_id', tId).maybeSingle();
      const profileData = {
          tenant_id: tId,
          brand_id: '00000000-0000-0000-0000-000000000002', 
          positioning_summary: '100% Plant-Derived Restorative Scalp Care',
          brand_voice: 'Earth-conscious Clinical'
      };

      if (existingProfile) {
          await supabaseAdmin.from('brand_profiles').update(profileData).eq('id', existingProfile.id);
      } else {
          try {
             await supabaseAdmin.from('brands').upsert({ id: '00000000-0000-0000-0000-000000000002', tenant_id: tId, name: 'Vegan Root' });
             await supabaseAdmin.from('brand_profiles').upsert(profileData);
          } catch(e) { console.log('ignored profile seed error'); }
      }

      // 2. Insert Custom Design Config for Vegan Root
      await supabaseAdmin.from('universal_content_assets')
         .delete()
         .eq('tenant_id', tId)
         .eq('type', 'design_config')
         .eq('category', 'system');

      await supabaseAdmin.from('universal_content_assets').insert({
         tenant_id: tId, 
         category: 'system', 
         type: 'design_config', 
         title: 'Vegan Root Master Theme Config',
         json_payload: { 
             base_theme: "clinical_premium",
             overrides: {
                 primary_color: "#2f5c40", 
                 bg: "#f8fdf9",
                 text: "#1c3826",
                 layout: {
                   homepage: [
                     {
                       type: "BrandHero",
                       props: {
                         heroImage: "/vegan_root_hero.png"
                       }
                     },
                     {
                       type: "BlockHeading",
                       props: {
                         title: "100% 비건 처방 라인업",
                         subtitle: "두피 열감을 식혀주는 식물성 루틴 베스트셀러"
                       }
                     },
                     {
                       type: "AnswerCardGrid",
                       props: {
                         columns: 3
                       }
                     }
                   ]
                 }
             }
         }
      });

      console.log('Vegan Root Homepage setup complete!');
  } catch (e: any) {
      console.error('Error:', e.message);
  }
}
run();
