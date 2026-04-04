import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { GeneratorRunsSnapshotDTO } from '@aihompyhub/database/dto/generator';
import type { SnapshotEnvelopeDTO } from '@aihompyhub/database/dto/shared';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);

    // DETERMINISTIC STUB: Return list of runs including complete list and provenance metadata
    const snapshotData: GeneratorRunsSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'generator_runs_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: context.tenantId },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: {
        totalRunning: 0,
        totalFailed: 1,
        runs: [
          {
            id: 'run-00000000-0000-0000-0000-000000000003',
            runType: 'content_draft',
            status: 'completed',
            inputPackHash: 'hash-answer', // Provenance
            rawInputState: { questionTitle: "Is retinol safe for sensitive skin?" },
            promptVersion: {
              id: 'pv-00000000-0000-0000-0000-000000000001',
              registryId: 'reg-00000000-0000-0000-0000-000000000001',
              versionTag: 'v1.0.0',
              status: 'active'
            },
            startedAt: new Date(Date.now() - 300000).toISOString(),
            finishedAt: new Date(Date.now() - 240000).toISOString()
          }
        ]
      }
    };

    return NextResponse.json({ data: snapshotData, meta: { requestId: 'req-' + Date.now(), tenantId: context.tenantId, snapshotAt: new Date().toISOString() } });
  } catch (error: any) {
    const isAuth = error.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } },
      { status: isAuth ? 401 : 400 }
    );
  }
}
