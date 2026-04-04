import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Skincare AI Homepage Factory OS',
  description: 'Enterprise B2C Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav style={{ background: '#111827', padding: '1rem', borderBottom: '1px solid #374151', color: 'white', display: 'flex', gap: '1rem' }}>
           <strong style={{ marginRight: '2rem' }}>Factory OS</strong>
           <a href="/tenant/onboarding" style={{ color: '#9ca3af', textDecoration: 'none' }}>Onboarding</a>
           <a href="/factory/commercial" style={{ color: '#9ca3af', textDecoration: 'none' }}>Commercial Plans</a>
           <a href="/factory/autonomy-lanes" style={{ color: '#9ca3af', textDecoration: 'none' }}>Autopilot</a>
           <a href="/factory/triage" style={{ color: '#9ca3af', textDecoration: 'none' }}>Triage Dashboard</a>
           <a href="/factory/postmortems" style={{ color: '#9ca3af', textDecoration: 'none' }}>Optimizations</a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
