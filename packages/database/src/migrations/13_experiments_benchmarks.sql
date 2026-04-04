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
