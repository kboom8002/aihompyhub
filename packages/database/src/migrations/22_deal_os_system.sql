-- Migration 22: Deal OS & Polymorphic Protocols
-- Description: Creates the foundation for the Industry-optimized Deal OS where Commerce meets Information Transparency.

CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    industry_type VARCHAR(50) NOT NULL, -- e.g. skincare, clinic, real_estate, consulting
    title VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'KRW',
    
    -- The core Deal OS Transparency Schema
    what_is_included TEXT[] DEFAULT '{}',
    what_is_not_included TEXT[] DEFAULT '{}',
    
    -- Polymorphic Industry Variables (e.g. downtime, side effects, ROI stats, area sqft)
    protocol_data JSONB DEFAULT '{}'::jsonb,
    
    -- SSoT Linking (QIS)
    qis_cluster_id UUID REFERENCES public.question_clusters(id) ON DELETE SET NULL,
    
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_deals_tenant_id ON public.deals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deals_industry_type ON public.deals(industry_type);
CREATE INDEX IF NOT EXISTS idx_deals_qis_cluster_id ON public.deals(qis_cluster_id);

-- Optional: RLS (Row Level Security) if not done at edge.
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deals are viewable by everyone if active" 
ON public.deals FOR SELECT 
USING (status = 'active');

CREATE POLICY "Tenants can view and manage their own deals"
ON public.deals FOR ALL 
USING (tenant_id = auth.uid()); -- Depends on your auth setup, skip if using ServiceRole internally.
