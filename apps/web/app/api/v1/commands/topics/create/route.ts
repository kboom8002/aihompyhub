import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { CreateTopicSchema } from '@aihompyhub/database/validations';
import type { CommandAcceptedDTO, ErrorResponseDTO } from '@aihompyhub/database/dto/shared';

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    const body = await request.json();
    
    // Zod Validation
    const parsed = CreateTopicSchema.safeParse(body);
    if (!parsed.success) {
      const errResp: ErrorResponseDTO = {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid payload',
          details: parsed.error.format()
        },
        meta: { requestId: context.requestId || 'req-err' }
      };
      return NextResponse.json(errResp, { status: 400 });
    }
    // TODO: Database insert logic for Canonical Topic

    const response: CommandAcceptedDTO = {
      data: {
        commandId: 'cmd-topic-mock',
        status: 'completed',
        targetRef: {
          type: 'Topic',
          id: 'mock-topic-id'
        }
      },
      meta: {
        requestId: context.requestId || 'req-mock',
        tenantId: context.tenantId
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    const errResp: ErrorResponseDTO = {
      error: {
        code: error.message === 'UNAUTHORIZED' ? 'PERMISSION_DENIED' : 'INVALID_STATE',
        message: error.message
      },
      meta: { requestId: 'req-err' }
    };
    return NextResponse.json(errResp, { status: error.message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}
