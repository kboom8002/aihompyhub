import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { TemplateProfilesSnapshotDTO } from '@aihompyhub/database/dto/generator';
import type { SnapshotEnvelopeDTO } from '@aihompyhub/database/dto/shared';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);

    // DETERMINISTIC STUB: Return hardcoded template profiles and assignments
    const snapshotData: TemplateProfilesSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'template_profiles_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: context.tenantId },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: {
        families: [
          {
            id: 'LumiereCore',
            name: 'Lumiere Skincare Core Layout'
          }
        ],
        profiles: [
          {
            id: 'tp-00000000-0000-0000-0000-000000000001',
            familyId: 'LumiereCore',
            name: 'EU Vegan Retinol Theme',
            overrides: { fonts: ['Inter'], colors: { primary: '#1A2F22' } },
            assignedBrands: ['11111111-1111-1111-1111-111111111111'] // Bound to Brand
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
