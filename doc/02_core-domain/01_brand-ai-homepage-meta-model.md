---
title: Brand AI Homepage Meta Model
status: reconstructed_from_conversation
---
# Brand AI Homepage Meta Model

## 목적
모든 tenant가 공유하는 AI Homepage Factory의 공통 구조 모델을 정의한다.

## Meta Model 상위 층
1. Tenant / Brand Layer
2. Question Capital Layer
3. Ontology / KG Layer
4. Canonical Content Layer
5. Trust Layer
6. Template / Generator Layer
7. Publish / Projection Layer
8. Search / GEO Layer
9. Observatory / Ops Layer

## First-class object
- QuestionCluster
- Topic
- AnswerCard
- Routine
- Compare
- Product
- ProductFit
- TrustBlock
- Evidence
- BoundaryRule
- ReviewTask
- PublishBundle
- Alert / RCA / FixIt / Incident

## 상태 축
- content_status
- review_status
- publish_status
- ops_status
- risk_class
- gate_profile

## 핵심 규칙
- page가 아니라 object가 핵심
- Product는 answer graph의 실행 노드
- Routine / Compare는 first-class
- Trust는 high-risk 객체에서 가시적이어야 함
- Search / GEO는 파생 부속이 아니라 core-adjacent layer
