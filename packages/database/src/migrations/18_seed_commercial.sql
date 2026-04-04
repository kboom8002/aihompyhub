-- Migration: 18_seed_commercial
-- Purpose: Pre-populate Core Commercial Plans, Subscriptions, and Reusable Catalogs

-- 1. Insert Commercial Plans
INSERT INTO commercial_plans (id, plan_code, display_name, monthly_price_usd, features_allowed, limits_definition, status)
VALUES
  ('plan-00000000-0000-0000-0000-000000000000', 'trial', 'Factory Free Trial', 0.00, '["core_generation"]', '{"max_generations_per_month": 50}', 'active'),
  ('plan-00000000-0000-0000-0000-000000000001', 'basic', 'Factory Basic', 499.00, '["core_generation", "manual_publish"]', '{"max_generations_per_month": 500}', 'active'),
  ('plan-00000000-0000-0000-0000-000000000002', 'pro', 'Factory Pro', 1299.00, '["core_generation", "manual_publish", "ab_testing", "advanced_analytics"]', '{"max_generations_per_month": 2500}', 'active'),
  ('plan-00000000-0000-0000-0000-000000000003', 'enterprise', 'Factory Enterprise', 4999.00, '["core_generation", "manual_publish", "ab_testing", "advanced_analytics", "autonomy", "custom_dealroom"]', '{"max_generations_per_month": 999999}', 'active');

-- 2. Insert Pack Catalogs
INSERT INTO pack_catalogs (id, pack_name, description, pack_type, minimum_plan_code, payload_manifest, is_published)
VALUES
  ('pack-00000000-0000-0000-0000-000000000001', 'Skincare Golden Starter Kit', 'The foundational template designed for luxury skincare brands. Includes optimized product pages and core SEO prompts.', 'website_template', 'basic', '{"version": "1.0", "entities_to_clone": ["tp-00000000-0000-0000-0000-000000000001"]}', true),
  ('pack-00000000-0000-0000-0000-000000000002', 'High-Conversion AB Testing Prompts', 'A bundle containing aggressive variant generation prompts for rapid growth experimentation.', 'prompt_bundle', 'pro', '{"version": "2.1", "entities_to_clone": ["pv-00000000-0000-0000-0000-000000000002"]}', true),
  ('pack-00000000-0000-0000-0000-000000000003', 'Full Autopilot Ops Board', 'Pre-configured low-risk autopilot lanes for enterprise-grade cache management and re-indexing.', 'ops_dashboard', 'enterprise', '{"version": "1.0", "target_lanes": ["auto_reindex", "auto_backfill"]}', true);

-- 3. Insert Tenant Subscriptions (Simulating 3 Active Brands onboarding)
INSERT INTO tenant_subscriptions (id, tenant_id, tenant_name, plan_id, status, current_period_end)
VALUES
  ('sub-00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000000', 'Nova Cosmetics (Onboarding)', 'plan-00000000-0000-0000-0000-000000000000', 'trialing', NOW() + INTERVAL '14 days'),
  ('sub-00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Lumina Beauty', 'plan-00000000-0000-0000-0000-000000000001', 'active', NOW() + INTERVAL '30 days'),
  ('sub-00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'DermaCore Labs', 'plan-00000000-0000-0000-0000-000000000002', 'active', NOW() + INTERVAL '30 days'),
  ('sub-00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Aura Skincare EU', 'plan-00000000-0000-0000-0000-000000000003', 'active', NOW() + INTERVAL '30 days'),
  ('sub-00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Vintage Apothecary', 'plan-00000000-0000-0000-0000-000000000001', 'past_due', NOW() - INTERVAL '5 days');
