-- Migration: 05_ops_observability
-- Purpose: Sprint 3 Ops Governance, Observability, and Alerting Spine

-- 1. System Signals (Raw Metrics/Events)
CREATE TABLE system_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  signal_type TEXT NOT NULL,
  source_target_id UUID,
  severity TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Alerts (Triaged anomalies)
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  rule_id TEXT NOT NULL, -- e.g., 'live_trust_incomplete'
  status TEXT NOT NULL CHECK (status IN ('open', 'acknowledged', 'resolved', 'muted')),
  context_ref_id UUID, -- Affected Target Object
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. RCA Records (Root Cause Analysis)
CREATE TABLE rca_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  alert_id UUID REFERENCES alerts(id),
  domain TEXT NOT NULL, -- e.g., 'trust', 'projection'
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'confirmed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Fix-It Tasks (Mitigation Actions)
CREATE TABLE fix_it_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  rca_id UUID REFERENCES rca_records(id),
  task_type TEXT NOT NULL, -- e.g., 'content_patch', 'geo_patch'
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'verified', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Incidents
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  alert_id UUID REFERENCES alerts(id),
  severity TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'mitigated', 'resolved')),
  mitigation_state JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Runtime Lanes (Execution Health)
CREATE TABLE runtime_lanes (
  id TEXT PRIMARY KEY, -- e.g., 'generator_worker_1', 'publish_worker_sync'
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'paused', 'down')),
  current_backlog INTEGER NOT NULL DEFAULT 0,
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. DLQ Events (Dead Letter Queue)
CREATE TABLE dlq_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lane_id TEXT NOT NULL REFERENCES runtime_lanes(id),
  payload JSONB NOT NULL,
  error_reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'requeued', 'dropped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
