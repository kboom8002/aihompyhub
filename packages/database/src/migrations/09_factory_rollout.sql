-- Migration: 09_factory_rollout
-- Purpose: Schema for Multi-Tenant Factory Control, Rollouts, and Systemic RCAs (Phase 5)

-- 1. Rollout Campaigns
CREATE TABLE rollout_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_name TEXT NOT NULL,
  target_object_type TEXT NOT NULL, -- e.g., 'TemplateProfile', 'PromptVersion'
  target_object_id UUID NOT NULL,
  rollout_strategy TEXT NOT NULL CHECK (rollout_strategy IN ('canary', 'phased', 'all_at_once', 'backfill')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'rolling_out', 'frozen', 'completed', 'rolling_back', 'rolled_back')),
  actor_id UUID NOT NULL, -- The Factory Admin who triggered it
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rollout_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES rollout_campaigns(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  phase_number INT DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('pending', 'applied', 'failed', 'rolled_back')),
  applied_at TIMESTAMPTZ,
  error_log TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Systemic RCA Candidates
-- Identifies widespread issues affecting multiple tenants simultaneously
CREATE TABLE systemic_rca_candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('monitoring', 'escalated_to_incident', 'resolved', 'false_positive')),
  suspected_rollout_campaign_id UUID REFERENCES rollout_campaigns(id), -- If a rollout is suspected to be the root cause
  affected_tenant_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE systemic_rca_evidence_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  systemic_id UUID NOT NULL REFERENCES systemic_rca_candidates(id),
  local_rca_id UUID NOT NULL REFERENCES rcas(id), -- Links back to observatory_ops local RCAs
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tenant Health Summary (Materialized / Snapshot view equivalent)
CREATE TABLE tenant_health_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  trust_score INT NOT NULL DEFAULT 100, -- Aggregate ops score
  active_incidents INT NOT NULL DEFAULT 0,
  failed_rollouts INT NOT NULL DEFAULT 0,
  unresolved_alerts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_tenant_health_daily ON tenant_health_snapshots(tenant_id, snapshot_date);
