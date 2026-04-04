'use client';

import React, { useState, useEffect } from 'react';
import type { BenchmarkExplorerSnapshotDTO } from '@aihompyhub/database/dto/optimization';
import { PageHeader } from '../../components/PageHeader';

export default function BenchmarkExplorerView() {
  const [data, setData] = useState<BenchmarkExplorerSnapshotDTO['data'] | null>(null);

  useEffect(() => {
    fetch('/api/v1/queries/benchmark-explorer-snapshot', { headers: { 'x-tenant-id': 'SYSTEM', 'x-role': 'factory_admin' } })
      .then(res => res.json())
      .then(payload => setData(payload.data?.data));
  }, []);

  if (!data) return <div style={{ padding: '2rem' }}>Loading Benchmark Runs...</div>;

  const renderRunRow = (run: BenchmarkExplorerSnapshotDTO['data']['recentRuns'][0]) => (
      <tr key={run.id} style={{ borderBottom: '1px solid #374151' }}>
         <td style={{ padding: '1rem', color: '#f3f4f6' }}>
            <div style={{ fontWeight: 600 }}>{run.targetIdentifier}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>{run.targetObjectType} | Ref: {run.datasetRef}</div>
         </td>
         <td style={{ padding: '1rem', textAlign: 'center' }}>
            <span style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, background: run.status === 'pass' ? '#064e3b' : '#7f1d1d', color: run.status === 'pass' ? '#34d399' : '#fca5a5' }}>
               {run.status.toUpperCase()}
            </span>
         </td>
         <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: run.overallScore > 90 ? '#10b981' : run.overallScore > 75 ? '#fbbf24' : '#ef4444' }}>{run.overallScore.toFixed(1)}</td>
         <td style={{ padding: '1rem', textAlign: 'right', color: '#d1d5db' }}>{run.qualityScore.toFixed(1)}</td>
         <td style={{ padding: '1rem', textAlign: 'right', color: '#d1d5db' }}>{run.safeguardScore.toFixed(1)}</td>
         <td style={{ padding: '1rem', textAlign: 'right', color: '#9ca3af', fontSize: '0.9rem' }}>{run.latencyMsP95 ? `${run.latencyMsP95}ms` : 'N/A'}</td>
         <td style={{ padding: '1rem', textAlign: 'right', color: '#6b7280', fontSize: '0.8rem' }}>{new Date(run.runDate).toLocaleDateString()}</td>
      </tr>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader title="Benchmark Explorer" />
      
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Golden-set evaluations against Prompts and Generative Pipelines. Use these offline benchmarks to certify generation boundaries before migrating to live Experiments.</p>

      <div className="surface" style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
         <div style={{ padding: '1rem 1.5rem', background: '#1f2937', borderBottom: '1px solid #374151' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#f3f4f6' }}>Evaluation Repository</h3>
         </div>
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#111827', textAlign: 'left', borderBottom: '2px solid #374151' }}>
               <tr>
                  <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: 500, fontSize: '0.85rem' }}>Asset Identity</th>
                  <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: 500, fontSize: '0.85rem', textAlign: 'center' }}>Result</th>
                  <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Overall Score</th>
                  <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Quality (LLM Evaluator)</th>
                  <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Safeguard adherence</th>
                  <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>p95 Latency</th>
                  <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Run Date</th>
               </tr>
            </thead>
            <tbody>
               {data.topPerformers.map(renderRunRow)}
               {data.recentRuns.map(renderRunRow)}
            </tbody>
         </table>
      </div>
    </div>
  );
}
