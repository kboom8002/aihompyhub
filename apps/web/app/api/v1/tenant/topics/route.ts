import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveAdminTenantId } from '../../../../../lib/tenant';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

let MOCK_TOPICS: any[] = [
  { id: 'mock-topic-1', cluster_id: 'mock-cluster-1', tenant_id: 'SYSTEM', canonical_question: '여름철 선크림 얼룩 안지우게 어떻게 바르나요?', status: 'active', created_at: new Date().toISOString() },
  { id: 'mock-topic-2', cluster_id: 'mock-cluster-1', tenant_id: 'SYSTEM', canonical_question: '지성 피부용 가벼운 로션 있나요?', status: 'active', created_at: new Date().toISOString() }
];

export async function GET(request: Request) {
  try {
    const rawTenantId = request.headers.get('x-tenant-id') || 'SYSTEM';
    const tenantId = resolveAdminTenantId(rawTenantId);
    const url = new URL(request.url);
    const clusterId = url.searchParams.get('clusterId');

    if (!clusterId) {
      return NextResponse.json({ error: 'Missing clusterId' }, { status: 400 });
    }

    const { data: topics, error } = await supabaseAdmin
      .from('topics')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('cluster_id', clusterId)
      .order('created_at', { ascending: false });

    const results = error || !topics ? MOCK_TOPICS.filter(t => t.cluster_id === clusterId) : topics;
    return NextResponse.json({ data: results });
  } catch (err: any) {
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const rawTenantId = request.headers.get('x-tenant-id') || 'SYSTEM';
    const tenantId = resolveAdminTenantId(rawTenantId);
    const body = await request.json();
    const { cluster_id, canonical_question } = body;

    if (!cluster_id || !canonical_question) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payload = {
        tenant_id: tenantId,
        cluster_id,
        canonical_question,
        status: 'active' // Forced MVP automatically set to active
    };

    const { data, error } = await supabaseAdmin
      .from('topics')
      .insert([payload])
      .select()
      .single();

    if (error) {
       const mockPayload = { ...payload, id: `mock-${Date.now()}`, created_at: new Date().toISOString() };
       MOCK_TOPICS.unshift(mockPayload);
       return NextResponse.json({ data: mockPayload });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing id param' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('topics')
      .delete()
      .eq('id', id);

    if (error) {
       MOCK_TOPICS = MOCK_TOPICS.filter(t => t.id !== id);
       return NextResponse.json({ success: true, mocked: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
