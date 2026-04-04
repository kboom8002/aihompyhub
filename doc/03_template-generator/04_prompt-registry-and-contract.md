---
title: Prompt Registry and Contract
status: reconstructed
---
# Prompt Registry and Contract

## Prompt Registry
- interpretation prompt
- ontology prompt
- answer draft prompt
- routine draft prompt
- compare draft prompt
- trust draft prompt
- projection hint prompt
- patch prompt

## 필수 contract
- target stage
- target object type
- required inputs
- forbidden claims / wording
- required output fields
- structured JSON schema
- confidence score
- fallback behavior

## 규칙
- 자유 텍스트보다 structured JSON 우선
- prompt alone으로 publish-ready object 생성 금지
- prompt version은 promote / rollback 가능해야 함
- generator provenance에 prompt version 기록
