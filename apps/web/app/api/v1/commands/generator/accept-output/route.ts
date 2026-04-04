import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { CommandAcceptedDTO } from '@aihompyhub/database/dto/shared';

const AcceptOutputSchema = z.object({
  meta: z.object({
    requestId: z.string(),
    actorId: z.string().uuid(),
    activeRole: z.string()
  }),
  body: z.object({
    outputId: z.string().uuid(),
    targetObjectType: z.enum(['AnswerCard', 'Topic', 'BrandProfile', 'Routine', 'CompareCard', 'BrandFoundation']).optional(),
    decision: z.enum(['accepted', 'rejected', 'partially_accepted']),
    modifiedContent: z.record(z.string(), z.any()).optional()
  })
});

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    const rawBody = await request.json();
    const { meta: commandMeta, body: payload } = AcceptOutputSchema.parse(rawBody);

    // STUB LOGIC: Canonical acceptance
    let targetRefType = payload.targetObjectType || 'AnswerCard';
    let targetRefId = crypto.randomUUID();

    if (payload.decision === 'accepted') {
      // 1. Validates that the requested output hasn't already been accepted.
      // 2. Maps `generation_outputs.proposed_content` specifically into canonical object.
      // 3. INSERTS into canonical_content (e.g. `answer_cards` & `answer_card_versions`)
      // 4. CRITICAL: content_status is hardcoded to 'draft'! Generator NEVER sets 'published'.
      
      console.log(`[Provenance Logging] Accepted Output ${payload.outputId}. Target Type: ${targetRefType}`);
      console.log(`[Canonical Bridge] Creating new ${targetRefType} ${targetRefId} with status DRAFT`);
    }

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
          type: targetRefType as any,
          id: targetRefId
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
