import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { fetchObjectDetailSnapshot } from '@aihompyhub/database/repositories/objects';
import type { QueryResponseDTO } from '@aihompyhub/database/dto/shared';

// API Route: Object Detail Snapshot (incorporating Publish, GEO, Search states)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const objectType = searchParams.get('type');
    const objectId = searchParams.get('id');

    if (!objectType || !objectId) {
      throw new Error('Missing object type or id parameters');
    }

    const context = getRequestContext(request);
    const detailData = await fetchObjectDetailSnapshot(context.tenantId, objectType, objectId);

    const response: QueryResponseDTO<any> = {
      data: detailData,
      meta: {
        requestId: context.requestId as string,
        tenantId: context.tenantId,
        snapshotAt: new Date().toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    const isAuth = error.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } },
      { status: isAuth ? 401 : 400 }
    );
  }
}
