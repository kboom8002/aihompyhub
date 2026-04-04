import React from 'react';
import Link from 'next/link';

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout-min-height" style={{ display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid var(--color-border)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>AI Homepage Builder</span>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/builder" style={{ textDecoration: 'none', color: 'inherit' }}>Template Mapping</Link>
          </nav>
        </div>
      </header>
      <main style={{ padding: '2rem', flex: 1, backgroundColor: 'var(--color-bg)' }}>
        {children}
      </main>
    </div>
  );
}
