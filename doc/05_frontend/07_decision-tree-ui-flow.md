---
title: Decision Tree UI Flow
status: recovered_from_visible_transcript_condensed
---
# Decision Tree UI Flow

## 흐름
1. Incident Entry Surface
2. Target Context Surface
3. Mitigation Decision Surface
4. Approval Surface
5. Execution & Audit Surface
6. Follow-up Surface

## 핵심 진입점
- Alert Detail
- Incident Bridge
- Object Workspace
- Runtime / Publish Console

## mitigation candidate
- 관찰 유지
- 제한 노출
- 신뢰 제한
- GEO 제외
- 검색 제외
- 배포 차단
- 롤백
- 중지
- lane 일시중지

## 승인 방식
- single approval
- dual approval
- escalated approval

## 가드레일
- 더 약한 조치로 충분하지 않았는지 질문
- high-risk trust에서 관찰 유지 선택 시 이유 강제
- approval-sensitive action audit 필수
