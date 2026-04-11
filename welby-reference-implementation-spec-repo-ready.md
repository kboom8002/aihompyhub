---
title: "Welby 전문가/컨설팅형 AI홈페이지 Reference Implementation Spec"
version: "1.0"
status: "repo-ready"
language: "ko"
document_type: "reference implementation spec + content writing guide"
intended_consumers:
  - "AI pair-coding agent"
  - "PM"
  - "Brand strategist"
  - "Content lead"
  - "Designer"
  - "Frontend engineer"
  - "CMS engineer"
  - "SEO/AEO operator"
brand: "Welby"
framework_base: "BSA Goldilocks-KR"
last_updated: "2026-04-11"
---

# Welby 전문가/컨설팅형 AI홈페이지 Reference Implementation Spec

## 0. 문서 목적

이 문서는 **Welby**를 `전문가/컨설팅형 AI홈페이지`의 **reference implementation**으로 구현하기 위한 상세 명세다.

문서 범위는 다음을 포함한다.

- 브랜드/포지셔닝 정의
- 정보구조(IA) 및 GNB
- 페이지 패밀리 상세 명세
- 컴포넌트 체계
- CMS 및 콘텐츠 객체 모델
- Schema / site knowledge graph 적용 기준
- 콘텐츠 포맷별 작성 가이드
- 운영 루프와 KPI
- 구현 우선순위와 승인 기준

본 문서는 사람 설명용 제안서가 아니라, **repo 안에서 AI pair-coding agent가 참고할 수 있는 구현 기준 문서**를 목표로 한다.

---

## 1. Reference Implementation 정의

### 1.1 한 줄 정의
Welby는 **메디컬의 신뢰와 웰니스의 감성적 경험을 운영 시스템으로 연결해, 클리닉·웰니스·리조트 프로젝트를 런칭 가능한 구조로 만드는 전문가/컨설팅형 브랜드**로 구현한다.

### 1.2 사이트의 핵심 역할
Welby AI홈페이지는 다음 5가지를 동시에 수행해야 한다.

1. **브랜드 정본**: Welby가 무엇을 하는 브랜드인지 잠근다.
2. **질문 허브**: 검색/AI/소개 유입 방문자의 질문을 답한다.
3. **신뢰 허브**: 경력, 프로젝트, 운영 자산, reviewer, boundary를 보여준다.
4. **오퍼 허브**: 6개 서비스와 5단계 컨설팅을 이해시키고 적합성을 판단하게 한다.
5. **행동 허브**: 상담보다 한 단계 앞선 `프로젝트 진단 요청` 중심의 전환을 만든다.

### 1.3 제품 철학
Welby 사이트는 화려한 이미지 중심 사이트가 아니라 **질문 → 짧은 답 → 근거 → 경계 → 다음 행동** 구조로 읽히는 사이트여야 한다.

---

## 2. 브랜드 기준 정의

## 2.1 브랜드 카테고리
- Primary Category: Medical Wellness Consulting / Clinic Launch & Operations / Wellness Resort Advisory
- Site Family: Expert / Consulting / Premium B2B-B2B2C Hybrid

## 2.2 핵심 가치 제안
Welby는 다음 문제를 해결한다.

- 좋은 프로젝트 아이디어가 있어도 운영 구조가 없어 런칭이 불안정한 문제
- 서비스, 교육, QA, CRM, KPI, 세일즈 구조가 분리돼 성과가 재현되지 않는 문제
- 브랜드/운영/고객경험이 따로 놀아 프리미엄 경험이 지속되지 않는 문제
- 메디컬과 웰니스, 리조트 사이의 기획·브랜딩·운영 언어가 통합되지 않는 문제

## 2.3 브랜드 핵심 문장
다음 3문장은 사이트 전반에서 반복적으로 살아야 한다.

1. **웰비는 메디컬의 신뢰와 웰니스의 감성을 운영 시스템으로 연결합니다.**
2. **웰비는 클리닉·웰니스·리조트 프로젝트를 런칭 가능한 구조로 만드는 파트너입니다.**
3. **웰비는 의료행위와 진료를 수행하지 않으며, 비의료 영역의 운영·서비스·고객경험·브랜딩 및 성과관리 체계를 중심으로 함께합니다.**

## 2.4 Brand Truth
### 우리는 무엇을 하는가
- 메디컬·웰니스 전략
- 센터 운영(비의료)
- 서비스 설계
- 클리닉 런칭·세팅 PM
- VIP CX · CS · CRM 설계
- 브랜드 포지셔닝 / 패키징 / 성장 전략
- 웰니스 리조트 기획 자문
- 유통·제휴 파트너십 연결

### 우리는 무엇이 아닌가
- 의료행위 수행 주체가 아니다
- 진료를 대체하는 브랜드가 아니다
- 단기 광고 대행만 수행하는 회사가 아니다
- 결과 보장을 약속하는 브랜드가 아니다

## 2.5 핵심 신뢰 신호
- 메디컬·웰니스 업계 25년 경력
- 글로벌 럭셔리 웰니스 브랜드 7년 경험
- 국내 대표 안티에이징 클리닉 1년 내 매출 4배 성장 사례
- 중국 성도 5성급 호텔 내 2,000평 클리닉 오픈 준비 총괄
- 발리 NULOOK 글로벌 런칭 GM 경험
- 클리닉 운영 / CRM / SOP / MOT / KPI 및 웰니스 리조트 분석 자산 보유

## 2.6 브랜드 톤 & 보이스
### 핵심 인상
- 노련함
- 진실성
- 구조감
- 프리미엄
- 과장 없는 자신감
- 실행 가능한 현실감

### 금지 톤
- 과장형 성공 약속
- 의료효능 암시
- 불필요하게 차갑고 권위적인 말투
- 광고 대행사식 자극 문구
- 감성만 있고 구조가 없는 카피

---

## 3. 사용자 및 유스케이스

## 3.1 핵심 사용자 그룹
### U1. 클리닉 오너 / 운영 책임자
- 새 오픈 또는 리뉴얼을 준비
- 운영 구조, 상담, CX, CRM, QA, KPI 정비가 필요

### U2. 웰니스/리조트 개발 기획자
- 운영 가능한 컨셉과 서비스 구조 설계가 필요
- 브랜딩과 운영 언어를 통합하고 싶음

### U3. 브랜드 / 프로젝트 의사결정자
- 마케팅보다 먼저 구조를 잡고 싶음
- “우리 프로젝트에 Welby가 맞는가”를 빠르게 판단하고 싶음

### U4. 파트너 / 유통 / 제휴 관계자
- Welby의 신뢰도와 역할 범위를 검증하고 싶음

## 3.2 대표 탐색 질문
- Welby는 정확히 어떤 회사인가?
- Welby는 누구를 돕는가?
- Welby는 일반 마케팅 대행과 무엇이 다른가?
- Welby는 어디까지 맡는가?
- 왜 김연진 대표를 신뢰할 수 있는가?
- 웰비와 일하면 어떤 구조가 만들어지는가?
- 의료행위와 Welby의 역할 경계는 어디인가?
- 지금 내 프로젝트는 상담이 필요한 단계인가?

---

## 4. 제품 목표

### 4.1 비즈니스 목표
- 고품질 상담 리드 증가
- 프로젝트 진단 요청 전환율 향상
- 브랜드 신뢰 형성
- 검색/AI 질의 장면에서의 정체성 왜곡 최소화
- 파트너/클라이언트 검토 단계 설득력 강화

### 4.2 사용자 경험 목표
- 3초 안에 브랜드 정체 이해
- 30초 안에 “내게 맞는지” 판단 가능
- 2분 안에 신뢰/근거/경계 확인 가능
- 질문 단위 탐색이 쉬움
- 무리한 문의 유도가 아니라 적합한 next step 제시

---

## 5. 상위 IA 및 GNB

## 5.1 권장 GNB
- Home
- What We Solve
- Services
- Why Welby
- Insights
- About
- Consultation

## 5.2 GNB rationale
Welby는 전문가/컨설팅형 브랜드이므로 GNB는 내부 조직도가 아니라 **문제→해법→신뢰→인물→행동** 순서로 설계한다.

사용자 흐름:
1. 이 브랜드가 무엇을 하는지 본다.
2. 내 문제를 다루는지 본다.
3. 어떤 서비스/방법론이 있는지 본다.
4. 왜 믿을 수 있는지 본다.
5. 누가 하는지 본다.
6. 상담/진단 요청 여부를 결정한다.

## 5.3 전체 사이트맵

```text
/
├─ /what-we-solve/
│  ├─ /topics/
│  │  ├─ /topics/medical-wellness-strategy/
│  │  ├─ /topics/clinic-launch-operations/
│  │  ├─ /topics/vip-cx-crm/
│  │  ├─ /topics/branding-growth/
│  │  ├─ /topics/wellness-resort-planning/
│  │  └─ /topics/distribution-partnerships/
│  ├─ /questions/
│  │  ├─ /questions/what-is-welby/
│  │  ├─ /questions/is-welby-medical/
│  │  ├─ /questions/what-does-welby-solve/
│  │  ├─ /questions/how-is-welby-different/
│  │  ├─ /questions/where-does-welby-help/
│  │  └─ /questions/what-to-prepare-before-consultation/
│  ├─ /compare/
│  └─ /faq/
│
├─ /services/
│  ├─ /services/medical-wellness-consulting/
│  ├─ /services/clinic-launch-operations-pm/
│  ├─ /services/vip-cx-cs-crm/
│  ├─ /services/branding-growth-strategy/
│  ├─ /services/wellness-resort-planning-advisory/
│  └─ /services/distribution-partnerships/
│
├─ /why-welby/
│  ├─ /evidence/
│  │  ├─ /evidence/operating-manual-framework/
│  │  ├─ /evidence/crm-sop-kpi-system/
│  │  └─ /evidence/wellness-resort-analysis-report/
│  ├─ /methods/
│  ├─ /reviews/
│  └─ /certifications/
│
├─ /portfolio/
│  ├─ /portfolio/chengdu-clinic-launch/
│  ├─ /portfolio/nulook-bali-launch/
│  ├─ /portfolio/antiaging-clinic-growth/
│  └─ /portfolio/jeju-resort-planning/
│
├─ /gallery/
│  ├─ /gallery/operations-systems/
│  ├─ /gallery/launch-projects/
│  ├─ /gallery/service-blueprints/
│  └─ /gallery/resort-concepts/
│
├─ /insights/
│  ├─ /stories/{story-slug}/
│  ├─ /guides/{guide-slug}/
│  ├─ /insights/{article-slug}/
│  └─ /compare/{compare-slug}/
│
├─ /about/
│  ├─ /about/kim-yeonjin/
│  ├─ /partners/
│  └─ /brand-story/
│
├─ /consultation/
│  ├─ /contact/
│  ├─ /project-diagnostic/
│  ├─ /partnerships/
│  └─ /inquiry/
│
└─ /legal/
   ├─ /privacy-policy/
   ├─ /terms/
   ├─ /disclaimer/
   └─ /editorial-policy/
```

---

## 6. 페이지 패밀리 상세 명세

## 6.1 Home
### 목적
Welby의 정체, 문제 해결 범위, 신뢰 신호, 다음 행동을 첫 화면에서 전달한다.

### 필수 섹션
1. Hero Question Strip
2. Brand One-liner
3. Problem Pattern Cards
4. 5-Step Consulting Stepper
5. Services Snapshot
6. Proof Signal Cluster
7. Core Values / Philosophy
8. Do-not-misread Guard
9. CTA Stack

### 필수 CTA
- 프로젝트 진단 요청하기
- 서비스 보기
- Welby가 다루는 문제 보기

### 승인 기준
- [ ] Hero가 질문형이다
- [ ] Short answer가 있다
- [ ] proof signal이 있다
- [ ] boundary guard가 있다
- [ ] CTA가 있다

---

## 6.2 What We Solve
### 목적
사용자가 자신의 문제와 질문을 주제별로 탐색하도록 돕는다.

### 필수 섹션
1. Topic Entry Grid
2. Question Cluster Grid
3. Problem Pattern Cards
4. Compare / FAQ 진입
5. Related Services Strip
6. CTA

### 대표 카피 방향
- “이런 프로젝트가 특히 어렵습니다”
- “이런 상황에서 Welby가 도움이 됩니다”
- “이런 경우는 지금 맞지 않을 수 있습니다”

---

## 6.3 Topic Hub
### 목적
하나의 큰 주제 아래 질문, 답변, 서비스, 사례, 근거, 행동을 연결하는 허브

### 필수 섹션
1. Topic Hero
2. 핵심 질문 6~12개
3. Featured Answers 2~4개
4. Related Services
5. Related Portfolio / Story
6. Related Evidence
7. CTA

### 예시 토픽
- Clinic Launch & Operations
- VIP CX · CRM
- Wellness Resort Planning

### 승인 기준
- [ ] 질문 목록이 있다
- [ ] answer preview가 있다
- [ ] related service가 있다
- [ ] related proof가 있다
- [ ] CTA가 있다

---

## 6.4 Question Hub / Answer Page
### 목적
개별 질문을 명확히 닫고 관련 서비스/근거/행동으로 연결

### Answer Page 필수 구조
1. Canonical Question
2. Short Answer
3. Expanded Answer
4. Proof
5. Boundary
6. Next Step
7. Related Service
8. Related Evidence
9. Reviewer / Updated Meta

### 승인 기준
- [ ] 질문이 첫 화면에 보인다
- [ ] short answer가 먼저 보인다
- [ ] proof가 있다
- [ ] boundary가 있다
- [ ] next step이 있다

---

## 6.5 Services Hub
### 목적
Welby의 6개 서비스와 역할 범위를 구조적으로 설명

### 필수 섹션
1. Services Hero
2. Service Pillar Grid
3. 5-Step Process
4. Scope In / Scope Out Summary
5. Related Questions
6. CTA

---

## 6.6 Service Detail
### 목적
특정 서비스가 어떤 문제에 유효하고 어디까지 포함하는지 설명

### 필수 섹션
1. Service Hero
2. 누구를 위한 서비스인가
3. 어떤 문제를 해결하는가
4. Process
5. Deliverables
6. Scope In / Scope Out
7. Related Questions
8. Related Evidence
9. CTA

### 승인 기준
- [ ] fit audience가 있다
- [ ] scope in / out이 있다
- [ ] deliverables가 있다
- [ ] related questions가 있다
- [ ] CTA가 있다

---

## 6.7 Why Welby
### 목적
Welby를 신뢰할 수 있는 이유를 구조적으로 보여준다.

### 필수 섹션
1. Trust Hero
2. Proof Signal Cluster
3. Case Snapshot Cards
4. Evidence Ledger Preview
5. Core Values
6. Boundary / Caution
7. Reviewer / Profile Block
8. CTA

---

## 6.8 Evidence Hub
### 목적
운영 매뉴얼, CRM/SOP/KPI, 리조트 분석 리포트 등 근거 자산의 주소 체계 제공

### 필수 섹션
1. Evidence category list
2. Evidence cards
3. what it proves
4. related claims
5. related services
6. author / reviewer
7. disclosure / boundary

### Evidence Detail 필수 구조
- 자료명
- 자료 유형
- 무엇을 증명하는가
- 요약
- 관련 서비스
- 관련 질문
- 작성자 / 검수자
- 공개 범위
- 업데이트일
- 문의 CTA

---

## 6.9 Portfolio
### 목적
실제 프로젝트와 결과를 통해 Welby의 실무 역량을 입증

### 필수 섹션
1. 프로젝트 배경
2. 문제 정의
3. Welby 접근 방식
4. 구축된 시스템
5. 결과 / 증거
6. 관련 서비스
7. 관련 근거
8. CTA

---

## 6.10 Gallery
### 목적
프로세스, 운영 프레임워크, 현장, 서비스 구조, 다이어그램 등 시각 증거 제공

### 필수 섹션
1. Gallery grid
2. Context caption
3. related case
4. related service
5. related topic

---

## 6.11 Insights / Stories / Guides / Compare
### 목적
검색 유입과 thought leadership 강화

### 하위 패밀리
- Insight: 개념, 전략, 철학
- Story: 프로젝트/경험 서사
- Guide: how-to / framework
- Compare: 차이점과 선택 기준

---

## 6.12 About
### 목적
브랜드와 인물/주체 구조를 설명

### 필수 섹션
1. Founder Hero
2. Career Timeline
3. Philosophy
4. Mission / Vision / Values
5. Authored / Reviewed Content
6. Partners
7. CTA

---

## 6.13 Consultation
### 목적
상담보다 한 단계 앞선 `프로젝트 진단 요청` 중심의 전환 설계

### 필수 섹션
1. Consultation Hero
2. Fit / Not-fit
3. Project Type Selector
4. Readiness Checklist
5. Inquiry Wizard
6. Expected Process
7. Boundary Note

---

## 7. 컴포넌트 시스템

## 7.1 Identity Components
- Hero Question Strip
- Brand One-liner Block
- Philosophy Panel
- Do-not-misread Guard
- Signature Statement

## 7.2 Question Components
- Question Cluster Grid
- Canonical Question Card
- Problem Pattern Card
- Scenario Tabs
- Readiness Diagnostic Card

## 7.3 Answer Components
- Short Answer Block
- Expanded Answer Section
- Answer Meta Bar
- Related Question Links
- Next Step Strip

## 7.4 Proof / Trust Components
- Proof Signal Cluster
- Case Snapshot Card
- Evidence Ledger Preview
- Reviewer Card
- Core Values Card
- Trust Block

## 7.5 Boundary Components
- Boundary Callout
- Scope In / Scope Out Block
- Caution Note
- Compliance Note

## 7.6 Service Components
- Service Pillar Card
- Service Hero
- Deliverables List
- Process Stepper
- Scope Matrix
- Related Evidence Block
- Related Questions Block

## 7.7 Action Components
- Consultation CTA Stack
- Fit / Not-fit Block
- Project Type Selector
- Inquiry Wizard
- Expected Process Strip
- Readiness Checklist

## 7.8 Portfolio / Gallery Components
- Portfolio Card
- Outcome Panel
- Problem / Approach / Result Block
- Gallery Grid
- Lightbox Viewer
- Visual Proof Strip

---

## 8. CMS / 콘텐츠 객체 모델

## 8.1 필수 엔티티
- Brand
- Person
- Service
- Topic
- Question
- Claim
- Evidence
- Portfolio Case
- Visual Asset
- Article / Story / Guide / Compare
- CTA / Form

## 8.2 공통 필드
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

## 8.3 Service 필드
- `service_id`
- `service_name`
- `one_liner`
- `target_audience`
- `problems_solved`
- `scope_in`
- `scope_out`
- `deliverables`
- `process_steps`
- `proof_refs`
- `related_questions`
- `related_topics`
- `cta`

## 8.4 Topic 필드
- `topic_id`
- `topic_name`
- `hero_copy`
- `problem_summary`
- `question_refs`
- `answer_refs`
- `service_refs`
- `portfolio_refs`
- `gallery_refs`
- `evidence_refs`
- `cta`

## 8.5 Question 필드
- `question_id`
- `canonical_question`
- `query_variants`
- `intent`
- `scenario`
- `persona_origin`
- `risk_level`
- `required_surface`
- `short_answer`
- `expanded_answer`
- `proof_refs`
- `boundary_note`
- `next_step_cta`
- `related_service_refs`

## 8.6 Evidence 필드
- `evidence_id`
- `title`
- `evidence_type`
- `what_it_proves`
- `summary`
- `claim_refs`
- `service_refs`
- `question_refs`
- `author`
- `reviewer`
- `updated_at`
- `disclosure_level`
- `boundary_note`

## 8.7 Portfolio 필드
- `case_id`
- `title`
- `context`
- `challenge`
- `approach`
- `system_built`
- `outcome`
- `related_services`
- `related_evidence`
- `visual_assets`
- `cta`

## 8.8 Person 필드
- `person_id`
- `name`
- `role_type`
- `job_title`
- `bio_short`
- `bio_long`
- `same_as`
- `knows_about`
- `affiliation`
- `authored_content`
- `reviewed_content`
- `featured_projects`

---

## 9. Site Knowledge Graph / Schema

## 9.1 핵심 원칙
Welby의 site knowledge graph는 별도 AI 파일이 아니라, **페이지 내 JSON-LD + 고정 @id 체계**로 운영한다.

## 9.2 필수 스키마
- `Organization`
- `ProfilePage + Person`
- `Service`
- `CollectionPage`
- `ItemList`
- `Article`
- `FAQPage`
- `BreadcrumbList`

## 9.3 선택 스키마
- `HowTo`
- `ImageObject`

## 9.4 페이지별 스키마 적용
- Home: `Organization` + `WebSite`
- Founder Profile: `ProfilePage` + `Person`
- Service Detail: `Service` + `BreadcrumbList`
- Topic/Question/Evidence Hub: `CollectionPage` + `ItemList`
- Story/Guide/Insight: `Article`
- FAQ: `FAQPage`

---

## 10. 콘텐츠 포맷별 작성 가이드

## 10.1 Home Hero 작성 가이드
### 목적
Welby의 정체를 3초 안에 이해시키고, “무엇이 아닌가”까지 함께 잠그기

### 구조
- Hero Question
- Short Answer
- Proof Signal
- Do-not-misread Guard
- Primary CTA
- Secondary CTA

### 작성 규칙
- 질문형으로 시작한다
- 1~2문장 안에 역할과 결과를 같이 말한다
- “최고, 유일, 압도적” 표현을 피한다
- 비의료 경계를 숨기지 않는다

### 템플릿
```md
질문:
좋은 메디컬·웰니스 프로젝트는 왜 런칭 전부터 운영 구조가 달라야 할까요?

짧은 답:
웰비는 메디컬의 신뢰와 웰니스의 감성을 운영 시스템으로 연결해, 클리닉·웰니스·리조트 프로젝트를 런칭 가능한 구조로 완성하도록 돕습니다.

신뢰 신호:
25년 업력 · 국내외 프로젝트 · 운영 매뉴얼/CRM/QA/KPI 자산

경계:
웰비는 의료행위나 진료를 수행하지 않으며, 비의료 영역의 운영·서비스·고객경험·브랜딩 및 성과관리 체계를 중심으로 함께합니다.

CTA:
프로젝트 진단 요청하기
```

---

## 10.2 Service Detail 작성 가이드
### 목적
특정 서비스가 누구에게 어떤 방식으로 유효한지 설명

### 구조
- 한 줄 정의
- 누구를 위한 서비스인가
- 어떤 문제를 해결하는가
- process
- deliverables
- scope in / out
- related questions
- proof
- CTA

### 작성 규칙
- “서비스 설명”보다 “문제 해결 설명”을 먼저 둔다
- scope out을 반드시 명시한다
- 산출물(docs, system, process)을 보이게 쓴다

### 템플릿
```md
서비스명:
Clinic Launch & Operations PM

한 줄 정의:
클리닉이 오픈 이후에도 일관된 품질로 운영되도록, 비의료 영역의 런칭 구조와 운영 체계를 설계하는 서비스입니다.

누구를 위한가:
- 클리닉 오픈 준비 팀
- 운영 구조가 약한 리뉴얼 프로젝트
- VIP CX와 상담/CRM 체계가 필요한 팀

문제:
- 오픈은 되는데 운영이 불안정함
- 상담/서비스/교육/QA/KPI가 따로 움직임
- 런칭 후 경험 품질이 재현되지 않음

범위 포함:
- 운영 매뉴얼
- 상담 프로세스
- 교육/QA
- KPI/CRM
- 고객경험 설계

범위 제외:
- 의료행위
- 진료 자체 설계
- 임상적 판단
```

---

## 10.3 Topic Hub 작성 가이드
### 목적
하나의 주제 아래 질문, 답변, 서비스, 사례, 근거를 묶는다

### 구조
- topic hero
- 핵심 질문
- featured answers
- related services
- related proof
- related stories
- CTA

### 작성 규칙
- topic 이름은 서비스명이 아니라 사용자 문제 언어를 우선한다
- 질문 카드에는 1문장 answer preview를 붙인다
- 관련 서비스와 관련 proof를 반드시 같이 노출한다

### 템플릿
```md
토픽명:
클리닉 런칭·운영

한 줄 정의:
좋은 오픈은 공간 완성이 아니라 운영 가능한 구조가 완성된 상태입니다.

핵심 질문:
- 클리닉 런칭 전에 무엇을 먼저 구조화해야 하나?
- Welby는 런칭에서 어디까지 맡는가?
- 운영 매뉴얼은 왜 오픈 전에 있어야 하나?
- 상담 프로세스와 CRM은 언제 설계해야 하나?

관련 서비스:
- Clinic Launch & Operations PM
- VIP CX · CRM
- Medical Wellness Consulting

관련 근거:
- Chengdu launch case
- NULOOK Bali case
- 운영 매뉴얼 framework
```

---

## 10.4 Answer Page 작성 가이드
### 목적
개별 질문을 짧고 검증 가능하게 닫는다

### 구조
- canonical question
- short answer
- expanded answer
- proof
- boundary
- next step

### 작성 규칙
- 첫 문단에서 short answer를 끝낸다
- proof가 없으면 강한 claim을 쓰지 않는다
- boundary를 footnote가 아니라 가시 블록으로 둔다

### 템플릿
```md
질문:
Welby는 클리닉 런칭에서 어디까지 맡나요?

짧은 답:
Welby는 비의료 영역에서 운영 구조, 고객경험, 상담 프로세스, QA, KPI, 매뉴얼 체계를 설계합니다.

확장 답변:
프로젝트가 실제로 런칭 가능한 상태가 되려면 ...

근거:
- Chengdu clinic launch
- Bali NULOOK GM experience
- 운영 매뉴얼 / CRM / KPI 자산

경계:
의료행위, 진료, 임상적 판단은 의료진의 영역입니다.

다음 행동:
현재 프로젝트 단계에 맞는 진단 요청하기
```

---

## 10.5 Why Welby / Trust Block 작성 가이드
### 목적
신뢰를 구조적으로 보여준다

### 구조
- why trust us
- proof signal
- reviewer
- evidence type
- boundary / caution
- updatedAt
- CTA

### 작성 규칙
- 경력만 나열하지 않는다
- “왜 믿을 수 있는가”를 근거 구조로 보여준다
- updatedAt와 reviewer를 드러낸다

---

## 10.6 Story / Case 작성 가이드
### 목적
서사형 proof를 제공한다

### 구조
- context
- challenge
- Welby approach
- system built
- outcome
- what this proves
- related service

### 작성 규칙
- 단순 자랑글이 아니라 문제→접근→결과 구조
- outcome은 가능하면 정량/구조/프로세스 언어로 쓴다
- “그래서 이 사례가 무엇을 증명하는가”를 꼭 적는다

---

## 10.7 Evidence 작성 가이드
### 목적
운영 자산을 검색/AI/검토 가능한 형태로 요약한다

### 구조
- what it proves
- summary
- related claim
- related question
- author / reviewer
- updatedAt
- disclosure / boundary

### 작성 규칙
- 파일만 던지지 않는다
- 사용자에게 보이는 summary page를 먼저 만든다
- 공개 수준을 명시한다

---

## 10.8 Consultation 작성 가이드
### 목적
무리 없는 상담/진단 전환을 만든다

### 구조
- 누구에게 맞는가
- 누구에게 안 맞는가
- readiness checklist
- inquiry wizard
- 예상 프로세스
- boundary note

### 작성 규칙
- “바로 문의하세요”보다 “지금이 맞는 단계인지”를 먼저 점검한다
- fit / not-fit을 숨기지 않는다
- 프로젝트 진단형 CTA를 기본값으로 둔다

---

## 11. 운영 루프

## 11.1 월간 운영
- Week 1: Truth / Claim Review
- Week 2: AI Observation
- Week 3: Surface Patch 1~3개
- Week 4: 재관측 및 backlog 정리

## 11.2 분기 운영
- QIS Refresh
- stale content 정리
- proof 갱신
- story / guide / evidence 확장 판단

---

## 12. KPI

### 핵심 KPI
- Identity Clarity
- Proof Visibility
- Fit Clarity
- Action Appropriateness
- AI Red-Flag Count

### 선택 KPI
- topic hub CTR
- answer page engagement
- consultation completion rate
- evidence page engagement
- profile page engagement

---

## 13. 구현 우선순위

## Phase 1
- Home
- What We Solve
- Services
- Why Welby
- About
- Consultation

## Phase 2
- Topic Hub 3개
- Answer Page 6개
- Founder Profile
- Evidence Hub 3개

## Phase 3
- Portfolio 4개
- Gallery 2개
- Story / Guide / Compare
- Partnership 페이지

---

## 14. 승인 기준

### 전체 구현 완료 기준
- [ ] 핵심 GNB 완성
- [ ] Home / Services / Why Welby / About / Consultation 게시
- [ ] Topic Hub 3개 이상
- [ ] Answer Page 6개 이상
- [ ] Evidence Detail 3개 이상
- [ ] Portfolio 3개 이상
- [ ] Founder Profile 존재
- [ ] Schema 기본셋 적용
- [ ] 월간 운영 루프 정의 완료

---

## 15. Repo 배치 권장

### 문서
- `docs/specs/welby-reference-implementation-spec.md`
- `docs/specs/welby-ia-map.md`
- `docs/specs/welby-schema-map.md`
- `docs/specs/welby-cms-model.md`
- `docs/specs/welby-content-guides.md`

### 콘텐츠
- `content/topics/`
- `content/questions/`
- `content/services/`
- `content/evidence/`
- `content/portfolio/`
- `content/galleries/`
- `content/insights/`
- `content/about/`

### 구현
- `src/routes/topics/`
- `src/routes/questions/`
- `src/routes/services/`
- `src/routes/evidence/`
- `src/routes/portfolio/`
- `src/routes/gallery/`
- `src/routes/insights/`
- `src/routes/about/`
- `src/routes/consultation/`
- `src/lib/schema/`
- `src/lib/content-model/`

---

## 16. 최종 정의

**Welby AI홈페이지 reference implementation의 목표는, Welby를 단순 전문가 소개 사이트가 아니라 질문-답변-근거-경계-행동 중심의 전문가/컨설팅형 AI홈페이지로 구현하는 것이다.**
