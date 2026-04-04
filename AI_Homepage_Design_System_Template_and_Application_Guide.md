# AI홈페이지 디자인 시스템 설정 템플릿 구조 및 적용 가이드 v1.0

## 0. 문서 목적
이 문서는 AI홈페이지에 적용할 디자인 시스템을 설정하기 위한
**템플릿 구조 표준안**과 **실제 적용 가이드**를 정의한다.

이 문서는 다음을 다룬다.
1. 디자인 시스템 설정 템플릿의 표준 구조
2. 각 템플릿 항목에 무엇을 입력해야 하는지
3. AI홈페이지에 실제로 어떻게 적용하는지
4. AI-pair coding / builder studio / multi-tenant factory에서 어떻게 재사용하는지

---

## 1. 템플릿 설계 원칙

### 1-1. 이 템플릿은 단순 스타일 설정 템플릿이 아니다
이 템플릿은:
- visual style
- information hierarchy
- trust grammar
- compare grammar
- routine grammar
- media grammar
를 함께 포함한다.

### 1-2. 템플릿은 조합 가능한 레이어여야 한다
하나의 템플릿은 아래 레이어의 조합으로 본다.

1. Visual Template
2. Information Hierarchy Template
3. Trust Template
4. Conversion Template
5. Media Template

### 1-3. 브랜드별 variation은 되지만 core contract는 유지해야 한다
즉 tenant별 customization은 가능하되,
question-first / trust-visible / compare-first-class 원칙은 유지되어야 한다.

---

## 2. AI홈페이지 디자인 시스템 설정 템플릿 구조

## Section A. Brand Visual Identity
### 필드
- `brand_name`
- `visual_thesis`
- `tone_keywords[]`
- `do_not_look_like[]`
- `reference_image_set[]`
- `brand_signature_motif`
- `premium_level`

### DR.O 예시
- visual_thesis: quiet clinical premium for interval-driven reset brand
- tone_keywords: timing, interval, reset, contour, calm, measured, science-derived

---

## Section B. Semantic Color Profile
### 필드
- `base_neutral_palette`
- `surface_palette`
- `text_palette`
- `trust_palette`
- `caution_palette`
- `product_semantic_accents[]`
- `media_semantic_accents[]`

### rules
- base palette is always neutral-dominant
- accents are restrained
- trust and caution colors must be distinct from commerce CTA colors

### DR.O 예시
- tension accent = pink-gel family
- glow accent = nude-peach family
- trust = cool muted assurance
- caution = warm muted boundary

---

## Section C. Typography Profile
### 필드
- `brand_logotype_rule`
- `display_type_role`
- `ui_type_role`
- `type_scale`
- `question_headline_priority`
- `editorial_serif_scope`
- `body_readability_rule`

### rules
- question > answer > product
- serif is limited
- UI readability prioritized over decorative luxury

---

## Section D. Spacing & Layout Profile
### 필드
- `grid_system`
- `content_width`
- `section_spacing`
- `card_density_rule`
- `hero_spacing_rule`
- `mobile_density_rule`

### rules
- answer pages prioritize readability
- no crowded marketplace layout
- trust needs vertical breathing room

---

## Section E. Shape / Surface Profile
### 필드
- `radius_scale`
- `surface_treatment`
- `shadow_profile`
- `border_profile`
- `motif_reuse_rule`

### DR.O 예시
- soft rounded rectangle
- quiet emboss/deboss contour reuse
- subtle shadow pedestal

---

## Section F. Information Hierarchy Template
### 필드
- `homepage_priority_order[]`
- `answer_page_priority_order[]`
- `compare_page_priority_order[]`
- `product_page_priority_order[]`
- `search_page_priority_order[]`
- `trust_page_priority_order[]`

### recommended default
#### homepage
question > answer > compare/routine > product as answer > trust > media

#### answer
question > short answer > suitable/not-for > next paths > trust > faq

#### product
fit situation > reset moments > why it fits > formula logic > compare/routine > trust > commerce

---

## Section G. Trust Grammar Template
### 필드
- `trust_components[]`
- `reviewer_display_rule`
- `evidence_display_rule`
- `boundary_display_rule`
- `updatedAt_display_rule`
- `sensitive_page_trust_position`
- `review_case_disclaimer_rule`

### mandatory defaults
- TrustStrip required
- BoundaryNoteBox required on sensitive pages
- reviewer/evidence visible before buy-only CTA
- before/after requires disclaimer grammar

---

## Section H. Compare Grammar Template
### 필드
- `compare_mode`
- `quick_decision_required`
- `fit_split_required`
- `battle_table_allowed`
- `shared_note_required`
- `compare_to_product_path_rule`

### mandatory defaults
- compare_mode = fit_split
- quick_decision_required = true
- battle_table_allowed = false

---

## Section I. Routine Grammar Template
### 필드
- `routine_mode`
- `sequence_component_required`
- `required_vs_optional_grouping`
- `timing_frequency_panel`
- `routine_to_product_rule`

### mandatory defaults
- routine_mode = sequence/timeline
- sequence_component_required = true
- routine to product path visible

---

## Section J. Media Grammar Template
### 필드
- `story_card_style`
- `review_case_style`
- `event_hero_style`
- `insight_style`
- `media_to_answer_path_rule`
- `proof_style_beforeafter_allowed`

### mandatory defaults
- media must route back to answer graph
- proof_style_beforeafter_allowed = false

---

## Section K. Component Contract Set
### 필드
- `must_have_components[]`
- `phase2_components[]`
- `phase5_media_components[]`
- `component_variants`
- `accessibility_rules`
- `responsive_rules`

### recommended core
- HeroQuestionBlock
- ResetFinder
- AnswerCard
- CompareQuickDecision
- RoutineStepCard
- ProductFitHero
- TrustStrip
- BoundaryNoteBox
- SearchInterpretationPanel

---

## Section L. CTA Hierarchy Template
### 필드
- `tier1_decision_cta[]`
- `tier2_execution_cta[]`
- `tier3_commerce_cta[]`
- `buy_only_page_allowed`
- `compare_cta_required_on_hero_products`
- `trust_page_commerce_priority`

### default
- tier1 = answer/compare/finder
- tier2 = routine/product detail
- tier3 = buy/bundle
- buy_only_page_allowed = false on sensitive pages

---

## Section M. Prompt Addendum Template
### 필드
- `global_design_addendum`
- `page_level_addendum`
- `component_level_addendum`
- `forbidden_visual_patterns[]`
- `required_visual_patterns[]`

### example defaults
- question headline must outrank product name
- trust strip must be visible in early viewport
- compare is fit split not battle chart
- routine is sequence not product grid
- quiet premium visual language

---

## 3. 설정 템플릿 JSON 개념 예시

```json
{
  "brand_name": "DR.O",
  "visual_thesis": "quiet clinical premium for interval-driven reset brand",
  "tone_keywords": ["timing", "interval", "reset", "contour", "calm", "science-derived"],
  "base_neutral_palette": {
    "bg": "#F5F4F2",
    "surface": "#FFFFFF",
    "text": "#111111"
  },
  "product_semantic_accents": {
    "medi_tension": ["#E8C7D4", "#DFA9C0"],
    "medi_glow": ["#E9D8CC", "#DDB8A3"]
  },
  "homepage_priority_order": [
    "hero_question",
    "featured_answers",
    "compare_entry",
    "routine_preview",
    "product_as_answer",
    "trust",
    "media_teasers"
  ],
  "trust_components": [
    "TrustStrip",
    "ReviewerCard",
    "BoundaryNoteBox"
  ],
  "compare_mode": "fit_split",
  "routine_mode": "sequence",
  "must_have_components": [
    "HeroQuestionBlock",
    "AnswerCard",
    "CompareQuickDecision",
    "RoutineStepCard",
    "ProductFitHero",
    "TrustStrip"
  ]
}
```

---

## 4. AI홈페이지 디자인 시스템 적용 가이드

## Step 1. Brand Input 확정
먼저 아래가 확정되어야 한다.
- brand truth
- do-not-misread
- question capital
- hero products
- fit split
- trust rules

이게 없으면 디자인 시스템 설정을 해도 product-first storefront로 회귀한다.

---

## Step 2. 설정 템플릿 초안 생성
브랜드 온톨로지, 제품 구조, 레퍼런스 이미지, 디자인 원칙을 입력해
디자인 시스템 설정 템플릿 초안을 만든다.

### 자동 생성 대상
- visual thesis
- tone keywords
- semantic color draft
- hierarchy order
- trust grammar
- compare grammar
- routine grammar
- component contract draft

---

## Step 3. Human Review
브랜드 담당자 / 디자이너 / 제품 담당자가 아래를 검토한다.
- 브랜드다움 유지 여부
- product fit split이 잘 보이는지
- trust가 충분히 드러나는지
- overly commercial하게 보이지 않는지
- anti-pattern이 없는지

---

## Step 4. Token/Component로 내린다
확정된 템플릿을 실제 코드 자산으로 바꾼다.

### repo 권장 반영
- `tokens.css`
- `semantic.css`
- `component contracts`
- `page composition config`
- `design prompt addendum`

---

## Step 5. Page Composition에 적용
각 페이지는 설정 템플릿을 소비해야 한다.

### homepage
- hero question
- answers
- compare/routine
- product as answer
- trust
- media teaser

### answer detail
- question
- short answer
- suitable/not-for
- compare/routine/product
- trust

### compare
- quick decision
- fit split
- shared note
- trust
- product/routine path

### product
- fit situation
- reset moments
- why it fits
- trust
- compare/routine
- commerce

---

## Step 6. Prompt / Builder에 연결
디자인 시스템 설정 템플릿은 아래 모듈과 연결된다.

- AI homepage builder
- page template composer
- content generation prompt
- AI-pair coding prompt
- review QA prompt

---

## 5. Builder / SaaS에서의 활용 구조

## 5-1. 테넌트 수준
tenant는 아래를 선택/수정한다.
- visual profile
- hierarchy profile
- trust profile
- compare profile
- routine profile
- media profile

## 5-2. factory 수준
factory admin은 아래를 관리한다.
- template family
- token presets
- component presets
- prompt addendum presets
- anti-pattern lint rules

---

## 6. 브랜드 온톨로지에서 디자인 시스템 템플릿 자동 추출 AI 기능 제안

## 6-1. 결론
매우 유망하다.
특히 multi-tenant AI homepage factory SaaS에서 핵심 differentiator가 될 수 있다.

## 6-2. 기능 정의
입력:
- ontology classes / relations
- question capital
- fit matrix
- trust rules
- visual references

출력:
- design system setting template draft
- design token draft
- page hierarchy profile
- component contract draft
- prompt addendum draft

## 6-3. 추천 아키텍처
### Module 1. Ontology Signal Extractor
브랜드 ontology에서 design driver 추출

### Module 2. Visual Reference Parser
브랜드북, 패키지, 제품 이미지에서 visual cue 추출

### Module 3. Design Template Composer
위 두 출력을 합쳐 설정 템플릿 draft 생성

### Module 4. Token & Component Mapper
template → token/component contract 변환

### Module 5. Human Review UI
승인/수정/비교/버전관리

### Module 6. Drift Detector
실제 구현과 템플릿 불일치 감지

---

## 7. 자동 추출 기능이 특히 좋은 이유
1. 브랜드 온톨로지와 디자인 시스템이 끊어지지 않는다
2. tenant마다 빠르게 1차 design system foundation을 만들 수 있다
3. AI-pair coding 결과 품질이 올라간다
4. trust/compare/routine grammar가 빠지지 않는다
5. 디자인팀이 zero-base로 시작하지 않아도 된다

---

## 8. 주의점
- 자동 추출 결과를 바로 production에 쓰면 안 된다
- 반드시 human review를 거쳐야 한다
- 레퍼런스 이미지 품질이 낮으면 visual thesis 품질도 낮아진다
- product fit matrix가 없으면 semantic split도 불안정하다
- ontology가 약하면 component priority도 흔들린다

---

## 9. 최종 권장 운영 방식
1. ontology / question capital 확정
2. design template draft 자동 생성
3. human review
4. tokens/component contracts 생성
5. page composition 적용
6. prompt addendum 동기화
7. builder / code generation에 적용
8. drift monitoring

---

## 10. 한 줄 결론
AI홈페이지 디자인 시스템 설정 템플릿은 단순 스타일 설정표가 아니라,
**브랜드 온톨로지와 Answer Commerce 구조를 UI/토큰/컴포넌트/페이지 조합 규칙으로 번역하는 실행 템플릿**이다.
