import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { QueryResponseDTO, BuilderStudioSnapshotDTO } from '@aihompyhub/database/dto/shared';

// API Route: Builder Studio Snapshot
export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);

    // STUB: Dummy builder studio configuration
    const snapshotData = {
      currentProfile: {
        templateProfileId: '11111111-1111-1111-1111-111111111111',
        familyType: 'HighTrustVariant',
        overrides: {
          navEmphasis: 'routine',
        }
      },
      assignedBundlesCount: 1,
      validationSummary: [
        { type: 'pass', message: 'Trust Badge 렌더레이션 룰 충족.' },
        { type: 'pass', message: 'EU GEO Exclusion 룰 호환.' }
      ],
      previewStructure: {
        layout: 'HolyGrail',
        nodes: [
          { type: 'Header', features: ['GlobalNav', 'SearchEntry'] },
          { type: 'Hero', features: ['BrandPositioning'] },
          { type: 'RoutineStack', features: ['TrustBar', 'ProductCompare'] }
        ]
      }
    } as unknown as BuilderStudioSnapshotDTO;

    const response: QueryResponseDTO<BuilderStudioSnapshotDTO> = {
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
