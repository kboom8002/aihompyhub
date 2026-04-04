-- Migration: 15_autopilot_journal
-- Purpose: Schema for Policy-driven Autopilot lanes and Execution Journals

-- 1. Autopilot Lanes 
-- Defines the safe, pre-approved operating tracks for recurring low-risk automation.
CREATE TABLE autopilot_lanes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lane_name TEXT NOT NULL,
  description TEXT NOT NULL,
  lane_type TEXT NOT NULL CHECK (lane_type IN ('auto_backfill', 'auto_reindex', 'auto_revalidation', 'cache_warmup')),
  cron_schedule TEXT, -- Optional, if schedule-driven
  trigger_condition TEXT, -- Optional, if event-driven logic boundary
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled', 'suspended_by_system')),
  recommendation_payload JSONB, -- Stores SuspendRecommendation DTO if continuous verification fails
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Execution Journals
-- Immutable audit log for any action taken autonomously by the system on an autopilot lane
CREATE TABLE execution_journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  autopilot_lane_id UUID NOT NULL REFERENCES autopilot_lanes(id),
  execution_run_id TEXT NOT NULL, -- Logical ID grouping potentially batched actions
  action_summary TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'blocked_by_policy')),
  details_payload JSONB, -- Context data such as records updated, duration, etc.
  policy_blocked_reason TEXT, -- Populated only if blocked by policy
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Override Event Logs
-- Logs explicit human interventions altering autopilot states.
CREATE TABLE human_override_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  autopilot_lane_id UUID NOT NULL REFERENCES autopilot_lanes(id),
  actor_id UUID NOT NULL,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  override_reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
