---
title: Role Dashboard Wireframe Outline
status: reconstructed
---
# Role Dashboard Wireframe Outline

## Tenant Home
```text
[Top Context Bar]
[Critical Strip: uncovered / review pending / publish ready / trust issue / fix-it]

| Priority Cluster Gaps      | Live Trust Watch        |
| Canonical Work Queue       | Search / GEO Snapshot   |
| Publish Readiness          | Open Fix-Its            |
```

## Reviewer Home
```text
[Top Context Bar]
[Critical Strip: high-risk review / live trust risk / stale evidence / revalidation]

| Review Inbox               | Live Trust Risk         |
| Evidence Freshness Watch   | Boundary Gap Queue      |
| Revalidation Board         | Throughput / SLA        |
```

## Factory Home
```text
[Top Context Bar]
[Critical Strip: unhealthy tenants / IR-4 / DLQ / systemic RCA]

| Tenant Health Overview     | Runtime Health          |
| Systemic RCA Radar         | Rollout Impact          |
| Cross-tenant Trust Health  | Backfill / Revalidation |
```

## Ops Home
```text
[Top Context Bar]
[Critical Strip: AL-4 / incidents / RCA unowned / fix-it overdue]

| Critical Alert Queue       | RCA Intake              |
| Fix-It Delivery            | Recovery Verification   |
| Search / GEO Watch         | Trust Incident Watch    |
```
