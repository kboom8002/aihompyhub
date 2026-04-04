import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { CommandAcceptedDTO } from '@aihompyhub/database/dto/shared';

const ProvisionPackSchema = z.object({
  meta: z.object({
    requestId: z.string()
  }),
  body: z.object({
    packId: z.string().uuid()
  })
});

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    
    if (context.tenantId === 'SYSTEM') {
       throw new Error('UNAUTHORIZED: The Factory Admin cannot consume Tenant packs. Must operate within a specific tenant context.');
    }

    const rawBody = await request.json();
    const { body: payload } = ProvisionPackSchema.parse(rawBody);

    const supabase = createServerSupabaseAdminClient();

    // 1. Find the target pack and its minimum plan requirement
    const { data: targetPack, error: packErr } = await supabase.from('pack_catalogs').select('pack_name, minimum_plan_code').eq('id', payload.packId).single();
    if (packErr || !targetPack) throw new Error('Target Catalog Pack does not exist.');

    // 2. Resolve the tenant's current subscription plan
    const { data: subData, error: subErr } = await supabase.from('tenant_subscriptions')
      .select(`plan_id, commercial_plans (plan_code, display_name)`)
      .eq('tenant_id', context.tenantId)
      .single();
      
    if (subErr || !subData || !subData.commercial_plans) throw new Error('Tenant holds no active subscription to Factory OS.');
    
    // Type casting due to join
    const tenantPlanCode = (subData.commercial_plans as unknown as { plan_code: string }).plan_code;

    // 3. Backend Feature Gate Check
    const ranks = ['basic', 'pro', 'enterprise'];
    const tenantRank = ranks.indexOf(tenantPlanCode);
    const requiredRank = ranks.indexOf(targetPack.minimum_plan_code);

    if (tenantRank < requiredRank) {
       console.warn(`[Feature Gate Block] Tenant ${context.tenantId} (Plan: ${tenantPlanCode}) attempted to provision Pack '${targetPack.pack_name}' (Requires: ${targetPack.minimum_plan_code}).`);
       return NextResponse.json(
           { error: { code: 'UPGRADE_REQUIRED', message: `Feature Gate Locked: The '${targetPack.pack_name}' pack requires a minimum of the '${targetPack.minimum_plan_code.toUpperCase()}' plan.` } }, 
           { status: 403 }
       );
    }

    // 4. Record the Provisioning Action (Mock Success for GTM baseline)
    console.log(`[Provision Engine] Initiating unpacking of '${targetPack.pack_name}' for Brand ${context.tenantId}...`);

    const response: CommandAcceptedDTO = {
      meta: { requestId: context.requestId as string, tenantId: context.tenantId, snapshotAt: new Date().toISOString() },
      data: { commandId: crypto.randomUUID(), status: 'accepted', targetRef: { type: 'TenantProfile' as any, id: context.tenantId } }
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
