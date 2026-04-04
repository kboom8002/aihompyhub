-- Migration: 16_seed_autonomy
-- Purpose: Pre-populate Autopilot Lanes, Execution Journals, and Human Override Logs (Phase 8)

-- 1. Insert Autopilot Lanes
INSERT INTO autopilot_lanes (id, lane_name, description, lane_type, cron_schedule, status, recommendation_payload)
VALUES
  ('lane-00000000-0000-0000-0000-000000000001', 'Hourly Graph Re-index', 'Rebuilds search index nodes across edge regions periodically.', 'auto_reindex', '0 * * * *', 'active', NULL),
  ('lane-00000000-0000-0000-0000-000000000002', 'Stale Cache Revalidation', 'Forces Next.js ISR cache purge when product schema changes.', 'auto_revalidation', NULL, 'paused', NULL),
  ('lane-00000000-0000-0000-0000-000000000003', 'Missing Image Backfill', 'Uses fallback generative prompts to backfill missing hero images.', 'auto_backfill', '0 0 * * *', 'suspended_by_system', '{"recommendationId": "rec-001", "type": "rollback_recommendation", "reason": "Continuous Verification limits breached. High volume of generated images rejected by guardrails.", "suggestedAction": "Inspect Generative Pipeline [pipe-00000000-1] and manually review last 14 backfill outputs before re-enabling."}'),
  ('lane-00000000-0000-0000-0000-000000000004', 'Edge Cache Warmup', 'Pre-computes Heavy Vercel Edge caches for top tier VIP campaigns.', 'cache_warmup', '0 2 * * *', 'disabled', NULL);

-- 2. Insert Execution Journals
INSERT INTO execution_journals (id, autopilot_lane_id, execution_run_id, action_summary, status, details_payload, policy_blocked_reason, executed_at)
VALUES
  ('exec-00000000-0000-0000-0000-000000000001', 'lane-00000000-0000-0000-0000-000000000001', 'run-abc-123', 'Re-indexed 1450 graph nodes in 3 regions.', 'success', '{"durationMs": 4200, "nodes_updated": 1450}', NULL, NOW() - INTERVAL '1 hour'),
  ('exec-00000000-0000-0000-0000-000000000002', 'lane-00000000-0000-0000-0000-000000000003', 'run-def-456', 'Triggered backfill for 14 missing SKUs.', 'blocked_by_policy', '{"skus_requested": 14}', 'Cost budget for Generation API exceeded daily limit. Auto-action blocked.', NOW() - INTERVAL '4 hours'),
  ('exec-00000000-0000-0000-0000-000000000003', 'lane-00000000-0000-0000-0000-000000000002', 'run-ghi-789', 'Attempted to purge entire EMEA region CDN.', 'blocked_by_policy', '{"region": "EMEA"}', 'Action escalated: Broad region purges require manual human approval per Tenant SLA.', NOW() - INTERVAL '13 hours');

-- 3. Insert Human Override Logs
INSERT INTO human_override_logs (id, autopilot_lane_id, actor_id, previous_status, new_status, override_reason, created_at)
VALUES
  ('over-00000000-0000-0000-0000-000000000001', 'lane-00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'active', 'paused', 'High traffic hitting EU region. Pausing ISR flush to protect origin servers.', NOW() - INTERVAL '12 hours'),
  ('over-00000000-0000-0000-0000-000000000002', 'lane-00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'active', 'disabled', 'Decommissioned the Heavy Vercel Edge caching feature outright per Sprint 6 rollback.', NOW() - INTERVAL '48 hours');
