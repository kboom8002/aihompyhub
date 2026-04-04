-- Migration: 11_guided_automation
-- Purpose: Schema for Machine Suggestions, Action Bundles, and Policy Guards (Phase 6)

-- 1. Policy Guards
-- Defines hard boundaries on what the system can suggest or auto-approve
CREATE TABLE automation_policy_guards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_name TEXT NOT NULL,
  target_impact_level TEXT NOT NULL CHECK (target_impact_level IN ('global', 'tenant', 'user')),
  enforcement_action TEXT NOT NULL CHECK (enforcement_action IN ('block', 'warn', 'require_approval')),
  auto_execute_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Operator Action Bundles
-- An immutable package of actual execution commands (e.g., API calls to make if approved)
CREATE TABLE operator_action_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  actions_payload JSONB NOT NULL, -- Array of target endpoints and payloads to execute
  required_role TEXT NOT NULL DEFAULT 'factory_admin',
  status TEXT NOT NULL CHECK (status IN ('pending_approval', 'executed', 'cancelled', 'execution_failed')),
  executed_at TIMESTAMPTZ,
  executed_by UUID, -- The human who approved it
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Automation Suggestions
-- The read-only recommendation from the system, pointing to an actionable bundle
CREATE TABLE automation_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_context_id UUID, -- RCA ID or Rollout ID that triggered this suggestion
  target_context_type TEXT NOT NULL CHECK (target_context_type IN ('SystemicRCA', 'RolloutCampaign', 'TenantAlert')),
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('fixit_suggestion', 'mitigation_suggestion', 'rollout_guard_suggestion', 'revalidation_suggestion')),
  title TEXT NOT NULL,
  reasoning_log TEXT NOT NULL, -- "Why" we are suggesting this
  confidence_score INT NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'dismissed', 'blocked_by_policy')),
  action_bundle_id UUID REFERENCES operator_action_bundles(id), -- Null if just a warning
  policy_guard_id UUID REFERENCES automation_policy_guards(id), -- If blocked or warned by a specific policy
  decided_at TIMESTAMPTZ,
  decided_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying open suggestions quickly
CREATE INDEX idx_pending_suggestions ON automation_suggestions(status) WHERE status = 'pending';
