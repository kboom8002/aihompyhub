import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { QueryResponseDTO, SearchGeoSnapshotDTO } from '@aihompyhub/database/dto/shared';

// API Route: Search & GEO Snapshot
export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);

    // STUB: Dummy search and geo records
    const snapshotData: SearchGeoSnapshotDTO = {
      totalTargetDocs: 150,
      syncedDocs: 148,
      excludedGeoRules: 1,
      searchItems: [
        {
          targetRef: { type: 'Topic', id: '44444444-4444-4444-4444-444444444444', title: 'Gentle Anti-aging Routine (Lumiere)' },
          versionRef: '99999999-9999-9999-9999-999999999999',
          syncStatus: 'synced'
        }
      ],
      geoItems: [
        {
          targetRef: { type: 'ProductFit', id: '12345678-1234-1234-1234-123456789012', title: 'Medical Grade Retinol' },
          versionRef: '88888888-8888-8888-8888-888888888888',
          excludedRegions: ['EU']
        }
      ]
    };

    const response: QueryResponseDTO<SearchGeoSnapshotDTO> = {
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
