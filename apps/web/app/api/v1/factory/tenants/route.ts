import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data: tenants, error } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const healthSummaries = (tenants || []).map((t: any) => ({
     tenantId: t.id,
     tenantName: t.name,
     slug: t.slug,
     status: t.status,
     trustScore: 100, // Mock metric mapping
     activeIncidents: 0,
     unresolvedAlerts: 0,
     trend: 'stable'
  }));

  return NextResponse.json({ data: { healthSummaries } });
}

export async function POST(request: Request) {
  try {
    const { name, slug } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') + '-' + Math.floor(Math.random() * 10000);

    const { data: newTenant, error: tenantErr } = await supabaseAdmin
      .from('tenants')
      .insert([{ name, slug: generatedSlug, status: 'active' }])
      .select()
      .single();
      
    if (tenantErr) {
       return NextResponse.json({ error: tenantErr.message }, { status: 500 });
    }

    return NextResponse.json({ data: newTenant });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
