import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { CreatePublishBundleSchema } from '@aihompyhub/database/validations';
import type { CommandAcceptedDTO, ErrorResponseDTO } from '@aihompyhub/database/dto/shared';

// API Route: Create Publish Bundle
export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    const body = await request.json();

    // 1. Zod Validation
    const parsed = CreatePublishBundleSchema.safeParse(body);
    if (!parsed.success) {
      const errResp: ErrorResponseDTO = {
        error: { code: 'VALIDATION_FAILED', message: 'Invalid Publish Bundle payload', details: parsed.error.format() },
        meta: { requestId: context.requestId || 'req-err' }
      };
      return NextResponse.json(errResp, { status: 400 });
    }

    // 2. STUB: Insert into `publish_bundles` and trigger `route_projections` logic
    // ...

    const response: CommandAcceptedDTO = {
      data: {
        commandId: crypto.randomUUID(),
        status: 'accepted',
        targetRef: {
          type: 'Topic',
          id: crypto.randomUUID(),
          title: `Publish Bundle generated for ${parsed.data.targetLocale}`
        }
      },
      meta: {
        requestId: context.requestId as string,
        tenantId: context.tenantId
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    const errResp: ErrorResponseDTO = {
      error: { code: error.message === 'UNAUTHORIZED' ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message },
      meta: { requestId: 'req-err' }
    };
    return NextResponse.json(errResp, { status: error.message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}
