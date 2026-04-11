import React from 'react';
import Link from 'next/link';

export default function FactoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Factory Sidebar */}
      <nav style={{ width: '250px', background: '#0a0a0a', padding: '2rem 1rem', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
           <div style={{ color: 'white', fontWeight: 600, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Core Factory</div>
           <div style={{ fontSize: '0.8rem', color: '#888' }}>Global Rollout & Control OS</div>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li><Link href="/factory/home" style={{ color: '#ccc', textDecoration: 'none', display: 'block', padding: '0.5rem', borderRadius: '4px' }}>⌘ Overlook (Home)</Link></li>
          <li><Link href="/factory/systemic-rca" style={{ color: '#ccc', textDecoration: 'none', display: 'block', padding: '0.5rem', borderRadius: '4px' }}>⌘ Systemic RCAs</Link></li>
          <li><Link href="/factory/tenants" style={{ color: '#ccc', textDecoration: 'none', display: 'block', padding: '0.5rem', borderRadius: '4px' }}>⌘ Tenant Registry</Link></li>
          <li><Link href="/factory/templates" style={{ color: '#ccc', textDecoration: 'none', display: 'block', padding: '0.5rem', borderRadius: '4px' }}>⌘ Prompt Templates</Link></li>
          <li><Link href="/factory/qis" style={{ color: '#ccc', textDecoration: 'none', display: 'block', padding: '0.5rem', borderRadius: '4px' }}>⌘ Question Capital</Link></li>
          <li><Link href="/factory/analytics" style={{ color: '#ec4899', textDecoration: 'none', display: 'block', padding: '0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>⌘ Deal Room Analytics</Link></li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
