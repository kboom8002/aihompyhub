---
title: README
status: reconstructed_repo_entrypoint
---
# AI Homepage Factory SaaS 문서 진입점

## 이 repo의 목적
이 repo는 **Skincare & Premium B2C AI Homepage Factory SaaS**를 구현하기 위한 문서와 코드를 담는다.

이 시스템의 목적은 개별 브랜드 홈페이지를 한 번 만드는 것이 아니라, 여러 브랜드의 AI Homepage를 반복적으로 빌드·운영·개선할 수 있는 **Factory OS**를 만드는 것이다.

여기서 핵심 정의는 아래와 같다.

- **AI Homepage**: 인간 고객용 홈페이지이면서 동시에 AI가 공식 정답으로 채택하기 쉬운 구조를 가진 이중 대응 웹사이트
- **Brand SSoT**: 브랜드의 공식 정답 본점
- **Media SSoT**: 브랜드 관련 질문, 해설, 사례, 비교, 사용 맥락을 구조화하는 콘텐츠 허브
- **Answer Commerce**: 질문에 대한 공식 답변에서 루틴·상담·구매로 자연스럽게 이어지는 전환 구조

## 설계 원칙
이 repo의 구현은 아래 원칙을 따른다.

- Question-first
- Answer-first
- Graph, not tree
- Content is object-based, not page-based
- Search is a core feature
- Trust always visible
- Product is not just merchandise
- Compare is a first-class object
- Routine is above product for action questions
- Template는 디자인 시스템 + 콘텐츠 시스템 + 웹사이트 구조 + trust grammar + conversion grammar의 조합
- Automation은 draft까지만, approval은 workflow 안에서 수행
- Multi-tenant SaaS는 feature list보다 meta-model과 operating model을 먼저 설계

## 공통 레이어
- Brand Input
- Question Capital
- Ontology
- KG
- Content
- Website
- Design System
- Workflow
- Ops
- Prompt

## 공통 모듈
- Brand Foundation Studio
- AI Homepage Builder Studio
- Content & Trust Studio
- Observatory & Ops Studio
- Tenant Admin
- Factory Admin
- Reviewer / Expert Admin
- Generator Layer
- Multi-tenant Core Data Model
- Worker / Queue / Sync Boundaries
- KPI / Root Cause / Fix-It Ops

## `/doc` 구조
```text
/doc
  /00_start-here
  /01_context
  /02_core-domain
  /03_template-generator
  /04_backend
  /05_frontend
  /06_workflow-publish-trust
  /07_ops-governance
  /08_delivery
  /09_archive
```

## Source of Truth 우선순위
1. `/02_core-domain`
2. `/04_backend`
3. `/05_frontend`
4. `/08_delivery`
5. `/07_ops-governance`

특히 backend 착수 시에는 `/04_backend/04_openapi-path-list.md`, `/04_backend/05_command-query-dto-spec.md`, `/04_backend/03_api-contract.md`를 함께 본다. path inventory는 `04_openapi-path-list.md`, payload shape는 `05_command-query-dto-spec.md`를 기준으로 맞춘다.

## ai-pair 시작 순서
### Backend
1. `01_context/01_factory-north-star-and-principles.md`
2. `02_core-domain/06_unified-core-data-model-kg-event-model.md`
3. `04_backend/01_backend-service-boundary.md`
4. `04_backend/02_db-schema-ddl-outline.md`
5. `04_backend/03_api-contract.md`
6. `04_backend/04_openapi-path-list.md`
7. `04_backend/05_command-query-dto-spec.md`
8. `04_backend/06_read-model-snapshot-spec.md`
9. `08_delivery/01_mvp-rollout-spec.md`
10. `08_delivery/02_seed-data-pack-spec.md`

### Frontend
1. `01_context/01_factory-north-star-and-principles.md`
2. `05_frontend/01_information-architecture.md`
3. `05_frontend/02_frontend-screen-contract-pack.md`
4. `05_frontend/03_admin-surface-field-map.md`
5. `05_frontend/04_role-dashboard-wireframe-outline.md`
6. `04_backend/06_read-model-snapshot-spec.md`
7. `08_delivery/02_seed-data-pack-spec.md`

## 구현 우선순위
### Phase 1
- Identity & Tenancy
- Brand Foundation
- Question Capital
- Canonical Content
- Trust & Review

### Phase 2
- Publish & Projection
- Search & GEO
- Template profile 기본
- Builder Studio 기본

### Phase 3
- Alert / RCA / Fix-It / Incident
- Runtime Console 기본

### Phase 4
- Generator Assist
- Prompt / provenance 확장

## 금지사항
- 단일 브랜드 CMS처럼 축소
- page / post 중심 모델링
- Product를 Answer/Routine/Compare보다 앞세우기
- Search / GEO / Trust / Observatory를 후순위로 미루기
- Template를 visual skin으로만 이해
- Generator가 publish-ready truth를 직접 만들게 하기

## 다음 문서
- `01_current-status.md`
- `02_reading-order.md`
- `03_repo-build-order.md`

## 최근 보강
- `04_backend/05_command-query-dto-spec.md`를 placeholder 수준에서 실제 MVP 구현용 DTO 계약 문서로 교체했다.
- `04_backend/04_openapi-path-list.md`를 path inventory / ownership / MVP tier 기준 문서로 전면 보강했다.
- backend와 frontend는 path set은 `04_openapi-path-list.md`, payload shape는 `05_command-query-dto-spec.md`를 기준으로 맞춘다.
