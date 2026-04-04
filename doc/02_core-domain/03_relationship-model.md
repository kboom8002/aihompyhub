---
title: Relationship Model
status: reconstructed
---
# Relationship Model

## 핵심 관계
- Brand 1:N QuestionCluster
- Brand 1:N Topic
- Topic 1:N AnswerCard
- Topic 1:N Routine
- Topic 1:N Compare
- AnswerCard N:M Routine
- AnswerCard N:M Compare
- Routine N:M Product
- Compare N:M Product
- ProductFit N:1 Product
- ProductFit N:M Concern
- Object N:M Evidence
- Object N:M BoundaryRule
- Object 1:N ReviewTask
- ObjectVersion 1:N ProjectionArtifact
- Alert N:M Signal
- RCA N:M Target
- FixIt N:M Target
- Incident N:M Alert / RCA / FixIt

## KG edge 예시
- cluster_maps_to_topic
- topic_has_answer
- topic_has_routine
- topic_has_compare
- answer_related_to_routine
- compare_has_subject
- routine_uses_product
- object_supported_by_evidence
- object_constrained_by_boundary
- object_followed_by_object

## 관계 원칙
- graph not tree
- no-dead-end path 보장
- Product 단독 종착점 금지
