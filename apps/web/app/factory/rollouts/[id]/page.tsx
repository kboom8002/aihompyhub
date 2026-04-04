'use client';

import React, { useState, useEffect } from 'react';
import type { RolloutImpactSnapshotDTO } from '@aihompyhub/database/dto/factory';
import { PageHeader } from '../../../components/PageHeader';

export default function RolloutImpactView({ params }: { params: { id: string } }) {
  const [data, setData] = useState<RolloutImpactSnapshotDTO['data'] | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const loadData = () => {
    fetch('/api/v1/queries/rollout-impact-snapshot?rolloutId=' + params.id, { headers: { 'x-tenant-id': 'SYSTEM', 'x-role': 'factory_admin' } })
      .then(res => res.json())
      .then(payload => setData(payload.data.data));
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleRollback = async () => {
    try {
      const res = await fetch('/api/v1/commands/factory/rollouts/rollback', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'x-role': 'factory_admin' },
         body: JSON.stringify({
            meta: { requestId: 'req-'+Date.now(), actorId: '00000000-0000-0000-0000-000000000000', activeRole: 'factory_admin' },
            body: { rolloutId: params.id, reason: 'Regression threshold exceeded: timeout spike' }
         })
      });
      if(res.ok) {
        setActionStatus('Rollback Initiated (Simulated)');
        setTimeout(() => setActionStatus(null), 3000);
        loadData(); // Sync with true backend state
      }
    } catch(e) { console.error(e); }
  };

  const handleBackfill = async () => {
     try {
       const res = await fetch('/api/v1/commands/factory/rollouts/backfill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-role': 'factory_admin' },
          body: JSON.stringify({
             meta: { requestId: 'req-'+Date.now(), actorId: '00000000-0000-0000-0000-000000000000', activeRole: 'factory_admin' },
             body: { rolloutId: params.id }
          })
       });
       if(res.ok) {
         setActionStatus('Backfill Initiated (Simulated)');
         setTimeout(() => setActionStatus(null), 3000);
         loadData(); // Sync with true backend state
       }
     } catch(e) { console.error(e); }
  };

  if(!data) return <div style={{ padding: '2rem' }}>Loading Rollout Impact Matrix...</div>;

  return (
    <div>
      <PageHeader title={`Rollout Investigation: ${data.rolloutInfo.campaignName}`} subtitle={`Target: ${data.rolloutInfo.targetObjectType} | Strategy: ${data.rolloutInfo.rolloutStrategy}`} />

      {actionStatus && <div style={{ background: 'var(--color-trust-green)', color: 'white', padding: '1rem', marginBottom: '2rem', borderRadius: '4px' }}>{actionStatus}</div>}

      {/* Control Strip */}
      <div className="surface" style={{ padding: '1rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div>
            <span style={{ fontWeight: 600, marginRight: '1rem' }}>Current Status:</span>
            <span style={{ background: data.rolloutInfo.status === 'frozen' ? 'var(--color-risk-yellow)' : '#3b82f6', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '4px', textTransform: 'uppercase', fontSize: '0.9rem' }}>{data.rolloutInfo.status.replace('_', ' ')}</span>
         </div>
         <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleBackfill} className="button-secondary" disabled={data.rolloutInfo.status !== 'frozen' && data.rolloutInfo.status !== 'rolling_out'}>Apply Backfill</button>
            <button onClick={handleRollback} className="button-primary" style={{ background: 'var(--color-risk-red)', borderColor: 'var(--color-risk-red)' }}>Emergency Rollback</button>
         </div>
      </div>

      {/* Regression Matrix */}
      {data.regressionIdentified && (
         <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-risk-red)', padding: '1.5rem', borderRadius: '4px', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-risk-red)', marginBottom: '1rem' }}>🚨 Regression Identified</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
               <div>
                 <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Generator Success Rate</div>
                 <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-risk-red)' }}>{data.baselineMetrics.generatorSuccessRate}% &rarr; {data.impactMetrics.generatorSuccessRate}%</div>
               </div>
               <div>
                 <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Timeout Rate</div>
                 <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-risk-red)' }}>{data.baselineMetrics.timeoutRate}% &rarr; {data.impactMetrics.timeoutRate}%</div>
               </div>
               <div>
                 <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Avg Latency</div>
                 <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-risk-red)' }}>{data.baselineMetrics.averageLatencyMs}ms &rarr; {data.impactMetrics.averageLatencyMs}ms</div>
               </div>
               <div>
                 <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Network Trust Score</div>
                 <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-risk-yellow)' }}>{data.baselineMetrics.trustScore} &rarr; {data.impactMetrics.trustScore}</div>
               </div>
            </div>
         </div>
      )}

      {/* Affected Tenants Map */}
      <div>
         <h3>Tenant Application Status</h3>
         <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
               <tr style={{ background: 'var(--color-bg-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Tenant</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Status</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Context / Error</th>
               </tr>
            </thead>
            <tbody>
               {data.affectedTenantsMap.map(t => (
                  <tr key={t.tenantId}>
                     <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', fontWeight: 500 }}>{t.tenantName}</td>
                     <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                        <span style={{ color: t.status === 'failed' ? 'var(--color-risk-red)' : t.status === 'applied' ? 'var(--color-trust-green)' : 'var(--color-text-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                          {t.status}
                        </span>
                     </td>
                     <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{t.errorContext || '-'}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

    </div>
  );
}
