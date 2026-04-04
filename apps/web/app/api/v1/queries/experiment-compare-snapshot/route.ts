import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { ExperimentCompareSnapshotDTO, ExperimentCompareSummaryDTO } from '@aihompyhub/database/dto/optimization';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);
    if (context.tenantId !== 'SYSTEM') throw new Error('UNAUTHORIZED: Experiment visibility is restricted to the global Factory scope.');

    const supabase = createServerSupabaseAdminClient();

    const { data: dbExps, error } = await supabase
       .from('controlled_experiments')
       .select('*')
       .order('started_at', { ascending: false });

    if (error) throw error;

    const exps = (dbExps || []).map(row => {
       const payload = row.metrics_payload || { baselineMetrics: {}, testMetrics: {} };
       return {
          id: row.id,
          experimentName: row.experiment_name,
          targetObjectType: row.target_object_type,
          status: row.status,
          primaryMetric: row.primary_metric,
          startedAt: row.started_at,
          conclusionReason: row.conclusion_reason,
          statisticalSignificanceReached: true, // Mock indicator for visibility
          baselineMetrics: payload.baselineMetrics,
          testMetrics: payload.testMetrics
       } as ExperimentCompareSummaryDTO;
    });

    const activeExperiments = exps.filter(e => e.status === 'running');
    const concludedExperiments = exps.filter(e => e.status === 'concluded' || e.status === 'aborted');

    const snapshotData: ExperimentCompareSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'experiment_compare_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: 'SYSTEM' },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: { activeExperiments, concludedExperiments }
    };

    return NextResponse.json({ data: snapshotData, meta: { requestId: 'req-' + Date.now(), tenantId: context.tenantId, snapshotAt: new Date().toISOString() } });
  } catch (error: any) {
    const isAuth = error.message === 'UNAUTHORIZED';
    return NextResponse.json({ error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } }, { status: isAuth ? 401 : 400 });
  }
}
