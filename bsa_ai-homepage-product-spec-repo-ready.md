---
title: "BSA Goldilocks-KR 기반 SME 브랜드 AI홈페이지 제품 스펙"
version: "1.1"
status: "repo-ready"
language: "ko"
intended_consumers:
  - "AI pair-coding agent"
  - "PM"
  - "Designer"
  - "Frontend engineer"
  - "CMS engineer"
  - "SEO/AEO operator"
source_model: "BSA Goldilocks-KR"
document_type: "master product spec"
last_updated: "2026-04-11"
---

# BSA Goldilocks-KR 기반 SME 브랜드 AI홈페이지 제품 스펙

## 0. 문서 목적

이 문서는 SME 브랜드의 공식 홈페이지를 단순 소개 사이트가 아니라 다음을 동시에 수행하는 **AI홈페이지 제품**으로 설계·구축·운영하기 위한 repo 기준 스펙이다.

- 브랜드 정본 저장소
- 검색/AI 질의 대응 허브
- 질문-답변-근거-경계-행동 기반 인터페이스
- 제품/서비스/포트폴리오/갤러리/자료실 허브
- 상담/문의/견적/제휴 전환 인터페이스
- 월간 관측 및 패치가 가능한 운영 시스템

이 문서는 **AI pair-coding agent가 repo 안에서 참조하기 좋은 형태**를 목표로 하며, 구현 세부는 프론트엔드/백엔드/CMS/콘텐츠 운영자가 분담할 수 있도록 작성한다.

---

## 1. 제품 정의

### 1.1 제품 한 줄 정의
**SME 브랜드 AI홈페이지**는 중소브랜드가 자사 웹사이트를 질문-답변-근거-경계-행동 중심의 공식 정본이자 SEO/AEO/GEO 대응 허브로 운영하도록 만드는 표준 제품이다.

### 1.2 해결하려는 문제
기존 SME 홈페이지는 보통 아래 문제를 가진다.

1. 브랜드 정체가 약하다.
2. 제품/서비스를 나열하지만 누구에게 맞는지 약하다.
3. 근거와 claim, 경계가 흩어져 있다.
4. 검색/AI/세일즈/문의에 쓰는 메시지가 일관되지 않다.
5. 월 단위 AI 관측과 수정 루프가 없다.

### 1.3 제품 가설
브랜드가 먼저 **진실 구조**, **질문 자산**, **핵심 claim-proof-boundary**, **홈/답/증명/행동 표면**, **월간 관측/패치 루프**를 갖추면, 홈페이지는 단순 소개를 넘어 검색/AI/전환 허브가 된다.

---

## 2. 범위

### 2.1 포함 범위
- 브랜드 정본 체계
- 질문 자산 체계
- Claim-Proof-Boundary 체계
- 정보구조(IA)와 GNB
- Topic / Question / Product / Portfolio / Gallery / Evidence 허브
- 페이지 패밀리
- CMS 데이터 모델
- site knowledge graph / JSON-LD 가이드
- 운영 SOP
- KPI
- 승인/게이트/체크리스트

### 2.2 비포함 범위
- 풀 ontology / 풀 KG / 그래프 DB
- AI 전용 파일 별도 구축
- 모든 page family를 한 번에 구현
- 과도한 자동화 팩토리
- 검색엔진별 해킹형 최적화
- 주간 대규모 benchmark 운영

---

## 3. 핵심 원칙

### 3.1 Truth-first
브랜드는 먼저 **무엇을 말할 수 있고 무엇을 말하면 안 되는지** 잠근다.

### 3.2 Answer-first
홈페이지의 중심은 제품 나열이 아니라 **질문에 대한 짧고 명확한 답**이다.

### 3.3 Proof-always-visible
핵심 답변에는 proof / reviewer / boundary / updated 정보가 함께 보여야 한다.

### 3.4 Boundary-explicit
민감 도메인일수록 “우리는 어디까지 하고 어디서 멈추는가”를 분명히 보여준다.

### 3.5 Question-capital driven
FAQ 양산이 아니라 **Top 30~50 질문 장면**을 관리한다.

### 3.6 Goldilocks delivery
처음부터 거대한 플랫폼을 만들지 않고, 90일 안에 돌아가는 최소 구조를 먼저 구축한다.

---

## 4. 타깃 사용자

### 4.1 비즈니스 오너
- 대표
- 브랜드 책임자
- 마케팅 리드
- 사업개발 리드

### 4.2 외부 방문자
- 검색 유입 사용자
- AI 검색/요약에서 링크로 들어온 사용자
- 비교 검토 단계의 잠재고객
- 문의/상담 전 단계 사용자
- 파트너/투자/유통/채용 이해관계자

### 4.3 내부 운영자
- 콘텐츠 운영자
- SEO/AEO 담당자
- 디자이너
- 퍼블리셔
- 프론트엔드 엔지니어
- CMS 엔지니어
- reviewer / 자문 전문가

---

## 5. 제품 목표

### 5.1 핵심 목표
1. 브랜드 정체를 분명히 한다.
2. 핵심 질문에 짧고 검증 가능한 답을 제공한다.
3. proof, reviewer, boundary를 가시화한다.
4. 질문 유입을 Topic/Question 구조로 흡수한다.
5. 제품/서비스/포트폴리오/갤러리/자료실을 문제 중심으로 연결한다.
6. 상담/문의/견적 같은 행동을 readiness 기반으로 유도한다.
7. 월 1회 AI 관측과 패치가 가능하도록 만든다.

### 5.2 성공 조건
- Home / What We Solve / Products(or Services) / Why Us / About / Contact 존재
- Answer Page 5개 이상
- Topic Hub 2개 이상
- Product/Service 상세 존재
- Portfolio 3개 이상 또는 equivalent case asset
- proof/reviewer/boundary가 보이는 trust 구조
- 월간 AI 관측 루프 가능

---

## 6. 상위 아키텍처

본 제품은 3개의 축으로 설계한다.

### 6.1 문제/질문 축
- What We Solve
- Topic Hub
- Question Hub
- Answer Pages
- Compare / FAQ / Guide

### 6.2 오퍼/상업 축
- Products / Solutions / Services
- Category Pages
- Product / Service Detail
- Pricing / RFQ / 구매/문의 CTA

### 6.3 증거/신뢰 축
- Portfolio
- Gallery
- Why Us
- Evidence Hub
- Founder / Expert Profiles
- Reviews / Certifications / Methods

---

## 7. GNB 스펙

### 7.1 권장 GNB
- Home
- What We Solve
- Products / Solutions / Services
- Portfolio
- Gallery
- Why Us
- Insights / Resources
- About
- Consultation / Contact

### 7.2 GNB rationale
GNB는 조직도 기준이 아니라 사용자 질문 흐름 기준으로 도출한다.

사용자 흐름:
1. 이 브랜드가 무엇인지 본다.
2. 내 문제를 다루는지 본다.
3. 실제로 무엇을 제공하는지 본다.
4. 무엇을 해냈는지 본다.
5. 왜 믿을 수 있는지 본다.
6. 더 읽거나 문의한다.

### 7.3 헤더 정책
- 우측 상단 sticky CTA 필수
- 모바일에서는 1-depth 우선
- 2-depth 드롭다운 허용: What We Solve / Products / Portfolio
- About / Why Us / Consultation은 1-click 유지

---

## 8. 전체 IA / 사이트맵

```text
/
├─ /what-we-solve/
│  ├─ /topics/
│  │  └─ /topics/{topic-slug}/
│  ├─ /questions/
│  │  ├─ /questions/{cluster-slug}/
│  │  └─ /questions/{answer-slug}/
│  ├─ /compare/
│  └─ /faq/
│
├─ /products/ | /solutions/ | /services/
│  ├─ /{category-slug}/
│  └─ /{detail-slug}/
│
├─ /portfolio/
│  ├─ /{industry-slug}/
│  └─ /{case-slug}/
│
├─ /gallery/
│  ├─ /{theme-slug}/
│  └─ /{asset-slug}/
│
├─ /why-us/
│  ├─ /evidence/
│  │  └─ /evidence/{evidence-slug}/
│  ├─ /certifications/
│  ├─ /reviews/
│  └─ /methods/
│
├─ /insights/
│  ├─ /insights/{article-slug}/
│  ├─ /stories/{story-slug}/
│  ├─ /guides/{guide-slug}/
│  └─ /news/
│
├─ /about/
│  ├─ /about/{founder-or-expert-slug}/
│  └─ /partners/
│
├─ /consultation/
│  ├─ /contact/
│  ├─ /inquiry/
│  ├─ /partnerships/
│  └─ /request-quote/
│
└─ /legal/
   ├─ /privacy-policy/
   ├─ /terms/
   ├─ /disclaimer/
   └─ /editorial-policy/
```

---

## 9. 페이지 패밀리 스펙

### 9.1 Home
#### 목적
브랜드 정체를 3초 안에 이해시키고, 대표 문제/오퍼/proof/CTA를 한 흐름으로 전달한다.

#### 필수 섹션
- Hero Question
- Short Answer
- Proof Signal
- 대표 Topic
- 대표 Product/Service
- 대표 Portfolio
- 대표 Gallery
- Trust Strip
- CTA Stack

#### 금지
- 제품 카드만 전면 배치
- 근거 없는 “최고/프리미엄” 표현
- buy-only CTA

#### 승인 체크
- [ ] 질문형 헤드라인
- [ ] short answer 존재
- [ ] proof signal 존재
- [ ] CTA 존재
- [ ] do-not-misread guard 존재

### 9.2 What We Solve
#### 목적
문제/질문 중심 허브의 상위 랜딩

#### 필수 섹션
- Topic Entry Grid
- Question Cluster
- Problem Pattern Cards
- Compare / FAQ 진입
- 대표 CTA

### 9.3 Topic Hub
#### 목적
하나의 큰 주제 아래 질문, 답변, 오퍼, proof, 사례, 행동을 묶는 중간 허브

#### 필수 섹션
- Topic Hero
- 핵심 질문 6~12개
- Featured Answers 2~4개
- Related Product/Service
- Related Portfolio/Gallery
- Related Evidence
- CTA

#### 승인 체크
- [ ] 질문 목록 있음
- [ ] answer preview 있음
- [ ] related offer 있음
- [ ] related proof 있음
- [ ] CTA 있음

### 9.4 Question Hub / Answer Page
#### 목적
개별 질문을 닫고 다음 행동으로 연결

#### 필수 섹션
- canonical question
- short answer
- expanded answer
- proof
- boundary
- next step
- related offer
- related evidence

#### 승인 체크
- [ ] short answer-first
- [ ] proof 없음 상태 금지
- [ ] boundary 없음 상태 금지
- [ ] next step 존재

### 9.5 Products / Solutions / Services
#### 목적
브랜드가 실제로 제공하는 오퍼를 설명

#### 필수 섹션
- 누구를 위한가
- 어떤 문제를 해결하는가
- 범위 / spec / 구성
- proof
- fit / not-fit
- 관련 질문
- CTA

### 9.6 Portfolio
#### 목적
우리가 실제로 무엇을 해냈는지 보여주는 사례 허브

#### 필수 섹션
- 프로젝트 개요
- 문제 정의
- 접근 방식
- 결과
- related offer
- related evidence
- visual proof
- CTA

### 9.7 Gallery
#### 목적
사진, 결과물, 현장, before/after, 프로세스 등 시각 proof 허브

#### 필수 섹션
- visual asset
- context caption
- related case
- related question
- related offer

### 9.8 Why Us
#### 목적
신뢰와 근거를 집약해 보여주는 허브

#### 필수 섹션
- why trust us
- reviewer
- evidence type
- boundaries / caution
- updatedAt
- related claims

### 9.9 Insights / Resources
#### 목적
SEO/AEO/GEO용 thought leadership 및 맥락 강화

#### 하위 패밀리
- Insight
- Story
- Guide
- News
- Compare
- FAQ

### 9.10 About
#### 목적
브랜드와 인물/주체 레이어 설명

#### 필수 섹션
- Brand Story
- Founder / Expert Profile
- Mission / Vision / Values
- Authored / Reviewed Content
- Partners

### 9.11 Consultation / Contact
#### 목적
질문 해결 후 무리 없는 행동 유도

#### 필수 섹션
- readiness condition
- fit / not-fit
- inquiry wizard
- caution
- next step

---

## 10. 내비게이션 시스템

### 10.1 글로벌 내비게이션
- GNB + sticky CTA

### 10.2 로컬 내비게이션
긴 허브 페이지는 section jump tab 사용

예시:
- 핵심 질문
- 대표 답변
- 관련 오퍼
- 사례
- 근거
- 상담

### 10.3 관계형 내비게이션
모든 핵심 페이지는 아래 중 최소 3개 이상을 연결해야 한다.

- related questions
- related products/services
- related portfolio
- related gallery
- related evidence
- related profiles
- CTA

---

## 11. UX 플로우

### 11.1 첫 방문자 플로우
Home → What We Solve → 관련 Product/Service → Why Us → Consultation

### 11.2 비교/검토 플로우
Question Hub → Answer Page → Compare → Evidence → Consultation

### 11.3 신뢰 검증 플로우
Why Us → Profile → Portfolio/Story → Evidence → Contact

### 11.4 급한 실행 플로우
Home Hero → Topic Hub → Service Detail → Readiness Checklist → Consultation

---

## 12. 컴포넌트 시스템

### 12.1 Identity Components
- Hero Question Strip
- Brand One-liner Block
- Philosophy Panel
- Do-not-misread Guard
- Signature Statement

### 12.2 Question Components
- Question Cluster Grid
- Canonical Question Card
- Problem Pattern Card
- Scenario Tabs
- Readiness Diagnostic Card

### 12.3 Answer Components
- Short Answer Block
- Expanded Answer Section
- Answer Meta Bar
- Related Question Links
- Next Step Strip

### 12.4 Proof / Trust Components
- Proof Signal Cluster
- Case Snapshot Card
- Evidence Ledger Preview
- Reviewer Card
- Core Values Card
- Trust Block

### 12.5 Boundary Components
- Boundary Callout
- Scope In / Scope Out
- Caution Note
- Compliance Note

### 12.6 Service / Product Components
- Product/Service Card
- Product/Service Hero
- Deliverables List
- Process Stepper
- Scope Matrix
- Related Evidence Block
- Related Questions Block
- Compare Table

### 12.7 Action Components
- Consultation CTA Stack
- Fit / Not-fit Block
- Project Type Selector
- Inquiry Wizard
- Expected Process Strip
- Readiness Checklist

### 12.8 Portfolio / Gallery Components
- Portfolio Card
- Outcome Panel
- Problem / Approach / Result Block
- Gallery Grid
- Lightbox Viewer
- Before/After Slider
- Visual Proof Strip

---

## 13. Core Data Model / CMS Spec

### 13.1 필수 엔티티
- Brand
- Person
- Product / Solution / Service
- Topic
- Question
- Claim
- Evidence
- Portfolio Case
- Visual Asset
- Article / Story / Guide
- CTA / Form

### 13.2 공통 필드
- `id`
- `type`
- `name`
- `summary`
- `canonical_url`
- `owner`
- `reviewer`
- `updated_at`
- `status`
- `boundary_note`
- `related_entities`

### 13.3 Truth Sheet 필드
- brand definition
- category definition
- primary problem
- core audience
- desired perception
- do-not-misread
- offer
- RTB
- reviewer
- prohibited claim
- boundary
- CTA

### 13.4 QIS Lite 필드
- scene_id
- canonical_question
- query_variants
- intent
- scenario
- persona_origin
- related_offer
- risk_level
- required_surface

### 13.5 Claim-Proof-Boundary 필드
- claim_id
- claim_text
- claim_type
- proof
- boundary
- owner
- reviewer
- allowed_surface
- status

### 13.6 Product / Service 필드
- id
- name
- one_liner
- target_audience
- problems_solved
- scope_in
- scope_out
- deliverables
- proof_refs
- related_questions
- related_topics
- CTA

### 13.7 Topic 필드
- id
- topic_name
- one_liner
- hero_copy
- related_questions
- related_answers
- related_products_services
- related_portfolio
- related_gallery
- related_evidence
- CTA

### 13.8 Portfolio 필드
- id
- title
- client_or_context
- challenge
- approach
- outcome
- related_offer
- related_evidence
- visual_assets
- CTA

### 13.9 Evidence 필드
- id
- title
- evidence_type
- what_it_proves
- summary
- claim_refs
- service_refs
- author
- reviewer
- updated_at
- disclosure_level
- boundary_note

---

## 14. Schema / Semantic Spec

### 14.1 필수 Schema
- `Organization`
- `ProfilePage + Person`
- `Service`
- `BreadcrumbList`

### 14.2 허브용 Schema
- `CollectionPage`
- `ItemList`

### 14.3 콘텐츠용 Schema
- `Article`
- `FAQPage`
- `HowTo` (필요 시)

### 14.4 시각 자산용 Schema
- `ImageObject`

### 14.5 적용 원칙
- 구조화데이터는 가시 텍스트와 일치해야 한다
- 페이지별 main entity 중심으로 적용한다
- 초기에는 site-level JSON-LD와 고정 `@id` 기반의 lite site KG만 운영한다
- AI 전용 파일/별도 schema 낭비를 금지한다

---

## 15. Site Knowledge Graph Spec

### 15.1 정의
site knowledge graph는 별도 AI 파일이 아니라, 사이트 내부 핵심 엔티티와 관계를 고정 URL, `@id`, JSON-LD `@graph`로 일관되게 표현하는 구조다.

### 15.2 핵심 노드
- Organization
- Person
- Product / Service
- Topic
- Question
- Evidence
- Portfolio Case
- Visual Asset
- CTA

### 15.3 삽입 원칙
- Home: 작은 마스터 그래프
- Profile Page: `ProfilePage + Person`
- Product/Service Detail: `Service`
- Hub Pages: `CollectionPage + ItemList`
- Content: `Article`
- FAQ: `FAQPage`
- 모든 주요 페이지: `BreadcrumbList`

### 15.4 위치
- 우선 `head`
- 필요 시 `body`
- 페이지별 main entity 중심 삽입

---

## 16. SEO / AEO / GEO Requirements

### 16.1 SEO
- 핵심 질문별 landing page 확보
- Topic Hub ↔ Answer ↔ Offer ↔ Proof internal linking
- title/meta 표준화
- Product/Portfolio/Gallery의 long-tail 대응

### 16.2 AEO
- canonical question 명확화
- short answer-first
- reviewer / proof / boundary 가시화
- FAQ / Guide / Compare 확장
- sameAs / actor profile 연동

### 16.3 GEO
- Google Business / Merchant Center / Naver 정합성
- 로컬 정보 최신화
- 브랜드/프로필/문의 정보 일관화

---

## 17. 운영 SOP

### 17.1 90일 구축
#### 0~30일
- Truth Sheet
- Claim-Proof-Boundary
- Home
- Why Us
- Contact 초안

#### 31~60일
- QIS Lite 30개
- Answer Page 5개
- Products/Services 허브
- Topic Hub 2개

#### 61~90일
- Persona Observatory Lite
- Patch 1차
- Portfolio 허브
- Gallery 허브
- FAQ / Compare / Guide 1개 이상

### 17.2 월간 루프
- Week 1: Truth Review
- Week 2: AI Observation
- Week 3: Surface Patch 1~3개
- Week 4: 재관측 및 backlog 정리

### 17.3 분기 루프
- QIS Refresh
- stale content 정리
- proof 갱신
- Compare / Guide / Portfolio 확장 여부 판단

---

## 18. KPI

### 핵심 KPI
- Identity Clarity
- Proof Visibility
- Fit Clarity
- Action Appropriateness
- AI Red-Flag Count

### 선택 KPI
- Answer Page impressions / clicks
- consultation completion rate
- portfolio engagement
- evidence page engagement
- topic hub CTR

---

## 19. Acceptance Criteria

필수 완료 조건:

- [ ] Truth / QIS / CPB 존재
- [ ] Home / What We Solve / Products(or Services) / Why Us / About / Contact 존재
- [ ] Answer Page 5개 이상
- [ ] proof/reviewer/boundary가 보이는 trust 구조
- [ ] CTA가 readiness 기반
- [ ] 월간 AI observation 가능

권장 완료 조건:

- [ ] Topic Hub 2개 이상
- [ ] Portfolio case 3개 이상
- [ ] Gallery cluster 1개 이상
- [ ] Evidence page 3개 이상
- [ ] Founder / Expert profile 존재

---

## 20. Repo 배치 권장

### 20.1 문서 파일 배치
- `docs/specs/ai-homepage-product-spec.md`
- `docs/specs/site-map-v2.md`
- `docs/specs/cms-model.md`
- `docs/specs/schema-map.md`
- `docs/specs/editorial-governance.md`

### 20.2 콘텐츠 운영 파일 배치
- `content/topics/`
- `content/questions/`
- `content/products/`
- `content/portfolio/`
- `content/evidence/`
- `content/galleries/`
- `content/insights/`

### 20.3 JSON-LD 템플릿
- `src/lib/schema/organization.ts`
- `src/lib/schema/profile.ts`
- `src/lib/schema/service.ts`
- `src/lib/schema/collection-page.ts`
- `src/lib/schema/article.ts`
- `src/lib/schema/faq.ts`
- `src/lib/schema/breadcrumb.ts`

---

## 21. Open Questions

1. 업종별 GNB를 분기할 것인가, 공통 GNB를 유지할 것인가?
2. Product / Service / Solution 용어를 브랜드별로 어떻게 매핑할 것인가?
3. Evidence 공개 수준을 CMS에서 어떻게 제어할 것인가?
4. Portfolio와 Story를 하나의 모델로 볼 것인가, 별도로 분리할 것인가?
5. Gallery를 독립 허브로 둘 것인가, Portfolio 내부로 둘 것인가?

---

## 22. 최종 한 줄 정의

**이 제품 스펙의 목표는, SME 브랜드가 자사 웹사이트를 질문-답변-근거-경계-행동 중심의 공식 정본이자 검색/AI/전환 허브로 운영하도록 만드는 것이다.**
