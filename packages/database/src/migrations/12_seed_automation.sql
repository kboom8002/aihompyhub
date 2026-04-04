-- Migration: 12_seed_automation
-- Purpose: Rigorous Seed Expansion for Guided Automation & Policy Guard Scenarios (Phase 6)

-- 1. Insert Policy Guards
INSERT INTO automation_policy_guards (id, policy_name, target_impact_level, enforcement_action, auto_execute_allowed)
VALUES
  ('1a1a1a1a-0000-0000-0000-000000000001', 'Global Template/Rollout Safety Guard', 'global', 'require_approval', false),
  ('1a1a1a1a-0000-0000-0000-000000000002', 'L0 SLA Incident Auto-Mitigation Prohibition', 'tenant', 'block', false),
  ('1a1a1a1a-0000-0000-0000-000000000003', 'Edge Cache Volatility Rule', 'global', 'warn', true);

-- 2. Insert Action Bundles
INSERT INTO operator_action_bundles (id, description, required_role, status, actions_payload)
VALUES
  ('2a2a2a2a-0000-0000-0000-000000000001', 'Emergency Freeze: Q3 Standard Template Update (v2.1)', 'factory_admin', 'pending_approval', 
    '[{"endpoint": "/commands/factory/rollouts/freeze", "payload": {"rolloutId": "66666666-0000-0000-0000-000000000111", "reason": "Copilot Systemic Freeze Recommendation"}}]'),
  ('2a2a2a2a-0000-0000-0000-000000000002', 'Hotfix Prompt Tweak: Force Temperature = 0.1 on Compare Extractor', 'factory_admin', 'pending_approval', 
    '[{"endpoint": "/commands/prompts/mitigate", "payload": {"template": "Compare Extractor", "temperature": 0.1}}]'),
  ('2a2a2a2a-0000-0000-0000-000000000003', 'Hard Restart Ingress Gateway (EU-West)', 'factory_admin', 'pending_approval', 
    '[{"endpoint": "/commands/infra/restart", "payload": {"target": "ingress-eu-west"}}]'),
  ('2a2a2a2a-0000-0000-0000-000000000004', 'Global CDN Edge Purge for Stylesheets', 'factory_admin', 'executed', 
    '[{"endpoint": "/commands/infra/cache/revalidate", "payload": {"tag": "stylesheets"}}]'),
  ('2a2a2a2a-0000-0000-0000-000000000005', 'Apply Semantic Repair Regex to Content Blocks', 'factory_admin', 'pending_approval', 
    '[{"endpoint": "/commands/generator/fix-it", "payload": {"regex": "/[nul]/g"}}]'),
  ('2a2a2a2a-0000-0000-0000-000000000006', 'Temporary Scale Up of GPU Nodes', 'factory_admin', 'cancelled', 
    '[{"endpoint": "/commands/infra/scale", "payload": {"gpu_count": 8}}]');

-- 3. Insert Suggestions

-- A: Rollout Freeze Recommendation (Pending / Approval Required)
INSERT INTO automation_suggestions (id, target_context_type, target_context_id, suggestion_type, title, reasoning_log, confidence_score, status, action_bundle_id, policy_guard_id)
VALUES
  ('3a3a3a3a-0000-0000-0000-000000000001', 'SystemicRCA', '4a4a4a4a-0000-0000-0000-000000000111', 'rollout_guard_suggestion', 
   'Emergency Freeze on Q3 Rollout', 
   'Critical Timeout mass detected. System highly recommends immediately freezing the propagation of Q3 Template. Execution bound strictly inside manual workflow.',
   98, 'pending', '2a2a2a2a-0000-0000-0000-000000000001', '1a1a1a1a-0000-0000-0000-000000000001');

-- B: Blocked By Policy Case (Fix-it / Blocked)
INSERT INTO automation_suggestions (id, target_context_type, target_context_id, suggestion_type, title, reasoning_log, confidence_score, status, action_bundle_id, policy_guard_id)
VALUES
  ('3a3a3a3a-0000-0000-0000-000000000002', 'SystemicRCA', '4a4a4a4a-0000-0000-0000-000000000222', 'fixit_suggestion',
   'Mitigate Routine Prompts (Temperature Drop)',
   'Repeated NLP hallucinations detected on 5 tenants. Action bundle calculates optimal temp at 0.1 but encounters an L0 SLA Guard blocking autonomous mutation.',
   85, 'blocked_by_policy', '2a2a2a2a-0000-0000-0000-000000000002', '1a1a1a1a-0000-0000-0000-000000000002');

-- C: Mitigation Suggestion (Approval Required)
INSERT INTO automation_suggestions (id, target_context_type, target_context_id, suggestion_type, title, reasoning_log, confidence_score, status, action_bundle_id, policy_guard_id)
VALUES
  ('3a3a3a3a-0000-0000-0000-000000000003', 'SystemicRCA', '4a4a4a4a-0000-0000-0000-000000000333', 'mitigation_suggestion',
   'Restart Ingress Gateway to Clear DNS Hang',
   'Connectivity drop observed across EU segment. Copilot recommends hard restarting the ingress. Requires explicit Ops consent.',
   75, 'pending', '2a2a2a2a-0000-0000-0000-000000000003', '1a1a1a1a-0000-0000-0000-000000000001');

-- D: Fix-it Suggestion Accepted Case (Audit Provenance)
INSERT INTO automation_suggestions (id, target_context_type, target_context_id, suggestion_type, title, reasoning_log, confidence_score, status, action_bundle_id, policy_guard_id, decided_by, decided_at)
VALUES
  ('3a3a3a3a-0000-0000-0000-000000000004', 'SystemicRCA', '4a4a4a4a-0000-0000-0000-000000000444', 'fixit_suggestion',
   'Apply Regex Null-Safe Filter',
   'Historical RCA generated an automated safe-script. Operator manually verified and accepted.',
   92, 'accepted', '2a2a2a2a-0000-0000-0000-000000000005', NULL, '00000000-0000-0000-0000-000000000000', NOW() - INTERVAL '1 day');

-- E: Rejected Suggestion Case (Audit Provenance)
INSERT INTO automation_suggestions (id, target_context_type, target_context_id, suggestion_type, title, reasoning_log, confidence_score, status, action_bundle_id, policy_guard_id, decided_by, decided_at)
VALUES
  ('3a3a3a3a-0000-0000-0000-000000000005', 'SystemicRCA', '4a4a4a4a-0000-0000-0000-000000000555', 'mitigation_suggestion',
   'Scale UP GPU Instances to combat Latency',
   'Latency spiking on LLM node. Recommending costly GPU auto-scale. Admin deemed it unnecessary and Rejected.',
   60, 'rejected', '2a2a2a2a-0000-0000-0000-000000000006', NULL, '00000000-0000-0000-0000-000000000000', NOW() - INTERVAL '2 days');

-- F: Dismissed Suggestion Case (Audit Provenance)
INSERT INTO automation_suggestions (id, target_context_type, target_context_id, suggestion_type, title, reasoning_log, confidence_score, status, action_bundle_id, policy_guard_id, decided_by, decided_at)
VALUES
  ('3a3a3a3a-0000-0000-0000-000000000006', 'TenantAlert', '00000000-0000-0000-0000-000000000000', 'revalidation_suggestion',
   'Revalidate Stale Cache',
   'Cache invalidation issue mapped. Suggestion dismissed because tenant manually fixed their deployment.',
   88, 'dismissed', '2a2a2a2a-0000-0000-0000-000000000004', '1a1a1a1a-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', NOW() - INTERVAL '5 hours');
