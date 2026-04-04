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
