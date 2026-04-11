-- Migration: 21_qis_intake_system
-- Purpose: Setup the Raw Intake Inbox mapped to industry/tenant

CREATE TABLE raw_intake_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id), -- Nullable if global
  industry_type TEXT,
  text TEXT NOT NULL,
  source TEXT DEFAULT 'storefront_search',
  count INT DEFAULT 1,
  status TEXT DEFAULT 'UNSORTED' CHECK (status IN ('UNSORTED', 'CLUSTERED', 'ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for fast inbox querying by tenant/industry
CREATE INDEX idx_raw_intake_tenant_status ON raw_intake_questions(tenant_id, status);
CREATE INDEX idx_raw_intake_industry_status ON raw_intake_questions(industry_type, status);
