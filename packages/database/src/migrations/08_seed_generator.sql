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
