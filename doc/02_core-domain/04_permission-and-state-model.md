---
title: Permission and State Model
status: reconstructed
---
# Permission and State Model

## Role
- tenant_owner
- brand_strategist
- content_lead
- reviewer
- expert_reviewer
- factory_operator
- factory_admin
- ops_lead

## Permission 원칙
- Tenant는 브랜드 scope 내 canonical edit 가능
- Reviewer는 review decision / evidence / boundary 관리 가능
- Factory는 template, policy, runtime, cross-tenant ops 관리 가능
- Ops는 alert / RCA / fix-it / incident 운영 가능

## 상태 모델
### content_status
- draft
- ready_for_review
- approved
- published
- deprecated
- archived

### review_status
- not_required
- required
- queued
- in_review
- changes_requested
- approved
- rejected

### publish_status
- unpublished
- scheduled
- live
- limited_live
- suspended
- retired

### ops_status
- unmeasured
- monitored
- healthy
- at_risk
- issue_detected
- fix_in_progress
- revalidation_pending

## Approval gate
- A: low risk
- B: medium risk
- C: trust-heavy
- D: high-risk / reviewer-required
