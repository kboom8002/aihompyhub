import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { AssignTemplateProfileSchema } from '@aihompyhub/database/validations';
import type { CommandAcceptedDTO, ErrorResponseDTO } from '@aihompyhub/database/dto/shared';

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    const body = await request.json();

    const parsed = AssignTemplateProfileSchema.safeParse(body);
    if (!parsed.success) {
      const errResp: ErrorResponseDTO = {
        error: { code: 'VALIDATION_FAILED', message: 'Invalid Profile Assignment payload', details: parsed.error.format() },
        meta: { requestId: context.requestId || 'req-err' }
      };
      return NextResponse.json(errResp, { status: 400 });
    }

    // STUB: Upsert into `template_profiles` based on tenant_id
    
    const response: CommandAcceptedDTO = {
      data: {
        commandId: crypto.randomUUID(),
        status: 'accepted',
        targetRef: {
          type: 'Topic', // Abstract reference matching ObjectType union
          id: crypto.randomUUID(),
        }
      },
      meta: {
        requestId: context.requestId as string,
        tenantId: context.tenantId
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    const isAuth = error.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } },
      { status: isAuth ? 401 : 500 }
    );
  }
}
