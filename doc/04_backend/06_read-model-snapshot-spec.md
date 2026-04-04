---
title: Read Model / Snapshot Spec
status: recovered_from_visible_transcript_condensed
---
# Read Model / Snapshot Spec

## 목적
frontend가 여러 write model을 직접 조인하지 않고도 role shell / studio / admin / ops 화면을 빠르게 렌더할 수 있도록 snapshot contract를 표준화한다.

## snapshot 공통 envelope
- snapshot_id
- snapshot_type
- snapshot_version
- context { tenant, brand, locale, market, viewer_role }
- as_of
- freshness { status, source_lag_seconds }
- data
- actions
- warnings
- critical_flags

## shared view model
- StatusQuartetVM
- TrustStateVM
- ProjectionStateVM
- ObservabilityStateVM
- NextActionVM

## 핵심 snapshot
- tenant_home_snapshot
- reviewer_home_snapshot
- factory_home_snapshot
- ops_home_snapshot
- brand_foundation_snapshot
- content_trust_studio_snapshot
- builder_studio_snapshot
- object_detail_snapshot
- review_workspace_snapshot
- publish_bundle_snapshot
- incident_bridge_snapshot
- runtime_health_snapshot
- alert_list_snapshot
- rca_workbench_snapshot
- fixit_board_snapshot
- cluster_list_snapshot
- search_geo_snapshot

## storage/build 전략
- home/dashboard: materialized snapshot
- approval/incident/workspace: on-demand assembly
- freshness와 degraded section 표시 필수
