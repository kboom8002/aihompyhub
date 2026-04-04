import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { CommandAcceptedDTO } from '@aihompyhub/database/dto/shared';

const VerifyFixitSchema = z.object({
  meta: z.object({
    requestId: z.string(),
    actorId: z.string().uuid(),
    activeRole: z.string(),
    reason: z.string().optional()
  }),
  body: z.object({
    taskId: z.string().uuid()
  })
});

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    const rawBody = await request.json();
    const { meta: commandMeta, body: payload } = VerifyFixitSchema.parse(rawBody);

    // TODO: Trigger systemic verification logic (e.g. projection rebuild check)
    // CANONICAL RULE: FixIt verifies changes, but doesn't write to AnswerCard directly here.
    // STUB: Thin rule set, updates task status to 'verified'

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
          type: 'FixItTask',
          id: payload.taskId
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
