-- Migration: 19_audit_triage
-- Purpose: Schema for Enterprise Hardening (Global Audit Logs, DLQs, Backup/Restore)

-- 1. Global Audit Logs
-- Tracks ALL sensitive actions (Plan changes, overrides, deployments) across the OS.
CREATE TABLE global_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID, -- NULL means SYSTEM action
  actor_id UUID NOT NULL, -- The user/role performing the action
  action_type TEXT NOT NULL, -- e.g., 'plan_upgrade', 'template_deleted', 'manual_rollback', 'policy_blocked'
  resource_type TEXT NOT NULL, -- e.g., 'tenant_subscription', 'autonomy_lane'
  resource_id TEXT, -- The target of the action
  payload JSONB, -- Difference snapshot or metadata context
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. System Backups (Migrations/Restore Run Paths)
-- Operates as a ledger tracking automated and manual snapshot backups.
CREATE TABLE system_backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backup_name TEXT NOT NULL,
  tenant_id UUID, -- If null, full factory backup
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'restored')),
  size_bytes BIGINT,
  storage_ref TEXT, -- e.g. s3://factory-backups/xyz.tar.gz
  triggered_by UUID NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Dead Letter Queues (DLQ)
-- Captures system actions/webhooks that persistently failed and need Support Triage.
CREATE TABLE dead_letter_queues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_queue TEXT NOT NULL, -- e.g., 'revalidation_queue', 'autopilot_backfill'
  tenant_id UUID,
  payload JSONB NOT NULL,
  error_message TEXT NOT NULL,
  retry_count INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'retried_success', 'discarded')),
  failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
