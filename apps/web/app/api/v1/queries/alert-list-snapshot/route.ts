import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { QueryResponseDTO } from '@aihompyhub/database/dto/shared';
import type { AlertListSnapshotDTO } from '@aihompyhub/database/dto/ops';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);

    const snapshotData: AlertListSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'alert_list_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: context.tenantId },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: {
        totalAlerts: 2,
        alerts: [
          {
            id: 'alert-1',
            ruleId: 'boundary_missing_on_high_risk_object',
            status: 'open',
            contextRef: { type: 'ProductFit', id: '12345678-1234-1234-1234-123456789012', title: 'Medical Grade Retinol' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'alert-2',
            ruleId: 'projection_stale',
            status: 'acknowledged',
            contextRef: null,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      }
    };

    const response: QueryResponseDTO<AlertListSnapshotDTO> = {
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
