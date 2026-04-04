---
title: DB Schema DDL Outline
status: recovered_from_visible_transcript_condensed
---
# DB Schema DDL Outline

## schema grouping
- identity_tenancy
- brand_foundation
- question_capital
- canonical_content
- trust_review
- template_generator
- publish_projection
- search_geo
- observatory_ops
- runtime_orchestration

## 공통 규칙
- 대부분 table에 `tenant_id`, `brand_id`
- `id uuid pk`
- `created_at`, `updated_at`
- 상태는 `text + check constraint`
- object head와 immutable version table 분리

## 핵심 테이블
### identity
- tenants
- brands
- workspace_users
- role_assignments
- reviewer_pools
- reviewer_pool_members

### brand_foundation
- brand_profiles
- brand_input_packs
- audience_segments
- concerns
- ingredients
- technologies
- claims
- products
- offers
- consult_paths

### question_capital
- raw_questions
- canonical_questions
- question_clusters
- question_cluster_members
- question_priority_profiles
- query_sets
- query_set_items

### canonical_content
- topics / topic_versions
- answer_cards / answer_card_versions
- routines / routine_versions
- compares / compare_versions
- product_fits / product_fit_versions
- kg_edges

### trust_review
- trust_blocks / trust_block_versions
- evidences
- evidence_uses
- boundary_rules
- boundary_rule_links
- review_tasks
- review_decisions
- restrictions
- revalidation_tasks

### template_generator
- template_families
- template_profiles
- template_modules
- template_assignments
- generator_runs
- generation_outputs
- prompt_registry_entries
- prompt_versions

### publish_projection
- publish_bundles
- publish_bundle_items
- routes
- page_projections
- navigation_nodes
- hub_projections
- structured_data_artifacts

### search_geo
- search_index_documents
- geo_blocks
- search_sync_runs
- citation_observations

### observatory_ops
- metric_snapshots
- signals
- alerts
- alert_signal_links
- rcas
- rca_targets
- fix_its
- fixit_targets
- recovery_verifications
- incidents
- postmortems
- audit_logs

### runtime
- job_runs
- job_runtime_events
- dlq_records
- scheduler_entries
- worker_health_snapshots

## snapshot tables
- tenant_home_snapshots
- reviewer_home_snapshots
- factory_home_snapshots
- ops_home_snapshots
- object_detail_snapshots
