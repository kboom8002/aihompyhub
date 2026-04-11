-- Migration: Instagram & Creator Workspace DDL
-- Description: Adds tables for managing creators, their requests, and content drafts.

-- 1. Enum Types
CREATE TYPE creator_account_status AS ENUM ('pending', 'connected', 'disconnected', 'error');
CREATE TYPE creator_request_status AS ENUM ('submitted', 'under_review', 'accepted', 'rejected', 'briefing', 'drafting', 'ready_for_creator');
CREATE TYPE content_draft_status AS ENUM ('draft', 'brand_review', 'creator_review', 'changes_requested', 'approved', 'scheduled', 'published', 'archived', 'failed');
CREATE TYPE content_format_type AS ENUM ('feed', 'carousel', 'reel', 'story');

-- 2. creators Table
CREATE TABLE public.creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    creator_name TEXT NOT NULL,
    handle TEXT NOT NULL,
    platform TEXT DEFAULT 'instagram',
    professional_account_status creator_account_status DEFAULT 'pending',
    authorization_status TEXT,
    preferred_format TEXT[],
    disclosure_required BOOLEAN DEFAULT true,
    landing_base_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. creator_requests Table
CREATE TABLE public.creator_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
    goal TEXT,
    topic_interest TEXT,
    service_interest TEXT,
    offer_interest TEXT,
    preferred_format TEXT,
    must_include TEXT,
    must_avoid TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    landing_preference TEXT,
    status creator_request_status DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. content_drafts Table
CREATE TABLE public.content_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.creators(id) ON DELETE SET NULL,
    campaign_id TEXT, -- UTM campaign matching
    goal TEXT,
    format_type content_format_type DEFAULT 'feed',
    topic_refs JSONB DEFAULT '[]'::jsonb, -- Array of topic ids
    service_refs JSONB DEFAULT '[]'::jsonb, -- Array of service ids
    offer_ref TEXT,
    draft_caption TEXT,
    draft_hooks JSONB DEFAULT '[]'::jsonb,
    draft_assets JSONB DEFAULT '[]'::jsonb,
    landing_url TEXT,
    utm_bundle JSONB DEFAULT '{}'::jsonb, -- stores utm_source, utm_medium, utm_campaign, utm_content, utm_id
    status content_draft_status DEFAULT 'draft',
    brand_approver UUID,
    creator_approver TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Indexes for fast lookup
CREATE INDEX idx_creators_tenant ON public.creators(tenant_id);
CREATE INDEX idx_creator_requests_tenant ON public.creator_requests(tenant_id);
CREATE INDEX idx_creator_requests_creator ON public.creator_requests(creator_id);
CREATE INDEX idx_content_drafts_tenant ON public.content_drafts(tenant_id);
CREATE INDEX idx_content_drafts_creator ON public.content_drafts(creator_id);

-- 6. Trigger for updated_at
CREATE TRIGGER update_creators_updated_at
BEFORE UPDATE ON public.creators
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_creator_requests_updated_at
BEFORE UPDATE ON public.creator_requests
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_content_drafts_updated_at
BEFORE UPDATE ON public.content_drafts
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 7. RLS Defaults (tenant isolation)
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY creators_tenant_isolation_policy ON public.creators
    FOR ALL USING (tenant_id = (SELECT id FROM public.tenants WHERE id = tenant_id));

ALTER TABLE public.creator_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY creator_requests_tenant_isolation_policy ON public.creator_requests
    FOR ALL USING (tenant_id = (SELECT id FROM public.tenants WHERE id = tenant_id));

ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY content_drafts_tenant_isolation_policy ON public.content_drafts
    FOR ALL USING (tenant_id = (SELECT id FROM public.tenants WHERE id = tenant_id));
