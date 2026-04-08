# TASKFLOW Practice Entry Guide Bank

## 0. 문서 목적
이 문서는 M0~M13 적용 실습 시작 시, 학습자가 막히지 않도록 starter example, cold-start scaffold, own-case conversion 브릿지를 제공하는 실습 진입 가이드 뱅크다.

이 문서의 역할:
- 교재의 실습 진입 가이드를 에이전트 런타임 루틴으로 전환
- `/예시`, `/주제`, `/복귀`의 응답 근거 제공
- starter 선택 → own-case conversion → 점검 실습 이동을 일관되게 유지
- session log metadata에 남길 starter trace 기준 제공

---

## 1. 공통 운영 규칙

### 1.1 기본 실행 순서
1. 현재 모듈과 현재 단계를 재고정한다.
2. 학습자가 자기 사례를 바로 낼 수 있는지 확인한다.
3. 막히면 starter example 2~4개를 제시한다.
4. 예시 하나를 고르게 한다.
5. 예시로 먼저 한 번 구조화하게 한다.
6. 같은 유형의 자기 사례로 전환하게 한다.
7. 점검 실습으로 이동한다.

### 1.2 starter 설계 원칙
- starter는 현재 모듈의 타깃 블록만 먼저 연다.
- starter는 “고르면 바로 시작” 가능한 수준이어야 한다.
- starter는 긴 설명보다 첫 문장/첫 카드/첫 선택지를 제공해야 한다.
- starter는 반드시 own-case conversion 브릿지를 가져야 한다.
- starter는 점검 실습 전에 최소 1회 구조화가 일어나게 설계한다.

### 1.3 공통 필드
각 entry는 아래 필드를 가진다.
- module_id
- module_name
- target_focus
- stage_scope
- entry_goal
- use_when
- starter_options
  - starter_id
  - starter_title
  - fit_signals
  - first_step
  - starter_prompt
  - expected_first_output
  - bridge_to_own_case
  - follow_up_check
  - recommended_next_module
- agent_scaffold
- save_metadata_candidates

---

## 2. M0

### module_id
M0

### module_name
AI 기초 활용 리터러시와 TASKFLOW 입문

### target_focus
orientation

### stage_scope
3단계 적용 실습 진입

### entry_goal
대화형 습관에서 벗어나, 새 세션과 카드 기반으로 작업을 다시 보기 시작한다.

### use_when
- 최근 작업이 막연하게 흔들린다.
- 새 세션이 필요한지 잘 모르겠다.
- 무엇부터 시작해야 할지 모르겠다.

### starter_options

#### starter_id
M0-ENTRY-01

#### starter_title
회의 정리형 작업

#### fit_signals
- 회의 메모를 요약하거나 공유해야 한다.
- 정리·보고형 작업을 자주 반복한다.

#### first_step
새 세션 필요 여부부터 고른다.

#### starter_prompt
- 작업명: 팀 공유용 회의 요약문
- 새 세션 필요 여부: 필요함 / 유지 가능
- [T]&#58; 무엇을 만들 것인가
- [O]&#58; bullet 5개 이내
- [K]&#58; 회의 메모 원문
- [W]&#58; 없는 결론 추가 금지

#### expected_first_output
새 세션 필요 여부 + T/O/K/W 4줄

#### bridge_to_own_case
내 최근 정리·보고 작업 1개를 같은 형식으로 다시 적는다.

#### follow_up_check
지금 가장 먼저 비어 있는 것은 T인가, O인가?

#### recommended_next_module
M1 또는 M3

---

#### starter_id
M0-ENTRY-02

#### starter_title
독자가 중요한 작업

#### fit_signals
- 자기소개, 지원문, 협업 요청문을 써야 한다.
- 누가 읽는지에 따라 톤이 달라진다.

#### first_step
이 작업을 현재 세션에 섞어도 되는지 먼저 본다.

#### starter_prompt
- 작업명: 1분 자기소개 초안
- 새 세션 필요 여부: 필요함 / 유지 가능
- [T]&#58; 무엇을 만들 것인가
- [O]&#58; 말하기용 스크립트
- [K]&#58; 내 실제 경험 2개
- [W]&#58; 없는 경험 추가 금지

#### expected_first_output
새 세션 여부 + T/O/K/W 4줄

#### bridge_to_own_case
내 최근 독자 중심 작업 1개를 같은 형식으로 다시 적는다.

#### follow_up_check
이 작업은 M1로 갈지, M2나 M4로 갈지 고른다.

#### recommended_next_module
M2 또는 M4

---

#### starter_id
M0-ENTRY-03

#### starter_title
공지·안내형 작업

#### fit_signals
- 일정 변경, 공지, 고객 안내처럼 오해 리스크가 있다.
- 짧지만 금지선이 중요하다.

#### first_step
새 세션 분리 여부와 출력 형태부터 본다.

#### starter_prompt
- 작업명: 일정 변경 안내문
- 새 세션 필요 여부: 필요함 / 유지 가능
- [T]&#58; 고객 안내문 작성
- [O]&#58; 5문장 이내 공지문
- [K]&#58; 확정된 변경 일정만 반영
- [W]&#58; 확인되지 않은 약속 금지

#### expected_first_output
새 세션 여부 + T/O/K/W 4줄

#### bridge_to_own_case
내 최근 공지·안내 작업 1개를 같은 형식으로 다시 적는다.

#### follow_up_check
지금은 M1, M3, M4 중 어디로 가는 편이 맞는가?

#### recommended_next_module
M3 또는 M4

### agent_scaffold
- 최근 작업 하나를 고르세요.
- 이 작업은 새 세션이 필요한가요?
- 지금 가장 비어 있는 것은 T / O / K / W 중 무엇인가요?
- 다음은 M1, M2, M3, M4 중 어디가 맞나요?

### save_metadata_candidates
- starter_source
- starter_id
- cold_start_help_used
- session_split_needed
- first_missing_block
- recommended_next_module

---

## 3. M1

### module_id
M1
### module_name
막연한 요청을 분명한 구조로 바꾸기
### target_focus
T / O / K / W
### stage_scope
3단계 적용 실습 진입
### entry_goal
막연한 자연어 요청을 4문항 프롬프트 카드로 바꾸는 첫 감각을 만든다.

### use_when
- “잘 정리해 줘”, “자연스럽게 써 줘” 같은 요청이 많다.
- 무엇을 만들고 어떤 형태로 받을지 흐리다.

### starter_options

#### starter_id
M1-ENTRY-01
#### starter_title
학습·과제형
#### fit_signals
- 강의자료 발표 준비
- 개념 정리, 과제 초안
#### first_step
예시를 먼저 4문항 카드로 바꾼다.
#### starter_prompt
강의자료를 바탕으로 5분 발표 대본을 만들어 줘.
#### expected_first_output
[T] 5분 발표 대본 작성 / [O] 말하기용 스크립트 / [K] 강의자료 핵심 3개 / [W] 자료 밖 사례 금지
#### bridge_to_own_case
같은 방식으로 내 학습·과제형 요청 1개를 다시 쓴다.
#### follow_up_check
네 문항 중 가장 흐린 칸은 어디인가?
#### recommended_next_module
M2 또는 M3

#### starter_id
M1-ENTRY-02
#### starter_title
정리·보고형
#### fit_signals
- 회의 메모 정리
- 팀 공유용 보고
#### first_step
예시를 4문항 카드로 다시 쓴다.
#### starter_prompt
이 회의 메모를 팀 공유용으로 정리해 줘.
#### expected_first_output
[T] 팀 공유용 회의 요약문 작성 / [O] bullet 5개 / [K] 회의 메모 원문 / [W] 없는 결론 추가 금지
#### bridge_to_own_case
내 최근 정리·보고형 요청 1개를 같은 형식으로 다시 쓴다.
#### follow_up_check
O가 실제 공유 형식까지 충분히 고정됐는가?
#### recommended_next_module
M2 또는 M3

#### starter_id
M1-ENTRY-03
#### starter_title
취업·협업형
#### fit_signals
- 자기소개 초안
- 협업 요청문
#### first_step
무엇을 만들지와 금지선을 먼저 다시 적는다.
#### starter_prompt
내 경험을 바탕으로 자기소개 초안을 써 줘.
#### expected_first_output
[T] 자기소개 초안 작성 / [O] 1분 말하기용 스크립트 / [K] 실제 경험 / [W] 없는 경험 추가 금지
#### bridge_to_own_case
내 최근 취업·협업형 요청을 같은 카드로 다시 쓴다.
#### follow_up_check
독자가 중요해지면 M2 또는 M4로 넘어가야 하는가?
#### recommended_next_module
M2 또는 M4

#### starter_id
M1-ENTRY-04
#### starter_title
공지·소통형
#### fit_signals
- 안내문
- 공지 메시지
#### first_step
형태와 금지선을 먼저 적는다.
#### starter_prompt
일정 변경 공지문을 써 줘.
#### expected_first_output
[T] 일정 변경 공지문 작성 / [O] 5문장 이내 공지문 / [K] 확정 일정 / [W] 확인되지 않은 약속 금지
#### bridge_to_own_case
내 최근 공지·소통형 요청을 같은 카드로 다시 쓴다.
#### follow_up_check
T와 O가 구분됐는가?
#### recommended_next_module
M3 또는 M4

### agent_scaffold
- 네 가지 중 가장 가까운 작업군 하나를 고르세요.
- 먼저 그 예시를 T/O/K/W로 바꿔 보세요.
- 이제 내 사례를 같은 형식으로 다시 적어 보세요.

### save_metadata_candidates
- starter_source
- starter_id
- converted_to_own_case
- cold_start_help_used
- recommended_next_module

---

## 4. M2

### module_id
M2
### module_name
무엇을 만들지와 결과 형태를 먼저 정하기
### target_focus
T / O / level
### stage_scope
3단계 적용 실습 진입
### entry_goal
[T]와 [O]를 먼저 고정하고, 3·5·8 시작 수준을 판단하게 한다.

### use_when
- 같은 작업인데 시작 밀도가 자꾸 흔들린다.
- 무겁게 시작할지 가볍게 시작할지 감이 없다.

### starter_options
(생략 없이 유지하되 공통 필드 구조 준수)
- M2-ENTRY-01: 3수준 / 강의 복습용 핵심 요약
- M2-ENTRY-02: 3수준 / 내부 확인용 일정 조율 메일
- M2-ENTRY-03: 5수준 / 팀 공유용 회의 요약문
- M2-ENTRY-04: 5수준 / 지원 직무용 1분 자기소개

### agent_scaffold
- 먼저 T와 O를 쓰세요.
- 그다음 왜 3수준인지, 왜 5수준인지 한 줄로 적으세요.
- 아직 확신이 없으면 3수준과 5수준 예시 중 하나를 고르세요.

### save_metadata_candidates
- starter_source
- starter_id
- chosen_level
- level_reason
- converted_to_own_case
- recommended_next_module

---

## 5. M3

### module_id
M3
### module_name
기준, 순서, 주의점을 더해 결과가 빗나가지 않게 통제하기
### target_focus
K / F / W
### stage_scope
3단계 적용 실습 진입
### entry_goal
결과 흔들림의 원인을 K/F/W 중 무엇이 비었는지로 좁혀 보게 한다.

### starter_options
- M3-ENTRY-01: K 스타터
- M3-ENTRY-02: F 스타터
- M3-ENTRY-03: W 스타터

각 starter는 아래 공통 질문을 가진다.
- 지금 가장 먼저 막아야 하는 문제는 무엇인가?
- 왜 이 starter가 현재 문제를 먼저 줄이는가?
- own-case에서 먼저 붙일 블록은 무엇인가?

### agent_scaffold
- 지금 가장 먼저 막아야 하는 문제를 고르세요: 일반론 / 순서 붕괴 / 위험 표현
- K / F / W 중 하나만 먼저 적어 보세요.
- 그다음 나머지 두 블록을 덧붙이겠습니다.

### save_metadata_candidates
- starter_source
- starter_id
- dominant_control_block
- converted_to_own_case
- cold_start_help_used
- recommended_next_module

---

## 6. M4

### module_id
M4
### module_name
나머지 블록을 채워 실제 상황에 맞추기
### target_focus
A / S / L
### stage_scope
3단계 적용 실습 진입
### entry_goal
누가 누구에게, 어떤 상황에서, 어떤 말투로 전달할지 먼저 정렬하게 한다.

### starter_options
- M4-ENTRY-01: 고객 불만 대응 메시지
- M4-ENTRY-02: 임원 보고용 요약문
- M4-ENTRY-03: 서버 점검 공지문

공통 규칙:
- 먼저 A/S/L만 쓴다.
- 그다음 기존 T/O/K/F/W와 합친다.
- 마지막에 own-case로 전환한다.

### agent_scaffold
- 가장 가까운 장면 하나를 고르세요: 고객 대응 / 임원 보고 / 긴급 공지
- 먼저 A/S/L만 써 보세요.
- 그다음 기존 T/O/K/F/W와 합치겠습니다.

### save_metadata_candidates
- starter_source
- starter_id
- dominant_context_block
- converted_to_own_case
- cold_start_help_used
- recommended_next_module

---

## 7. M5

### module_id
M5
### module_name
결과물의 형태를 다듬어 바로 복사해 쓰기
### target_focus
F / L / O
### stage_scope
3단계 적용 실습 진입
### entry_goal
출력 결함 유형을 먼저 고르고, 복사 가능한 출력 상태로 밀어 올린다.

### starter_options
- M5-ENTRY-01: 인사말·맺음말 제거
- M5-ENTRY-02: 통문단 분리
- M5-ENTRY-03: 장식 제거

공통 규칙:
- 문제 유형 먼저 선택
- 대응 블록 1개 먼저 선택
- starter 한 줄 먼저 적용
- own-case 제목만 넣어 다시 씀

### agent_scaffold
- 지금 가장 거슬리는 출력 문제를 고르세요: 인사말 / 통문단 / 장식
- 그 문제를 먼저 막을 블록을 고르세요: O / F / L
- starter 한 줄을 먼저 그대로 써 보세요.

### save_metadata_candidates
- starter_source
- starter_id
- surface_issue_type
- dominant_output_block
- copy_ready_self_check
- converted_to_own_case

---

## 8. M6

### module_id
M6
### module_name
성공한 지시문을 나만의 템플릿으로 남기기
### target_focus
constants / variables
### stage_scope
3단계 적용 실습 진입
### entry_goal
잘 작동한 지시문에서 무엇을 상수로 남기고 무엇을 변수로 비울지 구분하게 한다.

### starter_options
- M6-ENTRY-01: 회의 요약 템플릿으로 남기기
- M6-ENTRY-02: 고객 문의 답변 템플릿으로 남기기
- M6-ENTRY-03: 내가 자주 쓰는 성공 지시문 템플릿으로 남기기

공통 규칙:
- 상수 먼저
- 변수 슬롯 나중
- template name, 핵심 상수 3개, 주요 변수 슬롯 2개를 마지막에 남김

### agent_scaffold
- 지난번 잘 썼던 지시문이 무엇인지 고르세요.
- 먼저 상수로 남길 블록을 하나만 고르세요: T / W / F / L / O
- 그다음 변수로 비울 것을 고르세요: A / S / K / 날짜 / 수치 / 원문 자료

### save_metadata_candidates
- starter_source
- starter_id
- template_name
- template_candidate_type
- constant_first_block
- variable_slot_count
- raw_input_separated
- converted_to_own_case

---

## 9. 운영 메모
- `/예시`: 현재 모듈의 starter_options 2~4개를 짧게 제시
- `/주제`: 현재 모듈에 맞는 과업 유형을 추천
- `/복귀`: 현재 모듈 / 단계 / 타깃 블록을 다시 고정
- starter는 한 번에 1개만 깊게 본다.
- starter 사용 여부와 own-case 전환 여부를 metadata에 남길 수 있게 한다.