---
title: Publish and Projection Flow
status: reconstructed
---
# Publish and Projection Flow

## 기본 흐름
1. object review approved
2. publish bundle create
3. validation
4. execute publish
5. route / page projection generate
6. search doc / GEO block generate
7. observability watch
8. rollback / republish if needed

## 필수 체크
- review approved?
- restriction active?
- trust visibility valid?
- projection matrix pass?
- search/GEO generated?
