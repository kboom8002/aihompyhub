---
title: 08_Alert Tuning Policy
status: reconstructed
---

# Alert Tuning Policy

## tuning 축
- threshold
- window
- routing
- cooldown / dedupe
- suppression
- escalation
- learning

## core rules
- trust alert는 miss 비용을 더 크게 본다
- threshold보다 sample/window/baseline부터 본다
- tenant adaptive tuning은 core grammar를 깨면 안 된다
