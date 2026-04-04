import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { CommercialSnapshotDTO, CommercialPlanDTO, TenantSubscriptionDTO, PackCatalogDTO } from '@aihompyhub/database/dto/commercial';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);
    const supabase = createServerSupabaseAdminClient();

    // 1. Fetch Plans
    const { data: dbPlans, error: planErr } = await supabase.from('commercial_plans').select('*');
    if (planErr) throw planErr;

    const availablePlans: CommercialPlanDTO[] = (dbPlans || []).map(p => ({
        id: p.id,
        planCode: p.plan_code,
        displayName: p.display_name,
        monthlyPriceUsd: p.monthly_price_usd,
        featuresAllowed: p.features_allowed,
        limitsDefinition: p.limits_definition,
        status: p.status
    }));
    
    const planMap = new Map(availablePlans.map(p => [p.id, p]));

    // 2. Fetch Subscriptions (If SYSTEM, all. If Tenant, just theirs)
    let subQuery = supabase.from('tenant_subscriptions').select('*').order('created_at', { ascending: false });
    if (context.tenantId !== 'SYSTEM') subQuery = subQuery.eq('tenant_id', context.tenantId);
    
    const { data: dbSubs, error: subErr } = await subQuery;
    if (subErr) throw subErr;

    const activeSubscriptions: TenantSubscriptionDTO[] = (dbSubs || []).map(s => ({
        id: s.id,
        tenantId: s.tenant_id,
        tenantName: s.tenant_name,
        planId: s.plan_id,
        planCode: planMap.get(s.plan_id)?.planCode,
        status: s.status,
        currentPeriodEnd: s.current_period_end
    }));

    // 3. Fetch Pack Catalogs
    const { data: dbPacks, error: packErr } = await supabase.from('pack_catalogs').select('*').order('created_at', { ascending: true });
    if (packErr) throw packErr;

    const catalogPacks: PackCatalogDTO[] = (dbPacks || []).map(c => ({
        id: c.id,
        packName: c.pack_name,
        description: c.description,
        packType: c.pack_type,
        minimumPlanCode: c.minimum_plan_code,
        isPublished: c.is_published,
        payloadManifest: c.payload_manifest
    }));

    const snapshotData: CommercialSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'commercial_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: context.tenantId },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: { availablePlans, activeSubscriptions, catalogPacks }
    };

    return NextResponse.json({ data: snapshotData, meta: { requestId: 'req-' + Date.now(), tenantId: context.tenantId, snapshotAt: new Date().toISOString() } });
  } catch (error: any) {
    const isAuth = error.message.includes('UNAUTHORIZED');
    return NextResponse.json({ error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } }, { status: isAuth ? 401 : 400 });
  }
}
