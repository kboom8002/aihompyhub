import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { CommandAcceptedDTO } from '@aihompyhub/database/dto/shared';

const OverrideLaneSchema = z.object({
  meta: z.object({
    requestId: z.string(),
    actorId: z.string().uuid(),
    activeRole: z.string()
  }),
  body: z.object({
    laneId: z.string().uuid(),
    newStatus: z.enum(['active', 'paused', 'disabled']),
    reason: z.string().min(10, 'Override reason must be at least 10 characters long to ensure proper audit logging.')
  })
});

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    const rawBody = await request.json();
    const { meta: commandMeta, body: payload } = OverrideLaneSchema.parse(rawBody);

    if (context.activeRole !== 'factory_admin' && commandMeta.activeRole !== 'factory_admin') {
       throw new Error('UNAUTHORIZED: Autonomy governance strictly reserved for administrators.');
    }

    const supabase = createServerSupabaseAdminClient();

    // 1. Fetch current status and type
    const { data: currentLane, error: fetchErr } = await supabase.from('autopilot_lanes').select('status, lane_type').eq('id', payload.laneId).single();
    if (fetchErr || !currentLane) throw new Error('Autopilot lane not found.');

    const previousStatus = currentLane.status;
    const laneType = currentLane.lane_type;

    // Hard-coded Low-Risk Boundary Guard
    const allowedLowRiskLanes = ['auto_backfill', 'auto_reindex', 'auto_revalidation', 'cache_warmup'];
    if (payload.newStatus === 'active' && !allowedLowRiskLanes.includes(laneType)) {
       throw new Error(`POLICY BLOCKED: Cannot active autopilot for high-risk lane type: ${laneType}.`);
    }

    if (previousStatus === payload.newStatus) {
       return NextResponse.json({ error: { code: 'INVALID_STATE', message: 'Lane is already in requested state.' } }, { status: 400 });
    }

    // 2. Update Lane Status
    const { error: updateErr } = await supabase
      .from('autopilot_lanes')
      .update({ status: payload.newStatus, updated_at: new Date().toISOString() })
      .eq('id', payload.laneId);

    if (updateErr) throw new Error(`Failed to update lane: ${updateErr.message}`);

    // 3. Document the Override
    const { error: pErr } = await supabase.from('human_override_logs').insert({
       autopilot_lane_id: payload.laneId,
       actor_id: commandMeta.actorId,
       previous_status: previousStatus,
       new_status: payload.newStatus,
       override_reason: payload.reason,
       created_at: new Date().toISOString()
    });

    if (pErr) throw new Error(`Failed to record human override log: ${pErr.message}`);

    // Audit Completeness Hardening
    await supabase.from('global_audit_logs').insert({
        tenant_id: null, // SYSTEM level action
        actor_id: commandMeta.actorId,
        action_type: 'manual_override',
        resource_type: 'autopilot_lane',
        resource_id: payload.laneId,
        payload: { previous_status: previousStatus, new_status: payload.newStatus, reason: payload.reason }
    });

    console.log(`[Autopilot Control] Admin ${commandMeta.actorId} forced Lane ${payload.laneId} from ${previousStatus} -> ${payload.newStatus}. Reason: ${payload.reason}`);

    const response: CommandAcceptedDTO = {
      meta: { requestId: context.requestId as string, tenantId: 'SYSTEM', snapshotAt: new Date().toISOString() },
      data: { commandId: crypto.randomUUID(), status: 'accepted', targetRef: { type: 'FactoryAdminProfile' as any, id: payload.laneId } }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const isAuth = error.message.includes('UNAUTHORIZED');
    return NextResponse.json(
      { error: { code: isAuth ? 'PERMISSION_DENIED' : 'VALIDATION_FAILED', message: error.message } },
      { status: isAuth ? 401 : 400 }
    );
  }
}
