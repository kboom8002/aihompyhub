'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DecisionPanel({ reviewTaskId }: { reviewTaskId: string }) {
  const router = useRouter();
  const [decisionNote, setDecisionNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    setLoading(true);
    setMessage(null);
    try {
      // Stub endpoint mapping - actual endpoint hasn't been written in API, we'll simulate the fetch or point to a generic mock
      const res = await fetch(`/api/v1/commands/reviews/${reviewTaskId}/record-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, note: decisionNote })
      });
      
      if (!res.ok) throw new Error('API Mock Error (Not implemented fully)');
      
      setMessage(`[${decision.toUpperCase()}] 처리가 완료되었습니다.`);
      router.refresh();
      
    } catch(e: any) {
      setMessage(`통신 상태: ${e.message}. (API 라우트가 미구현되어 로그만 기록합니다.)`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1rem' }}>
      <h3>근거 & 경계 검토 (Trust Panel)</h3>
      
      <div style={{ padding: '1rem', border: '1px solid var(--color-risk-red)', borderRadius: '4px', background: 'var(--color-risk-red-bg)' }}>
        <strong>[경계 누락]</strong>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>의학적 효능 주장에 대한 구체적 부작용 안내나 의학적 Disclaimer가 설정되지 않았습니다.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
        <label style={{ fontWeight: 600 }}>Decision Note</label>
        <textarea 
          rows={4} 
          placeholder="반려 사유나 지시사항을 기록합니다..." 
          value={decisionNote}
          onChange={(e) => setDecisionNote(e.target.value)}
          style={{ padding: '0.5rem' }} 
        />
      </div>

      {message && (
        <div style={{ padding: '0.5rem', borderLeft: '4px solid var(--color-trust-green)', background: '#eee', fontSize: '0.875rem' }}>
          {message}
        </div>
      )}

      <div className="flex-center" style={{ gap: '1rem', marginTop: '1rem' }}>
          <button 
            type="button" 
            disabled={loading}
            onClick={() => handleDecision('rejected')} 
            className="button-primary" 
            style={{ background: 'var(--color-risk-red)', flex: 1, opacity: loading ? 0.7 : 1 }}>
            반려 (Reject)
          </button>
          <button 
            type="button" 
            disabled={loading}
            onClick={() => handleDecision('approved')} 
            className="button-primary" 
            style={{ background: 'var(--color-trust-green)', flex: 1, opacity: loading ? 0.7 : 1 }}>
            승인 (Approve)
          </button>
      </div>
    </div>
  );
}
