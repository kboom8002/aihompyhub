-- ==============================================================================
-- DR.O Skincare: Universal Content Factory Seed Migration (SPRINT 19)
-- Purpose: Create Universal Content Table and Inject High Fidelity DR.O Content
-- ==============================================================================

-- 1. Create the Universal SSoT Assets Table (replaces Mock Arrays)
CREATE TABLE IF NOT EXISTS universal_content_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  category TEXT NOT NULL,  -- e.g., 'brand_ssot', 'media_ssot', 'commerce'
  type TEXT NOT NULL,      -- e.g., 'routine', 'compare', 'story', 'answer'
  title TEXT NOT NULL,
  json_payload JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for fast retrieval in Universal CMS Grid
CREATE INDEX IF NOT EXISTS idx_universal_content_query 
  ON universal_content_assets(tenant_id, category, type);

-- 2. Tenant & Identity Overwrite (Mapping Default 000...1 to DR.O)
INSERT INTO tenants (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'DR.O Skincare') 
ON CONFLICT (id) DO UPDATE SET name = 'DR.O Skincare';

INSERT INTO brands (id, tenant_id, name) 
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'DR.O Official')
ON CONFLICT (id) DO UPDATE SET name = 'DR.O Official';

-- 3. High Fidelity Universal Content Seeding (Derived from DR.O Brief)

-- [ Category: brand_ssot / Type: answer ]
INSERT INTO universal_content_assets (tenant_id, category, type, title, status, json_payload) VALUES 
('00000000-0000-0000-0000-000000000001', 'brand_ssot', 'answer', 'Q. 시술 후 집에서는 뭘 써야 하나요?', 'active', 
 '{ "body": "시술 직후에는 피부 장벽이 미세하게 열려 있어 일반 기능성 화장품을 피해야 합니다. DR.O는 데일리 기초가 아니라 시술 사이 공백(The Interval)의 피부 온도를 즉각적으로 낮추고 재생을 돕는 스페셜 트리트먼트로 설계되었습니다.", "tags": "#시술후케어, #홈더마리셋" }'),

('00000000-0000-0000-0000-000000000001', 'brand_ssot', 'answer', 'Q. 메디텐션은 언제 쓰는 게 맞나요?', 'active', 
 '{ "body": "울쎄라, 슈링크 등 탄력 리프팅 시술의 고정력을 높일 때, 혹은 중요한 촬영이나 약속 전 무너진 페이스라인을 단기간에 끌어올리고 싶을 때 사용하는 리프팅 전용 마스크입니다.", "tags": "#메디텐션, #사용타이밍" }');

-- [ Category: brand_ssot / Type: compare ]
INSERT INTO universal_content_assets (tenant_id, category, type, title, status, json_payload) VALUES 
('00000000-0000-0000-0000-000000000001', 'brand_ssot', 'compare', '메디텐션 하이드로겔 vs 메디글로우 모델링', 'active', 
 '{ "body": "두 제품은 완전히 다른 목적을 갖습니다.\n\n[메디텐션]: 페이스라인과 탄력 리셋 (PDRN, 콜라겐 베이스)\n[메디글로우]: 쿨링 진정과 안색 리셋 (트라넥사믹애씨드 베이스)\n\n리프팅 시술 후엔 메디텐션을, 토닝 시술 후엔 메디글로우를 권장합니다.", "tags": "#제품비교, #목적구분" }');

-- [ Category: brand_ssot / Type: routine ]
INSERT INTO universal_content_assets (tenant_id, category, type, title, status, json_payload) VALUES 
('00000000-0000-0000-0000-000000000001', 'brand_ssot', 'routine', '토닝 시술 직후 72시간 진정/광채 리셋 프로토콜', 'active', 
 '{ "body": "STEP 1 (당일): 메디글로우 모델링 마스크로 시술 직후 열감을 빠르게 낮추고 투명도를 유지합니다.\nSTEP 2 (D+1): 워시리셋마스크로 자극 없는 세정과 결 정돈을 진행합니다.\nSTEP 3 (D+2): 수분 크림 도포 후 충분한 휴식을 취합니다.", "tags": "#토닝루틴, #진정루틴" }'),

('00000000-0000-0000-0000-000000000001', 'brand_ssot', 'routine', '중요한 D-DAY 전날, 페이스라인 리프팅 루틴', 'active', 
 '{ "body": "STEP 1 (취침 2시간 전): 나이트리셋크림마스크를 얼굴 전체에 도포하여 밤사이 수분 밀도를 충전합니다.\nSTEP 2 (D-DAY 아침): 붓기가 발생한 턱선과 광대를 중심으로 메디텐션 하이드로겔 마스크를 20분간 밀착하여 탄력을 끌어올립니다.", "tags": "#디데이루틴, #탄력리셋" }');

-- [ Category: brand_ssot / Type: product_fit ]
INSERT INTO universal_content_assets (tenant_id, category, type, title, status, json_payload) VALUES 
('00000000-0000-0000-0000-000000000001', 'brand_ssot', 'product_fit', '이런 분들께 메디글로우가 가장 적합합니다', 'active', 
 '{ "body": "✅ 피부과 안면 토닝 시술을 받은 직후 (붉은기와 열감 진정)\n✅ 골프 등 야외 활동으로 피부 자극을 심하게 받은 날\n✅ 화장이 심하게 뜨고 안색이 칙칙해 브라이트닝이 필요한 분", "tags": "#적합성, #메디글로우" }');

-- [ Category: media_ssot / Type: story ]
INSERT INTO universal_content_assets (tenant_id, category, type, title, status, json_payload) VALUES 
('00000000-0000-0000-0000-000000000001', 'media_ssot', 'story', 'The Interval: 피부과 시술, 그 공백의 중요성', 'active', 
 '{ "body": "화장품을 많이 바르는 것이 피부를 좋아지게 만들까요? 오라클 피부과 네트워크의 20년 임상 기록은 그렇지 않다고 말합니다. 가장 중요한 것은 수많은 화장품을 겹쳐 바르는 것이 아니라, 시술과 시술 사이의 시간인 The Interval 기간에 0점 수준으로 확실하게 피부를 리셋하는 단 한 번의 강력한 개입입니다.", "tags": "#브랜드스토리, #더인터벌" }'),

('00000000-0000-0000-0000-000000000001', 'media_ssot', 'story', '많이 바르지 마세요, 정확하게 붙이세요', 'active', 
 '{ "body": "DR.O는 무의미한 7스킨법이나 10단계 스킨케어를 거부합니다. 피부 상태를 측정하고 가장 필요한 순간에만 개입하는 클리닉 로직을 당신의 화장대 위로 가져왔습니다. 스페셜 트리트먼트는 간결하되 압도적이어야 합니다.", "tags": "#스킨케어철학, #전문가컬럼" }');

-- [ Category: media_ssot / Type: insight ]
INSERT INTO universal_content_assets (tenant_id, category, type, title, status, json_payload) VALUES 
('00000000-0000-0000-0000-000000000001', 'media_ssot', 'insight', '2026년 홈 더마의 미래: 데일리 기초의 종말', 'active', 
 '{ "body": "글로벌 코스메틱 뷰티 리포트에 따르면 고관여 소비자일수록 일반 데일리 화장품 소비를 줄이고, 프리미엄 시술과 홈 뷰티 디바이스, 그리고 초고효능 스페셜 마스크로 지출 기준을 옮기고 있습니다. 그 한가운데 DR.O가 있습니다.", "tags": "#트렌드, #마켓인사이트" }');

-- [ Category: commerce / Type: bundle ]
INSERT INTO universal_content_assets (tenant_id, category, type, title, status, json_payload) VALUES 
('00000000-0000-0000-0000-000000000001', 'commerce', 'bundle', '토닝 리셋 SOS 스타터 세트', 'active', 
 '{ "body": "메디글로우 모델링 1박스 + 배리어리셋마스크 증정.\n\n토닝/레이저 시술 직후 피부에 열감이 오르고 손상되었을 때 사용하는 베이직 복구 세트 구성입니다. (최대 15% 할인)", "tags": "#기획세트, #토닝세트" }'),

('00000000-0000-0000-0000-000000000001', 'commerce', 'bundle', 'V라인 앰버서더 리프팅 패키지', 'active', 
 '{ "body": "메디텐션 하이드로겔 2박스 + 덴시티리셋트리트먼트.\n\n중요한 웨딩 촬영이나 행사 직전, 무너진 페이스라인 단기 복구를 원하는 고객을 위한 프레스티지 스페셜 리프팅 케어 패키지입니다.", "tags": "#기획세트, #디데이패키지" }');
