'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../../../components/PageHeader';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ClusterTopicsPage() {
  const params = useParams();
  const clusterId = params.id as string;
  const tenantId = params.tenantId as string;
  
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Note: For MVP, we are not passing clusterName via route so we'll just refer to it generically or fetch it if needed.
  // We'll call it '종속 질문 모음' (Dependent Question Collection)

  const loadTopics = () => {
    fetch(`/api/v1/tenant/topics?clusterId=${clusterId}`, { headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' } }) // Default mock ID
      .then(res => res.json())
      .then(payload => {
        if (payload?.data) {
           setTopics(payload.data);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    if (clusterId) loadTopics();
  }, [clusterId]);

  const handleCreate = async () => {
    if (!newQuestion) return alert('질문 내용을 입력해주세요.');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/tenant/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId || '00000000-0000-0000-0000-000000000001' },
        body: JSON.stringify({ cluster_id: clusterId, title: newQuestion })
      });
      if (res.ok) {
         setNewQuestion('');
         setIsModalOpen(false);
         loadTopics();
      } else {
         const err = await res.json();
         alert('생성에 실패했습니다: ' + err.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 질문 원본을 삭제하시겠습니까? 연관된 답변 카드가 고립될 수 있습니다.')) return;
    try {
      const res = await fetch(`/api/v1/tenant/topics?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
         loadTopics();
      } else {
         alert('삭제 실패');
      }
    } catch {
      alert('네트워크 오류');
    }
  };

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
         <Link href={`/tenant/${tenantId}/questions/clusters`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            &larr; 상위 클러스터 목록으로 돌아가기
         </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageHeader 
          title="하위 질문 (Topics) 관리" 
          subtitle="해당 클러스터에 종속된 실제 고객 질문 원형(Canonical Question)들을 관리합니다."
        />
        <button 
           onClick={() => setIsModalOpen(true)}
           style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
        >
          + 새 질문 추가
        </button>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '500px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#111827' }}>새 질문(Topic) 등록</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#374151' }}>고객 지향적 질문 (Canonical Question)</label>
              <textarea 
                rows={3}
                value={newQuestion} 
                onChange={e => setNewQuestion(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical' }} 
                placeholder="예: 지성 피부인데 여름에 선크림 수시로 덧발라야 하나요?" 
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>* 상태(Status)는 기본 '초안(draft)' 상태로 등록됩니다.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#374151', fontWeight: 500 }}>취소</button>
              <button disabled={isSubmitting} onClick={handleCreate} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>{isSubmitting ? '등록 중...' : '등록하기'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="surface" style={{ marginTop: '1rem' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 0', width: '60%' }}>질문 내용 (Canonical Question)</th>
              <th>상태 (Status)</th>
              <th>등록일자</th>
              <th style={{ textAlign: 'right' }}>액션</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr><td colSpan={4} style={{ padding: '2rem 0', textAlign: 'center' }}>질문들을 불러오는 중입니다...</td></tr>
            ) : topics.length === 0 ? (
               <tr><td colSpan={4} style={{ padding: '2rem 0', textAlign: 'center', color: '#6b7280' }}>등록된 질문이 없습니다. 상단의 버튼을 눌러 새 질문을 등록하세요.</td></tr>
            ) : (
              topics.map((t: any) => (
                <tr key={t.id}>
                  <td style={{ padding: '1.25rem 0', borderBottom: '1px solid #e5e7eb', fontWeight: 500, color: '#111827', paddingRight: '1rem' }}>
                    {t.title}
                  </td>
                  <td style={{ padding: '1.25rem 0', borderBottom: '1px solid #e5e7eb' }}>
                     <span style={{ 
                        background: t.content_status === 'published' ? '#dcfce7' : (t.content_status === 'ready_for_review' ? '#fef3c7' : '#f1f5f9'), 
                        color: t.content_status === 'published' ? '#166534' : (t.content_status === 'ready_for_review' ? '#b45309' : '#475569'), 
                        padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 
                     }}>
                       {t.content_status || 'draft'}
                     </span>
                  </td>
                  <td style={{ padding: '1.25rem 0', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.85rem' }}>
                     {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1.25rem 0', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                    <Link 
                      href={`/tenant/${tenantId}/studio/brand_ssot/answer?topicId=${t.id}&title=${encodeURIComponent(t.title)}`}
                      style={{ padding: '0.35rem 0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', marginRight: '0.5rem' }}
                    >
                      ✏️ 답변 쓰기
                    </Link>
                    <button onClick={() => handleDelete(t.id)} title="삭제" style={{ padding: '0.35rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
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
