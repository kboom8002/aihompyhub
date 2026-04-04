'use client';

import React, { useState, useEffect } from 'react';
import type { ExperimentCompareSnapshotDTO, ExperimentCompareSummaryDTO } from '@aihompyhub/database/dto/optimization';
import { PageHeader } from '../../components/PageHeader';

function MetricBar({ label, baselineVal, testVal, isHigherBetter = true, format = (v: number) => v.toString() }: { label: string, baselineVal: number, testVal: number, isHigherBetter?: boolean, format?: (v: number) => string }) {
   const diff = testVal - baselineVal;
   const diffPercent = baselineVal > 0 ? (diff / baselineVal) * 100 : 0;
   
   let color = '#9ca3af'; // neutral
   if (diff !== 0) {
      if (isHigherBetter) color = diff > 0 ? '#10b981' : '#ef4444';
      else color = diff < 0 ? '#10b981' : '#ef4444';
   }

   const formattedDiff = `${diff > 0 ? '+' : ''}${diffPercent.toFixed(1)}%`;

   return (
      <div style={{ marginBottom: '1rem' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#d1d5db', marginBottom: '0.3rem' }}>
            <span>{label}</span>
            <span style={{ color, fontWeight: 600 }}>{formattedDiff}</span>
         </div>
         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1, background: '#374151', height: '1.5rem', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
               <div style={{ width: `${Math.min(100, Math.max(0, baselineVal))}%`, background: '#6b7280', height: '100%' }}></div>
               <span style={{ position: 'absolute', top: '50%', left: '0.5rem', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'white' }}>Base: {format(baselineVal)}</span>
            </div>
            <div style={{ flex: 1, background: '#374151', height: '1.5rem', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
               <div style={{ width: `${Math.min(100, Math.max(0, testVal))}%`, background: color, height: '100%' }}></div>
               <span style={{ position: 'absolute', top: '50%', left: '0.5rem', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'white' }}>Test: {format(testVal)}</span>
            </div>
         </div>
      </div>
   );
}

function ExperimentCard({ exp, onCommand }: { exp: ExperimentCompareSummaryDTO, onCommand: (id: string, decision: 'promote'|'abort') => Promise<void> }) {
   const isRunning = exp.status === 'running';
   return (
      <div className="surface" style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f3f4f6' }}>{exp.experimentName}</h3>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: isRunning ? '#1e3a8a' : '#374151', color: isRunning ? '#93c5fd' : '#d1d5db' }}>
                     {exp.status.toUpperCase()}
                  </span>
               </div>
               <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Target: {exp.targetObjectType} | Primary Metric: {exp.primaryMetric} | Started: {new Date(exp.startedAt).toLocaleDateString()}</div>
               {exp.conclusionReason && <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#450a0a', color: '#fecaca', borderRadius: '4px', fontSize: '0.8rem' }}><strong>Aborted:</strong> {exp.conclusionReason}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Traffic Split</div>
               <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f3f4f6' }}>{exp.baselineMetrics.trafficAllocation}% : {exp.testMetrics.trafficAllocation}%</div>
            </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: '#1f2937', borderRadius: '6px' }}>
               <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Variant</div>
               <div style={{ fontWeight: 600, color: '#f3f4f6', marginBottom: '0.5rem' }}>A: {exp.baselineMetrics.variantLabel}</div>
               <div style={{ fontWeight: 600, color: '#60a5fa' }}>B: {exp.testMetrics.variantLabel}</div>
            </div>
            <div style={{ gridColumn: 'span 3', padding: '1rem', background: '#111827', borderRadius: '6px', border: '1px solid #374151' }}>
               <MetricBar label="Success Rate" baselineVal={exp.baselineMetrics.successRate} testVal={exp.testMetrics.successRate} isHigherBetter={true} format={(v) => `${v}%`} />
               <MetricBar label="Timeout Rate" baselineVal={exp.baselineMetrics.timeoutRate} testVal={exp.testMetrics.timeoutRate} isHigherBetter={false} format={(v) => `${v}%`} />
               <MetricBar label="Avg Latency" baselineVal={exp.baselineMetrics.averageLatencyMs} testVal={exp.testMetrics.averageLatencyMs} isHigherBetter={false} format={(v) => `${v}ms`} />
               <MetricBar label="Trust Score" baselineVal={exp.baselineMetrics.trustScore} testVal={exp.testMetrics.trustScore} isHigherBetter={true} format={(v) => `${v}`} />
            </div>
         </div>

         {isRunning && (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #374151', paddingTop: '1rem' }}>
               <button 
                  onClick={() => onCommand(exp.id, 'promote')}
                  style={{ padding: '0.6rem 1rem', borderRadius: '6px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                  Promote B to 100% (Rollout)
               </button>
               <button 
                  onClick={() => onCommand(exp.id, 'abort')}
                  style={{ padding: '0.6rem 1rem', borderRadius: '6px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                  Abort Test (Rollback to A)
               </button>
            </div>
         )}
      </div>
   );
}

export default function ControlledExperimentsView() {
  const [data, setData] = useState<ExperimentCompareSnapshotDTO['data'] | null>(null);

  const loadData = () => {
    fetch('/api/v1/queries/experiment-compare-snapshot', { headers: { 'x-tenant-id': 'SYSTEM', 'x-role': 'factory_admin' } })
      .then(res => res.json())
      .then(payload => setData(payload.data?.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCommand = async (id: string, decision: 'promote'|'abort') => {
    const reason = window.prompt(`Rationale for ${decision.toUpperCase()}ing experiment:`, '');
    if (reason === null) return;
    
    await fetch('/api/v1/commands/experiments/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': 'factory_admin' },
        body: JSON.stringify({
            meta: { requestId: 'req-'+Date.now(), actorId: '00000000-0000-0000-0000-000000000000', activeRole: 'factory_admin' },
            body: { experimentId: id, decision, reason: reason || undefined }
        })
    });
    loadData();
  };

  if (!data) return <div style={{ padding: '2rem' }}>Loading Experiment Intelligence...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader title="Controlled Experiments" />
      
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Compare live deployment variants (A/B Test or Canary). Use these visual metrics to determine if a test variant should be frozen or fully rolled out across the multi-tenant base.</p>

      <h2 style={{ fontSize: '1.2rem', color: '#f3f4f6', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Active Experiments</h2>
      {data.activeExperiments.length === 0 ? (
         <div style={{ padding: '2rem', background: '#1f2937', color: '#9ca3af', textAlign: 'center', borderRadius: '6px', marginBottom: '2rem' }}>No experiments currently routing live traffic.</div>
      ) : (
         data.activeExperiments.map(exp => <ExperimentCard key={exp.id} exp={exp} onCommand={handleCommand} />)
      )}

      <h2 style={{ fontSize: '1.2rem', color: '#f3f4f6', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem', marginTop: '2rem' }}>Concluded (Archive)</h2>
      {data.concludedExperiments.map(exp => <ExperimentCard key={exp.id} exp={exp} onCommand={handleCommand} />)}

    </div>
  );
}
