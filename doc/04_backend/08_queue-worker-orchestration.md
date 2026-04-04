---
title: Queue Worker Orchestration
status: reconstructed_from_references
---
# Queue / Worker Orchestration

## Lane
- generator
- review-routing
- publish-projection
- search-sync
- metrics-signals
- fixit-assist
- runtime-maintenance

## Queue 정책
- priority: critical > high > normal > low
- tenant fairness 보장
- idempotency key 지원
- retry with capped backoff
- DLQ 이동 기준 명시

## Job lifecycle
1. queued
2. started
3. succeeded / failed
4. retried or moved to DLQ

## Worker 책임
- business truth 직접 소유 금지
- 해당 서비스 command/API 호출
- provenance / runtime event 기록
- structured failure reason 남김

## 운영자 액션
- pause lane
- resume lane
- rerun failed jobs
- drain queue
- open runtime incident
