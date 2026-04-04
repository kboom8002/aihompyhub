---
title: Unified Core Data Model / KG / Event Model
status: recovered_from_visible_transcript
---
# Unified Core Data Model / KG / Event Model

## 목적
정본 저장 모델, 그래프 관계 모델, 이벤트 계보 모델을 하나의 구현 가능한 core schema로 통합한다.

## 상위 층
1. Canonical Domain Model
2. Knowledge Graph Model
3. Derived Surface Model
4. Operational Event & Audit Model

## Canonical 주요 entity
- Tenant / Brand / User / Role
- BrandProfile / Audience / Concern / Ingredient / Claim / Product
- RawQuestion / CanonicalQuestion / QuestionCluster / QuerySet
- Topic / AnswerCard / Routine / Compare / ProductFit
- TrustBlock / Evidence / BoundaryRule / ReviewTask
- PublishBundle / Route / PageProjection / SearchDoc / GEOBlock
- Metric / Signal / Alert / RCA / FixIt / Incident / Postmortem
- JobRun / DLQ / Scheduler

## KG node / edge
- node: Brand, Concern, QuestionCluster, Topic, AnswerCard, Routine, Compare, Product, ProductFit, TrustBlock, Evidence, BoundaryRule
- edge: cluster_maps_to_topic, topic_has_answer, topic_has_routine, topic_has_compare, answer_related_to_routine, routine_uses_product, compare_has_subject, object_supported_by_evidence, object_constrained_by_boundary, object_followed_by_object

## Derived artifact
- Route
- PageProjection
- SearchIndexDocument
- GEOBlock
- StructuredDataArtifact
- HubProjection

## Event model
### domain events
- raw_question.captured
- canonical_question.normalized
- question_cluster.created
- topic.created
- answer_card.created
- routine.created
- compare.created
- review.approved
- publish.completed
- restriction.applied

### runtime events
- job.queued
- job.started
- job.succeeded
- job.failed
- job.moved_to_dlq

### observability events
- signal.detected
- alert.opened
- rca.confirmed
- fixit.created
- recovery.verified
- incident.opened

## 불변 규칙
- canonical storage의 기본 단위는 object
- graph edge catalog는 core relation layer
- Product는 execution node
- Search / GEO / Trust / Observatory는 명시적 persistence를 가짐
- generator output과 approved truth는 provenance / status로 구분
