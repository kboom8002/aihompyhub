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

# 🌐 테넌트 라우팅 체계를 Slug(슬러그) 기반으로 전환

현재 테넌트 관리자의 접속 체계가 UUID(`.../tenant/0000-0000.../home`)를 사용하고 있어 메모가 불가능하고 식별 및 공유가 어렵다는 피드백을 반영합니다. 이를 사람이 읽기 편한 직관적인 슬러그(`.../tenant/answerbiz/home`) 체계로 완벽하게 덮어씌우는 전면적인 라우팅 리팩토링을 수행합니다.

## User Review Required

> [!IMPORTANT]  
> 슬러그를 기반으로 접속하도록 바뀌면 향후 "테넌트의 슬러그"를 변경할 때 URL 주소 변경(리다이렉션) 이슈가 조심스럽게 다뤄져야 합니다. 현재 구현 방안에서는 URL에 들어온 문자열이 UUID인지 Slug인지 양쪽 모두 허용하여(Fallback) 기존 링크도 끊어지지 않도록 보호하는 방식으로 구현하겠습니다. 동의하시나요?

## Proposed Changes

### 1. 인증 미들웨어 및 전체 통제 라우팅 수정
#### [MODIFY] `apps/web/lib/supabase/middleware.ts`
- 관리자(Tenant Admin) 로그인 시 강제로 이동하는 기본 경로를 기존의 `UUID` 대신, 해당 테넌트의 DB 프로필에서 `slug`를 찾아서 `/tenant/[slug]/home`으로 연결하도록 개선합니다.

### 2. 레이아웃과 팩토리 OS 진입점 수정
#### [MODIFY] `apps/web/app/factory/tenants/page.tsx`
- 팩토리 OS의 [Inspect Workspace ↗] 버튼 링크를 `UUID`에서 `Slug`(없으면 fallback UUID) 중심으로 수정합니다.

#### [MODIFY] `apps/web/app/tenant/[tenantId]/layout.tsx`
- 파라미터로 넘어온 값(`params.tenantId`)이 UUID인지 Slug인지 자동으로 판별해 해당 테넌트 정보를 올바르게 Fetch하도록 쿼리를 `.or('id.eq.val,slug.eq.val')` 로 유연하게 변경합니다.
- 사이드바 메뉴들의 하위 경로(`<a href="...">`)에 삽입되는 파라미터를 현재 접속 중인 슬러그 체계로 통일하여 매핑합니다.

### 3. TenantSwitcher 컨트롤 최적화
#### [MODIFY] `apps/web/app/tenant/[tenantId]/TenantSwitcher.tsx`
- 드롭다운의 `value` 및 이동 대상을 `UUID`에서 `slug` 기준으로 전부 치환합니다.
- `<option value={t.slug}>`로 렌더링되도록 수정하여, 사용자가 테넌트 전환 시 즉시 `/tenant/[slug]/home`으로 떨어지도록 합니다.

### 4. 하위 Page의 UUID 파라미터 대응 조치
`home/page.tsx`나 `settings/brand/page.tsx` 등의 하위 페이지들이 API를 호출하거나 DB를 업데이트할 때는 **내부적으로 진짜 UUID 식별자가 필요**합니다.
#### [MODIFY] `apps/web/app/tenant/[tenantId]/home/page.tsx`
- URL 파라미터(Slug)를 가지고 DB에서 진짜 uuid(`tenantRow.id`)값을 찾아내어 `x-tenant-id` 헤더에 주입하도록 쿼리 조회 로직을 보강합니다.

#### [MODIFY] `apps/web/app/tenant/[tenantId]/settings/brand/page.tsx`
- 폼 Submit 처리 시에도 Slug 파라미터를 통해 진짜 폼 업데이트 대상(UUID)를 찾고 전송하도록 수정합니다.

## Verification Plan

### Manual Verification
1. 로컬 환경에서 기존 UUID로 된 주소 표시줄을 직접 지우고, 대신 등록해두셨던 `dr.o-skincare-00000000` 등을 주소창에 넣어(`/tenant/dr.o-skincare-00000000/home`) 정상 진입 되는지 확인합니다.
2. TenantSwitcher에서 다른 브랜드로 전환했을 때 URL이 슬러그로 깔끔하게 바뀌는지 확인합니다.
3. 팩토리 OS의 [Inspect Workspace ↗] 버튼을 클릭했을 때 UUID가 아닌 해당 테넌트의 슬러그 주소로 리다이렉션 되는지 점검합니다.

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
