import { ReactNode } from 'react';

export default function TenantLayout({ children }: { children: ReactNode }) {
  return (
    <div className="tenant-shell" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center' }}>
        <strong>Brand Tenant Workspace</strong>
        <nav style={{ marginLeft: '2rem', display: 'inline-flex', gap: '1.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
          <a href="/home">홈</a>
          <a href="/questions/clusters">질문 자산</a>
          <a href="/studio/foundation">브랜드 설정</a>
        </nav>
      </header>
      <main style={{ padding: '2rem', flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
