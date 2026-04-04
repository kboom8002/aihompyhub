---
title: Composable Template Layer Architecture
status: recovered_from_visible_transcript
---
# Composable Template Layer Architecture

## Template 정의
Template는 페이지 스킨이 아니라 **디자인 시스템 + 콘텐츠 시스템 + 웹사이트 구조 + trust grammar + conversion grammar의 조합**이다.

## Layer
1. Domain Family Template Layer
2. Meaning Template Layer
3. Trust Template Layer
4. Conversion Template Layer
5. Experience / Layout Template Layer
6. Projection Template Layer
7. Skin / Brand Expression Layer

## Family 예시
- Generic Core
- YMYL-lite Skincare
- Premium Editorial Commerce
- Clinic-like High Trust Variant

## Module 예시
- Topic Hub Module
- Answer Detail Module
- Routine Execution Module
- Compare Decision Module
- Trust Bar Module
- Boundary Notice Module
- Evidence Summary Module
- Next Step Rail
- Search Entry Module

## Override 원칙
### Factory only
- trust grammar core
- routine > product ordering
- compare first-class rendering
- high-risk placement rule

### Tenant configurable
- visual skin
- voice mapping
- nav emphasis
- section density
- CTA wording 범위

### 금지
- trust slot 제거
- boundary required object에서 caution 숨김
- Product를 Routine보다 위에 두기
- Compare를 FAQ 수준으로 다운그레이드
