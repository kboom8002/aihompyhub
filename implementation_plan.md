# 🚀 [Sprint 34] SSoT 타입별 동적 폼(Dynamic Schema Form) 확장

지적해주신 부분이 정확합니다! 현재 어드민의 `UniversalContentNewView`는 Tiptap을 이용한 "범용 본문(`body`)" 하나만 입력받는 구조이다 보니, 프론트엔드에서 요구하는 고도화된 특정 메타데이터(A/B 비교군의 이름, Best for 타겟, 서브 설명 등)를 입력받을 창구가 없는 구멍이 존재했습니다.

이를 해결하기 위해 어드민 폼을 **"타입 인지형 동적 폼(Type-Aware Dynamic Form)"**으로 구조를 개편하고자 합니다.

## ⚠️ User Review Required

> [!IMPORTANT]
> 어떻게 폼을 확장할지에 대한 2가지 하드웨어(설계) 옵션이 있습니다. 선호하시는 방식을 알려주세요.
> 
> 1. **옵션 A (빠르고 직관적인 대응)**: `new/page.tsx` 내부에서 `if (type === 'compare')` 일 때 렌더링되는 전용 입력 섹션을 추가합니다.
> 2. **옵션 B (장기적인 JSON Schema 빌더 구조)**: `compare`, `routine`, `product` 등 각 타입이 필요로 하는 메타데이터 규격을 별도의 설정 파일에 명시하고, 그 설정 파일에 따라 UI 입력칸을 자동 생성(맵핑)하는 고도화된 방식.

---

# 테넌트 디자인/테마 관리(Brand Hero) 연동 계획

어드민님의 의견처럼 소비자 진입 시 가장 먼저 노출되는 "메인 히어로(BrandHero)의 이미지와 카피라이팅"은 시각적 정체성의 핵심이므로 ⚙️ **디자인/테마 관리(Design Manager)** 메뉴에서 통합 조율할 수 있는 것이 경험상 훨씬 직관적입니다. 

이를 위해 기존의 전역 디자인 덮어쓰기(`overrides`) 항목에 Hero 에셋 관련 기능을 추가하고, 스토어프론트가 이를 자동으로 상속받도록 결합(Architecture Mapping)하겠습니다.

## User Review Required

> [!IMPORTANT]  
> 수정될 관리자 화면(디자인 미세조정 섹션 아래)에 들어갈 항목은 다음 3가지입니다.
> 1. **메인 히어로 이미지 URL** (현재는 텍스트 직접 입력 형태로 제공)
> 2. **메인 타이틀 (Summary)** (ex: 프리미엄 비건 솔루션)
> 3. **서브 설명글 (Description)** (ex: AI가 설계한 안전한 루틴...)
> 이 항목들이면 충분하실까요?

## Proposed Changes

### 1. 웹(관리자) 디자인 매니저 UI 확장
#### [MODIFY] `apps/web/app/tenant/[tenantId]/studio/design/page.tsx`
- 기존 Primary Color, Border Radius 지정 화면 하단에 `3. 메인 히어로(Hero) 콘셉트 구역` 폼을 신규로 추가합니다.
- 상태값(`heroImage`, `heroSummary`, `heroDescription`)을 연결하여, 퍼블리싱 시 `overrides.hero` 객체로 감싸서 API로 쏘도록 수정합니다.
- 현재 `/api/v1/tenant/design` 호출 시, `x-tenant-id` 헤더에 현재 웹 URL의 파라미터(tenantId/slug)를 실어보내어 저장 주체를 정확히 인지하도록 합니다. (버그 방지용)

### 2. 관리자 데이터 저장 API (Route) 연동 보강
#### [MODIFY] `apps/web/app/api/v1/tenant/design/route.ts`
- 현재 하드코딩 되어있던 `CURRENT_TENANT_ID`를 헤더(`req.headers.get('x-tenant-id')`)에서 동적으로 뽑아 정식으로 DB에 반영하도록 리팩토링 합니다.
- (슬러그일 경우 UUID를 한 번 조회하여 `universal_content_assets` 데이터 구조에 온전하게 반영)

### 3. 스토어프론트(소비자 뷰) 파이프라인 매핑
#### [MODIFY] `apps/storefront/lib/designConfig.ts`
- 팩토리 OS(API)에서 저장한 `overrides.hero` 객체를 파싱 모델의 최상위 스키마에 붙여서 가져오도록 스펙을 확장합니다. (`hero: overrides.hero`)

#### [MODIFY] `apps/storefront/app/[tenantSlug]/page.tsx`
- 스토어 홈 페이지 진입 시, 방금 꺼내온 `designConfig.hero` 정보를 묶어서 하위 위젯 렌더러로 내려보내줍니다 (`context={{ heroConfig: designConfig.hero, ... }}`).

#### [MODIFY] `apps/storefront/components/store/blocks/BlockRenderer.tsx`
- 큐레이션 보드에서 순서를 바꾼 `BrandHero`가 렌더링 될 때, 관리자 테마에서 방금 지정해둔 값을 1순위로 채택하여 화면에 표출해 주도록 `summary`, `description`, `heroImage` props 병합 로직을 구현합니다.

## Verification Plan

### Manual Verification
1. `AnswerBiz` 나 `DR.O Skincare` 관리자의 `디자인/테마 관리` 에 진입합니다.
2. 새롭게 생성된 히어로 에셋 구역에 새로운 이미지 경로와 카피라이팅을 타이핑하고 **퍼블리싱**을 누릅니다.
3. 스토어프론트(`localhost:3001` 등)로 이동하면 중앙을 덮고 있던 히어로 대문 사진과 메인 문구가 방금 입력한 대로 깔끔하게 덧씌워진 것을 육안으로 확인합니다!

## 🛠️ Proposed Changes (옵션 A를 가정한 기본 안)

### 1. Backend & Payload 구조 변경 없음
- 현재 스토어프론트는 `json_payload.profileA`, `json_payload.profileB`를 기대하고 있습니다. 따라서 DB 컬럼 추가 없이, 프론트엔드에서 묶어서 보내기만 하면 완벽히 호환됩니다.

### 2. Admin UI: Universal 폼 확장
#### [MODIFY] `new/page.tsx` (과 `edit/page.tsx`)
- `compare` 타입 전용 블록 렌더링 추가.
- `react-hook-form`에 `profileA_name`, `profileA_targetFit`, `profileA_description`, `profileB_*` 등의 필드를 추가.
- `onSubmit` 시, 해당 값들을 묶어 `json_payload: { profileA: {...}, profileB: {...}, body: ... }` 구조로 조립 후 저장하도록 수정.

## ❓ Open Questions

> [!WARNING]
> 만약 `Routine(루틴)`의 경우나 `Product(제품)`의 경우에도 일반 텍스트가 아닌 '단계별 1, 2, 3 스텝 구조' 나 '성분표'를 기입해야 한다면, 이참에 아예 각 **타입별 전용 컴포넌트(`CompareFormFields`, `RoutineFormFields`)** 로 파일들을 예쁘게 쪼개는 리팩토링을 병행하는 것이 어떨까요? (관리가 훨씬 수월해집니다!)

## 🧪 Verification Plan

1. **폼 노출 검증**: 테넌트 어드민에서 `비교 분석(Compare)`의 [새 항목 작성]에 들어갔을 때, 'Option A/B'에 대한 전용 입력칸(이름, 기대효과, 한줄설명)이 나타나는지 확인.
2. **데이터 파서 검증**: DB 저장 후 스토어프론트로 돌아가 해당 비교 글을 눌렀을 때, `해당 정보 없음` 이라는 회색 플레이스홀더 대신 진짜로 입력한 데이터가 A/B 매트릭스에 렌더링되는지 확인.
