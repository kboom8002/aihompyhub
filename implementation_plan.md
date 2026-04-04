# B2C Storefront Projection Engine 종합 개발 계획

이 문서는 SSoT 기반의 Factory/Tenant OS 데이터(Publish Bundle)를 최종 소비자(B2C)에게 시각적으로 투영하는 **Storefront 프론트엔드 파이프라인**의 최적 개발 계획을 정의합니다. `apps/web`(B2B 컨트롤 플레인)과 완전히 분리된 엣지 최적화 런타임인 `apps/storefront` 구축을 목표로 합니다.

## User Review Required

> [!NOTE]
> **Plan Approved (2026-04-04)**
> B2C Storefront는 독립된 `apps/storefront`로 구축하되, MVP 라우팅은 **서브디렉토리 방식(`/[tenantSlug]`)**을 채택하고 확장 시 커스텀 도메인을 연결합니다. 
> 디자인 시스템은 **`shadcn/ui` (Tailwind CSS 기반)**를 채택하여 재사용성과 확장성을 확보합니다.

## (Resolved) Open Questions

- **테넌트 도메인 처리 방식**: MVP에서는 서브디렉토리(`/[tenantSlug]`) 방식으로 진행하고, 추후 커스텀 도메인 미들웨어 확장을 계획합니다.
- **Design System**: B2C 스토어프론트는 `shadcn/ui`를 도입하여 고품질의 재사용 가능한 컴포넌트를 구축합니다.

## Verification Plan

### Automated Tests
- `apps/storefront` 빌드 시 Next.js App Router가 `generateStaticParams` 또는 미들웨어 충돌 없이 성공하는지 확인.
- B2C 라우트 모킹을 통한 JSON -> React Component 1:1 매핑 정합성 검사.

### Manual Verification
- Tenant Dashboard(B2B)에서 "Publish"를 누르면, 실제 B2C 스토어프론트 웹사이트에서 퍼블리시된 내용이 1초 내로 새로고침(ISR) 반영되는지 체감 테스트.
- Mobile Layout 렌더링 최적화 확인.
