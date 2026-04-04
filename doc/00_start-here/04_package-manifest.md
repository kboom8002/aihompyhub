---
title: Package Manifest
status: generated
---
# Package Manifest

이 패키지는 conversation에서 **직접 보이는 본문을 최대한 보존**하고, 본문이 생략된 초기 문서는 이후 문맥과 참조 관계를 바탕으로 **실행 가능한 working draft**로 재구성했다.

## provenance status
- `recovered_from_visible_transcript`: 대화에 보인 본문 중심으로 복원
- `reconstructed`: 후속 문맥과 연결 구조를 기반으로 실무용 초안으로 재구성
- `reconstructed_repo_entrypoint`: repo onboarding용 신규 조립 문서

## 목적
- 프로젝트 루트에 바로 풀어서 작업 가능
- backend / frontend / QA ai-pair가 바로 착수 가능
- source-of-truth 우선순위가 보이도록 재배치


## recent updates
- `04_backend/05_command-query-dto-spec.md`를 실구현용 DTO 계약 문서로 전면 교체
- `00_start-here/README.md`에 DTO spec를 backend 필독 문서로 반영

- `04_backend/04_openapi-path-list.md`를 path inventory / ownership / MVP tier 기준 문서로 전면 보강
