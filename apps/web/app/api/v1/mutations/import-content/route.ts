import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';
    const body = await request.json();
    const { category, type, items } = body;

    if (!category || !type || !Array.isArray(items)) {
        return NextResponse.json({ error: 'Missing required fields or invalid items format' }, { status: 400 });
    }
    
    // 1. 기존 DB에 등록된 항목인지 Title을 기준으로 Fetch
    const titles = items.map((i: any) => i.title).filter(Boolean);
    
    const { data: existingData, error: fetchError } = await supabaseAdmin
      .from('universal_content_assets')
      .select('id, title')
      .eq('tenant_id', tenantId)
      .eq('category', category)
      .eq('type', type)
      .in('title', titles);
      
    if (fetchError) {
      throw new Error("Failed to fetch existing records");
    }

    const existingMap = new Map();
    (existingData || []).forEach((row: any) => {
        existingMap.set(row.title, row.id);
    });

    let mockIdCounter = Date.now();

    const upsertPayload = items.map((item: any) => {
        const existingId = existingMap.get(item.title);
        
        let htmlBody = item.body || '';
        // 텍스트가 순수 문자열이면 기본 <p> HTML 래핑 처리
        if (htmlBody && !htmlBody.includes('<p>') && !htmlBody.includes('<h1>')) {
             htmlBody = `<p>${htmlBody}</p>`;
        }

        return {
            ...(existingId ? { id: existingId } : { id: `uc-bulk-${mockIdCounter++}` }), 
            tenant_id: tenantId,
            category,
            type,
            title: item.title,
            json_payload: {
                body: htmlBody,
                tags: item.tags || '',
                thumbnail: item.thumbnail || ''
            },
            status: 'active',
            updated_at: new Date().toISOString()
        };
    });

    // 2. Supabase Upsert 진행 (id가 존재하면 update, 없으면 생성)
    const { data, error } = await supabaseAdmin
      .from('universal_content_assets')
      .upsert(upsertPayload, { onConflict: 'id' })
      .select();

    if (error) {
         console.error("Bulk Import Upsert Failed:", error);
         return NextResponse.json({ error: 'DB Upsert Failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
