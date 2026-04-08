'use server';

import { createClient } from '../../../../../lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateTenantIdentity(formData: FormData) {
  const supabase = await createClient();
  const tenantId = formData.get('tenantId') as string;
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;

  if (!tenantId || !name || !slug) {
    return { error: 'Missing required fields' };
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return { error: 'Slug format is invalid. Use only lowercase letters, numbers, and hyphens.' };
  }

  const { error } = await supabase
    .from('tenants')
    .update({ name, slug })
    .eq('id', tenantId);

  if (error) {
    console.error('Update tenant error:', error);
    // Check if it's a unique constraint violation on slug
    if (error.code === '23505') {
       return { error: 'This slug is already taken by another brand.' };
    }
    return { error: error.message };
  }

  revalidatePath(`/tenant/${tenantId}`, 'layout');
  return { success: true };
}
