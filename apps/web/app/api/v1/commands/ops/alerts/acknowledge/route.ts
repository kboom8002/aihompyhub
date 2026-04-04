import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { CommandAcceptedDTO } from '@aihompyhub/database/dto/shared';

const AcknowledgeAlertSchema = z.object({
  meta: z.object({
    requestId: z.string(),
    actorId: z.string().uuid(),
    activeRole: z.string(),
    reason: z.string().optional()
  }),
  body: z.object({
    alertId: z.string().uuid(),
    notes: z.string().optional()
  })
});

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    const rawBody = await request.json();
    const { meta: commandMeta, body: payload } = AcknowledgeAlertSchema.parse(rawBody);

    // TODO: Actually update alerts table status to 'acknowledged'
    // STUB: Thin rule set, just acknowledge the payload validation

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
          type: 'Alert',
          id: payload.alertId
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
