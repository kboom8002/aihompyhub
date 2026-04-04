import { ReactNode } from 'react';

export default function ReviewerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="reviewer-shell" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', backgroundColor: '#e9f5ff', display: 'flex', alignItems: 'center' }}>
        <strong>Reviewer Workspace</strong>
        <nav style={{ marginLeft: '2rem', display: 'inline-flex', gap: '1.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
          <a href="/inbox">검수함</a>
          <a href="#">신뢰 검토</a>
        </nav>
      </header>
      <main style={{ padding: '2rem', flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
