import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { TriageSnapshotDTO } from '@aihompyhub/database/dto/triage';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);
    
    // Triage Board is strictly for Factory Admins and Support Teams
    if (context.tenantId !== 'SYSTEM' && context.activeRole !== 'factory_admin') {
       throw new Error('UNAUTHORIZED: The Triage & Health Board is restricted to Global Factory Admins.');
    }

    const supabase = createServerSupabaseAdminClient();

    // 1. Fetch Audits
    const { data: audits } = await supabase.from('global_audit_logs').select('*').order('created_at', { ascending: false }).limit(20);
    
    // 2. Fetch Backups
    const { data: backups } = await supabase.from('system_backups').select('*').order('created_at', { ascending: false }).limit(10);
    
    // 3. Fetch DLQ
    const { data: dlqs } = await supabase.from('dead_letter_queues').select('*').order('failed_at', { ascending: false }).limit(20);

    const snapshotData: TriageSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'triage_health_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: 'SYSTEM' },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: dlqs?.filter(d => d.status === 'unresolved').map(d => ({ code: 'DLQ_WARNING', message: `Unresolved DLQ in ${d.source_queue}` })) || [],
      criticalFlags: backups?.filter(b => b.status === 'failed').map(b => `Backup failed: ${b.backup_name}`) || [],
      data: { 
         recentAudits: (audits || []).map(a => ({
             id: a.id, tenantId: a.tenant_id, actorId: a.actor_id, actionType: a.action_type, resourceType: a.resource_type, resourceId: a.resource_id, payload: a.payload, createdAt: a.created_at
         })), 
         systemBackups: (backups || []).map(b => ({
             id: b.id, backupName: b.backup_name, tenantId: b.tenant_id, status: b.status, sizeBytes: b.size_bytes, completedAt: b.completed_at, createdAt: b.created_at
         })), 
         dlqEntries: (dlqs || []).map(d => ({
             id: d.id, sourceQueue: d.source_queue, tenantId: d.tenant_id, payload: d.payload, errorMessage: d.error_message, retryCount: d.retry_count, status: d.status, failedAt: d.failed_at
         }))
      }
    };

    return NextResponse.json({ data: snapshotData, meta: { requestId: 'req-' + Date.now(), tenantId: 'SYSTEM', snapshotAt: new Date().toISOString() } });
  } catch (error: any) {
    const isAuth = error.message.includes('UNAUTHORIZED');
    return NextResponse.json({ error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } }, { status: isAuth ? 401 : 400 });
  }
}
