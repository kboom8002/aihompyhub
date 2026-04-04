// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import type { CommercialSnapshotDTO } from '@aihompyhub/database/dto/commercial';
import { PageHeader } from '../../components/PageHeader';

export default function CommercialAdminView() {
  const [data, setData] = useState<CommercialSnapshotDTO['data'] | null>(null);

  const loadData = () => {
    fetch('/api/v1/queries/commercial-snapshot', { headers: { 'x-tenant-id': 'SYSTEM', 'x-role': 'factory_admin' } })
      .then(res => res.json())
      .then(payload => {
         if (payload?.data?.data) {
           setData(payload.data.data);
         } else {
           // Fallback Mock Data
           setData({
             availablePlans: [
               { id: 'p1', planCode: 'starter', displayName: 'Starter Pack', monthlyPriceUsd: 49, featuresAllowed: ['basic_templates', 'manual_generation'] },
               { id: 'p2', planCode: 'pro', displayName: 'Professional OS', monthlyPriceUsd: 199, featuresAllowed: ['premium_templates', 'autopilot_lanes', 'geo_blocking'] },
               { id: 'p3', planCode: 'enterprise', displayName: 'Enterprise Core', monthlyPriceUsd: 999, featuresAllowed: ['custom_models', 'unlimited_brands', 'systemic_rca', 'white_label'] }
             ],
             activeSubscriptions: [
               { id: 'sub1', tenantId: 't1', tenantName: 'Lumiere Skincare', planCode: 'enterprise', status: 'active', currentPeriodEnd: new Date(Date.now() + 8640000000).toISOString() },
               { id: 'sub2', tenantId: 't2', tenantName: 'Derma Core Labs', planCode: 'pro', status: 'active', currentPeriodEnd: new Date(Date.now() + 2592000000).toISOString() },
               { id: 'sub3', tenantId: 't3', tenantName: 'Basic Cosmetics', planCode: 'starter', status: 'past_due', currentPeriodEnd: new Date(Date.now() - 86400000).toISOString() }
             ]
           });
         }
      }).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignPlan = async (subscriptionId: string) => {
    if (!data) return;
    const planCodes = data.availablePlans.map(p => p.planCode).join(', ');
    const newPlanCode = window.prompt(`Enter new plan code to assign (${planCodes}):`);
    if (!newPlanCode) return;
    
    const targetPlan = data.availablePlans.find(p => p.planCode === newPlanCode);
    if (!targetPlan) {
      alert(`Invalid plan code: ${newPlanCode}`);
      return;
    }

    if (!window.confirm(`Are you sure you want to upgrade/downgrade this tenant to '${targetPlan.displayName}'? Feature Gates will apply immediately.`)) return;
    
    await fetch('/api/v1/commands/commercial/assign-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': 'factory_admin', 'x-tenant-id': 'SYSTEM' },
        body: JSON.stringify({
            meta: { requestId: 'req-'+Date.now() },
            body: { subscriptionId, newPlanId: targetPlan.id }
        })
    });
    loadData();
  };

  if (!data) return <div style={{ padding: '2rem' }}>Loading Commercial Packaging...</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader title="Commercial GTM & Packaging" />
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '3rem' }}>Factory OS pricing tiers, feature gate limits, and live tenant subscriptions. Manage which AI capabilities are unlocked per brand.</p>

      {/* Plans Definition */}
      <h2 style={{ fontSize: '1.2rem', color: '#f3f4f6', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Commercial Plans</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
         {data.availablePlans.map(plan => (
            <div key={plan.id} className="surface" style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', borderTop: `4px solid ${plan.planCode === 'enterprise' ? '#8b5cf6' : plan.planCode === 'pro' ? '#3b82f6' : '#10b981'}` }}>
               <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#f3f4f6', marginBottom: '0.5rem' }}>{plan.displayName} <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 'normal' }}>({plan.planCode})</span></h3>
               <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e5e7eb', marginBottom: '1rem' }}>${plan.monthlyPriceUsd}<span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'normal' }}> /mo</span></div>
               
               <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Included Gates</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {plan.featuresAllowed.map(feature => (
                       <span key={feature} style={{ padding: '0.2rem 0.5rem', background: '#374151', borderRadius: '4px', fontSize: '0.75rem', color: '#cbd5e1' }}>{feature.replace('_', ' ')}</span>
                    ))}
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Active Subscriptions */}
      <h2 style={{ fontSize: '1.2rem', color: '#f3f4f6', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Active Tenant Subscriptions</h2>
      <div className="surface" style={{ borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
         <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#1f2937', color: '#9ca3af', fontSize: '0.85rem' }}>
               <tr>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #374151' }}>Tenant Brand</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #374151' }}>Plan Code</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #374151' }}>Status</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #374151' }}>Next Billing</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #374151', textAlign: 'right' }}>Admin Governance</th>
               </tr>
            </thead>
            <tbody>
               {data.activeSubscriptions.map(sub => (
                  <tr key={sub.id}>
                     <td style={{ padding: '1rem', borderBottom: '1px solid #374151', color: '#e5e7eb', fontWeight: 500 }}>{sub.tenantName}</td>
                     <td style={{ padding: '1rem', borderBottom: '1px solid #374151', color: sub.planCode === 'enterprise' ? '#c4b5fd' : '#9ca3af', fontWeight: 600 }}>{sub.planCode?.toUpperCase()}</td>
                     <td style={{ padding: '1rem', borderBottom: '1px solid #374151' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', background: sub.status === 'active' ? '#064e3b' : '#374151', color: sub.status === 'active' ? '#34d399' : '#d1d5db' }}>{sub.status}</span>
                     </td>
                     <td style={{ padding: '1rem', borderBottom: '1px solid #374151', color: '#9ca3af', fontSize: '0.85rem' }}>{new Date(sub.currentPeriodEnd).toLocaleDateString()}</td>
                     <td style={{ padding: '1rem', borderBottom: '1px solid #374151', textAlign: 'right' }}>
                        <button onClick={() => handleAssignPlan(sub.id)} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', background: 'transparent', color: '#60a5fa', border: '1px solid #3b82f6', cursor: 'pointer', fontSize: '0.8rem' }}>Assign Plan</button>
                     </td>
                  </tr>
               ))}
               {data.activeSubscriptions.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No active subscriptions found.</td></tr>}
            </tbody>
         </table>
      </div>
    </div>
  );
}
