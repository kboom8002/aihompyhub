import { supabaseAdmin } from './supabase';

export async function resolveTenantId(slug: string): Promise<string | null> {
  const tenant = await resolveTenant(slug);
  return tenant ? tenant.id : null;
}

export async function resolveTenant(slug: string): Promise<{ id: string; industry_type: string } | null> {
  let querySlug = slug;
  if (slug === 'dr-oracle') querySlug = '00000000-0000-0000-0000-000000000001';
  if (slug === 'vegan-root') querySlug = '00000000-0000-0000-0000-000000000002';

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(querySlug);
  
  const { data } = await supabaseAdmin.from('tenants').select('id, industry_type').eq(isUuid ? 'id' : 'slug', querySlug).single();
  if (data) {
     return { id: data.id, industry_type: data.industry_type || 'skincare' };
  }
  
  // fallback for mocks if DB fetch fails
  if (isUuid) {
     return { id: querySlug, industry_type: 'skincare' };
  }

  return null;
}
