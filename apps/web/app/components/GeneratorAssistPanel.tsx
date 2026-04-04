'use client';

import React, { useState, useEffect } from 'react';

export function GeneratorAssistPanel({ 
  onAccept, 
  targetFilter 
}: { 
  onAccept: (data: any) => void,
  targetFilter: 'BrandFoundation' | 'AnswerCard' 
}) {
  const [assistData, setAssistData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  
  const fetchAssist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/queries/studio-assist-snapshot', { headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' } });
      const payload = await res.json();
      if (!res.ok) throw new Error('API Error');
      
      const payloadData = payload.data?.data;
      if(payloadData) {
        // Filter pending outputs by target
        const outputs = payloadData.pendingOutputs || [];
        payloadData.pendingOutputs = outputs.filter((o: any) => o.targetObjectType === targetFilter);
        
        // Filter runs roughly logically to represent history
        const runTypeMap = { 'BrandFoundation': 'brand_foundation', 'AnswerCard': 'content_draft' };
        payloadData.availableRuns = (payloadData.availableRuns || []).filter((r: any) => r.runType === runTypeMap[targetFilter]);
      }
      setAssistData(payloadData);
    } catch(e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssist();
  }, [targetFilter]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const runTypeMap = { 'BrandFoundation': 'brand_foundation', 'AnswerCard': 'content_draft' };
      const res = await fetch('/api/v1/commands/generator/trigger-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': '00000000-0000-0000-0000-000000000001' },
        body: JSON.stringify({
          meta: { requestId: 'req-'+Date.now(), actorId: '00000000-0000-0000-0000-000000000000', activeRole: 'admin' },
          body: { 
             runType: runTypeMap[targetFilter],
             targetObjectType: targetFilter
          }
        })
      });
      if(!res.ok) throw new Error('Generation failed');
      await fetchAssist();
    } catch(e:any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleAccept = async (outputId: string, proposedData: any) => {
    try {
      await fetch('/api/v1/commands/generator/accept-output', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': '00000000-0000-0000-0000-000000000001' },
        body: JSON.stringify({
           meta: { requestId: 'req-'+Date.now(), actorId: '00000000-0000-0000-0000-000000000000', activeRole: 'admin' },
           body: { outputId, decision: 'accepted', targetObjectType: targetFilter }
        })
      });
      onAccept(proposedData);
      setAssistData((prev: any) => ({
        ...prev,
        pendingOutputs: prev.pendingOutputs.filter((o:any) => o.id !== outputId)
      }));
    } catch(e) {
      console.error(e);
    }
  };

  if (loading && !assistData) return <div className="surface" style={{ marginTop: '2rem', background: 'var(--color-bg-secondary)' }}>AI Engine Processing / Loading...</div>;

  return (
    <div className="surface" style={{ marginTop: '2rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>✨ AI Generator Assist</h3>
          <span style={{ fontSize: '0.75rem', background: 'var(--color-trust-green)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>ENGINE READY</span>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="button-secondary">{loading ? 'Working...' : 'Run Generation'}</button>
      </div>
      
      {error && <p style={{color: 'var(--color-risk-red)'}}>{error}</p>}
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Run History List */}
        <div style={{ flex: '0 0 250px' }}>
          <h4 style={{ marginTop: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Recent Runs</h4>
          {assistData?.availableRuns && assistData.availableRuns.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {assistData.availableRuns.map((run: any) => (
                <div key={run.id} style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'var(--color-bg-primary)', borderRadius: '4px', borderLeft: run.status === 'completed' ? '3px solid var(--color-trust-green)' : (run.status === 'failed' || run.status === 'blocked_missing_inputs' ? '3px solid var(--color-risk-red)' : '3px solid var(--color-risk-yellow)') }}>
                  <div style={{ fontWeight: 600 }}>{run.id.slice(0,8)}...</div>
                  <div style={{ color: run.status === 'completed' ? 'var(--color-trust-green)' : 'var(--color-risk-red)' }}>{run.status.toUpperCase()}</div>
                  {run.status === 'blocked_missing_inputs' && <div style={{ fontSize: '0.7rem', color: 'var(--color-risk-red)' }}>Missing required Input Pack data</div>}
                </div>
              ))}
            </div>
          ) : (
             <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>No runs yet.</div>
          )}
        </div>

        {/* Pending Output Previews */}
        <div style={{ flex: 1 }}>
          <h4 style={{ marginTop: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Draft Generation Preview</h4>
          {assistData?.pendingOutputs && assistData.pendingOutputs.length > 0 ? (
            <div>
              {assistData.pendingOutputs.map((out: any) => (
                 <div key={out.id} style={{ padding: '1rem', background: 'var(--color-bg-primary)', borderRadius: '4px', marginTop: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                   <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', margin: 0, color: 'var(--color-text-primary)' }}>
                     {JSON.stringify(out.proposedContent, null, 2)}
                   </pre>
                   {out.trustPlaceholders && out.trustPlaceholders.length > 0 && (
                     <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'var(--color-risk-yellow-bg)', borderRadius: '4px', fontSize: '0.85rem' }}>
                       <strong style={{ display: 'block', marginBottom: '0.2rem' }}>⚠️ Action Required Post-Acceptance:</strong>
                       <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                         {out.trustPlaceholders.map((p: any, i: number) => (
                           <li key={i}>{p.hint}</li>
                         ))}
                       </ul>
                     </div>
                   )}
                   <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>This will be inserted as a DRAFT.</span>
                     <button onClick={() => handleAccept(out.id, out.proposedContent)} className="button-primary">Accept & Apply Draft</button>
                   </div>
                 </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', padding: '2rem', background: 'var(--color-bg-primary)', textAlign: 'center', borderRadius: '4px' }}>
              No pending outputs to review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
