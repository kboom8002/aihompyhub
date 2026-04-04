'use client';

import React, { useEffect, useState } from 'react';

const AVAILABLE_BLOCKS = [
  { type: 'BrandHero', label: '메인 히어로 영역', defaultProps: { alignment: 'center' } },
  { type: 'BlockHeading', label: '섹션 제목', defaultProps: { title: 'New Category', subtitle: 'Live Trust' } },
  { type: 'AnswerCardGrid', label: 'SSoT 콘텐츠 큐레이션 (답변 그리드)', defaultProps: { columns: 3 } },
];

export default function CurationManagerPage() {
  const [layout, setLayout] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/tenant/curation')
      .then(res => res.json())
      .then(data => {
         if (data && data.layout) {
            setLayout(data.layout);
         }
         setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setStatus('저장 중...');
    await fetch('/api/v1/tenant/curation', {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ layout })
    });
    setStatus('큐레이션 완료! 스토어프론트에 즉시 반영됩니다.');
    alert('홈페이지 큐레이션 및 레이아웃 배치가 퍼블리싱 되었습니다.');
    setTimeout(() => setStatus(''), 5000);
  };

  const addBlock = (blockType: any) => {
     setLayout([...layout, { type: blockType.type, props: blockType.defaultProps }]);
  };

  const removeBlock = (index: number) => {
     setLayout(layout.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
      if (index + direction < 0 || index + direction >= layout.length) return;
      const newLayout = [...layout];
      const temp = newLayout[index];
      newLayout[index] = newLayout[index + direction];
      newLayout[index + direction] = temp;
      setLayout(newLayout);
  };

  if (loading) return <div style={{ padding: '2rem' }}>로딩 중...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>📌 홈 큐레이션 보드</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>스토어프론트 홈 화면의 레이아웃 순서와 노출될 위젯 블록을 개별 조합하고 배치합니다.</p>

      {status && (
         <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '600' }}>
            {status}
         </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', marginBottom: '3rem' }}>
         
         {/* Left: Active Layout Builder */}
         <div style={{ background: '#f9fafb', border: '1px border #e5e7eb', padding: '2rem', borderRadius: '8px', minHeight: '500px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>현재 레이아웃 배치</h3>
            {layout.length === 0 && <p style={{ color: '#9ca3af' }}>비어있습니다. (템플릿 기본값이 사용됩니다)</p>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {layout.map((block, idx) => (
                 <div key={idx} style={{ background: 'white', border: '1px solid #d1d5db', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div>
                        <span style={{ fontWeight: 'bold', display: 'block', fontSize: '1.1rem' }}>{block.type}</span>
                        <code style={{ fontSize: '0.8rem', color: '#6b7280' }}>{JSON.stringify(block.props)}</code>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => moveBlock(idx, -1)} disabled={idx === 0} style={{ padding: '0.5rem', cursor: 'pointer' }}>↑</button>
                        <button onClick={() => moveBlock(idx, 1)} disabled={idx === layout.length - 1} style={{ padding: '0.5rem', cursor: 'pointer' }}>↓</button>
                        <button onClick={() => removeBlock(idx)} style={{ padding: '0.5rem', color: 'red', cursor: 'pointer' }}>🗑️</button>
                    </div>
                 </div>
              ))}
            </div>
         </div>

         {/* Right: Available Blocks */}
         <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>+ 블록 추가</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {AVAILABLE_BLOCKS.map(block => (
                 <button 
                   key={block.type} 
                   onClick={() => addBlock(block)}
                   style={{ background: '#ffffff', border: '1px dashed #3b82f6', padding: '1rem', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
                 >
                    <span style={{ fontWeight: 'bold', color: '#1d4ed8' }}>+ {block.label}</span>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>{block.type}</span>
                 </button>
              ))}
            </div>
         </div>
      </div>

      <button 
        onClick={handleSave}
        style={{ background: '#111827', color: 'white', padding: '1rem 3rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', border: 'none' }}
      >
        큐레이션 퍼블리싱 (Publish Curation)
      </button>

    </div>
  );
}
