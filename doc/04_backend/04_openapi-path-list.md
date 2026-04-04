---
title: OpenAPI Path List v1
status: reconstructed_and_upgraded
---
# OpenAPI Path List v1

## 1. 목적

이 문서는 **Skincare & Premium B2C AI Homepage Factory SaaS**의 MVP 구현에서 실제로 열어야 하는 API path를 **domain ownership / query-command 분리 / auth scope / internal orchestration** 기준으로 정리한 inventory다.

이 문서는 아래 문서와 함께 본다.

- `03_api-contract.md`: API 원칙, envelope, validation 규칙
- `05_command-query-dto-spec.md`: request/response payload shape
- `06_read-model-snapshot-spec.md`: snapshot query payload shape
- `01_backend-service-boundary.md`: service ownership

핵심 목적은 4가지다.

1. 프론트/백엔드가 같은 path set을 기준으로 작업하게 한다.
2. query와 command를 path 수준에서 분리한다.
3. public app API와 internal orchestration API를 구분한다.
4. MVP에서 반드시 구현할 path와 후순위 path를 나눈다.

---

## 2. 전역 규칙

### 2-1. Base path

```text
GET  /api/v1/queries/...
POST /api/v1/commands/...
POST /internal/v1/...
```

### 2-2. Query / Command 규칙

- `GET /queries/*` 는 read model / snapshot / registry / list / detail 조회 전용
- `POST /commands/*` 는 aggregate state change 요청 전용
- write effect가 있는 action을 `GET` 으로 노출하지 않는다

### 2-3. Naming 규칙

- resource는 kebab-case
- aggregate 중심 naming 사용
- action은 verb-first
- snapshot은 noun-first

예:
- `GET /api/v1/queries/question-clusters`
- `POST /api/v1/commands/answer-cards/create-draft`
- `GET /api/v1/queries/tenant-home-snapshot`

### 2-4. Scope 규칙

모든 public app API는 현재 auth context의
- `tenant_id`
- `brand_id`
- `market_code`
- `locale`
- `role_scope`
를 전제로 동작한다.

cross-tenant path는 factory role에서만 허용한다.

### 2-5. Idempotency 규칙

아래 command는 `Idempotency-Key` 권장 또는 필수다.
- publish execute
- publish rollback
- generator run start
- bulk upsert
- mitigation apply
- lane pause/resume

---

## 3. MVP Path Tier

### Tier A. MVP 필수
반드시 바로 구현해야 하는 path

### Tier B. MVP 강권
초기 demo/ops까지 보면 넣는 것이 좋은 path

### Tier C. Post-MVP
후속 phase에서 구현해도 되는 path

---

## 4. Context / Identity & Tenancy

## Queries

### Tier A
- `GET /api/v1/queries/context/current`
- `GET /api/v1/queries/brands`

### Tier B
- `GET /api/v1/queries/tenants`
- `GET /api/v1/queries/reviewer-pools`
- `GET /api/v1/queries/users/:id/roles`

## Commands

### Tier A
- `POST /api/v1/commands/brands/create`
- `POST /api/v1/commands/roles/assign`

### Tier B
- `POST /api/v1/commands/tenants/create`
- `POST /api/v1/commands/reviewer-pools/create`
- `POST /api/v1/commands/reviewer-pools/assign-member`

### Ownership
- Identity & Tenancy Service

### Auth scope
- `factory_admin`: tenants/create, reviewer-pool admin
- `tenant_owner`: brand create within authorized tenant
- `factory_admin | tenant_owner`: role assign within scope

---

## 5. Brand Foundation

## Queries

### Tier A
- `GET /api/v1/queries/brand-foundation`
- `GET /api/v1/queries/products`
- `GET /api/v1/queries/claims`
- `GET /api/v1/queries/concerns`
- `GET /api/v1/queries/audience-segments`

### Tier B
- `GET /api/v1/queries/brand-foundation-readiness`
- `GET /api/v1/queries/template-preferences`

## Commands

### Tier A
- `POST /api/v1/commands/brand-foundation/save-profile`
- `POST /api/v1/commands/products/upsert-batch`
- `POST /api/v1/commands/claims/upsert-batch`
- `POST /api/v1/commands/concerns/upsert-batch`
- `POST /api/v1/commands/audience-segments/upsert-batch`
- `POST /api/v1/commands/brand-foundation/publish-snapshot`

### Tier B
- `POST /api/v1/commands/brand-foundation/save-template-preference`
- `POST /api/v1/commands/products/archive`

### Ownership
- Brand Foundation Service

### UI consumers
- Brand Foundation Studio
- Tenant Home 일부
- Generator readiness panel

---

## 6. Question Capital

## Queries

### Tier A
- `GET /api/v1/queries/question-clusters`
- `GET /api/v1/queries/question-clusters/{id}`
- `GET /api/v1/queries/question-capital/home-snapshot`

### Tier B
- `GET /api/v1/queries/query-sets`
- `GET /api/v1/queries/query-sets/{id}`
- `GET /api/v1/queries/raw-questions`
- `GET /api/v1/queries/canonical-questions`

## Commands

### Tier A
- `POST /api/v1/commands/raw-questions/capture`
- `POST /api/v1/commands/question-clusters/create`
- `POST /api/v1/commands/question-clusters/{id}/reprioritize`
- `POST /api/v1/commands/question-clusters/{id}/map-topic`
- `POST /api/v1/commands/question-clusters/{id}/request-build`

### Tier B
- `POST /api/v1/commands/question-clusters/{id}/merge`
- `POST /api/v1/commands/query-sets/create`
- `POST /api/v1/commands/query-sets/{id}/add-items`

### Ownership
- Question Capital Service

### UI consumers
- Question Capital Manager
- Tenant Home priority gap panel
- Content & Trust Studio build queue

---

## 7. Canonical Content

## Queries

### Tier A
- `GET /api/v1/queries/topics`
- `GET /api/v1/queries/answer-cards`
- `GET /api/v1/queries/routines`
- `GET /api/v1/queries/compares`
- `GET /api/v1/queries/product-fits`
- `GET /api/v1/queries/products`
- `GET /api/v1/queries/objects/{objectType}/{id}`
- `GET /api/v1/queries/object-detail-snapshot`

### Tier B
- `GET /api/v1/queries/objects/{objectType}/{id}/versions`
- `GET /api/v1/queries/topics/{id}/graph`
- `GET /api/v1/queries/products/{id}/usage-context`

## Commands

### Tier A
- `POST /api/v1/commands/topics/create`
- `POST /api/v1/commands/answer-cards/create-draft`
- `POST /api/v1/commands/routines/create-draft`
- `POST /api/v1/commands/compares/create-draft`
- `POST /api/v1/commands/product-fits/create-draft`
- `POST /api/v1/commands/products/create-or-update`
- `POST /api/v1/commands/objects/{objectType}/{id}/patch`
- `POST /api/v1/commands/objects/{objectType}/{id}/request-review`

### Tier B
- `POST /api/v1/commands/objects/{objectType}/{id}/duplicate`
- `POST /api/v1/commands/objects/{objectType}/{id}/deprecate`
- `POST /api/v1/commands/objects/{objectType}/{id}/link-next-step`
- `POST /api/v1/commands/objects/{objectType}/{id}/unlink-next-step`

### Ownership
- Canonical Content Service

### UI consumers
- Content & Trust Studio
- Canonical Object Workspace
- Tenant Home canonical work queue

---

## 8. Trust & Review

## Queries

### Tier A
- `GET /api/v1/queries/reviewer-home-snapshot`
- `GET /api/v1/queries/review-tasks`
- `GET /api/v1/queries/review-tasks/{id}`
- `GET /api/v1/queries/review-workspace-snapshot`
- `GET /api/v1/queries/evidences`
- `GET /api/v1/queries/boundary-rules`
- `GET /api/v1/queries/revalidation-tasks`

### Tier B
- `GET /api/v1/queries/trust-risk-list`
- `GET /api/v1/queries/restrictions`
- `GET /api/v1/queries/evidences/{id}`
- `GET /api/v1/queries/boundary-rules/{id}`

## Commands

### Tier A
- `POST /api/v1/commands/reviews/tasks/create`
- `POST /api/v1/commands/reviews/{reviewTaskId}/record-decision`
- `POST /api/v1/commands/evidences/create`
- `POST /api/v1/commands/evidences/{id}/approve-public-use`
- `POST /api/v1/commands/evidences/{id}/mark-stale`
- `POST /api/v1/commands/evidence-uses/link`
- `POST /api/v1/commands/boundary-rules/create`
- `POST /api/v1/commands/boundary-rules/{id}/attach`
- `POST /api/v1/commands/restrictions/apply`
- `POST /api/v1/commands/revalidation-tasks/create`
- `POST /api/v1/commands/revalidation-tasks/{id}/clear`

### Tier B
- `POST /api/v1/commands/reviews/{reviewTaskId}/assign`
- `POST /api/v1/commands/reviews/{reviewTaskId}/escalate-expert`
- `POST /api/v1/commands/restrictions/remove`

### Ownership
- Trust & Review Service

### Auth scope
- reviewer / expert_reviewer / reviewer_lead
- 일부 restriction apply는 tenant_owner + reviewer dual intent 필요

---

## 9. Template & Generator

## Queries

### Tier A
- `GET /api/v1/queries/template-profiles`
- `GET /api/v1/queries/template-profiles/{id}`
- `GET /api/v1/queries/generator-runs`
- `GET /api/v1/queries/generator-runs/{id}`

### Tier B
- `GET /api/v1/queries/template-families`
- `GET /api/v1/queries/template-modules`
- `GET /api/v1/queries/prompt-registry`
- `GET /api/v1/queries/prompt-versions`

## Commands

### Tier A
- `POST /api/v1/commands/template-profiles/assign`
- `POST /api/v1/commands/generator-runs/start`
- `POST /api/v1/commands/generator-runs/{id}/accept-output`

### Tier B
- `POST /api/v1/commands/template-profiles/create`
- `POST /api/v1/commands/template-profiles/{id}/version-up`
- `POST /api/v1/commands/template-overrides/create`
- `POST /api/v1/commands/prompt-versions/promote`
- `POST /api/v1/commands/prompt-versions/rollback`

### Ownership
- Template & Generator Service

### Auth scope
- tenant_owner: template assignment
- factory_admin: prompt/template registry ops
- generator run start는 tenant_owner / content_lead / factory role 허용 가능

---

## 10. Publish & Projection

## Queries

### Tier A
- `GET /api/v1/queries/publish-bundles`
- `GET /api/v1/queries/publish-bundles/{id}`
- `GET /api/v1/queries/publish-bundle-snapshot`
- `GET /api/v1/queries/projection-health`
- `GET /api/v1/queries/routes`
- `GET /api/v1/queries/page-projections/{targetType}/{targetId}`

### Tier B
- `GET /api/v1/queries/navigation-nodes`
- `GET /api/v1/queries/hub-projections`
- `GET /api/v1/queries/structured-data-artifacts`
- `GET /api/v1/queries/rollback-history`

## Commands

### Tier A
- `POST /api/v1/commands/publish-bundles/create`
- `POST /api/v1/commands/publish-bundles/{id}/validate`
- `POST /api/v1/commands/publish-bundles/{id}/execute`
- `POST /api/v1/commands/publish-bundles/{id}/rollback`
- `POST /api/v1/commands/projections/regenerate`

### Tier B
- `POST /api/v1/commands/routes/regenerate`
- `POST /api/v1/commands/navigation-nodes/rebuild`
- `POST /api/v1/commands/structured-data/regenerate`

### Ownership
- Publish & Projection Service

### UI consumers
- Publish Manager
- Builder Studio
- Object Workspace Projection Tab

---

## 11. Search & GEO

## Queries

### Tier A
- `GET /api/v1/queries/search-geo-snapshot`
- `GET /api/v1/queries/search-documents`
- `GET /api/v1/queries/geo-blocks`

### Tier B
- `GET /api/v1/queries/citation-observations`
- `GET /api/v1/queries/search-sync-runs`

## Commands

### Tier A
- `POST /api/v1/commands/search-documents/generate`
- `POST /api/v1/commands/search-documents/{id}/sync`
- `POST /api/v1/commands/search-documents/{id}/unindex`
- `POST /api/v1/commands/geo-blocks/generate`
- `POST /api/v1/commands/geo-blocks/{id}/exclude`

### Tier B
- `POST /api/v1/commands/search-documents/bulk-sync`
- `POST /api/v1/commands/geo-blocks/bulk-regenerate`

### Ownership
- Search & GEO Service

### Auth scope
- tenant_owner / content_lead: regenerate request
- reviewer / factory/operator: exclude or unindex in trust-critical context

---

## 12. Observatory & Ops

## Queries

### Tier A
- `GET /api/v1/queries/ops-home-snapshot`
- `GET /api/v1/queries/alerts`
- `GET /api/v1/queries/alerts/{id}`
- `GET /api/v1/queries/rcas`
- `GET /api/v1/queries/rcas/{id}`
- `GET /api/v1/queries/fix-its`
- `GET /api/v1/queries/incidents`
- `GET /api/v1/queries/incidents/{id}/bridge`
- `GET /api/v1/queries/metrics`
- `GET /api/v1/queries/signals`

### Tier B
- `GET /api/v1/queries/benchmarks`
- `GET /api/v1/queries/postmortems`
- `GET /api/v1/queries/postmortems/{id}`
- `GET /api/v1/queries/systemic-rca-radar`

## Commands

### Tier A
- `POST /api/v1/commands/alerts/{id}/acknowledge`
- `POST /api/v1/commands/alerts/{id}/suppress`
- `POST /api/v1/commands/rcas/confirm`
- `POST /api/v1/commands/fix-its/create`
- `POST /api/v1/commands/fix-its/{id}/verify-recovery`
- `POST /api/v1/commands/incidents/open`
- `POST /api/v1/commands/incidents/{id}/apply-mitigation`
- `POST /api/v1/commands/postmortems/store`

### Tier B
- `POST /api/v1/commands/rcas/{id}/promote-systemic`
- `POST /api/v1/commands/fix-its/{id}/reopen`
- `POST /api/v1/commands/incidents/{id}/close`

### Ownership
- Observatory & Ops Service

### UI consumers
- Ops Home
- Alert Board
- RCA Workbench
- Fix-It Board
- Incident Bridge

---

## 13. Runtime Orchestration

## Queries

### Tier A
- `GET /api/v1/queries/runtime-health`
- `GET /api/v1/queries/runtime-health-snapshot`
- `GET /api/v1/queries/job-runs`
- `GET /api/v1/queries/dlq-records`

### Tier B
- `GET /api/v1/queries/worker-health`
- `GET /api/v1/queries/scheduler-entries`

## Public Commands

### Tier A
- `POST /api/v1/commands/runtime/lanes/{laneName}/pause-request`
- `POST /api/v1/commands/runtime/lanes/{laneName}/resume-request`
- `POST /api/v1/commands/runtime/dlq/{id}/rerun-request`

## Internal Commands

### Tier A
- `POST /internal/v1/jobs/enqueue`
- `POST /internal/v1/jobs/{id}/start`
- `POST /internal/v1/jobs/{id}/complete`
- `POST /internal/v1/jobs/{id}/fail`
- `POST /internal/v1/lanes/{laneName}/pause`
- `POST /internal/v1/lanes/{laneName}/resume`
- `POST /internal/v1/dlq/{id}/rerun`

### Ownership
- Runtime Orchestration Service

### 규칙
- public UI는 직접 internal path를 치지 않는다
- public command는 approval/request 의미만 갖고, 실제 execution은 internal path에서 처리한다

---

## 14. Snapshot Query Path Set

이 세트는 frontend screen contract와 바로 연결된다.

### Tier A
- `GET /api/v1/queries/tenant-home-snapshot`
- `GET /api/v1/queries/reviewer-home-snapshot`
- `GET /api/v1/queries/factory-home-snapshot`
- `GET /api/v1/queries/ops-home-snapshot`
- `GET /api/v1/queries/object-detail-snapshot`
- `GET /api/v1/queries/review-workspace-snapshot`
- `GET /api/v1/queries/publish-bundle-snapshot`
- `GET /api/v1/queries/incident-bridge-snapshot`
- `GET /api/v1/queries/runtime-health-snapshot`

### Tier B
- `GET /api/v1/queries/brand-foundation-snapshot`
- `GET /api/v1/queries/content-trust-studio-snapshot`
- `GET /api/v1/queries/builder-studio-snapshot`

### 규칙
- snapshot query는 read model / aggregator 기반
- `force_refresh=true` 는 privileged role에서만 허용

---

## 15. Auth Scope Matrix 요약

| Path Group | Main Roles |
|---|---|
| Identity & tenancy admin | factory_admin, tenant_owner |
| Brand foundation edit | tenant_owner, brand_strategist |
| Canonical content edit | content_lead, brand_strategist, tenant_owner |
| Review decision | reviewer, expert_reviewer, reviewer_lead |
| Publish execute / rollback | tenant_owner, factory_operator (context-dependent) |
| Search/GEO exclude/unindex | reviewer, tenant_owner, factory_operator |
| RCA / Fix-It / Incident | ops_lead, factory_operator, reviewer_lead 일부 |
| Runtime lane control | factory_operator, factory_admin |
| Prompt/template registry | factory_admin |

---

## 16. MVP 최소 Path 세트

아래 path가 있으면 first end-to-end MVP가 돈다.

### Core setup
- `GET /api/v1/queries/context/current`
- `GET /api/v1/queries/brand-foundation`
- `POST /api/v1/commands/brand-foundation/save-profile`
- `POST /api/v1/commands/products/upsert-batch`
- `POST /api/v1/commands/claims/upsert-batch`

### Question to canonical
- `GET /api/v1/queries/question-clusters`
- `POST /api/v1/commands/question-clusters/create`
- `POST /api/v1/commands/topics/create`
- `POST /api/v1/commands/answer-cards/create-draft`
- `POST /api/v1/commands/routines/create-draft`
- `POST /api/v1/commands/compares/create-draft`
- `GET /api/v1/queries/object-detail-snapshot`

### Review / trust
- `POST /api/v1/commands/objects/{objectType}/{id}/request-review`
- `GET /api/v1/queries/review-workspace-snapshot`
- `POST /api/v1/commands/reviews/{reviewTaskId}/record-decision`
- `POST /api/v1/commands/evidence-uses/link`
- `POST /api/v1/commands/boundary-rules/{id}/attach`

### Publish / search / GEO
- `POST /api/v1/commands/publish-bundles/create`
- `POST /api/v1/commands/publish-bundles/{id}/validate`
- `POST /api/v1/commands/publish-bundles/{id}/execute`
- `GET /api/v1/queries/publish-bundle-snapshot`
- `POST /api/v1/commands/search-documents/generate`
- `POST /api/v1/commands/geo-blocks/generate`
- `GET /api/v1/queries/search-geo-snapshot`

### Ops
- `GET /api/v1/queries/alerts`
- `POST /api/v1/commands/alerts/{id}/acknowledge`
- `POST /api/v1/commands/rcas/confirm`
- `POST /api/v1/commands/fix-its/create`
- `GET /api/v1/queries/incidents/{id}/bridge`

---

## 17. Post-MVP 후보 Path

- benchmark export APIs
- postmortem library browse APIs
- template rollout compare APIs
- prompt regression APIs
- bulk mitigation APIs 고도화
- advanced saved filters / query presets
- cross-tenant benchmark compare APIs

---

## 18. Path List 운영 규칙

1. path inventory는 `03_api-contract.md`보다 하위 문서이며, payload 정의는 DTO spec을 따른다.
2. 새로운 path를 추가할 때는 반드시 query/command 구분을 지킨다.
3. snapshot path는 screen contract와 1:1 또는 1:N 관계를 가져야 한다.
4. internal orchestration path는 public UI에서 직접 호출하지 않는다.
5. approval-sensitive command path는 audit / reason / role validation이 전제다.
6. path naming은 canonical object naming을 따라야 한다.
7. Product-only path를 Answer/Routine/Compare보다 더 상위 축으로 만들지 않는다.
8. search / GEO / trust / ops path를 부속 취급하지 않는다.
9. MVP는 Tier A 위주로 잠그고, Tier B/C는 뒤로 미룬다.
10. 이 문서는 OpenAPI 초안 작성 전 path inventory source of truth로 사용한다.
