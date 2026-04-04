---
title: API Contract
status: recovered_from_visible_transcript_condensed
---
# API Contract

## base
- `GET /api/v1/queries/...`
- `POST /api/v1/commands/...`
- internal worker API: `/internal/v1/...`

## request context
Headers:
- `X-Tenant-Id`
- `X-Brand-Id`
- `X-Market-Code`
- `X-Locale`
- `X-Request-Id`
- `Idempotency-Key` (command)

## response envelope
### query
- `data`
- `meta.request_id`
- `meta.snapshot_at`
- `meta.tenant_id/brand_id/locale/market_code`

### command
- `command_id`
- `status`
- `target_ref`

## query groups
- current context
- brand foundation
- question clusters
- objects
- review tasks / review workspace
- template profiles / generator runs
- publish bundles / projection health
- search / GEO snapshot
- alerts / RCA / fix-its / incidents
- runtime health

## command groups
- tenant/brand/user/role
- brand foundation save / upsert
- capture raw question
- create cluster / reprioritize / map topic
- create topic / answer / routine / compare / product fit draft
- request review
- record review decision
- attach evidence / boundary
- apply restriction / revalidation
- assign template profile / start generator run
- create/validate/execute/rollback publish bundle
- generate/sync/unindex search docs
- generate/exclude GEO blocks
- acknowledge alert / confirm RCA / create fix-it / verify recovery / open incident / apply mitigation
- enqueue/pause/resume runtime lanes (internal)

## 공통 validation
- role validation
- tenant/brand scope validation
- state validation
- idempotency
- audit logging
