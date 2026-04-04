---
title: Repo Build Order
status: reconstructed
---
# Repo Build Order

## Lane A. Backend Spine
1. modular monolith skeleton
2. shared auth / tenancy context
3. DDL migrations
4. service modules
5. command handlers
6. query snapshot assemblers
7. outbox / worker scaffold
8. seed loader

## Lane B. Frontend Spine
1. app shell / role shells
2. route map
3. query hooks
4. screen placeholders
5. object workspace shared layout
6. dashboard blocks
7. modal contracts
8. seed-driven demo path

## Lane C. QA / Demo / Seed
1. seed load scripts
2. smoke scenarios
3. acceptance checklist
4. incident simulation
5. demo script

## Build order by phase
### Phase 1
Identity, foundation, question capital, canonical content, trust/review

### Phase 2
Publish, projection, search, GEO, builder preview

### Phase 3
Alert, RCA, fix-it, incident, runtime

### Phase 4
Generator assist, prompt registry, rollout/backfill
