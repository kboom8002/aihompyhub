---
title: Canonical Object JSON Schema Pack
status: reconstructed
---
# Canonical Object JSON Schema Pack

## 공통 공리
모든 canonical object는 아래 공통 shape를 가진다.

```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "brand_id": "uuid",
  "object_type": "Topic|AnswerCard|Routine|Compare|ProductFit|Product",
  "status_quartet": {
    "content_status": "draft",
    "review_status": "required",
    "publish_status": "unpublished",
    "ops_status": "unmeasured"
  },
  "risk_class": "low|medium|high",
  "gate_profile": "A|B|C|D"
}
```

## Topic
- title
- summary
- topic_type
- linked_cluster_ids

## AnswerCard
- title
- summary
- body_struct
- linked_topic_id
- linked_cluster_ids

## Routine
- title
- objective
- steps_struct[]
- suitability_struct

## Compare
- title
- compare_type
- criteria_struct[]
- matrix_struct
- decision_guidance_struct

## ProductFit
- title
- fit_reason_struct
- audience_context
- concern_context

## Product
- sku
- name
- category
- benefit_tags[]

## Trust snapshot 공통
- trust_summary
- evidence_refs[]
- boundary_refs[]
- reviewer_trace
