import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: 'apps/storefront/.env.local' });

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  const tenantId = '00000000-0000-0000-0000-000000000001';

  const { data: compares } = await s.from('universal_content_assets')
    .select('id, title, created_at')
    .eq('tenant_id', tenantId)
    .eq('type', 'compare')
    .order('created_at', { ascending: true });

  if (compares && compares.length > 1) {
    console.log(`Found ${compares.length} compare records. Keeping the first one:`, compares[0].id);
    
    // Collect IDs to delete
    const idsToDelete = compares.slice(1).map(c => c.id);
    console.log('Deleting:', idsToDelete);
    
    const { error } = await s.from('universal_content_assets')
      .delete()
      .in('id', idsToDelete);
      
    if (error) console.error('Delete error:', error);
    else console.log('Successfully deleted duplicate compare records!');
  } else {
    console.log('No duplicates found.');
  }
}

run();
