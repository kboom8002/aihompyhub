---
title: Generator Architecture
status: recovered_from_visible_transcript
---
# Generator Architecture

## Generator 정의
brand brief, 제품 데이터, 레퍼런스를 입력받아 ontology, content system, structure 초안을 도출하는 **draft-only automation layer**다.

## 상위 구조
1. Input Ingestion
2. Interpretation
3. Planning
4. Canonical Draft Generation
5. Trust & Safety Draft
6. Projection Recommendation
7. Validation & Scoring
8. Workflow Handoff

## 입력 팩
- Brand Brief Pack
- Product Master Pack
- Claim & Evidence Pack
- Audience / Concern Pack
- Question Capital Seed Pack
- Reference Surface Pack
- Template Preference Pack
- Governance Pack
- Rollout Intent Pack

## 출력
- domain family / trust mode 추천
- topic map / ontology seed
- QuestionCluster / Topic / AnswerCard / Routine / Compare / ProductFit draft
- trust block / evidence placeholder / boundary recommendation
- route / nav / search / GEO hint
- workflow handoff package

## 규칙
- Generator는 page가 아니라 canonical object graph를 생성
- Template를 대체하지 않음
- publish-ready truth를 직접 만들지 않음
- YMYL-lite safe: evidence / boundary / reviewer-required flag 내장
