'use client';

import React, { useState, useEffect } from 'react';
import type { AutomationSuggestionSnapshotDTO, AutomationSuggestionDTO } from '@aihompyhub/database/dto/automation';

export function GuidedAutomationPanel() {
  const [data, setData] = useState<AutomationSuggestionSnapshotDTO['data'] | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = () => {
    fetch('/api/v1/queries/automation-suggestion-snapshot', { headers: { 'x-tenant-id': 'SYSTEM', 'x-role': 'factory_admin' } })
      .then(res => res.json())
      .then(payload => setData(payload.data?.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = async (suggestionId: string, decision: 'accept' | 'reject') => {
    let rationale = undefined;
    if (decision === 'reject') {
       const userReason = window.prompt("Operator Rationale: Why are you rejecting or dismissing this recommendation?", "");
       if (userReason === null) return; // Cancelled
       rationale = userReason || 'No rationale provided';
    }

    setProcessingId(suggestionId);
    try {
       const res = await fetch('/api/v1/commands/automation/decide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-role': 'factory_admin' },
          body: JSON.stringify({
             meta: { requestId: 'req-'+Date.now(), actorId: '00000000-0000-0000-0000-000000000000', activeRole: 'factory_admin' },
             body: { suggestionId, decision, rationale }
          })
       });
       if(res.ok) {
          setFeedback(`Suggestion ${decision}ed successfully.`);
          // Optimistic update
          // Fetch fresh server state immediately to move items to Audit History
          loadData();
          setTimeout(() => { setFeedback(null); }, 3000);
       }
    } catch(e) {
       console.error(e);
    } finally {
       setProcessingId(null);
    }
  };

  if(!data || (data.pendingSuggestions.length === 0 && data.recentDecisions.length === 0)) return null;

  return (
    <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '1.5rem', color: '#e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.2rem' }}>✨</span>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f3f4f6' }}>Copilot Automation Suggestions</h3>
      </div>
      
      {feedback && <div style={{ background: '#065f46', padding: '0.5rem 1rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>{feedback}</div>}

      {data.pendingSuggestions.length > 0 && (
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
           {data.pendingSuggestions.map(s => {
           const isBlocked = s.status === 'blocked_by_policy';
           return (
             <div key={s.id} style={{ background: '#1f2937', padding: '1rem', borderRadius: '6px', borderLeft: isBlocked ? '4px solid #ef4444' : '4px solid #3b82f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 600, color: '#f9fafb' }}>{s.title}</div>
                  <div style={{ fontSize: '0.75rem', background: '#374151', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Confidence: {s.confidenceScore}%</div>
                </div>
                
                <div style={{ fontSize: '0.8rem', color: '#6ee7b7', marginTop: '0.4rem' }}>
                   Target Context: {s.targetContextType}
                </div>

                <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.5rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                  {s.reasoningLog}
                </p>

                {isBlocked && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#7f1d1d', color: '#fecaca', fontSize: '0.8rem', borderRadius: '4px' }}>
                    <strong>Policy Guard Active:</strong> {s.policyWarning}
                    <div style={{ marginTop: '0.2rem', fontSize: '0.75rem', color: '#fca5a5' }}>* Auto-execution is disabled. Manual override required by upper management.</div>
                  </div>
                )}
                {!isBlocked && s.actionBundle && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#1e3a8a', color: '#bfdbfe', fontSize: '0.8rem', borderRadius: '4px' }}>
                    <strong>Proposed Mitigation:</strong> {s.actionBundle.description}
                    <pre style={{ margin: '0.5rem 0 0 0', padding: '0.3rem', background: '#172554', fontSize: '0.7rem', overflowX: 'auto', borderRadius: '2px' }}>
                       {s.actionBundle.actionsPayload ? JSON.stringify(s.actionBundle.actionsPayload, null, 2) : 'Payload hidden'}
                    </pre>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                   <button 
                      onClick={() => handleDecision(s.id, 'accept')}
                      disabled={isBlocked || processingId === s.id}
                      style={{ 
                         background: isBlocked ? '#374151' : '#2563eb', 
                         color: isBlocked ? '#9ca3af' : 'white',
                         border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: isBlocked ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600
                      }}
                   >
                     {processingId === s.id ? 'Processing...' : 'Accept & Execute Bundle'}
                   </button>
                   <button 
                      onClick={() => handleDecision(s.id, 'reject')}
                      disabled={processingId === s.id}
                      style={{ background: '#374151', border: 'none', color: '#d1d5db', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                   >
                     Reject / Dismiss
                   </button>
                </div>
             </div>
           );
         })}
         </div>
      )}

      {/* Audit Provenance Log */}
      {data.recentDecisions.length > 0 && (
         <div style={{ borderTop: '1px solid #374151', paddingTop: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Operator Decisions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
               {data.recentDecisions.map(s => (
                  <div key={s.id} style={{ display: 'flex', flexDirection: 'column', padding: '0.8rem', background: '#1f2937', borderRadius: '4px', borderLeft: s.status === 'accepted' ? '3px solid #10b981' : '3px solid #6b7280' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6' }}>{s.title}</span>
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '2px', background: s.status === 'accepted' ? '#064e3b' : '#374151', color: s.status === 'accepted' ? '#a7f3d0' : '#d1d5db' }}>
                           {s.status.toUpperCase()}
                        </span>
                     </div>
                     <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.4rem' }}>
                        Decided by: {(s as any).decidedBy || 'Unknown'}<br />
                        At: {(s as any).decidedAt ? new Date((s as any).decidedAt).toLocaleString() : new Date(s.createdAt).toLocaleString()}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

    </div>
  );
}
