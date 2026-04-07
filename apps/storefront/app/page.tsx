import { redirect } from 'next/navigation';

export default function Home() {
  // 현재 스토어프론트는 멀티테넌트 라우팅(/[tenantSlug]) 기반으로 동작합니다.
  // 로컬 환경의 최상위 루트(/) 접속 시, 대표 테스트 브랜드인 skincare-brand 로 자동 이동시킵니다.
  redirect('/skincare-brand');
}
