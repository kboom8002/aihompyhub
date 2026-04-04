-- Seed Data: 02_seed_skincare_mvp
-- Purpose: Provide MVP starting state for Design Partner Skincare

-- 1. Tenant & Identity
INSERT INTO tenants (id, name) VALUES 
('00000000-0000-0000-0000-000000000001', 'Lumiere Skincare');

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
