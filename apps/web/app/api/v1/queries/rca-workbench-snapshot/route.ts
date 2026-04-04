import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { QueryResponseDTO } from '@aihompyhub/database/dto/shared';
import type { RcaWorkbenchSnapshotDTO } from '@aihompyhub/database/dto/ops';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);

    const snapshotData: RcaWorkbenchSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'rca_workbench_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: context.tenantId },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: {
        rcaRecords: [
          {
            id: 'rca-1',
            alertId: 'alert-1',
            domain: 'trust',
            description: 'EU blocked region claim missing explicit boundary component in target schema.',
            status: 'draft',
            createdAt: new Date().toISOString()
          }
        ],
        linkedFixIts: {
          'rca-1': [
            {
              id: 'task-1',
              rcaId: 'rca-1',
              taskType: 'geo_patch',
              status: 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      }
    };

    const response: QueryResponseDTO<RcaWorkbenchSnapshotDTO> = {
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
