'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

export async function approveUserAction(formData: FormData) {
  // Use admin client to bypass RLS for administrative mutations
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const userId = formData.get('user_id') as string
  
  // In a real flow, you'd choose which tenant to assign them to.
  // Here for simplicity we fetch their profile and approve them.
  // If they don't tie to a tenant, we might need to create one first.
  
  const { data: profile } = await supabaseAdmin.from('user_profiles').select('*').eq('id', userId).single()
  
  if (!profile) return { error: 'Profile not found' }

  let tenantId = profile.tenant_id

  // If no tenant attached during signup, we auto-gen a mock one for them to use
  if (!tenantId) {
    const { data: newTenant } = await supabaseAdmin.from('tenants').insert([{ name: `Tenant of ${profile.email}`, status: 'active' }]).select().single()
    tenantId = newTenant?.id
  }

  // Update profile
  await supabaseAdmin.from('user_profiles').update({ role: 'tenant_admin', tenant_id: tenantId }).eq('id', userId)

  // Update tenant status if applicable
  if (tenantId) {
    await supabaseAdmin.from('tenants').update({ status: 'active' }).eq('id', tenantId)
  }

  revalidatePath('/factory')
}
