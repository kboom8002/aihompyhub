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
