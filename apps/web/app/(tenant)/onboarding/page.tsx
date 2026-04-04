'use client';

import React, { useState, useEffect } from 'react';
import type { CommercialSnapshotDTO } from '@aihompyhub/database/dto/commercial';

// Mock active list mapping to seed data
const DEMO_TENANTS = [
  { id: '10000000-0000-0000-0000-000000000000', name: 'Nova Cosmetics (Free Trial)' },
  { id: '10000000-0000-0000-0000-000000000001', name: 'Lumina Beauty (Basic)' },
  { id: '10000000-0000-0000-0000-000000000002', name: 'DermaCore Labs (Pro)' },
  { id: '10000000-0000-0000-0000-000000000003', name: 'Aura Skincare EU (Enterprise)' },
];

export default function TenantOnboardingView() {
  const [activeTenantId, setActiveTenantId] = useState(DEMO_TENANTS[2].id);
  const [data, setData] = useState<CommercialSnapshotDTO['data'] | null>(null);

  const loadData = (tenantId: string) => {
    fetch('/api/v1/queries/commercial-snapshot', { headers: { 'x-tenant-id': tenantId, 'x-role': 'brand_admin' } })
      .then(res => res.json())
      .then(payload => setData(payload.data?.data));
  };

  useEffect(() => { loadData(activeTenantId); }, [activeTenantId]);

  if (!data) return <div style={{ padding: '2rem' }}>Loading Onboarding Catalog...</div>;

  // Find my local capabilities based on backend returned subscription limits
  const mySub = data.activeSubscriptions.find(s => s.tenantId === activeTenantId);
  const myPlan = data.availablePlans.find(p => p.planCode === mySub?.planCode);

  const meetsRequirement = (minimumPlanCode: string) => {
    if (!myPlan) return false;
    const ranks = ['basic', 'pro', 'enterprise'];
    return ranks.indexOf(myPlan.planCode) >= ranks.indexOf(minimumPlanCode);
  };

   const handleProvision = async (packId: string, packName: string) => {
     try {
       const res = await fetch('/api/v1/commands/commercial/provision-tenant', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'x-tenant-id': activeTenantId, 'x-role': 'brand_admin' },
           body: JSON.stringify({
               meta: { requestId: 'req-'+Date.now() },
               body: { packId }
           })
       });

       if (!res.ok) {
           const err = await res.json();
           window.alert(`Provision Failed: ${err.error?.message || 'Server error'}`);
           return;
       }

       window.alert(`🎉 Provisioning Successful! Spin-up of [${packName}] initiated in Factory Engine.`);
     } catch (e) {
       window.alert(`Network error during provisioning.`);
     }
   };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
      
      {/* Mock Authorization Switcher */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#1f2937', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #374151' }}>
         <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Mock Auth:</span>
         <select 
            value={activeTenantId} 
            onChange={(e) => setActiveTenantId(e.target.value)}
            style={{ background: '#374151', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', outline: 'none' }}>
            {DEMO_TENANTS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
         </select>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
         <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#f3f4f6' }}>Welcome to Factory OS</h1>
         <p style={{ fontSize: '1.1rem', color: '#9ca3af' }}>Choose a starter Template Pack to automatically provision your Brand environment.</p>
         {myPlan && (
            <div style={{ marginTop: '1rem', display: 'inline-block', padding: '0.5rem 1rem', background: '#1f2937', borderRadius: '24px', border: '1px solid #374151' }}>
               Your designated plan: <strong style={{ color: '#60a5fa' }}>{myPlan.displayName}</strong>
            </div>
         )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
         {data.catalogPacks.map(pack => {
            const hasAccess = meetsRequirement(pack.minimumPlanCode);
            return (
               <div key={pack.id} className="surface" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)', opacity: hasAccess ? 1 : 0.6, position: 'relative' }}>
                  {!hasAccess && (
                     <div style={{ position: 'absolute', top: '-12px', right: '20px', background: '#dc2626', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        UPGRADE TO {pack.minimumPlanCode.toUpperCase()}
                     </div>
                  )}
                  
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{pack.packType.replace('_', ' ')}</div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#f3f4f6', marginBottom: '1rem' }}>{pack.packName}</h3>
                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '2rem', lineHeight: '1.5' }}>{pack.description}</div>
                  
                  <button 
                     disabled={!hasAccess}
                     onClick={() => handleProvision(pack.id, pack.packName)}
                     style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: hasAccess ? '#10b981' : '#374151', color: hasAccess ? 'white' : '#9ca3af', border: 'none', cursor: hasAccess ? 'pointer' : 'not-allowed', fontSize: '1rem', fontWeight: 600 }}
                  >
                     {hasAccess ? 'Provision Pack' : 'Gate Locked'}
                  </button>
               </div>
            );
         })}
      </div>
    </div>
  );
}
