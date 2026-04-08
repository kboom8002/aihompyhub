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

# 스토어프론트 Hero 구역 최고급 커스터마이징 (업로드, IA 드롭다운, 보이스 배지)

말씀해주신 3가지 개선 사항은 완벽한 노코드(No-code) SaaS 플랫폼으로 거듭나기 위한 핵심 기능들입니다. 특히 사용자가 URL을 복사하여 붙여넣는 방식은 불편하므로 파일 업로드(Storage)로 대체하고, 버튼 라우팅도 직관적으로 고를 수 있게 UX를 파격적으로 개선하겠습니다!

## User Review Required

> [!IMPORTANT]  
> 1. **배경 이미지 파일 업로드**: Supabase Storage 연동을 통해 브라우저에서 직접 파일을 첨부하여 업로드 되도록 변경합니다. 
> 2. **버튼 링크 IA 드롭다운**: 텍스트 인풋 대신, `<datalist>` 태그를 활용해 `IA 매니저`에 등록된 메뉴들이 **드롭다운으로 자동 완성**되도록 제공하겠습니다. 원하시면 직접 타이핑도 가능합니다.
> 3. **보이스 배지 오버라이드**: 이미지 상단에 나타나는 투명한 캡슐 라벨(Voice Badge)은 본래 기본 브랜드 프로필(Brand SSoT)에서 가져오지만, 히어로 전용으로 강제 수정할 수 있는 입력 칸 하나를 더 만들어 두겠습니다.
> 이 구현 방향성으로 진행할까요?

## Proposed Changes

### 1. 스토어프론트 뷰 오버라이드 & 스키마 확장
#### [MODIFY] `apps/storefront/components/store/BrandHero.tsx` & `BlockRenderer.tsx`
- 기존 `BrandHero`가 `voice` 속성을 상속받고 있었습니다. 여기에 `heroProps.voiceBadge` 속성을 1순위로 채택하도록 프롭스를 살짝만 더 병합시킵니다.
#### [MODIFY] `apps/storefront/lib/designConfig.ts`
- `designConfig` 스키마 인터페이스의 `hero` 필드 안에 `voiceBadge` 를 추가합니다.

### 2. AWS S3 기반(Supabase Storage) 원클릭 업로더 백엔드 신설
#### [NEW] `apps/web/app/api/v1/tenant/upload/route.ts`
- 테넌트 어드민이 올려보낸 파일을 받아 `tenant-assets` 버킷(방금 제가 즉석으로 생성해 두었습니다!)에 안전하게 저장하고 절대경로 Public URL을 반환해주는 전용 REST API를 하나 신설합니다.

### 3. 웹(관리자) 디자인 매니저 UI 최고급화 (업로더/드롭다운)
#### [MODIFY] `apps/web/app/tenant/[tenantId]/studio/design/page.tsx`
- **배경 이미지 설정란**: 단순 텍스트 박스에서 `<input type="file" />` 요소로 바꿉니다. 파일 선택 시 앞서 만든 API가 백그라운드에서 동작한 뒤 저장됩니다.
- **버튼 링크 설정란**: `fetch` 로 `api/v1/tenant/ia` 목록을 가져온 뒤 HTML5의 `<datalist>` 와 바인딩하여 콤보박스(드롭다운) UX를 선사합니다.
- **보이스 배지 오버라이드**: 텍스트 인풋 필드를 하나 더 추가합니다.

## Verification Plan

### Manual Verification
1. `디자인/테마 관리` 에 들어갑니다.
2. 배경 이미지를 "URL 입력"이 아닌 **[파일 선택]** 버튼을 통해 업로드합니다.
3. 로딩바가 끝나면 스토어프론트용 클라우드 버킷 URL이 부여됩니다.
4. 링크 인풋을 클릭하면 `IA 매니저`에서 쓰이는 메뉴 경로(`/routines`, `/solutions` 등)가 드롭다운 박스로 보기 좋게 제안됩니다.
5. 저장 후 스토어 프론트에 배지가 잘 나오는지 봅니다.

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
