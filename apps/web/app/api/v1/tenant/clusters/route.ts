import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fallback Mock Data for UI testing without DB
let MOCK_CLUSTERS: any[] = [
  { id: 'mock-cluster-1', tenant_id: 'SYSTEM', cluster_name: 'Summer Skincare Routine', intent_type: 'routine_discovery', priority_score: 95 },
  { id: 'mock-cluster-2', tenant_id: 'SYSTEM', cluster_name: 'Ingredient Safety Concerns', intent_type: 'ingredient_safety', priority_score: 80 }
];

export async function GET(request: Request) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'SYSTEM';
    const { data: clusters, error } = await supabaseAdmin
      .from('question_clusters')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('priority_score', { ascending: false });

    const results = error || !clusters ? MOCK_CLUSTERS.filter(c => c.tenant_id === tenantId || 'SYSTEM') : clusters;
    return NextResponse.json({ data: results });
  } catch (err: any) {
    return NextResponse.json({ data: MOCK_CLUSTERS }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'SYSTEM';
    const body = await request.json();
    const { cluster_name, intent_type, priority_score } = body;

    if (!cluster_name || !intent_type) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payload = {
        tenant_id: tenantId,
        cluster_name,
        intent_type,
        priority_score: priority_score || 50
    };

    const { data, error } = await supabaseAdmin
      .from('question_clusters')
      .insert([payload])
      .select()
      .single();

    if (error) {
       const mockPayload = { ...payload, id: `mock-${Date.now()}` };
       MOCK_CLUSTERS.unshift(mockPayload);
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
      .from('question_clusters')
      .delete()
      .eq('id', id);

    if (error) {
       MOCK_CLUSTERS = MOCK_CLUSTERS.filter(c => c.id !== id);
       return NextResponse.json({ success: true, mocked: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
