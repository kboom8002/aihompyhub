import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

let UNIVERSAL_MOCK_CONTENT: any[] = [];

export async function GET(request: Request) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');
    const id = url.searchParams.get('id');

    let contents: any = null;
    let error: any = null;

    if (id) {
        const res = await supabaseAdmin.from('universal_content_assets').select('*').eq('tenant_id', tenantId).eq('id', id).single();
        contents = res.data;
        error = res.error;
    } else if (category && type) {
        const res = await supabaseAdmin.from('universal_content_assets').select('*').eq('tenant_id', tenantId).eq('category', category).eq('type', type).order('created_at', { ascending: false });
        contents = res.data;
        error = res.error;
    } else {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // DB Error/Missing DB fallback to MOCK
    if (error || !contents) {
        console.error("Supabase Error or not found, falling back to mock:", error);
        if (id) {
            const single = UNIVERSAL_MOCK_CONTENT.find(c => c.id === id);
            return NextResponse.json({ data: single });
        }
        const filtered = UNIVERSAL_MOCK_CONTENT.filter(c => 
          c.tenant_id === tenantId && c.category === category && c.type === type
        );
        return NextResponse.json({ data: filtered });
    }

    return NextResponse.json({ data: contents });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const body = await request.json();
    const { title, json_payload } = body;

    if (!id || !title) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payload = {
        title,
        json_payload,
        updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('universal_content_assets')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
         console.warn("DB Update Failed, attempting mock update:", error);
         const idx = UNIVERSAL_MOCK_CONTENT.findIndex(c => c.id === id);
         if (idx > -1) {
             UNIVERSAL_MOCK_CONTENT[idx] = { ...UNIVERSAL_MOCK_CONTENT[idx], ...payload };
             return NextResponse.json({ data: UNIVERSAL_MOCK_CONTENT[idx] });
         }
         return NextResponse.json({ error: 'Item not found in mock' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';
    const body = await request.json();
    const { category, type, title, json_payload } = body;

    if (!category || !type || !title) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payload = {
        tenant_id: tenantId,
        category,
        type,
        title,
        json_payload,
        status: 'active'
    };

    const { data, error } = await supabaseAdmin
      .from('universal_content_assets')
      .insert([payload])
      .select()
      .single();

    if (error) {
         console.warn("DB Insert Failed, storing in mock:", error);
         const newContent = { ...payload, id: `uc-${Date.now()}`, created_at: new Date().toISOString() };
         UNIVERSAL_MOCK_CONTENT.unshift(newContent);
         return NextResponse.json({ data: newContent });
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
      .from('universal_content_assets')
      .delete()
      .eq('id', id);

    if (error) {
        const prevLength = UNIVERSAL_MOCK_CONTENT.length;
        UNIVERSAL_MOCK_CONTENT = UNIVERSAL_MOCK_CONTENT.filter(c => c.id !== id);
        return NextResponse.json({ success: prevLength > UNIVERSAL_MOCK_CONTENT.length });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
