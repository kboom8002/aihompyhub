'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import Link from 'next/link';
import type { FactoryHomeSnapshotDTO } from '@aihompyhub/database/dto/factory';

export default function TenantHealthRegistry() {
  const [data, setData] = useState<FactoryHomeSnapshotDTO['data'] | null>(null);

  useEffect(() => {
    // Reusing factory-home-snapshot to populate tenant health summary for demo purposes
    fetch('/api/v1/queries/factory-home-snapshot', { headers: { 'x-tenant-id': 'SYSTEM', 'x-role': 'factory_admin' } })
      .then(res => res.json())
      .then(payload => setData(payload.data.data));
  }, []);

  if(!data) return <div style={{ padding: '2rem' }}>Loading Tenant Registry...</div>;

  return (
    <div>
      <PageHeader title="Tenant Health Registry" subtitle="Cross-Tenant Observatory & Isolation Drill-down" />

      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Observe the operational health, active generator incidents, and rollout statuses of all instantiated brands (tenants). You may drill down into a specific tenant workspace if you have cross-tenant clearance.</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
         <thead>
            <tr style={{ background: 'var(--color-bg-primary)', textAlign: 'left' }}>
               <th style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)', width: '300px' }}>Tenant Alias</th>
               <th style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)' }}>Trust Score</th>
               <th style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)' }}>Active Incidents</th>
               <th style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)' }}>Unresolved Alarms</th>
               <th style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)', textAlign: 'right' }}>Actions</th>
            </tr>
         </thead>
         <tbody>
            {data.healthSummaries.map(t => (
               <tr key={t.tenantId} style={{ borderLeft: t.trend === 'degrading' ? '4px solid var(--color-risk-yellow)' : '4px solid transparent' }}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                     <div style={{ fontWeight: 600 }}>{t.tenantName}</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>ID: {t.tenantId}</div>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                     <span style={{ fontWeight: 'bold', color: t.trustScore < 90 ? 'var(--color-risk-yellow)' : 'var(--color-trust-green)' }}>
                       {t.trustScore}
                     </span>
                     {t.trend === 'degrading' && <span style={{ marginLeft: '0.5rem', color: 'var(--color-risk-red)' }}>↓</span>}
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', color: t.activeIncidents > 0 ? 'var(--color-risk-red)' : 'inherit' }}>
                     {t.activeIncidents}
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                     {t.unresolvedAlerts}
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', textAlign: 'right' }}>
                     <Link href="#" className="button-secondary" style={{ textDecoration: 'none', fontSize: '0.8rem' }}>Inspect Workspace ↗</Link>
                  </td>
               </tr>
            ))}
         </tbody>
      </table>
    </div>
  );
}
