---
title: Seed Loader CLI Spec
status: reconstructed
---
# Seed Loader / Seeder CLI Spec

## command
```bash
seed load --mode full-demo
seed load --mode minimal-dev
seed load --mode failure-sim
seed load --mode empty-state
seed reset
seed rebuild-snapshots
```

## 기능
- ordered loading
- idempotent upsert
- environment targeting
- snapshot rebuild
- selective tenant load
- teardown/reset

## output
- loaded tenants/brands count
- object counts
- failed rows
- snapshot rebuild result
