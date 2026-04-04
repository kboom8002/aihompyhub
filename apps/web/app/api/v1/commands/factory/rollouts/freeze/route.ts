import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { CommandAcceptedDTO } from '@aihompyhub/database/dto/shared';

const FreezeRolloutSchema = z.object({
  meta: z.object({
    requestId: z.string(),
    actorId: z.string().uuid(),
    activeRole: z.string()
  }),
  body: z.object({
    rolloutId: z.string().uuid(),
    reason: z.string()
  })
});

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    const rawBody = await request.json();
    const { meta: commandMeta, body: payload } = FreezeRolloutSchema.parse(rawBody);

    if (context.activeRole !== 'factory_admin' && commandMeta.activeRole !== 'factory_admin') {
       throw new Error('UNAUTHORIZED');
    }

    const supabase = createServerSupabaseAdminClient();
    
    // DB UPDATE
    const { error } = await supabase
      .from('rollout_campaigns')
      .update({ status: 'frozen' })
      .eq('id', payload.rolloutId);

    if (error) {
      throw new Error(`DB Error: ${error.message}`);
    }

    console.log(`[Factory Control] Freeze applied to DB for Rollout ${payload.rolloutId}. Reason: ${payload.reason}`);

    const response: CommandAcceptedDTO = {
      meta: {
        requestId: context.requestId as string,
        tenantId: context.tenantId, 
        snapshotAt: new Date().toISOString()
      },
      data: {
        commandId: crypto.randomUUID(),
        status: 'accepted',
        targetRef: {
          type: 'Topic',
          id: payload.rolloutId
        }
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const isAuth = error.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: { code: isAuth ? 'PERMISSION_DENIED' : 'VALIDATION_FAILED', message: error.message } },
      { status: isAuth ? 401 : 400 }
    );
  }
}
