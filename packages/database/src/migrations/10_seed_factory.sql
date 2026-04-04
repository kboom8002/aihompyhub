-- Migration: 10_seed_factory
-- Purpose: Pre-populate Factory Rollouts and Systemic RCAs to demonstrate Regression & Rollback (Phase 5)

-- 1. Ongoing Rollout: Q3 Template Update (Phased -> Frozen due to regression)
INSERT INTO rollout_campaigns (id, campaign_name, target_object_type, target_object_id, rollout_strategy, status, actor_id, started_at)
VALUES
  ('roll-00000000-0000-0000-0000-000000000111', 'Q3 Standard Template Update (v2.1)', 'TemplateProfile', 'tp-00000000-0000-0000-0000-000000000001', 'phased', 'frozen', '00000000-0000-0000-0000-000000000000', NOW() - INTERVAL '4 hours');

-- 2. Ongoing Rollout: Routine Prompt v2.0 (Stalled / Needs Backfill)
INSERT INTO rollout_campaigns (id, campaign_name, target_object_type, target_object_id, rollout_strategy, status, actor_id, started_at)
VALUES
  ('roll-00000000-0000-0000-0000-000000000222', 'Routine Flow Extractor (Prompt v2.0)', 'PromptVersion', 'pv-00000000-0000-0000-0000-000000000002', 'canary', 'rolling_out', '00000000-0000-0000-0000-000000000000', NOW() - INTERVAL '1 day');

-- 3. Systemic RCA Candidate: Triggered by Q3 Template Update (Timeout & Degradation)
INSERT INTO systemic_rca_candidates (id, title, description, severity, status, suspected_rollout_campaign_id, affected_tenant_count)
VALUES
  ('srca-00000000-0000-0000-0000-000000000111', 'Generator Timeout Spike on Brand Foundation Extract', 'v2.1 Template combined with Gemini-pro causes context length overrun, leading to a massive 12.5% timeout rate across EU tenants.', 'high', 'escalated_to_incident', 'roll-00000000-0000-0000-0000-000000000111', 12);

-- 4. Systemic RCA Candidate: Repeated RCA Prompt Drift (No exact rollout identified, Endemic)
INSERT INTO systemic_rca_candidates (id, title, description, severity, status, suspected_rollout_campaign_id, affected_tenant_count)
VALUES
  ('srca-00000000-0000-0000-0000-000000000222', 'Repeated Null Handling RCA: "Ingredient A vs B" Compare Cards', 'Multiple tenants reporting that Compare Cards drop the secondary ingredient entirely if it lacks clinical evidence.', 'medium', 'monitoring', NULL, 5);

-- 5. Tenant Health Snapshots (Good / Bad / Mixed)
-- Mixed (Degrading)
INSERT INTO tenant_health_snapshots (id, tenant_id, snapshot_date, trust_score, active_incidents, failed_rollouts, unresolved_alerts)
VALUES
  ('hlth-00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', CURRENT_DATE, 82, 1, 1, 4);

-- Good (Stable)
INSERT INTO tenant_health_snapshots (id, tenant_id, snapshot_date, trust_score, active_incidents, failed_rollouts, unresolved_alerts)
VALUES
  ('hlth-00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', CURRENT_DATE, 99, 0, 0, 0);

-- Bad (Critical)
INSERT INTO tenant_health_snapshots (id, tenant_id, snapshot_date, trust_score, active_incidents, failed_rollouts, unresolved_alerts)
VALUES
  ('hlth-00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', CURRENT_DATE, 65, 3, 2, 15);
