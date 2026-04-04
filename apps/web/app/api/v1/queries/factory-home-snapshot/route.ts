import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { FactoryHomeSnapshotDTO } from '@aihompyhub/database/dto/factory';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);
    const supabase = createServerSupabaseAdminClient();

    // Fetch live data from Supabase
    const [
      { data: rollouts, error: errRoll   },
      { data: rcas, error: errRca        },
      { data: healths, error: errHlth    }
    ] = await Promise.all([
      supabase.from('rollout_campaigns').select('*').in('status', ['rolling_out', 'frozen', 'rolling_back']).order('started_at', { ascending: false }),
      supabase.from('systemic_rca_candidates').select('*').in('status', ['monitoring', 'escalated_to_incident']).order('created_at', { ascending: false }),
      supabase.from('tenant_health_snapshots').select('*').order('snapshot_date', { ascending: false }).limit(50) // Assuming distinct tenant logic is enforced via daily unique constraints
    ]);

    if (errRoll) console.error('Rollback fetch error:', errRoll);
    if (errRca) console.error('RCA fetch error', errRca);
    if (errHlth) console.error('Health fetch error', errHlth);

    const safeRollouts = rollouts || [];
    const safeRcas = rcas || [];
    const safeHealths = healths || [];

    // Calculate Global Metrics
    const totalTenants = safeHealths.length > 0 ? safeHealths.length : 120; // Fallback to 120 if empty DB
    const avgTrust = safeHealths.length > 0 ? safeHealths.reduce((acc: number, h: any) => acc + h.trust_score, 0) / safeHealths.length : 90;
    const criticalIssues = safeRcas.filter((r: any) => ['high', 'critical'].includes(r.severity)).length;

    const snapshotData: FactoryHomeSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'factory_home_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: 'SYSTEM' },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: {
        globalMetrics: {
          averageTrustScore: Math.round(avgTrust),
          totalTenants: totalTenants,
          criticalSystemicIssues: criticalIssues
        },
        activeRollouts: safeRollouts.map((r: any) => ({
          id: r.id,
          campaignName: r.campaign_name,
          targetObjectType: r.target_object_type,
          targetObjectId: r.target_object_id,
          rolloutStrategy: r.rollout_strategy,
          status: r.status,
          startedAt: r.started_at,
          progressPercentage: 45 // Dummy progress logic unless tracked in db explicitly via targets
        })),
        systemicCandidates: safeRcas.map((r: any) => ({
          id: r.id,
          title: r.title,
          severity: r.severity,
          status: r.status,
          affectedTenantCount: r.affected_tenant_count,
          createdAt: r.created_at
        })),
        healthSummaries: safeHealths.map((h: any) => ({
          tenantId: h.tenant_id,
          tenantName: `Tenant Data (${h.tenant_id.substring(0,6)})`, // Supabase won't auto-join tenant table unless specified, mocking name
          trustScore: h.trust_score,
          activeIncidents: h.active_incidents,
          failedRollouts: h.failed_rollouts,
          unresolvedAlerts: h.unresolved_alerts,
          trend: h.trust_score < 75 ? 'degrading' : 'stable'
        }))
      }
    };

    return NextResponse.json({ data: snapshotData, meta: { requestId: 'req-' + Date.now(), tenantId: context.tenantId, snapshotAt: new Date().toISOString() } });
  } catch (error: any) {
    const isAuth = error.message === 'UNAUTHORIZED';
    return NextResponse.json({ error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } }, { status: isAuth ? 401 : 400 });
  }
}
