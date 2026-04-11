import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'anon'
);

const CURRENT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('universal_content_assets')
      .select('json_payload, id')
      .eq('tenant_id', CURRENT_TENANT_ID)
      .eq('type', 'curation_config')
      .eq('category', 'system')
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
       return NextResponse.json({ layout: [] });
    }

    return NextResponse.json(data.json_payload || { layout: [] });
  } catch(e) {
     return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

  export async function PATCH(req: Request) {
    try {
      const body = await req.json();
      const { layout, template } = body;
      const activeTemplate = template || 'universal';
  
      const { data: existing } = await getSupabaseAdmin()
        .from('universal_content_assets')
        .select('id, json_payload')
        .eq('tenant_id', CURRENT_TENANT_ID)
        .eq('type', 'curation_config')
        .eq('category', 'system')
        .single();
  
      const existingPayload = existing?.json_payload || {};
      const newLayouts = { ...(existingPayload.layouts || {}) };
      newLayouts[activeTemplate] = layout || [];

      // Also update the flat layout array if universal (backward compat)
      let flatLayout = existingPayload.layout || [];
      if (activeTemplate === 'universal') {
         flatLayout = layout || [];
      }
  
      const payload = {
         title: 'Homepage Layout Curation',
         type: 'curation_config',
         category: 'system',
         tenant_id: CURRENT_TENANT_ID,
         status: 'active',
         json_payload: {
            ...existingPayload,
            layout: flatLayout,
            layouts: newLayouts
         }
      };
  
      let dbError = null;
      if (existing) {
         const { error } = await getSupabaseAdmin().from('universal_content_assets').update({ json_payload: payload.json_payload, updated_at: new Date().toISOString() }).eq('id', existing.id);
         dbError = error;
    } else {
       const { error } = await getSupabaseAdmin().from('universal_content_assets').insert(payload);
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
