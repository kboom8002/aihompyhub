'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin for backend operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface DealFormData {
  id?: string;
  tenant_id: string;
  industry_type: string;
  title: string;
  description: string;
  base_price: number;
  what_is_included: string[];
  what_is_not_included: string[];
  protocol_data: Record<string, any>; // The polymorphic fields
  qis_cluster_id: string | null;
  status: 'draft' | 'active' | 'expired';
}

/**
 * Save Deal Action
 */
export async function saveDealAction(data: DealFormData) {
  try {
     const payload = {
         tenant_id: data.tenant_id,
         industry_type: data.industry_type,
         title: data.title,
         description: data.description,
         base_price: data.base_price,
         what_is_included: data.what_is_included,
         what_is_not_included: data.what_is_not_included,
         protocol_data: data.protocol_data,
         qis_cluster_id: data.qis_cluster_id,
         status: data.status
     };

     if (data.id) {
         // Update
         const { error } = await supabaseAdmin.from('deals').update(payload).eq('id', data.id);
         if (error) throw new Error(error.message);
         return { success: true, id: data.id };
     } else {
         // Insert
         const { data: newRow, error } = await supabaseAdmin.from('deals').insert(payload).select('id').single();
         if (error) throw new Error(error.message);
         return { success: true, id: newRow.id };
     }
  } catch (err: any) {
     console.error("Save Deal Error:", err);
     return { success: false, error: err.message };
  }
}

/**
 * Fetch Deals by Tenant
 */
export async function fetchDealsByTenantAction(tenantId: string) {
  try {
     const { data, error } = await supabaseAdmin
        .from('deals')
        .select(`
            *,
            question_clusters (
               cluster_name
            )
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

     if (error) throw new Error(error.message);
     return { success: true, data };
  } catch (err: any) {
     return { success: false, error: err.message };
  }
}
