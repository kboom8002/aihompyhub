-- COMPLETE CLOUD ROLLOUT MIGRATION (SPRINT 0 to 10)

-- Idempotency Guarantee: Wipe existing public schema before initializing
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres, public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;



---------------------------------------------
-- MIGRATION: 01_core_spine.sql
---------------------------------------------

-- Migration: 01_core_spine
-- Purpose: Create foundational schema for Identity, Brand, Question Capital, Content, Trust

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Identity & Tenancy
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Brand Foundation
CREATE TABLE brand_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  brand_id UUID NOT NULL REFERENCES brands(id),
  positioning_summary TEXT,
  brand_voice JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  brand_id UUID NOT NULL REFERENCES brands(id),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Question Capital
CREATE TABLE question_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  cluster_name TEXT NOT NULL,
  intent_type TEXT NOT NULL,
  priority_score INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Canonical Content
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  cluster_id UUID REFERENCES question_clusters(id),
  title TEXT NOT NULL,
  content_status TEXT NOT NULL CHECK (content_status IN ('draft', 'ready_for_review', 'approved', 'published', 'deprecated', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE answer_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  topic_id UUID NOT NULL REFERENCES topics(id),
  content_status TEXT NOT NULL,
  structured_body JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Trust & Review
CREATE TABLE review_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'in_review', 'completed')),
  severity TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE review_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_task_id UUID NOT NULL REFERENCES review_tasks(id),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'changes_requested')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


---------------------------------------------
-- MIGRATION: 02_seed_skincare_mvp.sql
---------------------------------------------

-- Seed Data: 02_seed_skincare_mvp
-- Purpose: Provide MVP starting state for Design Partner Skincare

-- 1. Tenant & Identity
INSERT INTO tenants (id, name) VALUES 
('00000000-0000-0000-0000-000000000001', 'Lumiere Skincare'),
('00000000-0000-0000-0000-000000000002', 'DermaCore Labs'),
('00000000-0000-0000-0000-000000000003', 'Botanica Basics');

INSERT INTO brands (id, tenant_id, name) VALUES 
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Lumiere Official');

-- 2. Brand Foundation
INSERT INTO brand_profiles (id, tenant_id, brand_id, positioning_summary, brand_voice) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 
 'Premium botanical anti-aging solutions targeting sensitive skin demographics.', '{"tone": "Professional yet empathetic", "forbidden_terms": ["magic", "instant cure"]}');

INSERT INTO products (id, tenant_id, brand_id, sku, name, category) VALUES 
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'L-SERUM-01', 'Lumiere Revitalizing Serum', 'Serum');

-- 3. Question Capital
INSERT INTO question_clusters (id, tenant_id, cluster_name, intent_type, priority_score) VALUES 
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Anti-aging routines for sensitive skin', 'routine_discovery', 95);

-- 4. Canonical Content (Draft mapped to cluster)
INSERT INTO topics (id, tenant_id, cluster_id, title, content_status) VALUES 
('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Gentle Anti-aging Routine (Lumiere)', 'ready_for_review');

INSERT INTO answer_cards (id, tenant_id, topic_id, content_status, structured_body) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'ready_for_review', '{"blocks": [{"type":"text", "content": "Our revitalizing serum is clinically designed to minimize irritation."}]}');

-- 5. Trust (Review scenario generated)
INSERT INTO review_tasks (id, tenant_id, target_type, target_id, status, severity) VALUES 
('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'Topic', '44444444-4444-4444-4444-444444444444', 'queued', 'medium');


---------------------------------------------
-- MIGRATION: 03_publish_projection_geo.sql
---------------------------------------------

-- Migration: 03_publish_projection_geo
-- Purpose: Schema for Phase 2 Publish, Projection, Search, GEO, and Template assignments

-- 1. Template Profile & Assignments
CREATE TABLE template_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  family_type TEXT NOT NULL, -- GenericCore, HighTrustVariant, etc.
  overrides JSONB, -- Navigation emphasis, visual skin overrides
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Publish Bundles
CREATE TABLE publish_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  template_profile_id UUID REFERENCES template_profiles(id),
  status TEXT NOT NULL CHECK (status IN ('draft', 'validating', 'published', 'rolled_back', 'failed')),
  target_locale TEXT,
  target_market TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Route Projections
CREATE TABLE route_projections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  bundle_id UUID NOT NULL REFERENCES publish_bundles(id),
  route_path TEXT NOT NULL,
  target_object_type TEXT NOT NULL,
  target_object_id UUID NOT NULL,
  version_ref UUID, -- Source truth snapshot version
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Search & GEO 
CREATE TABLE search_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  target_object_type TEXT NOT NULL,
  target_object_id UUID NOT NULL,
  version_ref UUID, -- Source truth snapshot version
  sync_status TEXT NOT NULL CHECK (sync_status IN ('pending', 'synced', 'failed', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE geo_exclusions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  target_object_type TEXT NOT NULL,
  target_object_id UUID NOT NULL,
  version_ref UUID, -- Source truth snapshot version
  excluded_regions JSONB NOT NULL, -- e.g., ["EU", "CN"]
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


---------------------------------------------
-- MIGRATION: 04_seed_phase2.sql
---------------------------------------------

-- Migration: 04_seed_phase2
-- Purpose: Mock data required for visual validation of Phase 2 logic

-- 1. Create a dummy Template Profile for Lumiere Skincare
INSERT INTO template_profiles (id, tenant_id, family_type, overrides)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'HighTrustVariant',
  '{"navEmphasis":"routine", "skinTheme":"lumiere_minimal"}'
) ON CONFLICT (id) DO NOTHING;

-- 2. Mock Publish Bundles
INSERT INTO publish_bundles (id, tenant_id, template_profile_id, status, target_locale, target_market)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'published',
  'en-US',
  'Global'
) ON CONFLICT (id) DO NOTHING;

-- 3. Mock GEO Block (EU Excluded for a mock medical claim)
INSERT INTO geo_exclusions (id, tenant_id, target_object_type, target_object_id, version_ref, excluded_regions, status)
VALUES (
  uuid_generate_v4(),
  '00000000-0000-0000-0000-000000000001',
  'ProductFit',
  '12345678-1234-1234-1234-123456789012', 
  uuid_generate_v4(),
  '["EU", "CN"]',
  'active'
);


---------------------------------------------
-- MIGRATION: 05_ops_observability.sql
---------------------------------------------

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


---------------------------------------------
-- MIGRATION: 06_seed_ops.sql
---------------------------------------------

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


---------------------------------------------
-- MIGRATION: 07_template_generator.sql
---------------------------------------------

-- Migration: 07_template_generator
-- Purpose: Schema for Prompt Registry and Generator Lifecycles (Phase 4)

-- 1. Prompt Registry & Versions
CREATE TABLE prompt_registry_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  domain TEXT NOT NULL, -- e.g., 'brand_foundation', 'trust_boundary', 'routine_builder'
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registry_id UUID NOT NULL REFERENCES prompt_registry_entries(id),
  version_tag TEXT NOT NULL,
  raw_prompt_template TEXT NOT NULL,
  config_json JSONB, -- Temperature, Model info, etc.
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'deprecated', 'experimental')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Template System
CREATE TABLE template_families (
  id TEXT PRIMARY KEY, -- e.g., 'GenericCore', 'HighTrustVariant'
  name TEXT NOT NULL,
  base_layout_structure JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE template_profiles 
  RENAME COLUMN family_type TO family_id;

ALTER TABLE template_profiles
  ADD COLUMN name TEXT DEFAULT 'Default Profile';

CREATE TABLE template_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id TEXT NOT NULL REFERENCES template_families(id),
  module_type TEXT NOT NULL, -- 'hero', 'claims_grid', 'trust_block'
  render_schema JSONB NOT NULL
);

CREATE TABLE template_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  brand_id UUID REFERENCES brands(id),
  channel_id TEXT, -- nullable for global
  active_profile_id UUID NOT NULL REFERENCES template_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Generator Automation Lifecycle
CREATE TABLE generator_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  actor_id UUID,
  prompt_version_id UUID REFERENCES prompt_versions(id),
  template_profile_id UUID REFERENCES template_profiles(id),
  run_type TEXT NOT NULL, -- 'brand_foundation', 'content_draft', 'trust_placeholder'
  input_pack_hash TEXT NOT NULL, -- Provenance tracking
  raw_input_state JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed', 'blocked_missing_inputs')),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE generation_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES generator_runs(id),
  target_object_type TEXT NOT NULL, -- 'AnswerCard', 'Topic', 'ProductFit'
  proposed_content JSONB NOT NULL,
  trust_placeholders JSONB, -- Array of required proofs/boundaries
  acceptance_status TEXT NOT NULL CHECK (acceptance_status IN ('pending', 'accepted', 'rejected', 'partially_accepted')),
  accepted_as_canonical_id UUID, -- Links to canonical_content tables
  reviewer_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


---------------------------------------------
-- MIGRATION: 08_seed_generator.sql
---------------------------------------------

-- Migration: 08_seed_generator
-- Purpose: Pre-populate Generator Automations with mock data

-- 1. Seed Prompt Registry & Versions
INSERT INTO prompt_registry_entries (id, tenant_id, domain, name, description)
VALUES 
  ('11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'brand_foundation', 'Brand Positioning Extractor', 'Extracts tone and positioning from raw brief text.');

INSERT INTO prompt_versions (id, registry_id, version_tag, raw_prompt_template, config_json, status)
VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'v1.0.0', 'Extract brand positioning from: {{rawBrief}}', '{"model": "gemini-pro", "temperature": 0.2}', 'active');

INSERT INTO prompt_registry_entries (id, tenant_id, domain, name, description)
VALUES 
  ('11111111-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'routine_builder', 'Routine Flow Extractor', 'Builds step-by-step skincare routine drafts.');

INSERT INTO prompt_versions (id, registry_id, version_tag, raw_prompt_template, config_json, status)
VALUES
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'v1.0.0', 'Generate a basic routine flow for: {{skinType}}', '{"model": "gemini-pro", "temperature": 0.5}', 'active');

-- 2. Seed Templates
INSERT INTO template_families (id, name, base_layout_structure)
VALUES 
  ('LumiereCore', 'Lumiere Skincare Core Layout', '{"header": "minimal", "body": "story_driven"}');

INSERT INTO template_profiles (id, tenant_id, family_id, name, overrides)
VALUES
  ('99999999-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'LumiereCore', 'EU Vegan Retinol Theme', '{"fonts": ["Inter", "EB Garamond"], "colors": {"primary": "#1A2F22"}}');

-- 3. Seed Generator Runs
-- Run 1: Completed Foundation Run
INSERT INTO generator_runs (id, tenant_id, actor_id, prompt_version_id, template_profile_id, run_type, input_pack_hash, raw_input_state, status, started_at, finished_at)
VALUES
  ('77777777-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000001', 'brand_foundation', 'hash-12345', '{"brief": "EU-compliant vegan retinol alternative"}', 'completed', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '59 minutes');

-- Run 2: Blocked/Failed Run due to missing inputs
INSERT INTO generator_runs (id, tenant_id, actor_id, prompt_version_id, template_profile_id, run_type, input_pack_hash, raw_input_state, status, started_at, finished_at)
VALUES
  ('77777777-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000001', 'content_draft', 'hash-00000', '{}', 'blocked_missing_inputs', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '9 minutes');

-- 4. Seed Outputs
INSERT INTO generation_outputs (id, run_id, target_object_type, proposed_content, trust_placeholders, acceptance_status)
VALUES
  ('6a6a6a6a-0000-0000-0000-000000000001', '77777777-0000-0000-0000-000000000001', 'BrandFoundation', '{"positioningSummary": "Premium botanical anti-aging targeting sensitive demographics.", "brandVoice": "Empathetic Clinical"}', '[{"type": "clinical_trial_link", "required": true, "hint": "Need link to dermatological test."}]', 'pending');

-- Run 3: Completed Content Draft (AnswerCard)
INSERT INTO generator_runs (id, tenant_id, actor_id, prompt_version_id, template_profile_id, run_type, input_pack_hash, raw_input_state, status, started_at, finished_at)
VALUES
  ('77777777-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000001', 'content_draft', 'hash-answer', '{"questionTitle": "Is retinol safe for sensitive skin?"}', 'completed', NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '4 minutes');

INSERT INTO generation_outputs (id, run_id, target_object_type, proposed_content, trust_placeholders, acceptance_status)
VALUES
  ('6a6a6a6a-0000-0000-0000-000000000003', '77777777-0000-0000-0000-000000000003', 'AnswerCard', '{"answerBody": "Yes, but our vegan formulation uses bakuchiol, providing similar anti-aging benefits without the typical irritation.", "supportingClaims": ["Dermatologist tested", "Hypoallergenic", "Plant-based alternative"]}', '[{"type": "dermatologist_review", "required": true, "hint": "Requires a verified dermatologist badge for sensitive skin claims."}]', 'pending');

-- Run 4: Failed Run (LLM Timeout or Parsing Error)
INSERT INTO generator_runs (id, tenant_id, actor_id, prompt_version_id, template_profile_id, run_type, input_pack_hash, raw_input_state, status, started_at, finished_at)
VALUES
  ('77777777-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000002', '99999999-0000-0000-0000-000000000001', 'content_draft', 'hash-routine-fail', '{"skinType": "Oily"}', 'failed', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '19 minutes');

-- Run 5: Completed Run -> ACCEPTED Output (Canonical Trace)
INSERT INTO generator_runs (id, tenant_id, actor_id, prompt_version_id, template_profile_id, run_type, input_pack_hash, raw_input_state, status, started_at, finished_at)
VALUES
  ('77777777-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000002', '99999999-0000-0000-0000-000000000001', 'content_draft', 'hash-routine-accept', '{"skinType": "Dry"}', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

INSERT INTO generation_outputs (id, run_id, target_object_type, proposed_content, trust_placeholders, acceptance_status, accepted_as_canonical_id)
VALUES
  ('6a6a6a6a-0000-0000-0000-000000000005', '77777777-0000-0000-0000-000000000005', 'Routine', '{"steps": ["Cleanse", "Hydrate (Hyaluronic)", "Protect"]}', '[]', 'accepted', 'c1110000-0000-0000-0000-000000000000');

-- Run 6: Completed Run -> Compare Draft
INSERT INTO generator_runs (id, tenant_id, actor_id, prompt_version_id, template_profile_id, run_type, input_pack_hash, raw_input_state, status, started_at, finished_at)
VALUES
  ('77777777-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', '22222222-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000001', 'content_draft', 'hash-compare', '{"productA": "Retinol", "productB": "Bakuchiol"}', 'completed', NOW() - INTERVAL '2 minutes', NOW() - INTERVAL '1 minute');

INSERT INTO generation_outputs (id, run_id, target_object_type, proposed_content, trust_placeholders, acceptance_status)
VALUES
  ('6a6a6a6a-0000-0000-0000-000000000006', '77777777-0000-0000-0000-000000000006', 'CompareCard', '{"comparison": "While Retinol is stronger, Bakuchiol offers 80% similar results with 0% irritation. Ideal for sensitive barriers."}', '[]', 'pending');


---------------------------------------------
-- MIGRATION: 09_factory_rollout.sql
---------------------------------------------

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
  local_rca_id UUID NOT NULL REFERENCES rca_records(id), -- Links back to observatory_ops local RCAs
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


---------------------------------------------
-- MIGRATION: 10_seed_factory.sql
---------------------------------------------

-- Migration: 10_seed_factory
-- Purpose: Pre-populate Factory Rollouts and Systemic RCAs to demonstrate Regression & Rollback (Phase 5)

-- 1. Ongoing Rollout: Q3 Template Update (Phased -> Frozen due to regression)
INSERT INTO rollout_campaigns (id, campaign_name, target_object_type, target_object_id, rollout_strategy, status, actor_id, started_at)
VALUES
  ('66666666-0000-0000-0000-000000000111', 'Q3 Standard Template Update (v2.1)', 'TemplateProfile', '99999999-0000-0000-0000-000000000001', 'phased', 'frozen', '00000000-0000-0000-0000-000000000000', NOW() - INTERVAL '4 hours');

-- 2. Ongoing Rollout: Routine Prompt v2.0 (Stalled / Needs Backfill)
INSERT INTO rollout_campaigns (id, campaign_name, target_object_type, target_object_id, rollout_strategy, status, actor_id, started_at)
VALUES
  ('66666666-0000-0000-0000-000000000222', 'Routine Flow Extractor (Prompt v2.0)', 'PromptVersion', '22222222-0000-0000-0000-000000000002', 'canary', 'rolling_out', '00000000-0000-0000-0000-000000000000', NOW() - INTERVAL '1 day');

-- 3. Systemic RCA Candidate: Triggered by Q3 Template Update (Timeout & Degradation)
INSERT INTO systemic_rca_candidates (id, title, description, severity, status, suspected_rollout_campaign_id, affected_tenant_count)
VALUES
  ('4a4a4a4a-0000-0000-0000-000000000111', 'Generator Timeout Spike on Brand Foundation Extract', 'v2.1 Template combined with Gemini-pro causes context length overrun, leading to a massive 12.5% timeout rate across EU tenants.', 'high', 'escalated_to_incident', '66666666-0000-0000-0000-000000000111', 12);

-- 4. Systemic RCA Candidate: Repeated RCA Prompt Drift (No exact rollout identified, Endemic)
INSERT INTO systemic_rca_candidates (id, title, description, severity, status, suspected_rollout_campaign_id, affected_tenant_count)
VALUES
  ('4a4a4a4a-0000-0000-0000-000000000222', 'Repeated Null Handling RCA: "Ingredient A vs B" Compare Cards', 'Multiple tenants reporting that Compare Cards drop the secondary ingredient entirely if it lacks clinical evidence.', 'medium', 'monitoring', NULL, 5);

-- 5. Tenant Health Snapshots (Good / Bad / Mixed)
-- Mixed (Degrading)
INSERT INTO tenant_health_snapshots (id, tenant_id, snapshot_date, trust_score, active_incidents, failed_rollouts, unresolved_alerts)
VALUES
  ('5a5a5a5a-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', CURRENT_DATE, 82, 1, 1, 4);

-- Good (Stable)
INSERT INTO tenant_health_snapshots (id, tenant_id, snapshot_date, trust_score, active_incidents, failed_rollouts, unresolved_alerts)
VALUES
  ('5a5a5a5a-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', CURRENT_DATE, 99, 0, 0, 0);

-- Bad (Critical)
INSERT INTO tenant_health_snapshots (id, tenant_id, snapshot_date, trust_score, active_incidents, failed_rollouts, unresolved_alerts)
VALUES
  ('5a5a5a5a-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', CURRENT_DATE, 65, 3, 2, 15);


---------------------------------------------
-- MIGRATION: 11_guided_automation.sql
---------------------------------------------

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


---------------------------------------------
-- MIGRATION: 12_seed_automation.sql
---------------------------------------------

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


---------------------------------------------
-- MIGRATION: 13_experiments_benchmarks.sql
---------------------------------------------

-- Migration: 13_experiments_benchmarks
-- Purpose: Schema for Controlled Experiments, Benchmarks, and Postmortem Archives (Phase 7)

-- 1. Controlled Experiments (A/B Test or Canary vs Baseline)
-- Tracks the overarching definition and status of a comparison test
CREATE TABLE controlled_experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_name TEXT NOT NULL,
  target_object_type TEXT NOT NULL CHECK (target_object_type IN ('TemplateProfile', 'PromptVersion', 'GeneratorPipeline')),
  status TEXT NOT NULL CHECK (status IN ('running', 'concluded', 'aborted')),
  baseline_variant_id UUID NOT NULL,
  test_variant_id UUID NOT NULL,
  traffic_split_percentage INT NOT NULL DEFAULT 50, -- Percentage allotted to test variant
  primary_metric TEXT NOT NULL CHECK (primary_metric IN ('success_rate', 'latency_ms', 'trust_score')),
  metrics_payload JSONB, -- Stores the comparison objects for Baseline and Test metrics
  conclusion_reason TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  concluded_at TIMESTAMPTZ
);

-- 2. Benchmark Runs
-- Tracks localized evaluation runs mapping a Prompt or Generative Task to known evaluation rubrics
CREATE TABLE benchmark_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_object_type TEXT NOT NULL CHECK (target_object_type IN ('PromptVersion', 'GeneratorPipeline')),
  target_object_id UUID NOT NULL,
  dataset_ref TEXT NOT NULL, -- Logical reference to benchmark evaluation dataset
  overall_score NUMERIC NOT NULL,
  quality_score NUMERIC NOT NULL,
  safeguard_score NUMERIC NOT NULL,
  latency_ms_p95 INT,
  status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'degraded')),
  run_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Postmortem Records
-- Archive of learned knowledge from SystemicRCAs, completing the incident life-cycle loop
CREATE TABLE postmortem_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  systemic_rca_id UUID NOT NULL, -- Link to the incident
  title TEXT NOT NULL,
  root_cause_analysis TEXT NOT NULL,
  resolution_summary TEXT NOT NULL,
  preventative_measures TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_id UUID NOT NULL
);


---------------------------------------------
-- MIGRATION: 14_seed_experiments.sql
---------------------------------------------

-- Migration: 14_seed_experiments
-- Purpose: Thoroughly Pre-populate Experimentation, Benchmarks, and Postmortem data (Phase 7 Expanded)

-- 1. Insert Controlled Experiments (Template / Prompt / Generator)
INSERT INTO controlled_experiments (id, experiment_name, target_object_type, baseline_variant_id, test_variant_id, traffic_split_percentage, primary_metric, status, metrics_payload, conclusion_reason)
VALUES
  -- Case A: Prompt version regression seed (Running currently, good results)
  ('44444444-0000-0000-0000-000000000001', 'Prompt v2.1 Readability Lift', 'PromptVersion', '22222222-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 30, 'success_rate', 'running', 
    '{"baselineMetrics": {"variantId": "22222222-0000-0000-0000-000000000001", "variantLabel": "Baseline (v2.0)", "trafficAllocation": 70, "successRate": 92.5, "timeoutRate": 0.5, "averageLatencyMs": 1450, "trustScore": 90}, "testMetrics": {"variantId": "22222222-0000-0000-0000-000000000002", "variantLabel": "Test (v2.1)", "trafficAllocation": 30, "successRate": 98.2, "timeoutRate": 0.1, "averageLatencyMs": 1200, "trustScore": 95}}', NULL),
  
  -- Case B: Template rollout compare seed (Concluded, aborted due to bad metrics)
  ('44444444-0000-0000-0000-000000000002', 'Q3 Template Structure A/B Test', 'TemplateProfile', '99999999-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000002', 0, 'trust_score', 'concluded',
    '{"baselineMetrics": {"variantId": "99999999-0000-0000-0000-000000000001", "variantLabel": "Baseline (v2.0)", "trafficAllocation": 100, "successRate": 99.0, "timeoutRate": 0.1, "averageLatencyMs": 800, "trustScore": 95}, "testMetrics": {"variantId": "99999999-0000-0000-0000-000000000002", "variantLabel": "Test (v2.1)", "trafficAllocation": 0, "successRate": 85.0, "timeoutRate": 12.5, "averageLatencyMs": 4500, "trustScore": 84}}', 'Test variant resulted in critical timeout regressions across EU tenants. Aborted early.'),
  
  -- Case C: Generator output regression seed (Running currently, mixed results)
  ('44444444-0000-0000-0000-000000000003', 'LLM Extractor JSON Parser Canary', 'GeneratorPipeline', '7a7a7a7a-0000-0000-0000-000000000001', '7a7a7a7a-0000-0000-0000-000000000002', 15, 'latency_ms', 'running', 
    '{"baselineMetrics": {"variantId": "7a7a7a7a-0000-0000-0000-000000000001", "variantLabel": "RegEx Parser", "trafficAllocation": 85, "successRate": 99.9, "timeoutRate": 0.0, "averageLatencyMs": 50, "trustScore": 92}, "testMetrics": {"variantId": "7a7a7a7a-0000-0000-0000-000000000002", "variantLabel": "JSON-Mode LLM", "trafficAllocation": 15, "successRate": 99.9, "timeoutRate": 4.1, "averageLatencyMs": 1800, "trustScore": 99}}', NULL);


-- 2. Insert Benchmark Runs
INSERT INTO benchmark_runs (id, target_object_type, target_object_id, dataset_ref, overall_score, quality_score, safeguard_score, latency_ms_p95, status)
VALUES
  -- Good Tenant Baseline
  ('55555555-0000-0000-0000-000000000001', 'PromptVersion', '22222222-0000-0000-0000-000000000002', 'golden-set-eu-q1', 94.5, 96.0, 93.0, 1100, 'pass'),
  
  -- Bad/Degraded Pipeline Output
  ('55555555-0000-0000-0000-000000000002', 'GeneratorPipeline', '7a7a7a7a-0000-0000-0000-000000000001', 'stress-test-content-gen', 65.2, 70.0, 60.5, 8400, 'degraded'),
  
  -- Failed Prompt Version Guardrail Check
  ('55555555-0000-0000-0000-000000000003', 'PromptVersion', '22222222-0000-0000-0000-000000000003', 'pii-data-leak-guard-test', 30.1, 80.0, 15.2, 800, 'fail');


-- 3. Insert Postmortem Records (Incident Learning Browse Seed)
INSERT INTO postmortem_records (id, systemic_rca_id, title, root_cause_analysis, resolution_summary, preventative_measures, severity, author_id)
VALUES
  -- Standard Critical Template Failure Learning
  ('ffff1111-0000-0000-0000-000000000001', '4a4a4a4a-0000-0000-0000-000000000111', 'Q3 Template Timeout Incident Analysis', 'Context length explosion due to excessive DOM node nesting in the React generation layer causing Vercel Edge timeout.', 'Rolled back to v2.0 baseline. Engineering pushed hotfix v2.2 to staging.', 'Added heavy DOM-depth guardrails in CI. Prompted caching layers for read-only pages.', 'critical', '00000000-0000-0000-0000-000000000000'),
  
  -- Repeated RCA Prompt Poisoning Learning
  ('ffff1111-0000-0000-0000-000000000002', '4a4a4a4a-0000-0000-0000-000000000222', 'Endemic Halucination on Compare Cards (Repeated)', 'Brand B ingredients were repeatedly substituted with general-purpose equivalents due to LLM zero-shot prompt drift over multiple releases.', 'Hard-forced temperature = 0.1 for Compare extractor prompt. Pushed Prompt v2.1 to bypass standard flow.', 'All comparison operations must bypass standard RAG and pass through verifiable entity ID layers mapping directly to PIM. Added to benchmark `safeguard-set-q2`.', 'high', '00000000-0000-0000-0000-000000000000');


---------------------------------------------
-- MIGRATION: 15_autopilot_journal.sql
---------------------------------------------

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


---------------------------------------------
-- MIGRATION: 16_seed_autonomy.sql
---------------------------------------------

-- Migration: 16_seed_autonomy
-- Purpose: Pre-populate Autopilot Lanes, Execution Journals, and Human Override Logs (Phase 8)

-- 1. Insert Autopilot Lanes
INSERT INTO autopilot_lanes (id, lane_name, description, lane_type, cron_schedule, status, recommendation_payload)
VALUES
  ('cccc1111-0000-0000-0000-000000000001', 'Hourly Graph Re-index', 'Rebuilds search index nodes across edge regions periodically.', 'auto_reindex', '0 * * * *', 'active', NULL),
  ('cccc1111-0000-0000-0000-000000000002', 'Stale Cache Revalidation', 'Forces Next.js ISR cache purge when product schema changes.', 'auto_revalidation', NULL, 'paused', NULL),
  ('cccc1111-0000-0000-0000-000000000003', 'Missing Image Backfill', 'Uses fallback generative prompts to backfill missing hero images.', 'auto_backfill', '0 0 * * *', 'suspended_by_system', '{"recommendationId": "rec-001", "type": "rollback_recommendation", "reason": "Continuous Verification limits breached. High volume of generated images rejected by guardrails.", "suggestedAction": "Inspect Generative Pipeline [7a7a7a7a-1] and manually review last 14 backfill outputs before re-enabling."}'),
  ('cccc1111-0000-0000-0000-000000000004', 'Edge Cache Warmup', 'Pre-computes Heavy Vercel Edge caches for top tier VIP campaigns.', 'cache_warmup', '0 2 * * *', 'disabled', NULL);

-- 2. Insert Execution Journals
INSERT INTO execution_journals (id, autopilot_lane_id, execution_run_id, action_summary, status, details_payload, policy_blocked_reason, executed_at)
VALUES
  ('dddd1111-0000-0000-0000-000000000001', 'cccc1111-0000-0000-0000-000000000001', '77777777-0000-0000-0000-123000000000', 'Re-indexed 1450 graph nodes in 3 regions.', 'success', '{"durationMs": 4200, "nodes_updated": 1450}', NULL, NOW() - INTERVAL '1 hour'),
  ('dddd1111-0000-0000-0000-000000000002', 'cccc1111-0000-0000-0000-000000000003', '77777777-0000-0000-0000-456000000000', 'Triggered backfill for 14 missing SKUs.', 'blocked_by_policy', '{"skus_requested": 14}', 'Cost budget for Generation API exceeded daily limit. Auto-action blocked.', NOW() - INTERVAL '4 hours'),
  ('dddd1111-0000-0000-0000-000000000003', 'cccc1111-0000-0000-0000-000000000002', '77777777-0000-0000-0000-789000000000', 'Attempted to purge entire EMEA region CDN.', 'blocked_by_policy', '{"region": "EMEA"}', 'Action escalated: Broad region purges require manual human approval per Tenant SLA.', NOW() - INTERVAL '13 hours');

-- 3. Insert Human Override Logs
INSERT INTO human_override_logs (id, autopilot_lane_id, actor_id, previous_status, new_status, override_reason, created_at)
VALUES
  ('eeee1111-0000-0000-0000-000000000001', 'cccc1111-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'active', 'paused', 'High traffic hitting EU region. Pausing ISR flush to protect origin servers.', NOW() - INTERVAL '12 hours'),
  ('eeee1111-0000-0000-0000-000000000002', 'cccc1111-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'active', 'disabled', 'Decommissioned the Heavy Vercel Edge caching feature outright per Sprint 6 rollback.', NOW() - INTERVAL '48 hours');


---------------------------------------------
-- MIGRATION: 17_commercial_packaging.sql
---------------------------------------------

-- Migration: 17_commercial_packaging
-- Purpose: Schema for GTM Plans, Tenant Subscriptions, and Catalog Provisioning

-- 1. Commercial Plans
-- Defines the tier definitions (Basic, Pro, Enterprise)
CREATE TABLE commercial_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_code TEXT NOT NULL UNIQUE, -- e.g. 'basic', 'pro', 'enterprise'
  display_name TEXT NOT NULL,
  monthly_price_usd DECIMAL(10, 2) NOT NULL,
  features_allowed JSONB NOT NULL, -- e.g. ["core_generation", "ab_testing", "autonomy"]
  limits_definition JSONB NOT NULL, -- e.g. {"max_generations_per_month": 1000}
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'legacy', 'deprecated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tenant Subscriptions
-- Maps a specific brand tenant to their current operating plan
CREATE TABLE tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL, -- References external tenant/brand ID
  tenant_name TEXT NOT NULL, -- Hydrated string for local queries
  plan_id UUID NOT NULL REFERENCES commercial_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tenant_subscription UNIQUE(tenant_id)
);

-- 3. Pack Catalogs
-- Blueprints and initial seeds that tenants can browse during Onboarding
CREATE TABLE pack_catalogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pack_name TEXT NOT NULL,
  description TEXT NOT NULL,
  pack_type TEXT NOT NULL CHECK (pack_type IN ('website_template', 'prompt_bundle', 'ops_dashboard')),
  minimum_plan_code TEXT NOT NULL, -- e.g. 'pro', restricts who can install this pack
  payload_manifest JSONB NOT NULL, -- Contains instructions on what specific PromptVersions/Templates to instantiate
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


---------------------------------------------
-- MIGRATION: 18_seed_commercial.sql
---------------------------------------------

-- Migration: 18_seed_commercial
-- Purpose: Pre-populate Core Commercial Plans, Subscriptions, and Reusable Catalogs

-- 1. Insert Commercial Plans
INSERT INTO commercial_plans (id, plan_code, display_name, monthly_price_usd, features_allowed, limits_definition, status)
VALUES
  ('bbbbbbbb-0000-0000-0000-000000000000', 'trial', 'Factory Free Trial', 0.00, '["core_generation"]', '{"max_generations_per_month": 50}', 'active'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'basic', 'Factory Basic', 499.00, '["core_generation", "manual_publish"]', '{"max_generations_per_month": 500}', 'active'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'pro', 'Factory Pro', 1299.00, '["core_generation", "manual_publish", "ab_testing", "advanced_analytics"]', '{"max_generations_per_month": 2500}', 'active'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'enterprise', 'Factory Enterprise', 4999.00, '["core_generation", "manual_publish", "ab_testing", "advanced_analytics", "autonomy", "custom_dealroom"]', '{"max_generations_per_month": 999999}', 'active');

-- 2. Insert Pack Catalogs
INSERT INTO pack_catalogs (id, pack_name, description, pack_type, minimum_plan_code, payload_manifest, is_published)
VALUES
  ('33333333-0000-0000-0000-000000000001', 'Skincare Golden Starter Kit', 'The foundational template designed for luxury skincare brands. Includes optimized product pages and core SEO prompts.', 'website_template', 'basic', '{"version": "1.0", "entities_to_clone": ["99999999-0000-0000-0000-000000000001"]}', true),
  ('33333333-0000-0000-0000-000000000002', 'High-Conversion AB Testing Prompts', 'A bundle containing aggressive variant generation prompts for rapid growth experimentation.', 'prompt_bundle', 'pro', '{"version": "2.1", "entities_to_clone": ["22222222-0000-0000-0000-000000000002"]}', true),
  ('33333333-0000-0000-0000-000000000003', 'Full Autopilot Ops Board', 'Pre-configured low-risk autopilot lanes for enterprise-grade cache management and re-indexing.', 'ops_dashboard', 'enterprise', '{"version": "1.0", "target_lanes": ["auto_reindex", "auto_backfill"]}', true);

-- 3. Insert Tenant Subscriptions (Simulating 3 Active Brands onboarding)
INSERT INTO tenant_subscriptions (id, tenant_id, tenant_name, plan_id, status, current_period_end)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000000', 'Nova Cosmetics (Onboarding)', 'bbbbbbbb-0000-0000-0000-000000000000', 'trialing', NOW() + INTERVAL '14 days'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Lumina Beauty', 'bbbbbbbb-0000-0000-0000-000000000001', 'active', NOW() + INTERVAL '30 days'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'DermaCore Labs', 'bbbbbbbb-0000-0000-0000-000000000002', 'active', NOW() + INTERVAL '30 days'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Aura Skincare EU', 'bbbbbbbb-0000-0000-0000-000000000003', 'active', NOW() + INTERVAL '30 days'),
  ('aaaaaaaa-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Vintage Apothecary', 'bbbbbbbb-0000-0000-0000-000000000001', 'past_due', NOW() - INTERVAL '5 days');


---------------------------------------------
-- MIGRATION: 19_audit_triage.sql
---------------------------------------------

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


---------------------------------------------
-- MIGRATION: 20_seed_triage_health.sql
---------------------------------------------

-- Migration: 20_seed_triage_health
-- Purpose: Pre-populate Enterprise Hardening metrics (Audits, Backups, DLQs)

-- 1. Insert Global Audit Logs
INSERT INTO global_audit_logs (id, tenant_id, actor_id, action_type, resource_type, resource_id, payload, ip_address, created_at)
VALUES
  ('aaaa1111-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '11110000-0000-0000-0000-000000000000', 'policy_blocked', 'tenant_subscription', '33333333-0000-0000-0000-000000000003', '{"reason": "Tenant plan PRO does not meet ENTERPRISE requirement. Blocked by Feature Gate."}', '192.168.1.1', NOW() - INTERVAL '4 hours'),
  ('aaaa1111-0000-0000-0000-000000000002', NULL, '99999999-0000-0000-0000-000000000000', 'plan_upgrade', 'tenant_subscription', 'aaaaaaaa-0000-0000-0000-000000000003', '{"old_plan": "pro", "new_plan": "enterprise"}', '10.0.0.5', NOW() - INTERVAL '1 day'),
  ('aaaa1111-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '22220000-0000-0000-0000-000000000000', 'scope_leak_prevented', 'api_route', 'provision-tenant', '{"attempted_target": "10000000-0000-0000-0000-000000000003"}', '35.190.1.2', NOW() - INTERVAL '1 hour');

-- 2. Insert System Backups
INSERT INTO system_backups (id, backup_name, tenant_id, status, size_bytes, storage_ref, triggered_by, completed_at, created_at)
VALUES
  ('bbbb1111-0000-0000-0000-000000000001', 'Weekly Factory Full Snapshot', NULL, 'completed', 1048576000, 's3://factory-vault/full-2026-w13.tar.gz', '99999999-0000-0000-0000-000000000000', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' - INTERVAL '15 minutes'),
  ('bbbb1111-0000-0000-0000-000000000002', 'DermaCore Labs Tenant Extraction', '10000000-0000-0000-0000-000000000002', 'failed', 2048000, NULL, '99999999-0000-0000-0000-000000000000', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours');

-- 3. Insert Dead Letter Queues (DLQ)
INSERT INTO dead_letter_queues (id, source_queue, tenant_id, payload, error_message, retry_count, status, failed_at)
VALUES
  ('88888888-0000-0000-0000-000000000001', 'auto_backfill_generator', '10000000-0000-0000-0000-000000000002', '{"sku": "LIP-001"}', 'LLM Provider Rate Limit Exceeded (HTTP 429). Max retries reached.', 5, 'unresolved', NOW() - INTERVAL '2 hours'),
  ('88888888-0000-0000-0000-000000000002', 'isr_revalidation', '10000000-0000-0000-0000-000000000003', '{"path": "/products"}', 'Network Timeout connecting to Vercel API Edge.', 3, 'retried_success', NOW() - INTERVAL '24 hours');
