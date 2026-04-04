---
title: Frontend Screen Contract Pack
status: recovered_from_visible_transcript_condensed
---
# Frontend Screen Contract Pack

## 공통 Screen Contract
- screen_id
- screen_name
- shell
- screen_group
- route_pattern
- purpose
- primary_actor_roles
- required_permissions
- primary_query_snapshots
- primary_commands
- main_sections
- critical_states
- empty_states
- error_states
- backend_dependencies

## 핵심 화면
### Tenant
- Tenant Home `/tenant/home`
- Brand Foundation Studio `/tenant/studio/foundation`
- Content & Trust Studio `/tenant/studio/content`
- AI Homepage Builder Studio `/tenant/studio/builder`
- Question Capital Manager `/tenant/questions/clusters`
- Canonical Object Workspace `/:shell/objects/:objectType/:id`
- Publish Manager `/tenant/publish`
- Tenant Fix-It Board `/tenant/fixits`

### Reviewer
- Reviewer Home `/reviewer/home`
- Review Inbox `/reviewer/inbox`
- Review Workspace `/reviewer/reviews/:reviewTaskId`
- Evidence Registry `/reviewer/evidence`
- Boundary Registry `/reviewer/boundaries`
- Revalidation Queue `/reviewer/revalidation`

### Factory
- Factory Home `/factory/home`
- Tenant Registry `/factory/tenants`
- Template Registry `/factory/templates`
- Policy Registry `/factory/policies`
- Runtime Console `/factory/runtime`
- Systemic RCA Board `/factory/systemic-rca`

### Ops
- Ops Home `/ops/home`
- Alert Board `/ops/alerts`
- RCA Workbench `/ops/rca/:rcaId?`
- Fix-It Board `/ops/fixits`
- Incident Bridge `/ops/incidents/:incidentId`
- Search/GEO Dashboard `/ops/search-geo`

## 공통 rules
- object workspace 공유
- snapshot query + command를 함께 정의
- critical 화면은 trust/live risk fold 위 표시
- empty / error / partial data state 계약 포함
