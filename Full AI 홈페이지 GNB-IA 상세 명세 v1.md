---
title: Full AI 홈페이지 GNB/IA 상세 명세 v1
locale: ko-KR
status: draft_for_antigravity_reference
---

# Full AI 홈페이지 GNB/IA 상세 명세 v1

## 0. 문서 목적
이 문서는 한국 locale 기본 서비스 기준의 Full AI 홈페이지 정보 구조를 정의한다.  
목적은 Brand SSoT + Media SSoT + Answer Commerce가 하나의 통합 AI 홈페이지로 작동하도록,  
공개 홈페이지 GNB, 페이지 계층, 허브/상세 구조, 검색 구조, Trust 구조, 상호 연결 규칙을 표준화하는 것이다.

---

## 1. 상위 정의
### 1.1 Full AI 홈페이지란 무엇인가
- 인간 고객이 탐색·이해·비교·실행·구매할 수 있는 고객용 홈페이지
- 동시에 AI가 공식 정답 구조로 읽고 채택하기 쉬운 공식 Answer Hub
- Brand SSoT + Media SSoT + Answer Commerce가 통합된 이중 대응 웹사이트

### 1.2 핵심 운영 원칙
- 질문 자산 → 정본 → 측정 → 원인 → 조치
- Question-first
- Answer-first
- Graph, not tree
- Content is object-based, not page-based
- Search is a core feature
- Trust always visible
- Product는 merchandise가 아니라 실행 답안
- Compare는 first-class object
- Routine은 action 질문에서 product보다 상위

### 1.3 한국 locale 기본 전제
- GNB / UI label / CTA / trust 문구는 한글 우선
- 공개 탐색 경로는 한국어 사용자의 검색/비교/루틴 탐색 습관에 맞춘다
- 제품명보다 질문형 헤드라인을 우선한다
- 의료적 단정, 과장 효능 표현, 과한 구매 유도 문구를 피한다

---

## 2. Full AI 홈페이지 최상위 IA

## 2.1 공개 사이트 최상위 GNB
1. 홈
2. 고민별 솔루션
3. 공식 답변
4. 루틴
5. 비교
6. 제품·번들
7. 스토리·가이드·리뷰
8. 신뢰
9. 검색

## 2.2 유틸리티 내비게이션
- 내 루틴/리셋 찾기
- 상담·진단
- 브랜드 소개
- 리뷰어/근거 보기
- 언어·국가 선택
- 공지 / 이벤트
- 로그인(운영자/관리자용 분리)

## 2.3 정보 구조의 3대 축
### A. Brand SSoT 축
- 고민 허브
- 토픽 허브
- 공식 답변
- 비교
- 루틴
- Product Fit
- 제품
- 신뢰

### B. Media SSoT 축
- 스토리
- 가이드
- 리뷰/케이스
- 인사이트/트렌드
- 이벤트
- 시리즈

### C. Answer Commerce 축
- Product-as-Answer
- 번들/세트
- 상담 CTA
- 추천 레일
- 루틴 진입
- 비교 진입
- 검색/진단 진입

---

## 3. GNB별 상세 구조

## 3.1 홈
### 역할
- 전체 AI 홈페이지의 질문 허브이자 브랜드의 공식 정답 게이트웨이
- 대표 질문, 대표 Answer, 대표 Routine, 대표 Compare, 대표 Product Fit, Trust, Search를 한 화면에서 시작하게 한다

### 핵심 섹션
1. Hero Question Block
2. 대표 고민 / 토픽 진입
3. 대표 공식 답변
4. Product-as-Answer
5. 대표 루틴
6. 대표 비교
7. Trust Strip
8. Story / Review / Event Teaser
9. Reset Finder / Search Entry
10. CTA Block

### 필수 규칙
- 질문형 헤드라인이 제품명보다 먼저
- Trust strip은 첫 의미 있는 viewport 안에 노출
- product-first mall UI 금지
- compare / routine / trust가 hero 이후 빠르게 보여야 함

---

## 3.2 고민별 솔루션
### 역할
- 주요 Need / Concern / Topic Cluster별 진입 허브
- 사용자가 “내 고민에 맞는 정답”으로 들어가는 메인 허브

### 2차 IA
- 고민 허브 목록
- 고민별 대표 질문
- 고민별 대표 공식 답변
- 고민별 대표 루틴
- 고민별 대표 비교
- 고민별 대표 Product Fit
- 연관 고민 연결

### 페이지 타입
- 고민 허브 목록 페이지
- 개별 고민 허브 상세 페이지

---

## 3.3 공식 답변
### 역할
- 정답 본점 역할
- AI 채택성과 사용자 직답 경험을 동시에 담당

### 2차 IA
- 질문별 답변 목록
- 토픽별 답변 묶음
- 대표 FAQ형 Answer 허브
- 상세 Answer 페이지

### 상세 페이지 구조
1. 질문
2. 한 줄 답변
3. 설명 본문
4. Suitable / Not-for
5. Compare / Routine / Product 연결
6. Trust
7. FAQ
8. 연관 스토리 / 사례

---

## 3.4 루틴
### 역할
- action intent 질문에 대한 실행 답안
- 제품 나열이 아니라 순서와 맥락을 제공

### 2차 IA
- 상황별 루틴 목록
- 아침/저녁 루틴
- 피부 고민별 루틴
- 제품군 결합 루틴
- 개별 루틴 상세

### 상세 페이지 구조
1. Routine Header
2. Step Timeline
3. Required / Optional
4. Timing / Frequency
5. Linked Products
6. Boundary / Safety
7. Next Action

---

## 3.5 비교
### 역할
- 선택 불안을 줄이고 빠른 판단을 돕는 허브
- feature battle이 아니라 fit split 중심

### 2차 IA
- 대표 비교 허브
- 상황별 A/B 비교
- 성분/기술 비교
- 제품 타입 비교
- 개별 비교 상세

### 상세 페이지 구조
1. Quick Decision First
2. A/B Fit Split
3. Shared Notes
4. Routine Split
5. Trust
6. Product Entry

---

## 3.6 제품·번들
### 역할
- 제품을 카탈로그가 아니라 적합성/실행 관점에서 보여주는 영역
- Answer Commerce로 연결되는 실행 페이지

### 2차 IA
- 제품 목록
- 제품 카테고리
- Product Fit 허브
- 번들 / 세트
- 개별 제품 상세

### 제품 상세 구조
1. Fit Situation
2. Reset Moments
3. Why It Fits
4. Formula / Mechanism
5. FAQ / Review
6. Compare CTA
7. Routine CTA
8. Trust
9. Purchase

### 번들 상세 구조
1. 번들 목적
2. 대상 고민/상황
3. 포함 구성
4. 루틴 연결
5. 신뢰/주의사항
6. 상담/구매

---

## 3.7 스토리·가이드·리뷰
### 역할
- Media SSoT 허브
- 설명, 사례, 리뷰, 이벤트, 트렌드가 Brand SSoT를 보강하는 역할

### 2차 IA
- 스토리
- 가이드/설명서
- 리뷰/케이스
- 인사이트/트렌드
- 이벤트/런칭
- 시리즈

### 공통 규칙
- all route back to answer/compare/product
- media island 금지
- source / updatedAt / related topic 필수
- trust 없는 media 카드 금지

---

## 3.8 신뢰
### 역할
- reviewer / evidence / boundary / process / updatedAt / changeLog를 구조적으로 보여주는 허브
- 민감한 질문에 대한 신뢰 보강 계층

### 2차 IA
- 신뢰 소개
- 리뷰어/전문가
- 근거/증거
- 경계/주의사항
- 업데이트 이력
- 검수 프로세스

### 상세 페이지 구조
1. Reviewer
2. Evidence
3. Boundary
4. Safety
5. Process
6. UpdatedAt
7. ChangeLog
8. 관련 Answer / Compare / Routine

---

## 3.9 검색
### 역할
- AI 홈페이지의 핵심 진입점
- 검색 결과가 아니라 질문 해석과 최적 답안 제시

### 검색 결과 구조
1. Query Interpretation First
2. Best Answer First
3. Grouped Results
4. Suggested Next Questions
5. Compare / Routine / Product 연쇄 추천
6. Trust / Evidence snippet

### 필수 규칙
- 검색은 helper가 아니라 core
- 단순 키워드 목록이 아니라 질문 해석 결과 제공
- 결과는 Topic / Answer / Compare / Routine / Product / Story로 그룹화

---

## 4. 허브형 페이지 공통 구조

모든 허브형 페이지는 가능하면 아래 공통 골격을 따른다.

1. Hub Hero
2. Core Answer
3. Key Question Groups
4. Canonical Objects
5. Visual Canonical Objects
6. Trust Layer
7. Decision / Next Step
8. Related Hubs
9. Measurement Hooks

### 적용 대상
- 고민 허브
- 토픽 허브
- 비교 허브
- 루틴 허브
- 제품 적합성 허브
- 브랜드 스토리 허브 일부

---

## 5. 상세 페이지 공통 규칙

### 5.1 Answer Detail
- question
- short answer
- suitable / not-for
- compare / routine / product 연결
- trust
- faq
- related story / case

### 5.2 Compare Detail
- quick decision first
- A/B fit split
- shared note
- routine split
- trust
- product entry

### 5.3 Routine Detail
- step timeline
- timing / frequency
- linked product
- caution / safety
- next action

### 5.4 Product Detail
- fit situation first
- reset moments
- why it fits
- formula logic
- faq / review
- compare / routine
- trust
- purchase

### 5.5 Trust Detail
- reviewer
- evidence
- boundary
- safety
- process
- updatedAt
- changeLog

---

## 6. 콘텐츠 객체와 IA의 연결 규칙

### 6.1 Topic 기반 연결
- 모든 핵심 페이지는 Topic 또는 Topic Cluster에 연결돼야 한다

### 6.2 Question Cluster 기반 연결
- 고민 허브 / 공식답변 / 검색 결과는 Question Cluster를 기준으로 구성한다

### 6.3 Object routing 규칙
- Topic has Answer
- Topic has Story
- Topic has Product
- Topic has Routine
- Topic has Evidence
- Product solves Need
- Routine uses Product
- Content routesTo CTA
- Need mappedTo Audience
- Answer routesTo Product / Routine / Guide / CTA

### 6.4 no-dead-end 규칙
- 모든 핵심 상세 페이지는 최소 2개 이상의 다음 경로를 가져야 한다
- 예: Answer → Compare / Routine, Product → Routine / Compare, Story → Answer / Product

---

## 7. 검색 / SEO / AEO / GEO 구조 반영

### schema mapping 기본
- Answer → FAQPage
- Story → Article / NewsArticle
- Product → Product
- Review → Review / AggregateRating
- 필요 시 Breadcrumb / CollectionPage / ItemList / DefinedTerm / Dataset / Event

### 검색/GEO 생성 기준
- Topic / Answer / Compare / Routine / Product Fit은 search_doc 대상
- direct answer 적합 객체는 geo_block 대상
- canonical URL과 schema_type은 각 상세 페이지에 필수

---

## 8. 한국 locale 라벨 표준안

### GNB 라벨
- 홈
- 고민별 솔루션
- 공식 답변
- 루틴
- 비교
- 제품·번들
- 스토리·가이드·리뷰
- 신뢰
- 검색

### 대표 CTA 라벨
#### Tier 1: 판단 지원
- 내 루틴/리셋 찾기
- 공식 답변 보기
- 비교해서 고르기

#### Tier 2: 실행
- 루틴 보기
- 제품 자세히 보기

#### Tier 3: 전환
- 구매하기
- 번들 보기
- 상담 받기

---

## 9. Admin IA와의 연결

### Tenant Admin에서 대응되는 운영면
- Tenant Home
- Brand Foundation Studio
- Question Capital Manager
- Content & Trust Studio
- Canonical Object Workspace
- Publish Manager
- Search/GEO 상태 확인

### Factory / Reviewer / Ops 연계면
- Reviewer Home / Review Workspace
- Factory Home
- Ops Home
- Alert / RCA / Fix-It / Incident
- Builder Studio
- Template / Generator / Governance 연결

---

## 10. Anti-Patterns
- 상품몰형 홈
- 카테고리 그리드 과밀
- beauty influencer e-commerce aesthetics
- bright saturated CTA palette
- before/after proof-style hero
- trust를 fold 아래에 숨기기
- product-first homepage
- media가 answer graph와 분리된 구조
- compare를 feature battle table로만 처리
- search를 helper로 축소

---

## 11. Antigravity 구현 체크리스트
### 11.1 라우팅
- GNB와 각 object type route가 1:1 또는 1:N으로 연결되는가
- route가 canonical object 중심인가

### 11.2 snapshot
- tenant_home_snapshot
- object_detail_snapshot
- publish_bundle_snapshot
- search_geo_snapshot
- builder_studio_snapshot
가 IA와 모순되지 않는가

### 11.3 콘텐츠 그래프
- Topic / Answer / Compare / Routine / Product / Story / Trust가 끊기지 않는가
- dead-end 없는가

### 11.4 신뢰
- reviewer / evidence / boundary / updatedAt / changeLog가 visible한가

### 11.5 한국 locale
- GNB / CTA / trust 문구 / 탐색 흐름이 한국어 기준으로 자연스러운가

---

## 12. 부록
### 부록 A. GNB 라벨 대체안
### 부록 B. 허브 페이지 와이어 목차
### 부록 C. 상세 페이지 와이어 목차
### 부록 D. Search / GEO 라우팅 메모
### 부록 E. 테넌트 개설 시 기본 IA 자동 생성 규칙
