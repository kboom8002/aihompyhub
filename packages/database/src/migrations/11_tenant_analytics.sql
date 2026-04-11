-- Migration: 11_tenant_analytics
-- Target: Establish event logging table for Tenant Dual-Tracking Analytics

CREATE TABLE IF NOT EXISTS public.tenant_analytics_events (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    category TEXT NOT NULL, 
    -- e.g., 'sns', 'commerce', 'semantic_search', 'content'
    
    attribution JSONB DEFAULT '{}'::jsonb,
    -- Tracks where the user came from: { "utm_source": "perplexity", "utm_medium": "ai_search", "referrer": "perplexity.ai" }
    
    payload JSONB DEFAULT '{}'::jsonb,
    -- Specific event data: { "creator_id": "xxx", "offer_id": "yyy", "answer_id": "zzz", "price": 0 }
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Read only by admins or stats role, insert by anon/authenticated)
ALTER TABLE public.tenant_analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow inserts from any origin if tenant routing is correct
CREATE POLICY "Allow anonymous inserts to analytics" 
    ON public.tenant_analytics_events 
    FOR INSERT 
    WITH CHECK (true);

-- Allow tenant admins to view their own analytics
CREATE POLICY "Allow tenant admins to view their analytics" 
    ON public.tenant_analytics_events 
    FOR SELECT 
    USING (
        tenant_id IN (
            SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'super_admin'
        )
    );

-- Index for efficient dashboard queries
CREATE INDEX IF NOT EXISTS idx_tenant_analytics_tenant_event ON public.tenant_analytics_events(tenant_id, event_name);
CREATE INDEX IF NOT EXISTS idx_tenant_analytics_created_at ON public.tenant_analytics_events(created_at);
