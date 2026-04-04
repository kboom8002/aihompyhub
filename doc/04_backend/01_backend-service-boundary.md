---
title: Backend Service Boundary
status: recovered_from_visible_transcript
---
# Backend Service Boundary

## 상위 bounded context
1. Identity & Tenancy
2. Brand Foundation
3. Question Capital
4. Canonical Content
5. Trust & Review
6. Template & Generator
7. Publish & Projection
8. Search & GEO
9. Observatory & Ops
10. Runtime Orchestration

## 서비스별 핵심 소유권
### Identity & Tenancy
tenant, brand, user, role, reviewer pool

### Brand Foundation
brand brief, concerns, claims, products, consult paths

### Question Capital
raw question, canonical question, cluster, priority, query set

### Canonical Content
topic, answer, routine, compare, product fit, object version

### Trust & Review
trust block, evidence, boundary, review task, review decision, restriction, revalidation

### Template & Generator
template family/profile/module, template assignment, prompt registry, generator run

### Publish & Projection
publish bundle, route, page projection, hub projection, structured data

### Search & GEO
search document, GEO block, sync run

### Observatory & Ops
metric, signal, alert, RCA, fix-it, incident, postmortem

### Runtime Orchestration
job run, scheduler, queue, DLQ, worker health

## interaction 원칙
- write truth는 해당 서비스만 소유
- cross-service 변경은 command/event로 연결
- dashboard는 read model로 조합
- public truth 전환은 sync validation
- background build/metric은 async
