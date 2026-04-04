import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { AutonomyJournalSnapshotDTO, AutopilotLaneDTO, ExecutionJournalDTO, HumanOverrideLogDTO } from '@aihompyhub/database/dto/autonomy';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);
    if (context.tenantId !== 'SYSTEM') throw new Error('UNAUTHORIZED: Autonomy visibility is restricted to the global Factory scope.');

    const supabase = createServerSupabaseAdminClient();

    // 1. Fetch Lanes
    const { data: dbLanes, error: laneErr } = await supabase.from('autopilot_lanes').select('*').order('created_at', { ascending: false });
    if (laneErr) throw laneErr;
    
    const lanes: AutopilotLaneDTO[] = (dbLanes || []).map(row => ({
       id: row.id,
       laneName: row.lane_name,
       description: row.description,
       laneType: row.lane_type,
       cronSchedule: row.cron_schedule,
       triggerCondition: row.trigger_condition,
       status: row.status,
       activeRecommendation: row.recommendation_payload
    }));

    // Lane Name lookup map for hydration
    const laneMap = new Map(lanes.map(l => [l.id, l.laneName]));

    // 2. Fetch Executions
    const { data: dbExecs, error: execErr } = await supabase.from('execution_journals').select('*').order('executed_at', { ascending: false }).limit(50);
    if (execErr) throw execErr;

    const recentExecutions: ExecutionJournalDTO[] = (dbExecs || []).map(row => ({
       id: row.id,
       autopilotLaneId: row.autopilot_lane_id,
       laneName: laneMap.get(row.autopilot_lane_id) || 'Unknown Lane',
       executionRunId: row.execution_run_id,
       actionSummary: row.action_summary,
       status: row.status,
       detailsPayload: row.details_payload,
       policyBlockedReason: row.policy_blocked_reason,
       executedAt: row.executed_at
    }));

    // 3. Fetch Overrides
    const { data: dbOvers, error: overErr } = await supabase.from('human_override_logs').select('*').order('created_at', { ascending: false }).limit(20);
    if (overErr) throw overErr;

    const recentOverrides: HumanOverrideLogDTO[] = (dbOvers || []).map(row => ({
       id: row.id,
       autopilotLaneId: row.autopilot_lane_id,
       laneName: laneMap.get(row.autopilot_lane_id) || 'Unknown Lane',
       actorId: row.actor_id,
       previousStatus: row.previous_status,
       newStatus: row.new_status,
       overrideReason: row.override_reason,
       createdAt: row.created_at
    }));

    const snapshotData: AutonomyJournalSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'autonomy_journal_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: 'SYSTEM' },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: { lanes, recentExecutions, recentOverrides }
    };

    return NextResponse.json({ data: snapshotData, meta: { requestId: 'req-' + Date.now(), tenantId: context.tenantId, snapshotAt: new Date().toISOString() } });
  } catch (error: any) {
    const isAuth = error.message.includes('UNAUTHORIZED');
    return NextResponse.json({ error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } }, { status: isAuth ? 401 : 400 });
  }
}
