import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { CommandAcceptedDTO } from '@aihompyhub/database/dto/shared';

const DecideSuggestionSchema = z.object({
  meta: z.object({
    requestId: z.string(),
    actorId: z.string().uuid(),
    activeRole: z.string()
  }),
  body: z.object({
    suggestionId: z.string().uuid(),
    decision: z.enum(['accept', 'reject', 'dismiss']),
    rationale: z.string().optional()
  })
});

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    const rawBody = await request.json();
    const { meta: commandMeta, body: payload } = DecideSuggestionSchema.parse(rawBody);

    if (context.activeRole !== 'factory_admin' && commandMeta.activeRole !== 'factory_admin') {
       throw new Error('UNAUTHORIZED: Operations strictly reserved for approved human administrators.');
    }

    const supabase = createServerSupabaseAdminClient();

    // Map intent to actual DB status
    const dbStatus = payload.decision === 'accept' ? 'accepted' : payload.decision === 'reject' ? 'rejected' : 'dismissed';

    // Update DB to mark Provenance / Audit record
    const { error } = await supabase
      .from('automation_suggestions')
      .update({ 
         status: dbStatus, 
         decided_at: new Date().toISOString(),
         decided_by: commandMeta.actorId
      })
      .eq('id', payload.suggestionId);

    if (error) {
      throw new Error(`DB Error during decision audit: ${error.message}`);
    }

    console.log(`[Copilot Automation] Admin ${commandMeta.actorId} persisted ${dbStatus} for suggestion ${payload.suggestionId} into Supabase Audit.`);

    const response: CommandAcceptedDTO = {
      meta: {
        requestId: context.requestId as string,
        tenantId: 'SYSTEM',
        snapshotAt: new Date().toISOString()
      },
      data: {
        commandId: crypto.randomUUID(),
        status: 'accepted',
        targetRef: {
          type: 'AutomationSuggestion' as any, // Typecast since strictly 'AutomationSuggestion' is not yet in ObjectType union
          id: payload.suggestionId
        }
      }
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
