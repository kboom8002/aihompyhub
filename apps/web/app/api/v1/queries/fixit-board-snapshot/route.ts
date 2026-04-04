import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { QueryResponseDTO } from '@aihompyhub/database/dto/shared';
import type { FixitBoardSnapshotDTO, FixItTaskDTO } from '@aihompyhub/database/dto/ops';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);

    // STUB: Dummy pending fix-its matching the RCA in previous stages
    const snapshotData: FixitBoardSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'fixit_board_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: context.tenantId },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: {
        totalPendingFixIts: 1,
        fixIts: [
          {
            id: 'task-1',
            rcaId: 'rca-1',
            taskType: 'geo_patch',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as FixItTaskDTO
        ]
      }
    };

    const response: QueryResponseDTO<FixitBoardSnapshotDTO> = {
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
