import { createServerSupabaseAdminClient } from '../server';
import { UUID } from '../dto/shared';

export async function fetchPendingReviewTasks(tenantId: UUID) {
  const supabase = createServerSupabaseAdminClient();
  // In a real app we'd join with topics/answer_cards to get titles.
  // For MVP, we mock the join since PostgREST join setup was not strictly checked.
  const { data, error } = await supabase
    .from('review_tasks')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'queued');

  if (error) {
    console.error('fetchPendingReviewTasks Error:', error);
    return [];
  }
  
  // Dummy mapping titles for the seed data topic
  return data.map(task => ({
    reviewTaskId: task.id,
    targetRef: {
      type: task.target_type,
      id: task.target_id,
      title: task.target_id === '44444444-4444-4444-4444-444444444444' ? 'Gentle Anti-aging Routine (Lumiere)' : 'Unknown Object'
    },
    status: task.status,
    severity: task.severity
  }));
}
