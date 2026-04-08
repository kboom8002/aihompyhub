import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'anon'
);

// Helper to get Tenant ID from headers (Simplified for this sprint)
// Now resolved dynamically from x-tenant-id

export async function GET(req: Request) {
  try {
    const tenantIdentifier = req.headers.get('x-tenant-id');
    if (!tenantIdentifier) return NextResponse.json({ error: 'Missing tenant header' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    // Resolve slug to uuid if necessary
    const { data: realTenant } = await supabase.from('tenants').select('id').or(`id.eq.${tenantIdentifier},slug.eq.${tenantIdentifier}`).single();
    const CURRENT_TENANT_ID = realTenant?.id;

    if (!CURRENT_TENANT_ID) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const { data, error } = await supabase
      .from('universal_content_assets')
      .select('json_payload, id')
      .eq('tenant_id', CURRENT_TENANT_ID)
      .eq('type', 'design_config')
      .eq('category', 'system')
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
       // Return default if not exists
       return NextResponse.json({
          base_theme: 'clinical_premium',
          overrides: {}
       });
    }

    return NextResponse.json(data.json_payload || { base_theme: 'clinical_premium', overrides: {} });
  } catch(e) {
     return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const tenantIdentifier = req.headers.get('x-tenant-id');
    if (!tenantIdentifier) return NextResponse.json({ error: 'Missing tenant header' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: realTenant } = await supabase.from('tenants').select('id').or(`id.eq.${tenantIdentifier},slug.eq.${tenantIdentifier}`).single();
    const CURRENT_TENANT_ID = realTenant?.id;

    if (!CURRENT_TENANT_ID) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const body = await req.json();
    const { base_theme, overrides } = body;

    // 1. Check if mapping already exists
    const { data: existing } = await supabase
      .from('universal_content_assets')
      .select('id')
      .eq('tenant_id', CURRENT_TENANT_ID)
      .eq('type', 'design_config')
      .eq('category', 'system')
      .single();

    const payload = {
       title: 'Master Theme Settings',
       type: 'design_config',
       category: 'system',
       tenant_id: CURRENT_TENANT_ID,
       status: 'active',
       json_payload: {
          base_theme: base_theme || 'clinical_premium',
          overrides: overrides || {}
       }
    };

    let dbError = null;
    if (existing) {
       const { error } = await supabase.from('universal_content_assets').update({ json_payload: payload.json_payload, updated_at: new Date().toISOString() }).eq('id', existing.id);
       dbError = error;
    } else {
       const { error } = await supabase.from('universal_content_assets').insert(payload);
       dbError = error;
    }

    if (dbError) {
       console.error('DB Operation Failed:', dbError);
       return NextResponse.json({ error: 'DB Save Failed', details: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, payload: payload.json_payload });
  } catch(e) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
