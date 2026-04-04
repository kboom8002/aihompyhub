'use client';

import React, { useState, useEffect } from 'react';
import type { PostmortemBrowseSnapshotDTO } from '@aihompyhub/database/dto/optimization';
import { PageHeader } from '../../components/PageHeader';

export default function PostmortemLibraryView() {
  const [data, setData] = useState<PostmortemBrowseSnapshotDTO['data'] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/v1/queries/postmortem-browse-snapshot', { headers: { 'x-tenant-id': 'SYSTEM', 'x-role': 'factory_admin' } })
      .then(res => res.json())
      .then(payload => setData(payload.data?.data));
  }, []);

  if (!data) return <div style={{ padding: '2rem' }}>Loading Postmortem Library...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader title="Postmortem Library" />
      
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Searchable learning archive of resolved Systemic RCAs and degraded Experiments. Documenting root causes directly prevents recurring architecture omissions.</p>

      <div style={{ marginBottom: '2rem' }}>
         <input 
            type="text" 
            placeholder="Search by title, root cause, or resolution..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: '#f3f4f6', fontSize: '1rem', outline: 'none' }}
         />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
         {data.library
            .filter(pm => 
               pm.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
               pm.rootCauseAnalysis.toLowerCase().includes(searchQuery.toLowerCase()) || 
               pm.resolutionSummary.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(pm => (
            <div key={pm.id} className="surface" style={{ padding: '2rem', borderRadius: '8px', border: '1px solid var(--color-border)', borderLeft: pm.severity === 'critical' ? '4px solid #ef4444' : '4px solid #f59e0b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                     <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#f3f4f6', marginBottom: '0.4rem' }}>{pm.title}</h3>
                     <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>RCA Link: {pm.systemicRcaId} | Published: {new Date(pm.publishedAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ padding: '0.4rem 0.8rem', background: '#374151', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, color: pm.severity === 'critical' ? '#fca5a5' : '#fcd34d', textTransform: 'uppercase' }}>
                     {pm.severity} Incident
                  </div>
               </div>

               <div style={{ background: '#111827', padding: '1.5rem', borderRadius: '6px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                     <h4 style={{ margin: '0 0 0.5rem 0', color: '#e5e7eb', fontSize: '0.95rem' }}>Root Cause Analysis</h4>
                     <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.5 }}>{pm.rootCauseAnalysis}</p>
                  </div>
                  <div style={{ borderTop: '1px dashed #374151', paddingTop: '1.5rem' }}>
                     <h4 style={{ margin: '0 0 0.5rem 0', color: '#e5e7eb', fontSize: '0.95rem' }}>Resolution Summary</h4>
                     <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.5 }}>{pm.resolutionSummary}</p>
                  </div>
                  {pm.preventativeMeasures && (
                     <div style={{ borderTop: '1px dashed #374151', paddingTop: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#34d399', fontSize: '0.95rem' }}>Preventative Measures (Learnings)</h4>
                        <p style={{ margin: 0, color: '#a7f3d0', fontSize: '0.9rem', lineHeight: 1.5 }}>{pm.preventativeMeasures}</p>
                     </div>
                  )}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
