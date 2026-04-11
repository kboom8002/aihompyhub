---
title: "소비재 브랜드용 AI홈페이지 + SNS 연동 운영체계 Spec"
version: "1.0"
status: "repo-ready"
language: "ko"
document_type: "operating spec"
intended_consumers:
  - "AI pair-coding agent"
  - "PM"
  - "Growth marketer"
  - "Frontend engineer"
  - "CRM operator"
  - "Performance marketer"
last_updated: "2026-04-11"
---

# 소비재 브랜드용 AI홈페이지 + SNS 연동 운영체계 Spec

## 0. 문서 목적

이 문서는 소비재 브랜드가 인스타그램, 틱톡, 인플루언서, 공동구매 채널과 **AI홈페이지**를 연동해  
다음 지표를 극대화하도록 설계·구축·운영하기 위한 repo-ready 스펙이다.

- 트래픽
- 고품질 리드
- 전환율
- 객단가
- 기여이익
- 재구매율
- creator / campaign별 ROI

이 문서는 구현팀이 다음을 바로 만들 수 있도록 작성한다.

- 페이지 패밀리
- 라우트 구조
- UTM 규칙
- creator landing 템플릿
- 공동구매 랜딩 템플릿
- DM 연동 플로우
- KPI 이벤트 구조
- CMS 필드 모델
- 운영 루프

---

## 1. 운영 철학

## 1.1 기본 원칙
SNS는 **관심을 만들고**, AI홈페이지는 **질문을 닫고 전환을 종결**한다.

즉 역할을 다음처럼 분리한다.

- Instagram / TikTok / Influencer / Joint-buy: 발견, 관심, 관계 시작
- AI홈페이지: 비교, 검증, FAQ, 신뢰, 정책, 오퍼, 전환
- CRM / DM / Retargeting: 회수, 후속, 재구매

## 1.2 왜 AI홈페이지가 필요한가
소비재 브랜드에서 SNS만 강하면 아래 문제가 생긴다.

1. 관심은 많지만 제품 이해가 얕다.
2. creator별 성과는 보이지만 질문/반품/CS 비용이 커진다.
3. 공동구매는 매출이 나도 수익성이 나빠질 수 있다.
4. DM은 많이 오지만 고품질 리드가 적다.
5. 검색과 AI 비교 단계에서 브랜드 정본이 약하다.

AI홈페이지는 이를 해결하기 위해 **문제 허브 + 제품 허브 + 증거 허브 + 전환 허브**를 동시에 운영한다.

---

## 2. 상위 아키텍처

본 운영체계는 4개 축으로 설계한다.

## 2.1 문제/질문 축
- Topic Hub
- Question Hub
- FAQ
- Compare
- Guide

## 2.2 오퍼/상업 축
- Product Hub
- Product Detail
- Bundle / Offer Landing
- Joint-buy Landing
- Creator Landing

## 2.3 증거/신뢰 축
- Review / UGC Hub
- Portfolio / Use Case
- Gallery
- Evidence / Ingredient / Method
- Why Brand

## 2.4 행동/회수 축
- DM / 상담 / 카톡 연동
- 알림 신청
- 체험단 신청
- 공동구매 참여
- 장바구니 / 구매
- CRM 후속

---

## 3. 권장 GNB

- Home
- Shop / Products
- What Fits Me
- Reviews
- Offers
- Why Brand
- Insights / Guides
- About
- Contact / DM

### GNB rationale
소비재 브랜드 사용자는 보통 다음 순서로 움직인다.

1. 이 브랜드/제품이 뭔지 본다.
2. 나에게 맞는지 본다.
3. 실제 후기를 본다.
4. 지금 사야 할 오퍼가 있는지 본다.
5. 믿을 수 있는지 본다.
6. DM/구매/공동구매로 이동한다.

---

## 4. 전체 IA / 사이트맵

```text
/
├─ /products/
│  ├─ /products/{category-slug}/
│  ├─ /products/{product-slug}/
│  ├─ /bundles/{bundle-slug}/
│  └─ /collections/{collection-slug}/
│
├─ /what-fits-me/
│  ├─ /topics/
│  │  └─ /topics/{topic-slug}/
│  ├─ /questions/
│  │  ├─ /questions/{cluster-slug}/
│  │  └─ /questions/{answer-slug}/
│  ├─ /compare/
│  └─ /faq/
│
├─ /reviews/
│  ├─ /reviews/{review-cluster-slug}/
│  ├─ /ugc/
│  └─ /before-after/
│
├─ /offers/
│  ├─ /offers/{campaign-slug}/
│  ├─ /joint-buy/{creator-or-event-slug}/
│  ├─ /launch/{launch-slug}/
│  └─ /creator/{creator-slug}/
│
├─ /why-brand/
│  ├─ /evidence/
│  │  └─ /evidence/{evidence-slug}/
│  ├─ /ingredients/
│  ├─ /methods/
│  ├─ /certifications/
│  └─ /brand-story/
│
├─ /gallery/
│  ├─ /gallery/{theme-slug}/
│  └─ /gallery/{asset-slug}/
│
├─ /insights/
│  ├─ /guides/{guide-slug}/
│  ├─ /stories/{story-slug}/
│  └─ /news/{news-slug}/
│
├─ /contact/
│  ├─ /dm/
│  ├─ /kakao/
│  ├─ /inquiry/
│  └─ /support/
│
└─ /legal/
   ├─ /shipping/
   ├─ /returns/
   ├─ /privacy-policy/
   ├─ /terms/
   └─ /disclaimer/
```

---

## 5. 페이지 패밀리

## 5.1 Home
### 목적
브랜드 정체, 대표 제품, 대표 문제, 대표 오퍼, 대표 proof를 한 화면 흐름으로 전달한다.

### 필수 섹션
- Hero Hook
- Brand One-liner
- 대표 Product / Bestseller
- 문제별 Topic Entry
- Review / UGC Strip
- Joint-buy / Offer Strip
- Why Trust Us
- CTA Stack

### CTA 예시
- 베스트셀러 보기
- 내 피부/문제 맞춤 추천 보기
- 지금 진행 중인 공동구매 보기
- DM으로 문의하기

---

## 5.2 Product Hub
### 목적
제품 카테고리, 번들, 컬렉션, 라인업을 정리하는 상업 허브

### 하위 구조
- Category page
- Collection page
- Bestseller page
- Bundle page

### 필수 섹션
- category hero
- fit / not-fit summary
- featured products
- compare entry
- reviews preview
- CTA

---

## 5.3 Product Detail
### 목적
구매를 종결하는 핵심 상세 페이지

### 필수 섹션
- 제품 한 줄 정의
- fit / not-fit
- 핵심 효익
- 주요 성분 / 포인트
- 사용법 / 사용 순서
- FAQ
- review / UGC block
- compare block
- related topic
- related bundle / offer
- CTA
- 배송/반품/정책 요약

### 승인 체크
- [ ] 누구에게 맞는지 보인다
- [ ] 누구에게 안 맞는지 보인다
- [ ] FAQ가 있다
- [ ] review / UGC가 있다
- [ ] 정책(배송/반품) 진입 링크가 있다
- [ ] 관련 Topic / Guide 링크가 있다

---

## 5.4 Topic Hub
### 목적
문제 기준으로 질문과 제품을 연결하는 허브

### 예시 토픽
- 민감 피부
- 수분 장벽
- 두피 케어
- 체취 케어
- 여름 피지
- 미백 루틴
- 홈케어 안티에이징

### 필수 섹션
- topic hero
- 핵심 질문 6~12개
- short answers
- related products
- related bundle
- related reviews / UGC
- related FAQ
- CTA

### 승인 체크
- [ ] 문제 설명이 있다
- [ ] 질문 목록이 있다
- [ ] 관련 제품이 있다
- [ ] 관련 후기/UGC가 있다
- [ ] CTA가 있다

---

## 5.5 Question Hub / Answer Page
### 목적
개별 질문을 빠르게 닫고 전환으로 연결

### 질문 예시
- 민감 피부도 사용 가능한가?
- 세럼과 크림 중 뭐부터 사야 하나?
- 같이 써도 되나?
- 하루 몇 번 써야 하나?
- 공동구매 제품도 환불 가능한가?
- 인플루언서 추천 구성은 일반 구매와 뭐가 다른가?

### 필수 섹션
- canonical question
- short answer
- expanded answer
- proof / source
- caution / boundary
- related products
- related FAQ
- next action

---

## 5.6 Review / UGC Hub
### 목적
소비자 후기, creator 영상, before/after, 사용 맥락을 모으는 신뢰 허브

### 하위 구조
- 후기 허브
- creator 사용기 허브
- before/after 허브
- 문제별 후기 허브

### 필수 섹션
- review card grid
- creator clip strip
- filter by problem / product / creator
- related product links
- related offer links

---

## 5.7 Offer Landing
### 목적
런칭, 프로모션, 기획전, 시즌 이벤트, 번들 오퍼를 닫는 전환 허브

### 필수 섹션
- 오늘 제안 한 줄
- 오퍼 이유
- 기본가 vs 혜택가 vs 구성
- fit / not-fit
- FAQ
- creator / UGC proof
- 배송 / 반품 / 정책
- urgency / 마감 정보
- CTA

---

## 5.8 Joint-buy Landing
### 목적
공동구매 전환 전용 허브

### 필수 섹션
- creator intro
- 공동구매 구성
- 일반 구매와의 차이
- 혜택/가격
- 관련 후기 / creator clip
- FAQ
- 정책
- 카운트다운
- CTA

### 필수 정책 블록
- 배송일정
- 교환/환불
- 문의 채널
- 공동구매 특이사항

---

## 5.9 Creator Landing
### 목적
creator별 추천 제품, 오퍼, 후기, 질문, 성과를 분리해 관리하는 페이지

### URL 예시
- `/offers/creator/creator-name/`
- `/joint-buy/creator-name-spring-2026/`

### 필수 섹션
- creator hero
- creator 추천 이유
- 추천 제품/번들
- creator 영상 / 이미지
- creator 코멘트
- FAQ
- 정책
- CTA

### 승인 체크
- [ ] creator 식별 가능
- [ ] creator 전용 UTM 규칙 반영
- [ ] creator 추천 제품 연결
- [ ] FAQ/정책 포함
- [ ] CTA 분명

---

## 5.10 Why Brand
### 목적
브랜드 근거, 원료, 제조/인증, 철학, 차별점 제공

### 하위 구조
- Evidence
- Ingredients
- Methods
- Certifications
- Brand Story

### 필수 섹션
- why trust us
- evidence preview
- methods / ingredients
- caution / disclaimer
- reviewer / updatedAt

---

## 5.11 Guides / Insights
### 목적
SEO/AEO 대응용 how-to, 비교, 사용법, 루틴 가이드, 문제 해결 콘텐츠

### 권장 콘텐츠 유형
- 문제 해결 가이드
- 제품 선택 가이드
- 성분 / 원료 이해 가이드
- 루틴 가이드
- 사용 순서 가이드
- 공동구매 / 이벤트 설명 가이드

---

## 5.12 Contact / DM / Kakao
### 목적
DM, 카카오, 문의 폼, 고객지원 분기

### 필수 섹션
- DM entry
- 카카오 entry
- 문의 폼
- support FAQ
- 예상 응답 시간
- 구매 전 / 구매 후 분기

---

## 6. KPI 체계

## 6.1 Traffic KPI
- creator별 세션 수
- platform별 세션 수
- landing별 세션 수
- Topic Hub 진입률
- Product Detail 진입률
- Offer Landing 진입률

## 6.2 Quality Lead KPI
- DM 시작률
- 카카오 시작률
- 체험단/알림 신청률
- creator별 qualified lead rate
- 문의 폼 완료율

## 6.3 Conversion KPI
- product view → add-to-cart 비율
- add-to-cart → checkout start 비율
- checkout start → purchase 비율
- 공동구매 전환율
- creator별 매출 기여
- bundle attach rate

## 6.4 Profitability KPI
- creator별 CAC
- creator별 기여이익
- 오퍼별 기여이익
- 할인 후 ROAS
- 신규/재구매 비율
- payback / LTV

## 6.5 Trust / Info KPI
- FAQ click-through rate
- review / UGC engagement
- compare page engagement
- policy page visit before purchase
- return/refund-related inquiry rate

---

## 7. 이벤트 및 측정 설계

## 7.1 필수 이벤트
- `view_topic`
- `view_product`
- `view_bundle`
- `view_offer`
- `view_creator_landing`
- `click_dm`
- `click_kakao`
- `click_joint_buy`
- `click_add_to_cart`
- `start_checkout`
- `purchase`
- `submit_lead_form`
- `click_review_video`
- `click_faq`
- `click_compare`
- `click_shipping_policy`
- `click_return_policy`

## 7.2 공통 이벤트 파라미터
- `platform_source`
- `creator_id`
- `campaign_id`
- `offer_id`
- `topic_id`
- `product_id`
- `bundle_id`
- `content_id`
- `landing_type`

## 7.3 CRM 연동 이벤트
- `lead_qualified`
- `consultation_started`
- `dm_resolved`
- `repeat_purchase`
- `refund_requested`

---

## 8. UTM 규칙

## 8.1 기본 규칙
모든 SNS / creator / 광고 / 공동구매 링크는 아래 UTM을 기본으로 붙인다.

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_id`

## 8.2 source 규칙
- `instagram`
- `tiktok`
- `youtube`
- `naver`
- `kakao`
- `meta`
- `google`

## 8.3 medium 규칙
- `organic`
- `paid`
- `creator`
- `affiliate`
- `jointbuy`
- `dm`
- `storylink`
- `reel`
- `shorts`

## 8.4 campaign 규칙
포맷:
`{brand}_{objective}_{season-or-date}`

예:
- `brand_barrier_launch_202604`
- `brand_jointbuy_may_2026`
- `brand_summer_odor_202606`

## 8.5 content 규칙
포맷:
`{creator-or-placement}_{format}_{creative-id}`

예:
- `jisu_reel_01`
- `hana_story_02`
- `tiktokugc_video_03`
- `profilelink_main_01`

## 8.6 utm_id 규칙
광고/비용/시트 정합을 위한 고유 ID 사용  
예:
- `202604_ig_creator_jisu_01`
- `202605_jointbuy_hana_bundleA`

## 8.7 예시 URL
```text
https://brand.com/offers/joint-buy-hana-may?utm_source=instagram&utm_medium=creator&utm_campaign=brand_jointbuy_may_2026&utm_content=hana_story_01&utm_id=202605_jointbuy_hana_bundleA
```

---

## 9. Creator Landing 템플릿

## 9.1 목적
creator별 트래픽, 전환율, 객단가, ROI를 분리 측정하고 최적화

## 9.2 필수 필드
- `creator_id`
- `creator_name`
- `creator_handle`
- `creator_channel`
- `creator_content_type`
- `campaign_id`
- `offer_id`
- `hero_title`
- `hero_subcopy`
- `recommended_products`
- `recommended_bundle`
- `creator_quote`
- `creator_assets`
- `faq_ids`
- `policy_block`
- `primary_cta`
- `secondary_cta`

## 9.3 필수 섹션
1. Creator Hero
2. 추천 제품/번들
3. creator 사용 맥락
4. creator 영상/이미지
5. FAQ
6. 정책
7. CTA

## 9.4 금지
- 홈으로 보내는 일반 링크
- 정책 없는 공동구매 링크
- creator 식별이 안 되는 일반 랜딩

---

## 10. 공동구매 랜딩 템플릿

## 10.1 목적
공동구매 매출을 내되 CS와 수익성 악화를 막는 전환 허브

## 10.2 필수 필드
- `offer_id`
- `offer_name`
- `creator_id`
- `campaign_period`
- `price_regular`
- `price_offer`
- `bundle_contents`
- `fit_summary`
- `not_fit_summary`
- `creator_proof_assets`
- `faq_ids`
- `shipping_policy_id`
- `return_policy_id`
- `countdown_end_at`
- `cta_url`

## 10.3 필수 섹션
1. 오늘 제안 한 줄
2. 혜택 설명
3. 가격/구성 비교
4. fit / not-fit
5. creator proof
6. review / UGC strip
7. FAQ
8. 배송/교환/환불
9. urgency / countdown
10. CTA

## 10.4 승인 체크
- [ ] 정책 블록 존재
- [ ] FAQ 존재
- [ ] creator proof 존재
- [ ] 가격 비교 존재
- [ ] fit / not-fit 존재
- [ ] CTA 명확

---

## 11. DM 연동 플로우

## 11.1 목표
DM을 단순 문의함이 아니라 **고품질 리드 분기기**로 운영

## 11.2 기본 플로우
```text
SNS 콘텐츠 클릭
→ Creator / Offer / Product / Topic 랜딩
→ "DM으로 물어보기" CTA
→ Instagram DM / Kakao 진입
→ 자동응답 또는 상담 스크립트
→ FAQ / Product / Offer / Policy 링크 제공
→ 장바구니 / 구매 / 알림신청 / 상담으로 전환
```

## 11.3 DM 분기 시나리오
### 시나리오 A. 구매 전 질문
- 제품 추천 필요
- 성분/피부 타입 질문
- 사용법 질문
- 공구/혜택 질문
- 배송/환불 질문

### 시나리오 B. 공동구매 질문
- 공구 마감
- 구성 차이
- 일반 구매와 차이
- 정책 확인

### 시나리오 C. 구매 후 질문
- 사용 순서
- 트러블/민감 반응
- 교환/환불
- 재구매

## 11.4 DM용 필수 응답 링크
DM 운영자는 아래 링크를 즉시 보낼 수 있어야 한다.

- Product Detail
- Topic Hub
- FAQ
- Compare
- Offer Landing
- Shipping Policy
- Return Policy
- Contact / Support

## 11.5 DM 운영 메트릭
- DM 시작률
- DM 응답 시간
- DM → Product click-through
- DM → Purchase conversion
- DM → Support escalation rate

---

## 12. CMS 모델

## 12.1 필수 엔티티
- Brand
- Product
- Bundle
- Topic
- Question
- FAQ
- Review
- Creator
- Offer
- Portfolio / Use Case
- Visual Asset
- Policy
- CTA / Form

## 12.2 Product 필드
- `product_id`
- `name`
- `one_liner`
- `fit_summary`
- `not_fit_summary`
- `benefits`
- `ingredients_or_key_points`
- `usage_guide`
- `faq_refs`
- `review_refs`
- `compare_refs`
- `topic_refs`
- `bundle_refs`
- `policy_refs`
- `cta`

## 12.3 Topic 필드
- `topic_id`
- `topic_name`
- `hero_copy`
- `problem_summary`
- `question_refs`
- `product_refs`
- `offer_refs`
- `review_refs`
- `guide_refs`
- `cta`

## 12.4 Creator 필드
- `creator_id`
- `creator_name`
- `handle`
- `platform`
- `bio_short`
- `proof_assets`
- `related_offers`
- `related_products`
- `landing_url`

## 12.5 Offer 필드
- `offer_id`
- `offer_type` (`jointbuy`, `launch`, `bundle`, `campaign`)
- `title`
- `summary`
- `creator_refs`
- `product_refs`
- `bundle_contents`
- `price_regular`
- `price_offer`
- `countdown_end_at`
- `faq_refs`
- `policy_refs`
- `cta`

## 12.6 Review 필드
- `review_id`
- `review_type` (`ugc`, `creator`, `customer`, `before_after`)
- `product_refs`
- `topic_refs`
- `creator_ref`
- `visual_assets`
- `summary`
- `quote`
- `cta`

---

## 13. 운영 루프

## 13.1 일간 운영
- creator별 세션 확인
- landing별 전환율 확인
- DM 질문 패턴 수집
- 공동구매 CS 이슈 확인
- 댓글/DM/문의의 반복 질문 저장

## 13.2 주간 운영
- 어떤 Topic이 제일 잘 먹히는지 확인
- 어떤 creator가 고품질 리드를 주는지 확인
- 어떤 Offer Landing이 이익을 훼손하는지 확인
- FAQ/정책/비교 부족 구간 patch
- Product Page에 붙일 UGC 교체

## 13.3 월간 운영
- joint-buy 성과와 수익성 리뷰
- creator별 ROI 리뷰
- QIS / FAQ 업데이트
- Topic Hub patch 1~3개
- Offer template 개선
- Policy / Support friction 개선

---

## 14. 최소 구축 우선순위

## 14.1 1차 구축
- Product Detail 5개
- Topic Hub 3개
- Offer Landing 1개
- Creator Landing 2개
- FAQ 1개
- Review / UGC strip 1개

## 14.2 2차 구축
- Joint-buy 템플릿
- Gallery
- Compare
- Why Brand / Evidence
- DM / Kakao flow

## 14.3 3차 구축
- Review Hub
- Bundle automation
- Campaign-specific dashboards
- CRM lifecycle flows

---

## 15. 승인 기준

### 전체 운영체계 승인 조건
- [ ] SNS 링크가 홈으로만 가지 않는다
- [ ] creator / offer / topic / product 전용 랜딩이 있다
- [ ] Product Detail에 FAQ / review / policy가 있다
- [ ] 공동구매 랜딩에 FAQ / 정책 / urgency / CTA가 있다
- [ ] UTM 규칙이 문서화되었다
- [ ] creator별 성과가 측정된다
- [ ] DM 후속 링크 체계가 있다
- [ ] 매주 patch 가능한 운영 루프가 있다

---

## 16. Repo 배치 권장

### 문서
- `docs/specs/consumer-ai-homepage-sns-operating-spec.md`
- `docs/specs/utm-governance.md`
- `docs/specs/creator-landing-template.md`
- `docs/specs/jointbuy-landing-template.md`
- `docs/specs/dm-flow.md`

### 콘텐츠
- `content/products/`
- `content/topics/`
- `content/offers/`
- `content/creators/`
- `content/reviews/`
- `content/guides/`
- `content/policies/`

### 구현
- `src/routes/products/`
- `src/routes/topics/`
- `src/routes/offers/`
- `src/routes/creator/`
- `src/routes/reviews/`
- `src/routes/contact/dm/`
- `src/lib/utm/`
- `src/lib/analytics/`
- `src/lib/schema/`

---

## 17. 최종 정의

**소비재 브랜드용 AI홈페이지 + SNS 연동 운영체계의 목표는, SNS에서 발생한 관심을 문제-제품-증거-정책-행동 구조로 정리해 고품질 리드, 전환율, 수익성, 재구매율을 함께 높이는 것이다.**
