# [Strategic Integration Plan] AI 홈페이지 ↔ 인스타그램 채널 연동 최적화 플랜

작성해주신 5개의 스펙 문서(`welby-instagram`, `content-generation`, `dm-routing`, `utm-governance`, `creator-workspace`)와 지금까지 구현하신 **AIHQ(멀티 테넌트 팩토리, QIS 데이터베이스, AI 스트리밍 세일즈 챗봇)** 의 비즈니스 가치를 결합한 최적의 마스터 구현 계획입니다.

단순한 '인스타그램 자동 포스팅'이 아닙니다. **"인스타그램이 AI 홈페이지(정본)의 마이크로 프론트엔드처럼 작동하여 리드를 긁어오는"** 강력한 AEO/GEO 특화 파이프라인으로 설계했습니다.

---

## 1. 🚀 코어 전략: "정본(SSoT)의 파편화 및 회수 (The Frag-and-Catch Flywheel)"

지금까지 구현된 AI 홈페이지의 핵심 비즈니스 가치는 **SSoT(단일 지식 출처)와 QIS(질문 수집망)의 순환**입니다. 인스타그램 채널 연동은 이 순환망을 소셜 외부로 확장하는 역할을 합니다.

1. **파편화(Frag)**: AI 홈페이지에 모인 SSoT(Topic, Question)를 `content-generation-guidelines.md`에 맞춰 3장짜리 카드뉴스와 릴스로 잘라내어(Frag) 포스팅합니다. 
2. **거버넌스(Governance)**: 배포되는 모든 콘텐츠는 엄격한 `utm-governance.md`에 의해 AI가 부여한 고유 URL 토큰을 가집니다.
3. **회수(Catch)**: DM이나 프로필 링크를 통해 AI 홈페이지(`[tenantSlug]/answers/[id]?contextId=...&utm_source=...`)로 트래픽을 회수하며, 앞서 개발한 **Edge Streaming Chatbot(수석 실장)** 이 인스타그램 문맥을 넘겨받아 끊김 없는 클로징을 따냅니다.

---

## 2. ⚙️ 기능 연동 및 구현 상세 (4-Phases)

### Phase 1: AI Content Generation Pipeline (가장 이른 가치 창출)
인스타그램 콘텐츠를 맨땅에 기획하지 않고, **기존에 구현 완료된 SSoT(topics) 기반으로 AI가 역가공**하도록 팩토리 어드민을 연동합니다.
*   **구현 방향**: Factory Admin에 `Instagram Studio` 신설
*   **기술 방식**:
    *   사용자가 기존 발행된 `Topic`이나 `Service`를 선택.
    *   System Prompt(`content-generation-guidelines.md` 룰 탑재)가 자동으로 **Hook 5개, Angle 3개, 캡션 초안**을 뽑아냅니다.
    *   이때 가장 중요한 랜딩 URL을 `utm-governance.md` 패턴에 맞춰 무조건 AI가 **자동 발급/강제 주입**합니다.
*   **AEO/GEO 효과**: 인스타그램의 본문과 랜딩된 홈페이지의 텍스트가 시맨틱(의미론) 적으로 100% 일치하므로 검색엔진의 E-E-A-T 신뢰도 지수가 극대화됩니다.

### Phase 2: 인텐트 라우팅 DM(Webhook) & 챗봇 핸드오프 (고난이도-고효율)
`dm-routing-spec.md`를 바탕으로, 단순 챗봇이 아닌 **'전략적 DM 라우팅망'** 을 구축합니다.
*   **구현 방향**: Meta Webhook 연결 및 챗봇 CTA 동기화
*   **기술 방식**:
    *   AI가 DM을 실시간 수신하여 인텐트를 3가지(S1: 적합성, S2: 제휴, S3: 오퍼)로 분류.
    *   DM 상에서 구구절절 대답하는 대신, **"정본 링크(Topic/Service) + 챗봇 딥링크"** 를 던져 유저를 AI 홈페이지로 끌어들입니다.
    *   **강력한 연계 포인트**: 우리가 방금 만든 챗봇(Edge Streaming)에 `?contextType=dm_offer` 형태로 던지면, 챗봇 실장이 *"방금 인스타 DM으로 혜택 물어보셨던 내용, 이어서 자세히 알려드릴까요?"* 라며 소름 돋는 연속성을 보여줍니다.

### Phase 3: Creator Co-creation Workspace (B2B 제휴 거점화)
테넌트(브랜드) 계정의 포스팅 기능을 넘어, 제휴를 맺은 인플루언서 / 크리에이터들이 쓸 수 있는 어드민 단을 개방합니다.
*   **구현 방향**: 웹진/답변 관리와 유사하게 `Creator Drafts` 관리 테이블 추가.
*   **기술 방식**:
    *   크리에이터가 협업 요청 (Intake).
    *   AI가 `creator-workspace-spec`을 바탕으로 초안을 작성(`ContentDraft` DB 인서트).
    *   승인 시 즉시 Meta Graph API를 통해 크리에이터 계정으로 예약 게시(Schedule).
*   **팩토리 비즈니스 장점**: 이 시스템 자체가 단순 에이전시 운영을 넘어선 **'AI 크리에이터 매니지먼트 인프라'** 로 둔갑하여 테넌트(원장/마케터)에게 막대한 비용 절감 셀링 포인트가 됩니다.

---

## 3. 📊 데이터 파이프라인 (Deal Room 연동성)

본 연동 플랜의 종착지는 결국 CRM(통합 상황실)입니다. 우리가 구현해 둔 `finalizeInquiryAction` 서버 액션을 개조해야 합니다.
1.  사용자가 Instagram DM 라우팅을 거쳐 상담 접수를 완료하면,
2.  브라우저 스토리지에 남아있던 `utm_source=instagram&utm_medium=creator&utm_content=...` 값을 가로챕니다.
3.  최종 Deal Room JSON 구조(`ai_structured_brief`) 속의 `attribution` 노드에 이 UTM 메타데이터를 강제 병합하여 저장해 둡니다.
4.  팩토리 어드민(KPI 보드)에서 "어떤 크리에이터의 어떤 릴스가 가장 많은 최종 예약 리드를 따냈는가?"에 대한 퍼포먼스(Closed-Loop) ROI 측정이 자동화됩니다.

---

## 4. 🛠 추천 Action Items (코드 구현 순서)

1.  **DB Schema Update** (Supabase DDL)
    *   `content_drafts`, `creator_requests`, `creators` 관련 테이블 개설 및 RLS 적용.
    *   기존 `topics` 테이블과 외래키 연동(`campaign_id`, `topic_refs`).
2.  **Factory Admin - UTM & Content Studio 구현**
    *   `apps/web/admin/instagram/drafts` 레이아웃 구성.
    *   이전에 만든 `converseWithAgentAction`의 프롬프트 제어 경험을 살려, AI가 가이드라인에 맞춘 마크다운 텍스트를 생성하는 API 생성.
3.  **Chatbot Context Extension**
    *   `apps/storefront/app/[tenantSlug]/contact/dm/page.tsx` 에 DM 파라미터(`utm_source=dm`)를 인식하는 Greetings 조건문 하나만 추가하면, 위 스펙의 DM 딥링크 라우팅 시나리오가 100% 작동합니다.
4.  **Meta Graph API Integration**
    *   최종적으로 승인된 `content_draft`를 Instagram Business Account로 발송하는 Webhook/Worker 세팅.
