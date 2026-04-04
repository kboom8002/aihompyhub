import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { CommandAcceptedDTO } from '@aihompyhub/database/dto/shared';

const TriggerRunSchema = z.object({
  meta: z.object({
    requestId: z.string(),
    actorId: z.string().uuid(),
    activeRole: z.string()
  }),
  body: z.object({
    runType: z.enum(['brand_foundation', 'content_draft', 'trust_placeholder']),
    targetObjectType: z.string().optional(),
    contextId: z.string().uuid().optional(),
    templateProfileId: z.string().uuid().optional(),
    inputContextOverrides: z.record(z.any()).optional()
  })
});

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    const rawBody = await request.json();
    const { meta: commandMeta, body: payload } = TriggerRunSchema.parse(rawBody);

    // STUB LOGIC: Trigger Run Provenance and Node Delegation
    const hashData = {
      runType: payload.runType,
      targetObjectType: payload.targetObjectType,
      contextId: payload.contextId,
      overrides: payload.inputContextOverrides || {}
    };
    const inputPackHash = crypto.createHash('sha256').update(JSON.stringify(hashData)).digest('hex');
    console.log(`[Provenance Logging] Starting Run. Domain: ${payload.targetObjectType || 'Generic'}. InputHash: ${inputPackHash}`);
    console.log(`[Run Spine] Creating generator_runs entry with status 'queued'`);
    
    // Asynchronous delegation to worker queue would happen here in Phase 5
    // For now, it deterministically finishes by creating mocked output after brief delay.

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
          type: 'Topic', // Stub return for run target 
          id: crypto.randomUUID()
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
