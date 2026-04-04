-- Migration: 20_seed_triage_health
-- Purpose: Pre-populate Enterprise Hardening metrics (Audits, Backups, DLQs)

-- 1. Insert Global Audit Logs
INSERT INTO global_audit_logs (id, tenant_id, actor_id, action_type, resource_type, resource_id, payload, ip_address, created_at)
VALUES
  ('aud-00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'user-0000-1111', 'policy_blocked', 'tenant_subscription', 'pack-00000000-0000-0000-0000-000000000003', '{"reason": "Tenant plan PRO does not meet ENTERPRISE requirement. Blocked by Feature Gate."}', '192.168.1.1', NOW() - INTERVAL '4 hours'),
  ('aud-00000000-0000-0000-0000-000000000002', NULL, 'user-admin-9999', 'plan_upgrade', 'tenant_subscription', 'sub-00000000-0000-0000-0000-000000000003', '{"old_plan": "pro", "new_plan": "enterprise"}', '10.0.0.5', NOW() - INTERVAL '1 day'),
  ('aud-00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'user-0000-2222', 'scope_leak_prevented', 'api_route', 'provision-tenant', '{"attempted_target": "10000000-0000-0000-0000-000000000003"}', '35.190.1.2', NOW() - INTERVAL '1 hour');

-- 2. Insert System Backups
INSERT INTO system_backups (id, backup_name, tenant_id, status, size_bytes, storage_ref, triggered_by, completed_at, created_at)
VALUES
  ('bkp-00000000-0000-0000-0000-000000000001', 'Weekly Factory Full Snapshot', NULL, 'completed', 1048576000, 's3://factory-vault/full-2026-w13.tar.gz', 'user-admin-9999', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' - INTERVAL '15 minutes'),
  ('bkp-00000000-0000-0000-0000-000000000002', 'DermaCore Labs Tenant Extraction', '10000000-0000-0000-0000-000000000002', 'failed', 2048000, NULL, 'user-admin-9999', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours');

-- 3. Insert Dead Letter Queues (DLQ)
INSERT INTO dead_letter_queues (id, source_queue, tenant_id, payload, error_message, retry_count, status, failed_at)
VALUES
  ('dlq-00000000-0000-0000-0000-000000000001', 'auto_backfill_generator', '10000000-0000-0000-0000-000000000002', '{"sku": "LIP-001"}', 'LLM Provider Rate Limit Exceeded (HTTP 429). Max retries reached.', 5, 'unresolved', NOW() - INTERVAL '2 hours'),
  ('dlq-00000000-0000-0000-0000-000000000002', 'isr_revalidation', '10000000-0000-0000-0000-000000000003', '{"path": "/products"}', 'Network Timeout connecting to Vercel API Edge.', 3, 'retried_success', NOW() - INTERVAL '24 hours');
