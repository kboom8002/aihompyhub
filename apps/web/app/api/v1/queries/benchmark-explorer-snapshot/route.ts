import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { BenchmarkExplorerSnapshotDTO, BenchmarkRunDTO } from '@aihompyhub/database/dto/optimization';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);
    if (context.tenantId !== 'SYSTEM') throw new Error('UNAUTHORIZED: Benchmark visibility is restricted to the global Factory scope.');

    const supabase = createServerSupabaseAdminClient();

    const { data: dbRuns, error } = await supabase
       .from('benchmark_runs')
       .select('*')
       .order('run_date', { ascending: false });

    if (error) throw error;

    const runs: BenchmarkRunDTO[] = (dbRuns || []).map(row => ({
       id: row.id,
       targetObjectType: row.target_object_type,
       targetObjectId: row.target_object_id,
       targetIdentifier: `Target [${row.target_object_id.slice(0, 8)}]`, // Placeholder mapping
       datasetRef: row.dataset_ref,
       overallScore: Number(row.overall_score),
       qualityScore: Number(row.quality_score),
       safeguardScore: Number(row.safeguard_score),
       latencyMsP95: row.latency_ms_p95 ? Number(row.latency_ms_p95) : null,
       status: row.status,
       runDate: row.run_date
    }));

    const topPerformers = runs.filter(r => r.status === 'pass').sort((a,b) => b.overallScore - a.overallScore);
    const recentRuns = runs.filter(r => r.status !== 'pass');

    const snapshotData: BenchmarkExplorerSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'benchmark_explorer_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: 'SYSTEM' },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: { recentRuns, topPerformers }
    };

    return NextResponse.json({ data: snapshotData, meta: { requestId: 'req-' + Date.now(), tenantId: context.tenantId, snapshotAt: new Date().toISOString() } });
  } catch (error: any) {
    const isAuth = error.message === 'UNAUTHORIZED';
    return NextResponse.json({ error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } }, { status: isAuth ? 401 : 400 });
  }
}
