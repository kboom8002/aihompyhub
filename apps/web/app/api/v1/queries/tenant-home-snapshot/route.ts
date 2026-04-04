import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { fetchPriorityClusters } from '@aihompyhub/database/repositories/clusters';
import type { QueryResponseDTO } from '@aihompyhub/database/dto/shared';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);
    const clusters = await fetchPriorityClusters(context.tenantId);

  const response: QueryResponseDTO<any> = {
    data: {
      snapshotId: 'snap-mock-1',
      snapshotType: 'tenant_home_snapshot',
      snapshotVersion: 'v1',
      context: {
        tenantId: context.tenantId,
      },
      asOf: new Date().toISOString(),
      freshness: {
        status: 'fresh',
        sourceLagSeconds: 0
      },
      data: {
        criticalStrip: {
          highPriorityUncoveredCount: 3,
          reviewPendingCount: 1,
          publishReadyCount: 0,
          liveTrustIssueCount: 0,
          openFixitCount: 0,
          noDeadEndRiskCount: 0
        },
        priorityClusterGaps: { 
          items: clusters?.map((c: any) => ({
            clusterId: c.id,
            clusterName: c.cluster_name,
            intentType: c.intent_type,
            priorityScore: c.priority_score,
            coverageStatus: 'uncovered'
          })) || [] 
        },
        canonicalWorkQueue: { items: [] },
        liveTrustWatch: { items: [] },
        publishReadiness: { items: [] },
        searchGeoSummary: {
          searchResolutionRate: 100,
          zeroResultRate: 0,
          geoCoverageRate: 100,
          citationObservedRate: 0
        },
        openFixits: { items: [] }
      },
      actions: [],
      warnings: [],
      criticalFlags: []
    },
    meta: {
      requestId: context.requestId || 'req-mock-query',
      tenantId: context.tenantId,
      snapshotAt: new Date().toISOString()
    }
  };

  return NextResponse.json(response);
} catch (err: any) {
  return NextResponse.json({ error: { code: 'PERMISSION_DENIED', message: err.message } }, { status: 401 });
}
}
