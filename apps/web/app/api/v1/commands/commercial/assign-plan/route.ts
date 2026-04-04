import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestContext, assertTenantScope } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { CommandAcceptedDTO } from '@aihompyhub/database/dto/shared';

const AssignPlanSchema = z.object({
  meta: z.object({
    requestId: z.string()
  }),
  body: z.object({
    subscriptionId: z.string().uuid(),
    newPlanId: z.string().uuid()
  })
});

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    
    // Only the Global Factory Admin can modify tenant billing plans.
    if (context.activeRole !== 'factory_admin' || context.tenantId !== 'SYSTEM') {
       throw new Error('UNAUTHORIZED: Commercial Plan assignment is strictly reserved for the Global Factory Admin.');
    }

    const rawBody = await request.json();
    const { body: payload } = AssignPlanSchema.parse(rawBody);

    const supabase = createServerSupabaseAdminClient();

    // Verify target subscription exists
    const { data: subData, error: subErr } = await supabase.from('tenant_subscriptions').select('tenant_id').eq('id', payload.subscriptionId).single();
    if (subErr || !subData) throw new Error('Target Subscription ID does not exist.');

    // Harden: Ensure caller has scope access to this tenant boundary
    assertTenantScope(context, subData.tenant_id);

    // Verify Plan exists
    const { data: planValid, error: pErr } = await supabase.from('commercial_plans').select('id, plan_code').eq('id', payload.newPlanId).single();
    if (pErr || !planValid) throw new Error('Target Plan ID does not exist.');

    // Execute Assignment
    const { error: updateErr } = await supabase
      .from('tenant_subscriptions')
      .update({ plan_id: payload.newPlanId, updated_at: new Date().toISOString() })
      .eq('id', payload.subscriptionId);

    if (updateErr) throw new Error(`Failed to assign plan: ${updateErr.message}`);

    // Audit Completeness Hardening
    await supabase.from('global_audit_logs').insert({
        tenant_id: subData.tenant_id,
        actor_id: context.actorId,
        action_type: 'plan_upgrade', // Semantic naming
        resource_type: 'tenant_subscription',
        resource_id: payload.subscriptionId,
        payload: { new_plan: planValid.plan_code }
    });

    console.log(`[Commercial GTM] Factory Admin assigned Plan '${planValid.plan_code}' to Subscription ${payload.subscriptionId}.`);

    const response: CommandAcceptedDTO = {
      meta: { requestId: context.requestId as string, tenantId: 'SYSTEM', snapshotAt: new Date().toISOString() },
      data: { commandId: crypto.randomUUID(), status: 'accepted', targetRef: { type: 'TenantProfile' as any, id: payload.subscriptionId } }
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
