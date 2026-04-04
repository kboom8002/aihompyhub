'use client';

import React, { useState, useEffect } from 'react';
import type { AutonomyJournalSnapshotDTO } from '@aihompyhub/database/dto/autonomy';
import { PageHeader } from '../../components/PageHeader';

export default function AutonomyLanesView() {
  const [data, setData] = useState<AutonomyJournalSnapshotDTO['data'] | null>(null);

  const loadData = () => {
    fetch('/api/v1/queries/autonomy-journal-snapshot', { headers: { 'x-tenant-id': 'SYSTEM', 'x-role': 'factory_admin' } })
      .then(res => res.json())
      .then(payload => setData(payload.data?.data));
  };

  useEffect(() => {
    loadData();
    const intervalId = setInterval(() => {
       loadData();
    }, 30000); // 30 seconds polling

    return () => clearInterval(intervalId);
  }, []);

  const handleOverride = async (laneId: string, newStatus: string) => {
    const reason = window.prompt(`Rationale for setting lane to ${newStatus.toUpperCase()}:`, '');
    if (!reason) return;
    
    await fetch('/api/v1/commands/autonomy/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': 'factory_admin' },
        body: JSON.stringify({
            meta: { requestId: 'req-'+Date.now(), actorId: '00000000-0000-0000-0000-000000000000', activeRole: 'factory_admin' },
            body: { laneId, newStatus, reason }
        })
    });
    loadData();
  };

  if (!data) return <div style={{ padding: '2rem' }}>Loading Autopilot Intelligence...</div>;

  const renderBadge = (status: string) => {
     let bg = '#374151', color = '#d1d5db';
     if (status === 'success' || status === 'active') { bg = '#064e3b'; color = '#34d399'; }
     else if (status === 'blocked_by_policy' || status === 'failed' || status === 'suspended_by_system') { bg = '#7f1d1d'; color = '#fca5a5'; }
     else if (status === 'paused') { bg = '#78350f'; color = '#fbbf24'; }
     
     return <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: bg, color }}>{status.toUpperCase().replace(/_/g, ' ')}</span>;
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader title="Autopilot & Execution Journal" />
      
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Manage and observe policy-driven partial autonomy. Low-risk operations (e.g. indexing, cache flushes) execute here automatically, but can be overseen and hard-paused at any time.</p>

      {/* Lanes Section */}
      <h2 style={{ fontSize: '1.2rem', color: '#f3f4f6', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Autopilot Lanes</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
         {data.lanes.map(lane => (
            <div key={lane.id} className="surface" style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid', borderColor: lane.activeRecommendation ? '#ef4444' : 'var(--color-border)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f3f4f6' }}>{lane.laneName}</h3>
                  {renderBadge(lane.status)}
               </div>
               <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.5rem', minHeight: '40px' }}>{lane.description}</div>
               
               {lane.activeRecommendation && (
                  <div style={{ background: '#450a0a', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #ef4444', marginBottom: '1.5rem' }}>
                     <div style={{ color: '#fca5a5', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>{lane.activeRecommendation.type.replace('_', ' ')}</div>
                     <div style={{ color: '#fecaca', fontSize: '0.9rem', marginBottom: '0.8rem' }}><strong>Alert:</strong> {lane.activeRecommendation.reason}</div>
                     <div style={{ color: '#d1d5db', fontSize: '0.85rem', fontStyle: 'italic' }}><strong>Action Required:</strong> {lane.activeRecommendation.suggestedAction}</div>
                  </div>
               )}

               <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {lane.status !== 'active' && (
                     <button onClick={() => handleOverride(lane.id, 'active')} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', background: '#059669', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Resume</button>
                  )}
                  {lane.status !== 'paused' && (
                     <button onClick={() => handleOverride(lane.id, 'paused')} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', background: '#d97706', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Pause</button>
                  )}
                  {lane.status !== 'disabled' && (
                     <button onClick={() => handleOverride(lane.id, 'disabled')} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', background: '#dc2626', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Disable</button>
                  )}
               </div>
            </div>
         ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
         {/* Execution Journal */}
         <div>
            <h2 style={{ fontSize: '1.2rem', color: '#f3f4f6', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Execution Journal</h2>
            <div className="surface" style={{ borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
               {data.recentExecutions.map(exec => (
                  <div key={exec.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #374151' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ color: '#e5e7eb', fontWeight: 500 }}>{exec.actionSummary}</div>
                        {renderBadge(exec.status)}
                     </div>
                     <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', gap: '1rem' }}>
                        <span>Lane: <strong>{exec.laneName}</strong></span>
                        <span>Executed: {new Date(exec.executedAt).toLocaleString()}</span>
                     </div>
                     {exec.policyBlockedReason && (
                        <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: '#450a0a', color: '#fecaca', borderRadius: '4px', fontSize: '0.8rem' }}>
                           <strong>Blocked by Policy:</strong> {exec.policyBlockedReason}
                        </div>
                     )}
                  </div>
               ))}
               {data.recentExecutions.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No executions recorded yet.</div>}
            </div>
         </div>

         {/* Override Logs */}
         <div>
            <h2 style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Human Overrides</h2>
            <div className="surface" style={{ borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
               {data.recentOverrides.map(over => (
                  <div key={over.id} style={{ padding: '1rem', borderBottom: '1px solid #374151' }}>
                     <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.3rem' }}>{new Date(over.createdAt).toLocaleString()}</div>
                     <div style={{ color: '#e5e7eb', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Forced <strong>{over.laneName}</strong> structure <br/>
                        <span style={{ color: '#fbbf24' }}>{over.previousStatus.toUpperCase()} → {over.newStatus.toUpperCase()}</span>
                     </div>
                     <div style={{ fontSize: '0.8rem', color: '#d1d5db', background: '#374151', padding: '0.4rem', borderRadius: '4px' }}>"{over.overrideReason}"</div>
                  </div>
               ))}
               {data.recentOverrides.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No overrides recorded.</div>}
            </div>
         </div>
      </div>

    </div>
  );
}
