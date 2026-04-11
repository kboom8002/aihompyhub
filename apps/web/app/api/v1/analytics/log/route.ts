import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, sessionId, eventName, category, attribution, payload } = body;

    if (!tenantId || !eventName || !sessionId) {
      return NextResponse.json({ error: 'Missing required tracking fields' }, { status: 400 });
    }

    // Insert into tenant_analytics_events using admin role (bypass RLS for insert)
    const { error } = await supabaseAdmin
      .from('tenant_analytics_events')
      .insert({
        tenant_id: tenantId,
        session_id: sessionId,
        event_name: eventName,
        category: category || 'general',
        attribution: attribution || {},
        payload: payload || {}
      });

    if (error) {
      console.error('[Analytics API] Insert Error:', error);
      return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Analytics API] Processing Error:', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
