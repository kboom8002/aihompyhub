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

# 테넌트 브랜드 기본 요소 관리 및 동적 UI 통합 계획

현재 테넌트 관리자(`/tenant/[tenantId]/*`) 내 사이드바(TenantSwitcher)와 홈 대시보드 타이틀이 **하드코딩된 목업 데이터(`Dr.Oracle`, `Lumiere Skincare` 등)에 의존하고 있어 식별이 부정확한 문제**를 해결하고, **테넌트(브랜드)의 이름과 접속용 슬러그(slug) 등을 직접 수정하고 관리할 수 있는 설정 페이지**를 구축합니다.

## User Review Required

> [!IMPORTANT]  
> 현재 `[tenantId]` 라우트 파라미터는 UUID 형식(`1234-abcd-...`)을 기준으로 동작하고 있습니다. 
> B2B 서비스의 경우 보안상 **어드민 포털의 경로는 UUID를 유지하고 프론트엔드쪽 접속 경로는 슬러그(slug)를 사용할 계획**입니다. 설정 페이지 UI 구성 항목(이름, 슬러그 관리 등)이 아래 제안드린 수준으로 충분한지 확인 부탁드립니다.

## Proposed Changes

### 1. 동적 UI 연동 (사이드바 & 홈 화면)

#### [MODIFY] `apps/web/app/tenant/[tenantId]/layout.tsx`
- Layout 단에서 `params.tenantId` (UUID)를 활용해 DB망(`tenants` 테이블)에 접근하여 현재 접속 중인 테넌트의 진짜 이름(`name`)과 `slug`를 Fetch합니다.
- 좌측 사이드바 구조에 ⚙️ **브랜드 기본 설정 (Settings)** 메뉴 항목을 새롭게 추가합니다.

#### [MODIFY] `apps/web/app/tenant/[tenantId]/TenantSwitcher.tsx`
- 목업으로 하드코딩된 드롭다운(Dr.Oracle 등)을 제거합니다.
- 슈퍼어드민일 경우 `tenants` 전체 목록을 불러와 다른 테넌트로 쉽게 이동할 수 있는 동적 Select 옵션으로 개편합니다. (테넌트 어드민은 타 테넌트 이동 불가)

#### [MODIFY] `apps/web/app/tenant/[tenantId]/home/page.tsx`
- 홈 화면 타이틀에 적혀 있는 "Lumiere Skincare..." 목업을 `현재 DB에 저장된 테넌트 이름(ex: AnswerBiz)`으로 정확하게 렌더링되도록 수정합니다.

---

### 2. 브랜드 기초 요소 관리 페이지 (Brand Settings)

#### [NEW] `apps/web/app/tenant/[tenantId]/settings/brand/page.tsx`
테넌트의 아이덴티티 및 식별자(Slug)를 관리하는 관리자 전용 폼(UX)을 신규 생성합니다. 
- **입력 항목:**
  1. `테넌트 이름 (Brand Name)`
  2. `프론트엔드 연결용 슬러그 (URL Slug)` (예: `answerbiz` 입력 시 -> `aihompyhub.com/answerbiz` 로 자동 매스킹)
- **로직:** CSR 기반의 실시간 폼 처리와 서버 액션 업데이트를 결합하여 작성.

#### [NEW] `apps/web/app/tenant/[tenantId]/settings/brand/actions.ts`
새로운 Server Action을 구현하여, 전송받은 폼 데이터로 `public.tenants` 테이블의 `name`, `slug` 컬럼 수정을 DB에 반영(UPDATE)하고 캐시를 갱신(revalidatePath)합니다.

## Open Questions

> [!WARNING]  
> 향후 브랜딩 고도화 시 브랜드 로고(이미지), 브랜드 고유의 Tone/Manner (프롬프트 반영용) 등의 컬럼도 추가할 계획이 있으신가요? (이번 1차 스코프에서는 필수 요소인 Name, Slug 에 우선 집중하겠습니다.)

## Verification Plan

### Manual Verification
1. 슈퍼 관리자 계정으로 접속 후 Factory OS 에서 AnswerBiz 등 **특정 테넌트를 클릭해 Workspace로 이동**합니다.
2. 좌측 사이드바 상단이 `Dr.Oracle`에서 **`AnswerBiz` (실제 할당된 이름)**로 정상 표출되는지 검증합니다.
3. 좌측 하단에 새롭게 추가된 ⚙️ **브랜드 기본 설정 (Settings)** 페이지에 진입하여 테넌트 이름이나 `slug` 이름을 변경해봅니다.
4. 저장 직후 사이드바 요소들이 실시간으로 자동 갱신되는지 확인합니다.

---

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
