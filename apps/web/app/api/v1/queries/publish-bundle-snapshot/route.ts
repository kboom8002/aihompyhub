import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { QueryResponseDTO, PublishBundleSnapshotDTO, PublishBundleDTO } from '@aihompyhub/database/dto/shared';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);
    const supabase = createServerSupabaseAdminClient();

    const { data: bundles, error } = await supabase
      .from('publish_bundles')
      .select('*')
      .eq('tenant_id', context.tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`DB Error: ${error.message}`);
    }

    const mappedBundles: PublishBundleDTO[] = (bundles || []).map((b: any) => ({
      bundleId: b.id,
      templateProfileId: b.template_profile_id || 'unassigned',
      status: b.status,
      targetLocale: b.target_locale || 'en-US',
      targetMarket: b.target_market || 'Global',
      createdAt: b.created_at
    }));

    const snapshotData: PublishBundleSnapshotDTO = {
      totalBundles: mappedBundles.length,
      healthStatus: 'healthy',
      bundles: mappedBundles
    };

    const response: QueryResponseDTO<PublishBundleSnapshotDTO> = {
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
