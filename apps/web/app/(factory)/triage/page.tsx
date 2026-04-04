'use client';

import React, { useState, useEffect } from 'react';
import type { TriageSnapshotDTO } from '@aihompyhub/database/dto/triage';
import { PageHeader } from '../../components/PageHeader';

export default function FactoryTriageView() {
  const [data, setData] = useState<TriageSnapshotDTO | null>(null);
  const [backupName, setBackupName] = useState('');

  const loadData = () => {
    fetch('/api/v1/queries/triage-snapshot', { headers: { 'x-tenant-id': 'SYSTEM', 'x-role': 'factory_admin' } })
      .then(res => res.json())
      .then(payload => setData(payload.data));
  };

  useEffect(() => { loadData(); }, []);

  const handleTriggerBackup = async () => {
    if (!backupName) return alert('Enter a backup name.');
    
    await fetch('/api/v1/commands/admin/trigger-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'SYSTEM', 'x-role': 'factory_admin' },
        body: JSON.stringify({
           meta: { requestId: 'req-' + Date.now() },
           body: { backupName }
        })
    });
    setBackupName('');
    loadData();
  };

  if (!data) return <div style={{ padding: '2rem' }}>Loading Triage Dashboard...</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader title="Support Triage & Hardening Board" />
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Global Security Audits, Dead Letter Queues (DLQ), and Disaster Recovery operations.</p>

      {/* Critical SLA / Warnings Render */}
      {(data.criticalFlags?.length > 0 || data.warnings?.length > 0) && (
        <div style={{ background: '#450a0a', border: '1px solid #b91c1c', borderRadius: '8px', padding: '1.5rem', marginBottom: '3rem' }}>
           <h3 style={{ margin: '0 0 1rem 0', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ ACTIVE INCIDENTS
           </h3>
           <ul style={{ color: '#fecaca', margin: 0, paddingLeft: '1.5rem', lineHeight: 1.6 }}>
             {data.criticalFlags?.map((flag, i) => <li key={`c-${i}`}><strong>CRITICAL</strong>: {flag.message}</li>)}
             {data.warnings?.map((warn, i) => <li key={`w-${i}`}>WARNING: {warn.message}</li>)}
           </ul>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '2rem' }}>
         {/* Left Column: Audits & DLQ */}
         <div>
            {/* Audits */}
            <h2 style={{ fontSize: '1.2rem', color: '#f3f4f6', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Global Security Audits</h2>
            <div className="surface" style={{ borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden', marginBottom: '3rem' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead style={{ background: '#1f2937', color: '#9ca3af' }}>
                     <tr>
                        <th style={{ padding: '1rem', borderBottom: '1px solid #374151' }}>Timestamp</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid #374151' }}>Action</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid #374151' }}>Target Resource</th>
                     </tr>
                  </thead>
                  <tbody>
                     {data.data.recentAudits.map(audit => (
                        <tr key={audit.id}>
                           <td style={{ padding: '1rem', borderBottom: '1px solid #374151', color: '#9ca3af' }}>{new Date(audit.createdAt).toLocaleString()}</td>
                           <td style={{ padding: '1rem', borderBottom: '1px solid #374151', color: '#60a5fa', fontWeight: 600 }}>{audit.actionType}</td>
                           <td style={{ padding: '1rem', borderBottom: '1px solid #374151', color: '#d1d5db' }}>{audit.resourceType} <br/> <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{audit.resourceId}</span></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* DLQ */}
            <h2 style={{ fontSize: '1.2rem', color: '#f3f4f6', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Dead Letter Queue (Failures)</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
               {data.data.dlqEntries.map(dlq => (
                  <div key={dlq.id} className="surface" style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)', borderLeft: `4px solid ${dlq.status === 'unresolved' ? '#f59e0b' : '#10b981'}` }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong style={{ color: '#e5e7eb' }}>{dlq.sourceQueue}</strong>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#374151', borderRadius: '4px', color: dlq.status === 'unresolved' ? '#fbbf24' : '#6ee7b7' }}>{dlq.status} (Retries: {dlq.retryCount})</span>
                     </div>
                     <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#f87171' }}>{dlq.errorMessage}</p>
                     <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>Failed at: {new Date(dlq.failedAt).toLocaleString()}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Right Column: Backup/Restore Operations */}
         <div>
            <h2 style={{ fontSize: '1.2rem', color: '#f3f4f6', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Disaster Recovery & Backups</h2>
            
            <div className="surface" style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
               <h4 style={{ margin: '0 0 1rem 0', color: '#e5e7eb' }}>Trigger Manual Backup</h4>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                     type="text" 
                     placeholder="e.g. Pre-deploy Snapshot v1.2" 
                     value={backupName}
                     onChange={e => setBackupName(e.target.value)}
                     style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#374151', color: 'white', outline: 'none' }} 
                  />
                  <button onClick={handleTriggerBackup} style={{ padding: '0.6rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Run</button>
               </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
               {data.data.systemBackups.map(bkp => (
                  <div key={bkp.id} className="surface" style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong style={{ color: '#e5e7eb', fontSize: '0.9rem' }}>{bkp.backupName}</strong>
                        <span style={{ fontSize: '0.75rem', color: bkp.status === 'completed' ? '#34d399' : bkp.status === 'failed' ? '#f87171' : '#9ca3af' }}>{bkp.status.toUpperCase()}</span>
                     </div>
                     <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Size: {bkp.sizeBytes ? (bkp.sizeBytes / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</div>
                     <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(bkp.createdAt).toLocaleString()}</div>
                     
                     {bkp.status === 'completed' && (
                        <button onClick={() => alert('Restore simulation triggered.')} style={{ marginTop: '1rem', width: '100%', padding: '0.4rem', background: 'transparent', border: '1px solid #4b5563', color: '#9ca3af', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Rollback & Restore</button>
                     )}
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
