'use client';

import React, { useEffect, useState } from 'react';

const THEMES = [
  { id: 'clinical_premium', name: 'Clinical Premium', desc: '진지하고 전문적인 클리닉/피부과톤 (세리프 기본)' },
  { id: 'modern_vivid', name: 'Modern Vivid', desc: 'IT/스타트업을 위한 원색적이고 강렬한 디자인' },
  { id: 'soft_minimalist', name: 'Soft Minimalist', desc: '라운딩을 강조한 친근하고 따뜻한 베이지 톤' },
];

export default function DesignManagerPage() {
  const [baseTheme, setBaseTheme] = useState('clinical_premium');
  const [primaryColor, setPrimaryColor] = useState('');
  const [radius, setRadius] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/tenant/design')
      .then(res => res.json())
      .then(data => {
         if (data) {
            setBaseTheme(data.base_theme || 'clinical_premium');
            setPrimaryColor(data.overrides?.primary_color || '');
            setRadius(data.overrides?.radius || '');
            setBgColor(data.overrides?.bg || '');
         }
         setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setStatus('저장 중...');
    const payload = {
       base_theme: baseTheme,
       overrides: {
          ...(primaryColor ? { primary_color: primaryColor } : {}),
          ...(radius ? { radius: radius } : {}),
          ...(bgColor ? { bg: bgColor } : {})
       }
    };

    await fetch('/api/v1/tenant/design', {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(payload)
    });
    setStatus('테마가 완료! 스토어프론트에서 즉시 확인하세요!');
    alert('마스터 테마 퍼블리싱이 완료되었습니다! 스토어프론트를 새로고침 해보세요.');
    setTimeout(() => setStatus(''), 5000);
  };

  if (loading) return <div style={{ padding: '2rem' }}>로딩 중...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🎨 테마 및 디자인 관리</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>스토어프론트 웹빌더 환경입니다. 브랜드에 가장 잘 맞는 디자인 마스터 프리셋을 선택하고 원하는 부분만 덮어쓰기(Override) 하세요.</p>

      {status && (
         <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '600' }}>
            {status}
         </div>
      )}

      {/* 1. Base Theme Selection */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>1. 마스터 테마 (Base Template) 선택</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
         {THEMES.map(theme => (
            <div 
               key={theme.id}
               onClick={() => setBaseTheme(theme.id)}
               style={{ 
                 border: baseTheme === theme.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                 borderRadius: '8px',
                 padding: '1.5rem',
                 cursor: 'pointer',
                 background: baseTheme === theme.id ? '#eff6ff' : '#ffffff',
                 transition: 'all 0.2s'
               }}
            >
               <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{theme.name}</h4>
               <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{theme.desc}</p>
            </div>
         ))}
      </div>

      {/* 2. Micro Overrides */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>2. 디자인 미세조정 (Overrides)</h3>
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
         <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Primary Color (브랜드 테마 컬러)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <input type="color" value={primaryColor || '#000000'} onChange={e => setPrimaryColor(e.target.value)} style={{ width: '50px', height: '50px', padding: '0', border: 'none', cursor: 'pointer' }} />
               <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} placeholder="e.g. #FF5500 또는 비워두면 템플릿 기본값" style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
         </div>

         <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Background Tint (배경색)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <input type="color" value={bgColor || '#ffffff'} onChange={e => setBgColor(e.target.value)} style={{ width: '50px', height: '50px', padding: '0', border: 'none', cursor: 'pointer' }} />
               <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} placeholder="e.g. #FDFCF9 또는 비워두면 템플릿 기본값" style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
         </div>

         <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>버튼 및 모서리 둥글기 (Border Radius)</label>
            <select value={radius} onChange={e => setRadius(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}>
               <option value="">마스터 템플릿 기본값 사용</option>
               <option value="0px">0px (직각, Sharp)</option>
               <option value="4px">4px (보통)</option>
               <option value="12px">12px (둥근)</option>
               <option value="32px">32px (완전한 타원급 버튼)</option>
            </select>
         </div>
      </div>

      {/* 3. Execute */}
      <button 
        onClick={handleSave}
        style={{ background: '#111827', color: 'white', padding: '1rem 3rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', border: 'none' }}
      >
        마스터 테마 퍼블리싱 (Publish Design)
      </button>

    </div>
  );
}
