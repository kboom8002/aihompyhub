'use client';

import React, { useEffect, useState } from 'react';

const DEFAULT_NODES = [
  { id: 'solutions', label: '고민별 솔루션', defaultLabel: '고민별 솔루션', enabled: true },
  { id: 'answers', label: '공식 답변', defaultLabel: '공식 답변', enabled: true },
  { id: 'compare', label: '비교', defaultLabel: '비교', enabled: true },
  { id: 'media', label: '스토리·가이드·리뷰', defaultLabel: '스토리·가이드·리뷰', enabled: true },
  { id: 'trust', label: '신뢰(Trust)', defaultLabel: '신뢰(Trust)', enabled: true },
  { id: 'routines', label: '루틴', defaultLabel: '루틴', enabled: true },
  { id: 'products', label: '제품·번들', defaultLabel: '제품·번들', enabled: true }
];

export default function IAManagerPage() {
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/tenant/ia')
      .then(res => res.json())
      .then(data => {
         if (data && data.nodes && data.nodes.length > 0) {
            // Merge with defaults to ensure missing IDs act correctly
            const merged = DEFAULT_NODES.map(def => {
               const found = data.nodes.find((n: any) => n.id === def.id);
               if (found) {
                  return { ...def, label: found.label, enabled: found.enabled };
               }
               return def;
            });
            setNodes(merged);
         }
         setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setStatus('업데이트 중...');
    await fetch('/api/v1/tenant/ia', {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ nodes })
    });
    setStatus('GNB 내비게이션 설정이 저장되었습니다. 스토어프론트에 반영됩니다.');
    alert('IA 퍼블리싱이 완료되었습니다!');
    setTimeout(() => setStatus(''), 5000);
  };

  const toggleNode = (id: string) => {
     setNodes(nodes.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  };

  const updateLabel = (id: string, newLabel: string) => {
     setNodes(nodes.map(n => n.id === id ? { ...n, label: newLabel } : n));
  };

  if (loading) return <div style={{ padding: '2rem' }}>로딩 중...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🗂️ GNB & IA 매니저</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>스토어프론트의 상단 메뉴(GNB)를 커스텀하세요. 불필요한 메뉴를 숨기거나 브랜드에 맞는 이름으로 변경할 수 있습니다.</p>

      {status && (
         <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '600' }}>
            {status}
         </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem', background: '#f9fafb', padding: '2rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 100px', gap: '1rem', fontWeight: 'bold', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', color: '#374151' }}>
           <span>라우팅 경로</span>
           <span>커스텀 텍스트 (Label)</span>
           <span style={{ textAlign: 'center' }}>노출 여부</span>
        </div>
        
        {nodes.map(node => (
           <div key={node.id} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 100px', gap: '1rem', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #d1d5db', opacity: node.enabled ? 1 : 0.6 }}>
              <div style={{ fontSize: '0.9rem', color: '#4b5563', fontFamily: 'monospace' }}>
                 /{node.id}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                 <input 
                   type="text" 
                   value={node.label} 
                   onChange={(e) => updateLabel(node.id, e.target.value)}
                   disabled={!node.enabled}
                   style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                 />
                 {node.label !== node.defaultLabel && (
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>Modified</span>
                 )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                 <button 
                   onClick={() => toggleNode(node.id)}
                   style={{ 
                     background: node.enabled ? '#10b981' : '#e5e7eb', 
                     color: node.enabled ? 'white' : '#6b7280', 
                     border: 'none', 
                     padding: '0.5rem 1rem', 
                     borderRadius: '20px', 
                     cursor: 'pointer',
                     fontWeight: 'bold',
                     transition: 'all 0.2s'
                   }}
                 >
                   {node.enabled ? 'ON' : 'OFF'}
                 </button>
              </div>
           </div>
        ))}
      </div>

      <button 
        onClick={handleSave}
        style={{ background: '#111827', color: 'white', padding: '1rem 3rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', border: 'none' }}
      >
        IA 저장 및 퍼블리싱 (Publish IA)
      </button>

    </div>
  );
}
