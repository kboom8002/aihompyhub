'use client';

import React, { useState, useEffect } from 'react';
import type { FactoryHomeSnapshotDTO, RolloutCampaignDTO } from '@aihompyhub/database/dto/factory';
import { PageHeader } from '../../components/PageHeader';

export default function FactoryHome() {
  const [data, setData] = useState<FactoryHomeSnapshotDTO['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState<string|null>(null);

  const loadData = () => {
    fetch('/api/v1/queries/factory-home-snapshot', { headers: { 'x-tenant-id': 'SYSTEM', 'x-role': 'factory_admin' } })
      .then(res => res.json())
      .then(payload => {
        setData(payload.data.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFreeze = async (rolloutId: string) => {
    try {
      const res = await fetch('/api/v1/commands/factory/rollouts/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': 'factory_admin' },
        body: JSON.stringify({
          meta: { requestId: 'req-'+Date.now(), actorId: '00000000-0000-0000-0000-000000000000', activeRole: 'factory_admin' },
          body: { rolloutId, reason: 'Manual freeze triggered by Admin' }
        })
      });
      if(res.ok) {
        setActionStatus('Rollout Frozen! (Simulated)');
        // Optimistic UI update
        setData(prev => prev ? {
          ...prev,
          activeRollouts: prev.activeRollouts.map(r => r.id === rolloutId ? { ...r, status: 'frozen' } : r)
        } : null);
        setTimeout(() => setActionStatus(null), 3000);
        // Sync with true backend state
        loadData();
      }
    } catch(e) {
      console.error(e);
    }
  };

  if(!data) return <div style={{ padding: '2rem' }}>Loading Factory Control Board...</div>;

  return (
    <div>
      <PageHeader title="Factory Overlook" subtitle="Multi-Tenant Health & Rollout Command Center" />
      
      {actionStatus && <div style={{ background: 'var(--color-risk-yellow-bg)', padding: '1rem', borderLeft: '4px solid var(--color-risk-yellow)', marginBottom: '2rem' }}>{actionStatus}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
        <div className="surface" style={{ padding: '1.5rem', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Avg Tenant Trust Score</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--color-trust-green)' }}>{data.globalMetrics.averageTrustScore}</div>
        </div>
        <div className="surface" style={{ padding: '1.5rem', border: '1px solid var(--color-border)' }}>
           <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Active Tenants</div>
           <div style={{ fontSize: '2.5rem', fontWeight: 600 }}>{data.globalMetrics.totalTenants}</div>
        </div>
        <div className="surface" style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderLeft: data.globalMetrics.criticalSystemicIssues > 0 ? '4px solid var(--color-risk-red)' : '' }}>
           <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Critical Systemic Issues</div>
           <div style={{ fontSize: '2.5rem', fontWeight: 600, color: data.globalMetrics.criticalSystemicIssues > 0 ? 'var(--color-risk-red)' : 'var(--color-text-primary)' }}>{data.globalMetrics.criticalSystemicIssues}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 2 }}>
           <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Active Rollout Campaigns</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
             {data.activeRollouts.map(rollout => (
               <div key={rollout.id} className="surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: rollout.status === 'frozen' ? '4px solid var(--color-risk-yellow)' : '4px solid #3b82f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{rollout.campaignName}</div>
                    <div style={{ background: rollout.status === 'frozen' ? 'var(--color-risk-yellow)' : '#3b82f6', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'uppercase' }}>{rollout.status.replace('_', ' ')}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Target: {rollout.targetObjectType} ({rollout.targetObjectId}) • Strategy: {rollout.rolloutStrategy}</div>
                  
                  <div style={{ marginTop: '1rem', height: '8px', background: 'var(--color-bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${rollout.progressPercentage}%`, background: rollout.status === 'frozen' ? 'var(--color-risk-yellow)' : '#3b82f6', height: '100%' }}></div>
                  </div>
                  <div style={{ fontSize: '0.8rem', textAlign: 'right', color: 'var(--color-text-secondary)' }}>{rollout.progressPercentage}% Deployed</div>
                  
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {rollout.status !== 'frozen' && <button onClick={() => handleFreeze(rollout.id)} className="button-secondary" style={{ borderColor: 'var(--color-risk-yellow)', color: 'var(--color-risk-yellow)' }}>Freeze Rollout</button>}
                    {rollout.status === 'frozen' && <button className="button-primary" style={{ background: 'var(--color-risk-red)' }}>Initiate Rollback</button>}
                  </div>
               </div>
             ))}
           </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           <div>
             <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', color: 'var(--color-risk-red)' }}>Systemic Candidates ⚠️</h3>
             <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               {data.systemicCandidates.map(c => (
                 <li key={c.id} className="surface" style={{ padding: '1rem', borderLeft: '3px solid var(--color-risk-red)' }}>
                   <div style={{ fontWeight: 600 }}>{c.title}</div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.3rem' }}>{c.affectedTenantCount} Tenants Affected</div>
                   <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--color-risk-red)' }}>Status: {c.status}</div>
                 </li>
               ))}
             </ul>
           </div>

           <div>
             <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Tenant Health Watchlist</h3>
             <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               {data.healthSummaries.map(t => (
                 <li key={t.tenantId} className="surface" style={{ padding: '1rem', borderLeft: t.trend === 'degrading' ? '3px solid var(--color-risk-yellow)' : '3px solid transparent' }}>
                   <div style={{ fontWeight: 600 }}>{t.tenantName}</div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                     <span>Trust Score: <strong style={{ color: t.trustScore < 90 ? 'var(--color-risk-yellow)' : 'inherit' }}>{t.trustScore}</strong></span>
                     <span>Alerts: {t.unresolvedAlerts}</span>
                   </div>
                 </li>
               ))}
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
