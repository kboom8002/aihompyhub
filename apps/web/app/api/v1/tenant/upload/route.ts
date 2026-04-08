import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'anon'
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = getSupabaseAdmin();
    // Unique filename prefixed by tenant ID
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${tenantId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tenant-assets')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
    }

    const { data } = supabase.storage.from('tenant-assets').getPublicUrl(fileName);
    
    return NextResponse.json({ url: data.publicUrl }, { status: 200 });

  } catch (error) {
    console.error("Internal Server Error in /api/v1/tenant/upload:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
