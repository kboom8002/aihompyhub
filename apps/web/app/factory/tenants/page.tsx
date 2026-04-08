// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import Link from 'next/link';
import type { FactoryHomeSnapshotDTO } from '@aihompyhub/database/dto/factory';

export default function TenantHealthRegistry() {
  const [data, setData] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadData = () => {
    fetch('/api/v1/factory/tenants')
      .then(res => res.json())
      .then(payload => {
        if(payload?.data) {
          setData({ healthSummaries: payload.data.healthSummaries });
        }
      }).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTenant = async () => {
    const tenantName = window.prompt('Enter new brand/tenant name:');
    if (!tenantName) return;
    
    setIsCreating(true);
    try {
      const res = await fetch('/api/v1/factory/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tenantName })
      });
      if (!res.ok) {
         const err = await res.json();
         alert('Failed to create tenant: ' + err.error);
      } else {
         alert(`Successfully created tenant: ${tenantName} (with defaults cascaded)`);
         loadData();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleInviteAdmin = async (tenantId: string, tenantName: string) => {
    const email = window.prompt(`Enter Owner Email for ${tenantName}:`);
    if (!email) return;

    try {
      const res = await fetch('/api/v1/factory/tenants/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, email })
      });
      const data = await res.json();
      if (!res.ok) {
         alert('Failed to send invite: ' + (data.error || 'Unknown Error'));
      } else {
         alert(data.message);
      }
    } catch (err: any) {
      alert('Network Error during invite: ' + err.message);
    }
  };

  if(!data) return <div style={{ padding: '2rem' }}>Loading Tenant Registry...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageHeader title="Tenant Health Registry (Live)" subtitle="Cross-Tenant Observatory & Isolation Drill-down" />
        <button 
          onClick={handleCreateTenant} 
          disabled={isCreating}
          style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: isCreating ? 'not-allowed' : 'pointer', fontWeight: 600 }}
        >
          {isCreating ? 'Provisioning...' : '+ Register New Tenant'}
        </button>
      </div>

      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Observe the operational health, active generator incidents, and rollout statuses of all instantiated brands (tenants). You may drill down into a specific tenant workspace if you have cross-tenant clearance.</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
         <thead>
            <tr style={{ background: 'var(--color-bg-primary)', textAlign: 'left' }}>
               <th style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)', width: '300px' }}>Tenant Alias</th>
               <th style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)' }}>Slug</th>
               <th style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)' }}>Status</th>
               <th style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)' }}>Active Incidents</th>
               <th style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)', textAlign: 'right' }}>Actions</th>
            </tr>
         </thead>
         <tbody>
            {data.healthSummaries.map((t: any) => (
               <tr key={t.tenantId} style={{ borderLeft: t.status === 'pending' ? '4px solid var(--color-risk-yellow)' : '4px solid transparent' }}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                     <div style={{ fontWeight: 600 }}>{t.tenantName}</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>ID: {t.tenantId}</div>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                     <span style={{ fontFamily: 'monospace', color: '#6b7280' }}>/{t.slug || 'no-slug'}</span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                     <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                        background: t.status === 'active' ? '#dcfce7' : '#fef08a',
                        color: t.status === 'active' ? '#166534' : '#854d0e'
                      }}>
                        {t.status?.toUpperCase() || 'UNKNOWN'}
                     </span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', color: t.activeIncidents > 0 ? 'var(--color-risk-red)' : 'inherit' }}>
                     {t.activeIncidents}
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
                     <button onClick={() => handleInviteAdmin(t.tenantId, t.tenantName)} className="button-secondary" style={{ fontSize: '0.8rem', background: '#374151', padding: '0.4rem 0.8rem', borderRadius: '4px', color: '#e5e7eb', border: 'none', cursor: 'pointer' }}>Invite Admin ✉️</button>
                     <Link href={`/tenant/${t.tenantId}/home`} className="button-secondary" style={{ textDecoration: 'none', fontSize: '0.8rem', border: '1px solid #4b5563', padding: '0.4rem 0.8rem', borderRadius: '4px', color: '#e5e7eb' }}>Inspect Workspace ↗</Link>
                  </td>
               </tr>
            ))}
         </tbody>
      </table>
    </div>
  );
}
