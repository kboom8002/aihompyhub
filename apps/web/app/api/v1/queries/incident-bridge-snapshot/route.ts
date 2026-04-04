import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { QueryResponseDTO } from '@aihompyhub/database/dto/shared';
import type { IncidentDTO as OpsIncidentDTO } from '@aihompyhub/database/dto/ops';

export interface IncidentBridgeSnapshotDTO {
  activeIncidents: OpsIncidentDTO[];
  ongoingMitigations: Record<string, unknown>;
}

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);

    const snapshotData: IncidentBridgeSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'incident_bridge_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: context.tenantId },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: ['SEV2_ONGOING'],
      data: {
        activeIncidents: [
          {
            id: '77777777-0000-0000-0000-000000000001',
            alertId: '99999999-0000-0000-0000-000000000001',
            severity: 'sev2',
            status: 'active',
            mitigationState: { current_step: 'Awaiting C-Level approval', blocks_applied: ['EU_GEO_KILLSWITCH'] },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        ongoingMitigations: {
          '77777777-0000-0000-0000-000000000001': {
             killSwitchEnabled: true,
             projectionPaused: false
          }
        }
      }
    };

    const response: QueryResponseDTO<IncidentBridgeSnapshotDTO> = {
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
