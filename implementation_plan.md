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

# 스토어프론트 히어로 템플릿 셀렉터 구축 (글래스모피즘 vs 텍스트 릴리즈형)

어드민님의 통찰력이 또 한번 빛났습니다. Vegan-Root처럼 깨끗하고 거대한 타이포그래피만으로 아름다운 뷰티 브랜드가 있는 반면, Dr-Oracle처럼 다양한 유도 장치(버튼, 배지)와 유리 질감(Glassmorphism) 박스를 필요로 하는 브랜드도 있습니다. 한 가지 레이아웃을 모든 테넌트에 강제하는 것은 유연한 빌더의 철학에 맞지 않습니다!

따라서 디자인/테마 관리 화면에서 **"마스터 테마"를 고르듯, 메인 히어로 구역의 렌더링 템플릿 레이아웃도 드롭다운으로 선택**할 수 있도록 옵션을 확장하겠습니다.

## User Review Required

> [!IMPORTANT]  
> 히어로 레이아웃 템플릿(Hero Template)으로 두 가지 옵션을 지원하도록 설계하겠습니다.
> 1. `glass_card` (기존 방식): 화면 중앙에 반투명한 박스(Glassmorphism)가 있고 그 안에 배지, 타이틀, 버튼 2개가 꽉 차게 들어가는 형태. (Dr-Oracle 추천)
> 2. `transparent_text` (비건루트 방식): 박스나 배지 없이 크고 유려한 텍스트가 화면 전체에 뿌려지며 깔끔한 텍스트 그림자로 가독성만 보존되는 형태. 하단 버튼들도 숨기거나 심플하게 배치 가능.
> 이 두 가지 모드를 마음대로 스위칭할 수 있도록 개발할까요?

## Proposed Changes

### 1. 스토어프론트 우위성 및 속성 확장 (Schema)
#### [MODIFY] `apps/storefront/lib/designConfig.ts` & `BlockRenderer.tsx`
- `designConfig.hero` 객체 안에 `heroTemplate?: 'glass_card' | 'transparent_text'` 속성을 추가 선언합니다.
- BlockRenderer에서 이 값을 꺼내 `BrandHero`의 `template` 프롭스를 주입합니다.

### 2. 스토어프론트 `BrandHero.tsx` 뷰 분기 로직
#### [MODIFY] `apps/storefront/components/store/BrandHero.tsx`
- 프롭스로 넘어온 `template` 값을 확인합니다.
- `transparent_text` 일 경우:
  - 가운데 둥근 테두리의 반투명 박스(`backdrop-blur`)를 제거합니다.
  - 보이스 배지를 렌더링하지 않거나 단순 텍스트로 녹입니다.
  - 버튼을 중앙 정렬하되 박스 안에 가두지 않고 투명하게 깔아줍니다.
- `glass_card` (기본값) 일 경우: 기존 설계된 UI 로직을 구동합니다.

### 3. 웹(관리자) 디자인 매니저 선택 UI 삽입
#### [MODIFY] `apps/web/app/tenant/[tenantId]/studio/design/page.tsx`
- 히어로 편집 구역 폼 최상단에 **히어로 템플릿 형태(Layout)** 도 고를 수 있는 드롭다운(`<select>`)을 하나 더 자그맣게 밀어넣겠습니다.
- 선택한 값을 저장 시 payload에 바인딩하여 백엔드로 보냅니다.

## Verification Plan

### Manual Verification
1. `AnswerBiz` 나 `DR.O Skincare` 관리자의 `디자인/테마 관리` 에 진입합니다.
2. 새롭게 추가된 **"히어로 레이아웃 형태"** 드롭다운에서 `투명 텍스트 강조형 (Transparent)`을 골라 저장합니다.
3. 스토어프론트에 진입하면 화면을 덮고 있던 둥근 박스가 사라지고 글씨만 깨끗하고 웅장하게 표출되는지 테스트합니다.
4. 다시 `글래스모피즘 박스형 (Glass Card)`으로 바꿔 제대로 원상복구 되는지 확인합니다.

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
