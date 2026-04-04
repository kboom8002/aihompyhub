---
title: Template Registry and Assignment
status: reconstructed
---
# Template Registry and Assignment

## Registry 구조
### TemplateFamily
- code
- domain_family
- trust_mode
- conversion_mode
- search_mode
- geo_mode

### TemplateProfile
- family_id
- profile_name
- intended_brand_tier
- routine_priority_mode
- compare_priority_mode
- trust_visibility_mode
- nav_mode
- geo_summary_mode

### TemplateModule
- module_type
- applicable_object_types
- required_inputs
- render_rules
- action_rules

### TemplateAssignment
- tenant_id
- brand_id
- template_profile_id
- market_codes
- locales
- active_version

### TemplateOverridePack
- override scope
- allowed_keys
- requested_by
- approved_by
- expiry

## Assignment 원칙
- 1 brand = 1 active profile
- high-risk 도메인에서 trust-visible profile 기본
- rollout / backfill / observability와 연결
