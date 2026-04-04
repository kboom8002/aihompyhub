import React from 'react';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', minHeight: '100vh', background: '#f9fafb' }}>
      <aside style={{ background: '#ffffff', borderRight: '1px solid #e5e7eb', padding: '2rem 1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '2rem', color: '#111827' }}>브랜드 관리(Tenant)</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <a href="/tenant/home" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>홈</a>
          <a href="/tenant/questions/clusters" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>질문 자산 (Clusters)</a>
          <a href="/tenant/studio/foundation" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>브랜드 설정 (SSoT)</a>
          <a href="/tenant/studio/content" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>콘텐츠 스튜디오</a>
          <a href="/tenant/publish" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>배포 (Publish)</a>
        </nav>
      </aside>
      <div style={{ padding: '2rem' }}>
        {children}
      </div>
    </div>
  );
}
