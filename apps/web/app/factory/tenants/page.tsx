// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import Link from 'next/link';
import type { FactoryHomeSnapshotDTO } from '@aihompyhub/database/dto/factory';

export default function TenantHealthRegistry() {
  const [data, setData] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', slug: '', industryType: 'skincare' });

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

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.slug) return alert('Name and Slug are required');
    
    setIsCreating(true);
    try {
      const res = await fetch('/api/v1/factory/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm)
      });
      if (!res.ok) {
         const err = await res.json();
         alert('Failed to create tenant: ' + err.error);
      } else {
         alert(`Successfully created tenant: ${newForm.name} [${newForm.industryType}]`);
         setShowCreateModal(false);
         setNewForm({ name: '', slug: '', industryType: 'skincare' });
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
          onClick={() => setShowCreateModal(true)} 
          disabled={isCreating}
          style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: isCreating ? 'not-allowed' : 'pointer', fontWeight: 600 }}
        >+ Add Tenant</button>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Observe the operational health, active generator incidents, and rollout statuses of all instantiated brands (tenants). You may drill down into a specific tenant workspace if you have cross-tenant clearance.</p>

      {showCreateModal && (
         <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
            <form onSubmit={handleCreateTenant} style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px' }}>
               <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>새 테넌트(브랜드) 추가</h3>
               
               <div style={{ marginBottom: '1rem' }}>
                 <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600 }}>브랜드 이름 (Name)</label>
                 <input autoFocus required type="text" value={newForm.name} onChange={e => setNewForm({...newForm, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="예: 메디컬 스킨의원" />
               </div>

               <div style={{ marginBottom: '1rem' }}>
                 <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600 }}>접속 주소 슬러그 (Slug)</label>
                 <input required type="text" value={newForm.slug} onChange={e => setNewForm({...newForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="예: medical-skin" />
               </div>

               <div style={{ marginBottom: '1.5rem' }}>
                 <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600 }}>업종 (Industry Type)</label>
                 <select required value={newForm.industryType} onChange={e => setNewForm({...newForm, industryType: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                   <option value="skincare">스킨케어 / 코스메틱</option>
                   <option value="clinic">의원 / 병원 / 클리닉</option>
                   <option value="real_estate">부동산 중개법인</option>
                   <option value="consulting">전문 컨설팅 / B2B</option>
                 </select>
               </div>

               <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                 <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>취소</button>
                 <button type="submit" disabled={isCreating} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{isCreating ? '생성 중...' : '생성하기'}</button>
               </div>
            </form>
         </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
         <thead>
            <tr style={{ background: 'var(--color-bg-primary)', textAlign: 'left' }}>
               <th style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)', width: '250px' }}>Tenant Alias</th>
               <th style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)' }}>Slug</th>
               <th style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)' }}>Industry</th>
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
                     <span style={{ background: '#f3f4f6', color: '#374151', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {t.industryType || 'skincare'}
                     </span>
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
                        <Link href={`/tenant/${t.slug || t.tenantId}/home`} className="button-secondary" style={{ textDecoration: 'none', fontSize: '0.8rem', border: '1px solid #4b5563', padding: '0.4rem 0.8rem', borderRadius: '4px', color: '#e5e7eb' }}>Inspect Workspace ↗</Link>
                     </td>
               </tr>
            ))}
         </tbody>
      </table>
    </div>
  );
}
