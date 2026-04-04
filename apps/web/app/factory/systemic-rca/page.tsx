'use client';

import React, { useState, useEffect } from 'react';
import type { SystemicRCASnapshotDTO } from '@aihompyhub/database/dto/factory';
import { PageHeader } from '../../components/PageHeader';
import { GuidedAutomationPanel } from '../../components/GuidedAutomationPanel';

export default function SystemicRCABoard() {
  const [data, setData] = useState<SystemicRCASnapshotDTO['data'] | null>(null);

  useEffect(() => {
    fetch('/api/v1/queries/systemic-rca-snapshot', { headers: { 'x-tenant-id': 'SYSTEM', 'x-role': 'factory_admin' } })
      .then(res => res.json())
      .then(payload => setData(payload.data.data));
  }, []);

  if(!data) return <div style={{ padding: '2rem' }}>Loading RCA Candidate List...</div>;

  return (
    <div>
      <PageHeader title="Systemic RCA Board" subtitle="Investigate Multi-Tenant Operations Spikes & Pattern Correlators" />

      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>This board aggregates local Fix-It alerts and Incidents across all active tenants. When an error signature repeatedly triggers across &ge;3 tenants within a short window, the OS promotes it to a Systemic Candidate.</p>
      
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
         {data.candidates.map(c => (
          <div key={c.id} className="surface" style={{ padding: '2rem', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ margin: 0, color: 'var(--color-risk-red)' }}>⚠️ {c.title}</h3>
               <span style={{ background: 'var(--color-bg-secondary)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem' }}>STATUS: {c.status.toUpperCase()}</span>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: '4px' }}>
                <div>
                   <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Correlation Metrics</h4>
                   <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem' }}>
                      <li><strong>Affected Tenants:</strong> {c.affectedTenantCount} / {data.globalMetrics.totalTenants}</li>
                      <li><strong>Severity Pattern:</strong> {c.severity.toUpperCase()}</li>
                      <li><strong>First Seen:</strong> {new Date(c.createdAt).toLocaleString()}</li>
                   </ul>
                </div>
                <div>
                   <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Suspected Root Cause Tree</h4>
                   {c.correlatedRolloutName ? (
                      <div style={{ fontSize: '0.9rem', background: 'rgba(255,165,0,0.1)', padding: '0.5rem', borderLeft: '3px solid var(--color-risk-yellow)' }}>
                        <p style={{ margin: 0 }}><strong>Regression Match:</strong> Pattern matches recent rollout <em>{c.correlatedRolloutName} ({c.correlatedRolloutTargetType})</em></p>
                      </div>
                   ) : (
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>No correlated rollout detected. (Endemic issue candidate)</div>
                   )}
                </div>
             </div>
             
             <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
               <button className="button-primary">Acknowledge & Escalate Incident</button>
               <button className="button-secondary">Drill Down Tenant Evidence ({c.tenantEvidenceLinks?.length || 0})</button>
               <button className="button-secondary" style={{ opacity: 0.5 }}>Mark as False Positive</button>
             </div>
          </div>
        ))}
        {data.candidates.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--color-bg-secondary)', borderRadius: '4px' }}>
            🎉 No active systemic RCA candidates. All factories are operating normally.
          </div>
        )}
        </div>

        {/* Guided Automation Copilot Panel */}
        <div style={{ flex: 1 }}>
           <div style={{ position: 'sticky', top: '2rem' }}>
              <GuidedAutomationPanel />
           </div>
        </div>
      </div>
    </div>
  );
}
