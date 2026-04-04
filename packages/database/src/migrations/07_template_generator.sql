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
