---
title: Queue Payload Schema Pack
status: reconstructed_from_references
---
# Queue Payload Schema Pack

## 공통 envelope
```json
{
  "jobId": "uuid",
  "jobType": "publish.generate_projection",
  "tenantId": "uuid",
  "brandId": "uuid",
  "scopeType": "AnswerCard",
  "scopeRef": "uuid",
  "priority": "high",
  "idempotencyKey": "string",
  "payload": {}
}
```

## 대표 payload
### generator.run
- generatorUnit
- inputPackRef
- templateProfileRef

### publish.generate_projection
- publishBundleId
- targetType
- targetId
- targetVersionId
- projectionTypes[]

### search.sync_document
- searchDocumentId
- targetType
- targetId
- targetVersionId

### ops.recompute_metrics
- metricIds[]
- grainType
- grainRef

### fixit.assist_patch
- fixitId
- rcaId
- targetRefs[]
