import React from 'react';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', minHeight: '100vh', background: '#f9fafb' }}>
      <aside style={{ background: '#ffffff', borderRight: '1px solid #e5e7eb', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>브랜드 관리(Tenant)</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
          <a href="/tenant/home" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '600' }}>🏠 홈 대시보드</a>
          <a href="/tenant/questions/clusters" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '600' }}>💬 질문 자산 (Clusters)</a>
          
          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }}/>
          
          <details open>
            <summary style={{ fontWeight: 'bold', cursor: 'pointer', marginBottom: '0.5rem', color: '#1f2937' }}>🛡️ Brand SSoT</summary>
            <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <a href="/tenant/studio/brand_ssot/topic_hub" style={{ color: '#4b5563', textDecoration: 'none' }}>Topic Hub</a>
              <a href="/tenant/studio/brand_ssot/answer" style={{ color: '#4b5563', textDecoration: 'none' }}>공식 답변 (Answer)</a>
              <a href="/tenant/studio/brand_ssot/compare" style={{ color: '#4b5563', textDecoration: 'none' }}>비교 분석 (Compare)</a>
              <a href="/tenant/studio/brand_ssot/routine" style={{ color: '#4b5563', textDecoration: 'none' }}>뷰티 루틴 (Routine)</a>
              <a href="/tenant/studio/brand_ssot/product_fit" style={{ color: '#4b5563', textDecoration: 'none' }}>제품 적합성 (Fit)</a>
              <a href="/tenant/studio/brand_ssot/product" style={{ color: '#4b5563', textDecoration: 'none' }}>제품 디테일 (Product)</a>
              <a href="/tenant/studio/brand_ssot/trust" style={{ color: '#4b5563', textDecoration: 'none' }}>신뢰/보증 (Trust)</a>
            </div>
          </details>

          <details>
            <summary style={{ fontWeight: 'bold', cursor: 'pointer', marginBottom: '0.5rem', marginTop: '0.5rem', color: '#1f2937' }}>📰 Media SSoT</summary>
            <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <a href="/tenant/studio/media_ssot/story" style={{ color: '#4b5563', textDecoration: 'none' }}>스토리 / 아티클</a>
              <a href="/tenant/studio/media_ssot/guide" style={{ color: '#4b5563', textDecoration: 'none' }}>가이드 / 설명서</a>
              <a href="/tenant/studio/media_ssot/review" style={{ color: '#4b5563', textDecoration: 'none' }}>리뷰 / 케이스</a>
              <a href="/tenant/studio/media_ssot/insight" style={{ color: '#4b5563', textDecoration: 'none' }}>인사이트 / 트렌드</a>
              <a href="/tenant/studio/media_ssot/event" style={{ color: '#4b5563', textDecoration: 'none' }}>이벤트 / 론칭</a>
            </div>
          </details>

          <details>
            <summary style={{ fontWeight: 'bold', cursor: 'pointer', marginBottom: '0.5rem', marginTop: '0.5rem', color: '#1f2937' }}>🛍️ Answer Commerce</summary>
            <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <a href="/tenant/studio/commerce/answer_block" style={{ color: '#4b5563', textDecoration: 'none' }}>제품 답변 블록</a>
              <a href="/tenant/studio/commerce/bundle" style={{ color: '#4b5563', textDecoration: 'none' }}>번들 구성 (Set)</a>
              <a href="/tenant/studio/commerce/consultation" style={{ color: '#4b5563', textDecoration: 'none' }}>맞춤 상담 CTA</a>
              <a href="/tenant/studio/commerce/diagnostic" style={{ color: '#4b5563', textDecoration: 'none' }}>진단 / 리셋 파인더</a>
            </div>
          </details>
          
          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }}/>
          <a href="/tenant/studio/design" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '600' }}>🎨 디자인/테마 관리</a>
          <a href="/tenant/studio/curation" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '600' }}>📌 홈 큐레이션 보드</a>
          <a href="/tenant/studio/ia" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '600' }}>🗂️ GNB / IA 매니저</a>
          <a href="/tenant/publish" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '600' }}>📤 배포 (Publish)</a>
        </nav>
      </aside>
      <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
