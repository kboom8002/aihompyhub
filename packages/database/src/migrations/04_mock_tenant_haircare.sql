-- Insert second tenant
INSERT INTO tenants (id, name) VALUES ('00000000-0000-0000-0000-000000000002', 'Vegan Haircare Brand') ON CONFLICT (id) DO NOTHING;
INSERT INTO brands (id, tenant_id, name) VALUES (uuid_generate_v4(), '00000000-0000-0000-0000-000000000002', 'VEGAN ROOT') ON CONFLICT DO NOTHING;

-- Insert Mock Content for Vegan Haircare
INSERT INTO universal_content_assets (id, tenant_id, category, type, title, json_payload) VALUES
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000002', 'brand_ssot', 'topic_hub', '설페이트프리 샴푸란?', '{"body": "<p>설페이트 계면활성제를 첨가하지 않아 두피 자극을 최소화한 제품입니다.</p>"}'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000002', 'brand_ssot', 'topic_hub', '올바른 헤어 트리트먼트 사용법', '{"body": "<p>물기를 꽉 짠 상태에서 모발 끝 쪽에 도포한 뒤 5분 후 씻어냅니다.</p>"}'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000002', 'brand_ssot', 'compare', '일반 약산성 샴푸 vs 비건 트리트먼트 샴푸', '{"profileA": {"name": "일반 약산성 샴푸", "targetFit": "가벼운 피지 컨트롤", "description": "기본적인 두피 pH 밸런싱을 돕는 일반 라인"}, "profileB": {"name": "비건 트리트먼트 샴푸", "targetFit": "극손상모 집중 영양", "description": "비건 인증 성분으로 손상모에 단백질 충전"}, "body": "<p>민감성 두피라면 반드시 비건 인증된 트리트먼트 결합형 샴푸를 권장합니다.</p>"}');
