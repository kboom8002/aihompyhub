import { createServerSupabaseAdminClient } from '../server';
import { UUID } from '../dto/shared';

export async function fetchPriorityClusters(tenantId: UUID) {
  const supabase = createServerSupabaseAdminClient();
  const { data, error } = await supabase
    .from('question_clusters')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('priority_score', { ascending: false });

  if (error) {
    console.error('fetchPriorityClusters Error:', error);
    return [];
  }
  return data || [];
}
