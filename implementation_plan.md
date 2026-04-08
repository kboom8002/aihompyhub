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

# 테넌트 디자인/테마 관리(Brand Hero) 퍼블리싱 및 CTA 확장 연동

어드민님의 날카로운 관찰력이 맞습니다! 
이전 연동에서 **블록 렌더러(BlockRenderer)**가 "만약 홈 큐레이션 보드 쪽에 명시된 설정(`props`)이 있으면 그 값을 먼저 쓴다"라고 우선순위를 판정하는 바람에, 디자인 매니저에서 덮어쓴 값(`heroProps`)이 무시당하는 렌더링 우선순위 버그가 있었습니다.

또한 히어로 영역 하단에는 **2개의 액션 버튼(CTA)**과 상단의 **보이스 배지(Voice Badge)**가 자리잡고 있습니다. 어드민님의 말씀처럼 "이미지와 텍스트 외의 요소(버튼 등)"도 테넌트 관리자가 마음대로 링크와 라벨을 변경할 수 있어야 완벽한 빌더의 면모를 갖출 수 있습니다!

## User Review Required

> [!IMPORTANT]  
> 관리자의 `디자인/테마 관리` 화면의 메인 히어로 구역 폼에 다음 4가지 버튼 관련 항목을 추가합니다. 승인해주시면 바로 작업에 착수하겠습니다.
> 1. 메인 버튼 텍스트 (예: 내 루틴/리셋 찾기)
> 2. 메인 버튼 연결 링크 (예: `/routines`)
> 3. 서브 버튼 텍스트 (예: 고민별 공식 답변 보기)
> 4. 서브 버튼 연결 링크 (예: `/solutions`)

## Proposed Changes

### 1. 스토어프론트 우위성(Priority) 역전 & CTA 컴포넌트 Props 바인딩
#### [MODIFY] `apps/storefront/components/store/blocks/BlockRenderer.tsx`
- 기존의 값이 없으면 꺼내오는 체인 `props?.heroImage || heroProps.heroImage` 의 순서를 **`heroProps.heroImage || props?.heroImage`** 로 뒤집어버립니다! 즉, 방금 디자인/테마 관리에서 저장한 `heroConfig`의 값을 **무조건 최우선 호가**로 렌더링하도록 덮어쓰기 권력을 부여합니다.

#### [MODIFY] `apps/storefront/components/store/BrandHero.tsx`
- 컴포넌트 하단에 하드코딩 되어 있던 두 개의 Link와 Button 안의 텍스트를 `props.primaryCtaText`, `props.primaryCtaLink` 등으로 교체합니다. 만약 입력값이 없으면 기존의 텍스트가 Fallback 되도록 보존합니다.

#### [MODIFY] `apps/storefront/lib/designConfig.ts`
- `designConfig` 스키마 인터페이스의 `hero` 필드 안에 `primaryCtaText`, `primaryCtaLink`, `secondaryCtaText`, `secondaryCtaLink` 를 편입시킵니다.

### 2. 웹(관리자) 디자인 매니저 UI 확장
#### [MODIFY] `apps/web/app/tenant/[tenantId]/studio/design/page.tsx`
- 기존 히어로 이미지/타이틀 설정란 아래에 **[액션 버튼(CTA) 1]** 과 **[액션 버튼(CTA) 2]** 의 라벨과 도달 경로(URL)를 적을 수 있는 Input 필드를 4개 더 붙입니다.
- 저장 버튼 누를 때 `payload.overrides.hero` 객체 안에 CTA 텍스트와 링크를 함께 동봉해서 DB(`api/v1/tenant/design/route.ts`)로 넘기도록 조립합니다.

## Verification Plan

### Manual Verification
1. `디자인/테마 관리` 에 진입하면 히어로 구역 아래에 버튼 이름과 위치를 적을 수 있는 칸이 생성되어 있는지 확인합니다.
2. 예컨대 스킨케어 브랜드가 아닐 경우 "시작하기", "/pricing" 등으로 세팅 후 퍼블리싱합니다.
3. 스토어프론트에 진입하여 방금 적은 타이틀과 이미지가 1순위로 즉각 반영되어 대문에 찍히는지 점검합니다.
4. 버튼 텍스트가 바뀐 것을 육안으로 보고 클릭 시 의도한 주소로 올바르게 튕겨져 나가는지 확인합니다!

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
