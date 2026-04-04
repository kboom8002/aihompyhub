# 🗺️ [Sprint 31] Dynamic GNB & Information Architecture (IA) Manager

홈페이지의 '메인 영역(레이아웃 큐레이션)'과 '디자인 테마(마스터 토큰)'를 정복했으니, 이제 스토어프론트의 가장 핵심 뼈대인 **글로벌 내비게이션 바(GNB)의 제어권**을 테넌트(브랜드)에게 온전히 넘겨줄 차례입니다.

## 📌 목표 및 철학 (Goal & Thesis)
- **Fluid Architecture**: SSoT 카테고리(솔루션, 루틴, 신뢰 등)가 모든 브랜드에 동일한 중요도를 갖지 않습니다. (예: 어떤 브랜드에는 '루틴'이 없고 단일 제품만 존재함)
- **Notion-Style Configuration**: 스튜디오에서 스위치(Toggle) 하나로 특정 GNB 메뉴를 켜고 끄거나, "해결책"이라는 딱딱한 이름을 "My 리셋 파인더" 같은 브랜드 용어로 직접 변경(Labeling)할 수 있어야 진정한 SaaS입니다.

---

## ⚠️ User Review Required

> [!IMPORTANT]
> GNB 메뉴를 유동적으로 만들게 되면, 스토어프론트 상단 헤더(`StoreHeader.tsx`)가 완전히 DB 기반 캐시 시스템으로 전환됩니다. 다음의 방향성을 검토해주세요.

1. **GNB 메뉴 On/Off 기능**: 필요 없는 메뉴 탭(예: Compare 비교 분석)을 비활성화하는 토글 스위치 도입 여부.
2. **GNB 메뉴명 커스텀(Label Override)**: 예를 들어 기본 "루틴"이라는 탭을 -> 브랜드가 "홈케어 플랜"으로 이름을 바꿀 수 있도록 허용할지 여부.

---

## 🛠️ Proposed Changes

### 1. DB (universal_content_assets) 스키마 확장
- `type: 'ia_config'` (Information Architecture) 카테고리를 신설하여 스토어프론트의 네비게이션 구조를 JSON 형태로 저장합니다.

### 2. Studio CMS - [IA 관리 메뉴] 신설
#### [NEW] [ia/page.tsx](file:///C:/Users/User/aihompyhub/apps/web/app/tenant/studio/ia/page.tsx)
- 브랜드의 SSoT 라우팅(솔루션, 스토리, 제품 등)의 보이기/숨기기 토글 스위치 제공.
- 각 라우트의 '노출 텍스트(Label)' 커스텀 인풋 제공.

### 3. Storefront - GNB 헤더 동적 렌더링
#### [MODIFY] [StoreHeader.tsx](file:///C:/Users/User/aihompyhub/apps/storefront/components/store/StoreHeader.tsx)
- 현재 하드코딩 되어있는 `<nav><Link href="/solutions">...</Link></nav>` 구조를 폐기.
- 레이아웃(Layout.tsx)에서 넘겨받은 `ia_config` JSON 매트릭스를 순회하며 활성화된(Enabled) 탭만 동적으로 생성하고, 커스텀 라벨을 적용합니다.

---

## ❓ Open Questions

> [!WARNING]
> 현재 논의해야 할 또 다른 중요한 마일스톤이 존재합니다. 이번 스프린트(Sprint 31)로 **GNB/IA 매니저**를 진행하는 것이 가장 좋을까요, 아니면 아래의 **대체 과제** 중 하나를 먼저 우선순위에 두길 원하시나요?

- **[옵션 A] 본 계획대로 GNB/IA 매니저 구축**: 사이트 메뉴 구조의 완전 제어권 확보 (UI/UX 완성).
- **[옵션 B] 파일 스토리지 연동 (Storage)**: Tiptap 텍스트 에디터 안에 진짜 이미지(Media)를 업로드하고 Supabase Storage 버킷에 담아 CDN으로 이미지를 띄우는 기능.
- **[옵션 C] 프로덕션 안정화 / 보안 (Production Hardening)**: 현재 우회되어있는 데이터베이스 최고 권한(`supabaseAdmin`) 쿼리들을 모두 테넌트 격리형 RLS(Row Level Security) 클라이언트 쿼리로 안전하게 랩핑하는 작업.

## 🧪 Verification Plan
- IA 매니저에서 '비교(Compare)' 탭을 `off` 했을 때 스토어프론트 헤더에서 즉각적으로 메뉴가 사라지는지 테스트.
- 라벨 이름을 변경(예: 루틴 -> 스킨사이클) 했을 때 스토어프론트에 반영되는지 확인.
