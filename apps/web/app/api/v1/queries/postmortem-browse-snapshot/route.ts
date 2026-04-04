import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { PostmortemBrowseSnapshotDTO, PostmortemRecordDTO } from '@aihompyhub/database/dto/optimization';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);
    if (context.tenantId !== 'SYSTEM') throw new Error('UNAUTHORIZED: Postmortem visibility is restricted to the global Factory scope.');

    const supabase = createServerSupabaseAdminClient();

    const { data: dbRecords, error } = await supabase
       .from('postmortem_records')
       .select('*')
       .order('published_at', { ascending: false });

    if (error) throw error;

    const library: PostmortemRecordDTO[] = (dbRecords || []).map(row => ({
       id: row.id,
       systemicRcaId: row.systemic_rca_id,
       title: row.title,
       rootCauseAnalysis: row.root_cause_analysis,
       resolutionSummary: row.resolution_summary,
       preventativeMeasures: row.preventative_measures,
       severity: row.severity,
       authorId: row.author_id,
       publishedAt: row.published_at
    }));

    const snapshotData: PostmortemBrowseSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'postmortem_browse_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: 'SYSTEM' },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: { library }
    };

    return NextResponse.json({ data: snapshotData, meta: { requestId: 'req-' + Date.now(), tenantId: context.tenantId, snapshotAt: new Date().toISOString() } });
  } catch (error: any) {
    const isAuth = error.message === 'UNAUTHORIZED';
    return NextResponse.json({ error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } }, { status: isAuth ? 401 : 400 });
  }
}
