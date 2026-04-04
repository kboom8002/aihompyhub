---
title: Workflow State Machine
status: reconstructed
---
# Workflow State Machine

## canonical object lifecycle
draft -> ready_for_review -> approved -> published -> deprecated -> archived

## review lifecycle
required -> queued -> in_review -> approved / changes_requested / rejected

## publish lifecycle
unpublished -> scheduled -> live -> limited_live / suspended -> retired

## ops lifecycle
unmeasured -> monitored -> healthy / at_risk -> issue_detected -> fix_in_progress -> revalidation_pending -> healthy

## key transitions
- request review
- record review decision
- create publish bundle
- validate bundle
- execute publish
- apply restriction
- create fix-it
- verify recovery
