import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { QueryResponseDTO } from '@aihompyhub/database/dto/shared';
import type { RuntimeHealthSnapshotDTO } from '@aihompyhub/database/dto/ops';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);

    // STUB: Dummy DLQ and Runtime Lanes
    const snapshotData: RuntimeHealthSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'runtime_health_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: context.tenantId },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: ['SEARCH_LANE_DEGRADED'],
      data: {
        globalStatus: 'degraded',
        lanes: [
          {
            laneId: 'generator_worker_1',
            status: 'healthy',
            currentBacklog: 0,
            lastHeartbeat: new Date().toISOString()
          },
          {
            laneId: 'search_index_worker',
            status: 'degraded',
            currentBacklog: 420,
            lastHeartbeat: new Date(Date.now() - 300000).toISOString() // 5 mins ago
          }
        ],
        recentDlqEvents: [
          {
            eventId: 'dlq-1',
            laneId: 'search_index_worker',
            errorReason: 'Zero-Result Map Timeout Exception',
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        ]
      }
    };

    const response: QueryResponseDTO<RuntimeHealthSnapshotDTO> = {
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
