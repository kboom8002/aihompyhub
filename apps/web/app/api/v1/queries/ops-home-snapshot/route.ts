import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { QueryResponseDTO } from '@aihompyhub/database/dto/shared';
import type { OpsHomeSnapshotDTO } from '@aihompyhub/database/dto/ops';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);

    const snapshotData: OpsHomeSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'ops_home_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: context.tenantId },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: ['EU_RETINOL_TRUST_GAP_DETECTED'],
      data: {
        openAlertsCount: 1, // Only 1 un-acknowledged open
        activeIncidentsCount: 1, // Trust gap SEV2
        pendingFixItsCount: 1, // Geo patch
        recentSignals: [
          {
            id: 'sig-1',
            signalType: 'trust_gap_detected',
            sourceTarget: { type: 'ProductFit', id: '12345678-1234-1234-1234-123456789012' },
            severity: 'high',
            payload: { reason: 'Medical claim boundary block missing for region EU' },
            createdAt: new Date().toISOString()
          },
          {
            id: 'sig-2',
            signalType: 'zero_result_spike',
            sourceTarget: null,
            severity: 'medium',
            payload: { query: 'vegan retinol substitute', count: 1205, timeframe: '10m' },
            createdAt: new Date().toISOString()
          }
        ]
      }
    };

    const response: QueryResponseDTO<OpsHomeSnapshotDTO> = {
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
    if (isAuth) {
      return NextResponse.json(
        { error: { code: 'PERMISSION_DENIED', message: error.message } },
        { status: 401 }
      );
    }
    
    // FALLBACK: Return degraded envelope rather than 400 error
    const fallbackEnvelope: OpsHomeSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'ops_home_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: '00000000-0000-0000-0000-000000000000' },
      asOf: new Date().toISOString(),
      freshness: { status: 'degraded', sourceLagSeconds: -1 },
      actions: [],
      warnings: [{ code: 'STORE_OFFLINE', message: 'Main DB is unreachable.' }],
      criticalFlags: ['DEGRADED_STATE'],
      data: {
        openAlertsCount: 0,
        activeIncidentsCount: 0,
        pendingFixItsCount: 0,
        recentSignals: []
      }
    };
    return NextResponse.json({ data: fallbackEnvelope, meta: { requestId: 'fallback-error', tenantId: '00000000-0000-0000-0000-000000000000', snapshotAt: new Date().toISOString() } });
  }
}
