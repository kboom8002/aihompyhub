---
title: Snapshot Build and Invalidation Flow
status: reconstructed
---
# Snapshot Build / Invalidation Flow

## Build 방식
### Materialized
- tenant_home_snapshot
- reviewer_home_snapshot
- factory_home_snapshot
- ops_home_snapshot
- object_detail_snapshot (선택적 캐시)

### On-demand
- review_workspace_snapshot
- publish_bundle_snapshot
- incident_bridge_snapshot
- runtime_health_snapshot

## Event-driven invalidation
### tenant_home
- cluster priority update
- review task status change
- restriction apply/remove
- publish bundle status change
- fix-it status change

### reviewer_home
- review task create/update
- evidence status change
- boundary link change
- revalidation change

### object_detail
- object version create
- trust block update
- projection regenerate
- alert open/resolve
- fix-it open/close

### incident_bridge
- incident state change
- mitigation applied
- linked alert / RCA / fix-it change

## 운영 규칙
- outbox subscriber 기반 rebuild
- noisy event는 debounce batch
- approval-sensitive action 후 강제 refresh 허용
- stale snapshot은 UI 배지로 노출
