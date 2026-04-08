'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

export async function approveUserAction(formData: FormData) {
  // Use admin client to bypass RLS for administrative mutations
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const userId = formData.get('user_id') as string;
  const tenantId = formData.get('tenant_id') as string;

  if (!userId) return { error: 'No user ID provided' };
  if (!tenantId) return { error: 'No tenant selected' };

  // Directly call the RPC or manually update user and tenant
  const { error: rpcErr } = await supabaseAdmin.rpc('approve_tenant_admin', {
    target_user_id: userId,
    target_tenant_id: tenantId
  });

  if (rpcErr) {
    return { error: 'Failed to approve user: ' + rpcErr.message };
  }

  // Fallback direct updates if RPC fails/doesn't exist
  await supabaseAdmin.from('user_profiles').update({ role: 'tenant_admin', tenant_id: tenantId }).eq('id', userId);
  await supabaseAdmin.from('tenants').update({ status: 'active' }).eq('id', tenantId);

  // Update tenant status if applicable
  if (tenantId) {
    await supabaseAdmin.from('tenants').update({ status: 'active' }).eq('id', tenantId)
  }

  revalidatePath('/factory')
}
