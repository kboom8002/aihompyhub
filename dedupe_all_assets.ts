import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: 'apps/storefront/.env.local' });

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  const tenantId = '00000000-0000-0000-0000-000000000001';

  const { data: assets } = await s.from('universal_content_assets')
    .select('id, type, title, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true });

  if (!assets) {
    console.log('No assets found');
    return;
  }

  const seen = new Set();
  const idsToDelete = [];

  for (const asset of assets) {
    // Only deduplicate items that have title (like insights, routines, compare, story)
    // Avoid deduplicating system things arbitrarily, but actually title+type is a safe composite key for content
    if (asset.title) {
        const key = `${asset.type}::${asset.title}`;
        if (seen.has(key)) {
            idsToDelete.push(asset.id);
        } else {
            seen.add(key);
        }
    }
  }

  if (idsToDelete.length > 0) {
    console.log(`Found ${idsToDelete.length} duplicate records across all types.`);
    console.log('Deleting:', idsToDelete);
    
    const { error } = await s.from('universal_content_assets')
      .delete()
      .in('id', idsToDelete);
      
    if (error) console.error('Delete error:', error);
    else console.log('Successfully deleted all duplicate records!');
  } else {
    console.log('No duplicates found.');
  }
}

run();
