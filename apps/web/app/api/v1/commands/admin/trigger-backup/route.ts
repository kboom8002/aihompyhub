import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { CommandAcceptedDTO } from '@aihompyhub/database/dto/shared';

const TriggerBackupSchema = z.object({
  meta: z.object({
    requestId: z.string()
  }),
  body: z.object({
    backupName: z.string().min(3),
    targetTenantId: z.string().uuid().optional() // specific tenant, or global if omitted
  })
});

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    
    if (context.activeRole !== 'factory_admin' || context.tenantId !== 'SYSTEM') {
       throw new Error('UNAUTHORIZED: Backup triggers are strictly reserved for Support Admins.');
    }

    const rawBody = await request.json();
    const { body: payload } = TriggerBackupSchema.parse(rawBody);

    const supabase = createServerSupabaseAdminClient();

    // Insert Backup Run Path log
    const { data: newBackup, error: insertErr } = await supabase.from('system_backups').insert({
        backup_name: payload.backupName,
        tenant_id: payload.targetTenantId || null,
        status: 'in_progress',
        triggered_by: context.actorId
    }).select('id').single();

    if (insertErr || !newBackup) throw new Error(`Failed to initialize backup: ${insertErr?.message}`);

    // Log the action to Global Audits
    await supabase.from('global_audit_logs').insert({
        tenant_id: payload.targetTenantId || null,
        actor_id: context.actorId,
        action_type: 'trigger_backup',
        resource_type: 'system_backups',
        resource_id: newBackup.id,
        payload: { target: payload.targetTenantId ? 'tenant' : 'global', requested_name: payload.backupName }
    });

    console.log(`[Enterprise Hardening] Support Admin triggered Backup Run: '${payload.backupName}'.`);

    const response: CommandAcceptedDTO = {
      meta: { requestId: context.requestId as string, tenantId: 'SYSTEM', snapshotAt: new Date().toISOString() },
      data: { commandId: crypto.randomUUID(), status: 'accepted', targetRef: { type: 'SystemBackup' as any, id: newBackup.id } }
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
