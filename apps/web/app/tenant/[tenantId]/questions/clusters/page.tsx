'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../../components/PageHeader';
import { useParams } from 'next/navigation';

export default function QuestionClustersPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [clusters, setClusters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClusterName, setNewClusterName] = useState('');
  const [newIntent, setNewIntent] = useState('routine_discovery');
  const [newPriority, setNewPriority] = useState<number>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadClusters = () => {
    fetch('/api/v1/tenant/clusters', { headers: { 'x-tenant-id': tenantId } }) 
      .then(res => res.json())
      .then(payload => {
        if (payload?.data) {
           setClusters(payload.data);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    loadClusters();
  }, []);

  const handleCreate = async () => {
    if (!newClusterName) return alert('클러스터 명을 입력해주세요.');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/tenant/clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
        body: JSON.stringify({ cluster_name: newClusterName, intent_type: newIntent, priority_score: newPriority })
      });
      if (res.ok) {
         setNewClusterName('');
         setNewPriority(50);
         setIsModalOpen(false);
         loadClusters();
      } else {
         alert('생성에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 질문 자산을 정말 삭제하시겠습니까? 연관된 토픽이 모두 지워집니다.')) return;
    try {
      const res = await fetch(`/api/v1/tenant/clusters?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
         loadClusters();
      } else {
         alert('삭제 실패');
      }
    } catch {
      alert('네트워크 오류');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageHeader 
          title="질문 자산 (Clusters)" 
          subtitle="수집된 고객 질문 의도를 그룹핑하여 답변 적용 범위를 확인합니다."
        />
        <button 
           onClick={() => setIsModalOpen(true)}
           style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
        >
          + 신규 클러스터 추가
        </button>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#111827' }}>새 질문 클러스터 생성</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#374151' }}>클러스터 명</label>
              <input type="text" value={newClusterName} onChange={e => setNewClusterName(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} placeholder="예: 여름철 자외선 차단" />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#374151' }}>의도 (Intent) 분류</label>
              <select value={newIntent} onChange={e => setNewIntent(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white' }}>
                 <option value="routine_discovery">루틴 발견 (Routine Discovery)</option>
                 <option value="ingredient_safety">성분/안전성 (Ingredient Safety)</option>
                 <option value="comparison">비교 (Comparison)</option>
                 <option value="troubleshooting">트러블 슈팅 (Troubleshooting)</option>
                 <option value="pricing_availability">가격/구매 (Pricing & Availability)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#374151' }}>우선순위 점수 (1-100)</label>
              <input type="number" min="1" max="100" value={newPriority} onChange={e => setNewPriority(parseInt(e.target.value))} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>취소</button>
              <button disabled={isSubmitting} onClick={handleCreate} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{isSubmitting ? '생성 중...' : '생성하기'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="surface" style={{ marginTop: '1rem' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 0' }}>클러스터 명</th>
              <th>의도 (Intent)</th>
              <th>우선순위 점수</th>
              <th>커버리지 상태</th>
              <th style={{ textAlign: 'right' }}>액션</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr><td colSpan={5} style={{ padding: '2rem 0', textAlign: 'center' }}>데이터를 불러오는 중입니다...</td></tr>
            ) : clusters.length === 0 ? (
               <tr><td colSpan={5} style={{ padding: '2rem 0', textAlign: 'center' }}>데이터가 없습니다. 상단의 버튼을 눌러 개설하세요.</td></tr>
            ) : (
              clusters.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>{c.cluster_name}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>
                     <span style={{ background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem' }}>{c.intent_type}</span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>{c.priority_score}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>Uncovered</span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <a href={`/tenant/${tenantId}/questions/clusters/${c.id}`} className="button-primary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', textDecoration: 'none' }}>질문 관리 🔍</a>
                    <button onClick={() => handleDelete(c.id)} title="삭제" style={{ padding: '0.35rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
