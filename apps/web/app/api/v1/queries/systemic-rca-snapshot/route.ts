import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { SystemicRCASnapshotDTO } from '@aihompyhub/database/dto/factory';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);

    const snapshotData: SystemicRCASnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'systemic_rca_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: 'SYSTEM' },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: {
        globalMetrics: {
          totalTenants: 450,
          openInvestigations: 2
        },
        candidates: [
          {
            id: 'srca-00000000-0000-0000-0000-000000000111',
            title: 'Generator Timeout Spike on Brand Foundation Extract',
            severity: 'high',
            status: 'escalated_to_incident',
            affectedTenantCount: 12,
            suspectedRolloutCampaignId: 'roll-00000000-0000-0000-0000-000000000111',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            correlatedRolloutName: 'Q3 Standard Template Update (v2.1)',
            correlatedRolloutTargetType: 'TemplateProfile',
            tenantEvidenceLinks: [
              { tenantId: '00000000-0000-0000-0000-000000000001', tenantName: 'Lumiere Botanicals', localIncidentId: 'inc-123', reportedAt: new Date(Date.now() - 3600000).toISOString() },
              { tenantId: '00000000-0000-0000-0000-000000000003', tenantName: 'Urban Derma Corp', localIncidentId: 'inc-124', reportedAt: new Date(Date.now() - 3500000).toISOString() },
              { tenantId: '00000000-0000-0000-0000-000000000008', tenantName: 'Nature Co.', localIncidentId: 'inc-125', reportedAt: new Date(Date.now() - 3400000).toISOString() }
            ]
          },
          {
             id: 'srca-00000000-0000-0000-0000-000000000222',
             title: 'Repeated Null Handling RCA: "Ingredient A vs B" Compare Cards',
             severity: 'medium',
             status: 'monitoring',
             affectedTenantCount: 5,
             suspectedRolloutCampaignId: null,
             createdAt: new Date(Date.now() - 172800000).toISOString(),
             tenantEvidenceLinks: [
               { tenantId: '00000000-0000-0000-0000-000000000011', tenantName: 'Vegan Choice', localIncidentId: 'inc-222', reportedAt: new Date(Date.now() - 86400000).toISOString() }
             ]
          }
        ]
      }
    };

    return NextResponse.json({ data: snapshotData, meta: { requestId: 'req-' + Date.now(), tenantId: context.tenantId, snapshotAt: new Date().toISOString() } });
  } catch (error: any) {
    const isAuth = error.message === 'UNAUTHORIZED';
    return NextResponse.json({ error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } }, { status: isAuth ? 401 : 400 });
  }
}
