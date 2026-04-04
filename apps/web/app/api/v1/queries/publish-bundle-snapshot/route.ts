import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { QueryResponseDTO, PublishBundleSnapshotDTO } from '@aihompyhub/database/dto/shared';

// API Route: Publish Bundle Snapshot
export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);

    // STUB: Dummy publish bundles
    const snapshotData: PublishBundleSnapshotDTO = {
      totalBundles: 2,
      healthStatus: 'healthy',
      bundles: [
        {
          bundleId: '22222222-2222-2222-2222-222222222222',
          templateProfileId: '11111111-1111-1111-1111-111111111111',
          status: 'published',
          targetLocale: 'en-US',
          targetMarket: 'Global',
          createdAt: new Date().toISOString()
        },
        {
          bundleId: '33333333-3333-3333-3333-333333333333',
          templateProfileId: '11111111-1111-1111-1111-111111111111',
          status: 'draft',
          targetLocale: 'fr-FR',
          targetMarket: 'EU',
          createdAt: new Date().toISOString()
        }
      ]
    };

    const response: QueryResponseDTO<PublishBundleSnapshotDTO> = {
      data: snapshotData,
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
