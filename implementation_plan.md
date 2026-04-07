# 🚀 [Sprint 34] SSoT 타입별 동적 폼(Dynamic Schema Form) 확장

지적해주신 부분이 정확합니다! 현재 어드민의 `UniversalContentNewView`는 Tiptap을 이용한 "범용 본문(`body`)" 하나만 입력받는 구조이다 보니, 프론트엔드에서 요구하는 고도화된 특정 메타데이터(A/B 비교군의 이름, Best for 타겟, 서브 설명 등)를 입력받을 창구가 없는 구멍이 존재했습니다.

이를 해결하기 위해 어드민 폼을 **"타입 인지형 동적 폼(Type-Aware Dynamic Form)"**으로 구조를 개편하고자 합니다.

## ⚠️ User Review Required

> [!IMPORTANT]
> 어떻게 폼을 확장할지에 대한 2가지 하드웨어(설계) 옵션이 있습니다. 선호하시는 방식을 알려주세요.
> 
> 1. **옵션 A (빠르고 직관적인 대응)**: `new/page.tsx` 내부에서 `if (type === 'compare')` 일 때 렌더링되는 전용 입력 섹션을 추가합니다. (Option A/B의 이름, 특징, Best for를 적는 Input 칸이 폼 하단에 등장)
> 2. **옵션 B (장기적인 JSON Schema 빌더 구조)**: `compare`, `routine`, `product` 등 각 타입이 필요로 하는 메타데이터 규격을 별도의 설정 파일에 명시하고, 그 설정 파일에 따라 UI 입력칸을 자동 생성(맵핑)하는 고도화된 방식.

---

## 🛠️ Proposed Changes (옵션 A를 가정한 기본 안)

### 1. Backend & Payload 구조 변경 없음
- 현재 스토어프론트는 `json_payload.profileA`, `json_payload.profileB`를 기대하고 있습니다. 따라서 DB 컬럼 추가 없이, 프론트엔드에서 묶어서 보내기만 하면 완벽히 호환됩니다.

### 2. Admin UI: Universal 폼 확장
#### [MODIFY] `new/page.tsx` (과 `edit/page.tsx`)
- `compare` 타입 전용 블록 렌더링 추가.
- `react-hook-form`에 `profileA_name`, `profileA_targetFit`, `profileA_description`, `profileB_*` 등의 필드를 추가.
- `onSubmit` 시, 해당 값들을 묶어 `json_payload: { profileA: {...}, profileB: {...}, body: ... }` 구조로 조립 후 저장하도록 수정.

---

## ❓ Open Questions

> [!WARNING]
> 만약 `Routine(루틴)`의 경우나 `Product(제품)`의 경우에도 일반 텍스트가 아닌 '단계별 1, 2, 3 스텝 구조' 나 '성분표'를 기입해야 한다면, 이참에 아예 각 **타입별 전용 컴포넌트(`CompareFormFields`, `RoutineFormFields`)** 로 파일들을 예쁘게 쪼개는 리팩토링을 병행하는 것이 어떨까요? (관리가 훨씬 수월해집니다!)

## 🧪 Verification Plan

1. **폼 노출 검증**: 테넌트 어드민에서 `비교 분석(Compare)`의 [새 항목 작성]에 들어갔을 때, 'Option A/B'에 대한 전용 입력칸(이름, 기대효과, 한줄설명)이 나타나는지 확인.
2. **데이터 파서 검증**: DB 저장 후 스토어프론트로 돌아가 해당 비교 글을 눌렀을 때, `해당 정보 없음` 이라는 회색 플레이스홀더 대신 진짜로 입력한 데이터가 A/B 매트릭스에 렌더링되는지 확인.
