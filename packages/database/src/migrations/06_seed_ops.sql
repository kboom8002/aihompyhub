-- Migration: 06_seed_ops
-- Purpose: Ops Degraded/Incident scenarios for testing Sprint 3 pipelines

-- 1. Mock System Signals (Telemetry Noise)
INSERT INTO system_signals (id, tenant_id, signal_type, source_target_id, severity, payload)
VALUES 
(
  uuid_generate_v4(),
  '00000000-0000-0000-0000-000000000001',
  'trust_gap_detected',
  '12345678-1234-1234-1234-123456789012', 
  'high',
  '{"reason": "Medical claim boundary block missing for region EU"}'
),
(
  uuid_generate_v4(),
  '00000000-0000-0000-0000-000000000001',
  'zero_result_spike_on_priority_query',
  NULL, 
  'medium',
  '{"query": "vegan retinol substitute", "count": 1205, "timeframe_minutes": 10}'
);

-- 2. Mock Alert for the Signal
INSERT INTO alerts (id, tenant_id, rule_id, status, context_ref_id)
VALUES 
(
  '99999999-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'boundary_missing_on_high_risk_object',
  'open',
  '12345678-1234-1234-1234-123456789012' -- ProductFit
),
(
  '99999999-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'projection_stale',
  'acknowledged',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- 3. Mock RCA linked to Alert
INSERT INTO rca_records (id, tenant_id, alert_id, domain, description, status)
VALUES (
  '88888888-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '99999999-0000-0000-0000-000000000001',
  'trust',
  'Retinol EU exception block rule was bypassed during Projection Sync.',
  'draft'
) ON CONFLICT (id) DO NOTHING;

-- 4. Mock Fix-It Task
INSERT INTO fix_it_tasks (id, tenant_id, rca_id, task_type, status)
VALUES (
  uuid_generate_v4(),
  '00000000-0000-0000-0000-000000000001',
  '88888888-0000-0000-0000-000000000001',
  'geo_patch',
  'pending'
);

-- 5. Mock Incident (Escalation)
INSERT INTO incidents (id, tenant_id, alert_id, severity, status, mitigation_state)
VALUES (
  '77777777-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '99999999-0000-0000-0000-000000000001',
  'sev2',
  'active',
  '{"current_step": "Awaiting C-Level approval", "blocks_applied": ["EU_GEO_KILLSWITCH"]}'
) ON CONFLICT (id) DO NOTHING;

-- 6. Runtime Lanes and DLQ Events
INSERT INTO runtime_lanes (id, status, current_backlog, last_heartbeat)
VALUES 
  ('generator_worker_1', 'healthy', 0, NOW()),
  ('search_index_worker', 'degraded', 420, NOW() - INTERVAL '5 minutes');

INSERT INTO dlq_events (id, lane_id, payload, error_reason, status)
VALUES (
  uuid_generate_v4(),
  'search_index_worker',
  '{"query": "vegan retinol substitute"}',
  'Zero-Result Map Timeout Exception',
  'pending'
);
