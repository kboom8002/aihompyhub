'use client';

import React, { useEffect, useState } from 'react';

const THEMES = [
  { id: 'clinical_premium', name: 'Clinical Premium', desc: '진지하고 전문적인 클리닉/피부과톤 (세리프 기본)' },
  { id: 'modern_vivid', name: 'Modern Vivid', desc: 'IT/스타트업을 위한 원색적이고 강렬한 디자인' },
  { id: 'soft_minimalist', name: 'Soft Minimalist', desc: '라운딩을 강조한 친근하고 따뜻한 베이지 톤' },
];

export default function DesignManagerPage({ params }: { params: { tenantId: string } }) {
  const [baseTheme, setBaseTheme] = useState('clinical_premium');
  const [primaryColor, setPrimaryColor] = useState('');
  const [radius, setRadius] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [homeTemplate, setHomeTemplate] = useState('universal');
  const [logoUrl, setLogoUrl] = useState('');
  
  // Hero section states (universal)
  const [heroImage, setHeroImage] = useState('');
  const [heroTemplate, setHeroTemplate] = useState('glass_card');
  const [heroSummary, setHeroSummary] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [primaryCtaText, setPrimaryCtaText] = useState('');
  const [primaryCtaLink, setPrimaryCtaLink] = useState('');
  const [secondaryCtaText, setSecondaryCtaText] = useState('');
  const [secondaryCtaLink, setSecondaryCtaLink] = useState('');
  const [voiceBadge, setVoiceBadge] = useState('');

  // Semantic Hero states (question-first)
  const [semanticSummary, setSemanticSummary] = useState('');
  const [semanticDescription, setSemanticDescription] = useState('');

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [iaNodes, setIaNodes] = useState<{id: string, label: string}[]>([]);

  useEffect(() => {
    fetch('/api/v1/tenant/design', {
       headers: { 'x-tenant-id': params.tenantId }
    })
      .then(res => res.json())
      .then(data => {
         if (data) {
            setBaseTheme(data.base_theme || 'clinical_premium');
            setPrimaryColor(data.overrides?.primary_color || '');
            setRadius(data.overrides?.radius || '');
            setBgColor(data.overrides?.bg || '');
            setHomeTemplate(data.overrides?.homeTemplate || 'universal');
            setLogoUrl(data.overrides?.logo_url || '');
            
            if (data.overrides?.hero) {
               setHeroImage(data.overrides.hero.heroImage || '');
               setHeroTemplate(data.overrides.hero.heroTemplate || 'glass_card');
               setHeroSummary(data.overrides.hero.summary || '');
               setHeroDescription(data.overrides.hero.description || '');
               setPrimaryCtaText(data.overrides.hero.primaryCtaText || '');
               setPrimaryCtaLink(data.overrides.hero.primaryCtaLink || '');
               setSecondaryCtaText(data.overrides.hero.secondaryCtaText || '');
               setSecondaryCtaLink(data.overrides.hero.secondaryCtaLink || '');
               setVoiceBadge(data.overrides.hero.voiceBadge || '');
            }
            if (data.overrides?.semanticHero) {
               setSemanticSummary(data.overrides.semanticHero.summary || '');
               setSemanticDescription(data.overrides.semanticHero.description || '');
            }
         }
         
         // Fetch IA nodes for datalist
         return fetch('/api/v1/tenant/ia', { headers: { 'x-tenant-id': params.tenantId } });
      })
      .then(res => res ? res.json() : null)
      .then(iaData => {
         if (iaData && iaData.nodes) {
             setIaNodes(iaData.nodes.filter((n: any) => n.enabled));
         }
         setLoading(false);
      });
  }, [params.tenantId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     setIsUploading(true);
     try {
       const formData = new FormData();
       formData.append('file', file);
       const res = await fetch('/api/v1/tenant/upload', {
         method: 'POST',
         headers: { 'x-tenant-id': params.tenantId },
         body: formData
       });
       const data = await res.json();
       if (data.url) {
         setHeroImage(data.url);
       } else {
         alert('업로드 실패: ' + (data.error || '알 수 없는 오류'));
       }
     } catch (err) {
       alert('업로드 중 오류 발생');
     } finally {
       setIsUploading(false);
     }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     setIsLogoUploading(true);
     try {
       const formData = new FormData();
       formData.append('file', file);
       const res = await fetch('/api/v1/tenant/upload', {
         method: 'POST',
         headers: { 'x-tenant-id': params.tenantId },
         body: formData
       });
       const data = await res.json();
       if (data.url) {
         setLogoUrl(data.url);
       } else {
         alert('로고 업로드 실패: ' + (data.error || '알 수 없는 오류'));
       }
     } catch (err) {
       alert('로고 업로드 중 오류 발생');
     } finally {
       setIsLogoUploading(false);
     }
  };

  const handleSave = async () => {
    setStatus('저장 중...');
    const payload = {
       base_theme: baseTheme,
       overrides: {
          ...(primaryColor ? { primary_color: primaryColor } : {}),
          ...(radius ? { radius: radius } : {}),
          ...(bgColor ? { bg: bgColor } : {}),
          ...(logoUrl ? { logo_url: logoUrl } : {}),
          homeTemplate: homeTemplate,
          hero: {
             heroImage: heroImage,
             heroTemplate: heroTemplate,
             summary: heroSummary,
             description: heroDescription,
             voiceBadge: voiceBadge,
             primaryCtaText: primaryCtaText,
             primaryCtaLink: primaryCtaLink,
             secondaryCtaText: secondaryCtaText,
             secondaryCtaLink: secondaryCtaLink
          },
          semanticHero: {
             summary: semanticSummary,
             description: semanticDescription
          }
       }
    };

    await fetch('/api/v1/tenant/design', {
       method: 'PATCH',
       headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': params.tenantId
       },
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

      {/* 0. Home Template Selection */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>0. 홈페이지 구조 템플릿 (Layout Structure)</h3>
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '2rem', marginBottom: '3rem' }}>
         <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>메인 페이지 렌더링 템플릿</label>
         <select value={homeTemplate} onChange={e => setHomeTemplate(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', background: '#f8fafc' }}>
            <option value="universal">Universal (보편적인 커머스/브랜드 기본 구조)</option>
            <option value="question-first">Question-First (검색 및 상황 문답 중심 특화 구조 - DR.O 호환)</option>
         </select>
         <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            선택한 템플릿에 따라 스토어프론트 메인 페이지의 프리셋 레이아웃 블록 배열이 동적으로 교체됩니다.
         </p>
      </div>

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

      {/* 1.1 Brand Identity (Logo) */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', marginTop: '2rem' }}>1.1. 브랜드 아이덴티티 설정</h3>
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '2rem', marginBottom: '3rem' }}>
         <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>메인 GNB 로고 이미지 최우선 적용 (File Upload / URL)</label>
         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            {isLogoUploading && <span style={{ fontSize: '0.9rem', color: '#3b82f6' }}>업로드 중...</span>}
         </div>
         <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="로고 URL (설정 시 텍스트 대신 좌측 상단 로고 노출)" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', marginTop: '0.5rem' }} />
         {logoUrl && (
            <div style={{ marginTop: '0.5rem', maxWidth: '200px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb', background: '#f8fafc', padding: '1rem' }}>
               <img src={logoUrl} alt="Logo Preview" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} />
            </div>
         )}
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

       {/* 3. Hero Overrides */}
       {homeTemplate === 'universal' ? (
         <>
           <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>3. 메인 히어로(Hero) 콘셉트 구역 (Universal Template)</h3>
           <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
              <div>
                 <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>히어로 레이아웃 템플릿 형태</label>
                 <select value={heroTemplate} onChange={e => setHeroTemplate(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', background: '#f8fafc' }}>
                    <option value="glass_card">글래스모피즘 박스 갤러리형 (버튼 및 배지 포함 권장)</option>
                    <option value="transparent_text">투명 텍스트 강조형 (비건루트 감성, 배경없는 큰 글씨)</option>
                 </select>
              </div>
              <div>
                 <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>메인 배경 이미지 업로드 (File Upload / URL)</label>
                 <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                    {isUploading && <span style={{ fontSize: '0.9rem', color: '#3b82f6' }}>업로드 중...</span>}
                 </div>
                 <input type="text" value={heroImage} onChange={e => setHeroImage(e.target.value)} placeholder="업로드된 클라우드 URL (또는 직접 입력)" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', marginTop: '0.5rem' }} />
                 {heroImage && (
                    <div style={{ marginTop: '0.5rem', maxWidth: '300px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                       <img src={heroImage} alt="Hero Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                 )}
              </div>
              <div>
                 <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>보이스 배지 텍스트 (Voice Badge)</label>
                 <input type="text" value={voiceBadge} onChange={e => setVoiceBadge(e.target.value)} placeholder="e.g. 프리미엄 스킨 리셋 VOICE (비워두면 브랜드 SSoT 설정 따름)" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>
              <div>
                 <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>메인 타이틀 (Summary)</label>
                 <input type="text" value={heroSummary} onChange={e => setHeroSummary(e.target.value)} placeholder="e.g. Premium Botanical Skincare" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>
              <div>
                 <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>서브 설명글 (Description)</label>
                 <textarea value={heroDescription} onChange={e => setHeroDescription(e.target.value)} placeholder="e.g. AI-Crafted canonical answers and routines for absolute trust..." style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '80px' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                 <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>메인 버튼 텍스트 (Primary CTA)</label>
                    <input type="text" value={primaryCtaText} onChange={e => setPrimaryCtaText(e.target.value)} placeholder="e.g. 내 루틴/리셋 찾기" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                 </div>
                 <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>메인 버튼 링크 (Primary Link)</label>
                    <input type="text" list="ia-nodes" value={primaryCtaLink} onChange={e => setPrimaryCtaLink(e.target.value)} placeholder="e.g. /routines" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                 </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>서브 버튼 텍스트 (Secondary CTA)</label>
                    <input type="text" value={secondaryCtaText} onChange={e => setSecondaryCtaText(e.target.value)} placeholder="e.g. 고민별 공식 답변 보기" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                 </div>
                 <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>서브 버튼 링크 (Secondary Link)</label>
                    <input type="text" list="ia-nodes" value={secondaryCtaLink} onChange={e => setSecondaryCtaLink(e.target.value)} placeholder="e.g. /solutions" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                 </div>
              </div>
           </div>
         </>
       ) : (
         <>
           <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#4f46e5' }}>3. 대화형 AI 질의 히어로 설정 (Semantic Search Hero)</h3>
           <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
             <p style={{ fontSize: '0.875rem', color: '#4338ca', marginBottom: '-0.5rem' }}>
                 Question-First 템플릿(DR.O 모델)에 특화된 단순화 폼입니다. 고객이 자신의 '상황'을 직접 입력할 수 있도록 유도하는 카피라이트를 작성해주세요. 설정된 배경 이미지는 검색 화면 뒤편에 은은하게 투영됩니다.
              </p>
              <div>
                 <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>메인 배경 이미지 업로드 (File Upload / URL)</label>
                 <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ padding: '0.5rem', border: '1px solid #c7d2fe', borderRadius: '6px' }} />
                    {isUploading && <span style={{ fontSize: '0.9rem', color: '#4f46e5' }}>업로드 중...</span>}
                 </div>
                 <input type="text" value={heroImage} onChange={e => setHeroImage(e.target.value)} placeholder="업로드된 클라우드 URL (또는 직접 입력)" style={{ width: '100%', padding: '0.75rem', border: '1px solid #c7d2fe', borderRadius: '6px', marginTop: '0.5rem' }} />
                 {heroImage && (
                    <div style={{ marginTop: '0.5rem', maxWidth: '300px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #c7d2fe' }}>
                       <img src={heroImage} alt="Hero Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                 )}
              </div>
              <div>
                 <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>검색 유도 메인 타이틀 (Summary)</label>
                 <textarea value={semanticSummary} onChange={e => setSemanticSummary(e.target.value)} placeholder="e.g. 오늘 어떤 피부 고민으로 정확한 타이밍의 리셋이 필요하신가요?" style={{ width: '100%', padding: '0.75rem', border: '1px solid #c7d2fe', borderRadius: '6px', minHeight: '80px' }} />
              </div>
              <div>
                 <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>서브 설명글 (Description)</label>
                 <textarea value={semanticDescription} onChange={e => setSemanticDescription(e.target.value)} placeholder="e.g. 무너진 피부 상태를 가장 빠르게 정상화하는 클리닉 로직을 질문해 보세요." style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '80px' }} />
              </div>
           </div>
         </>
       )}

      <datalist id="ia-nodes">
        {iaNodes.map(node => (
           <option key={node.id} value={`/${node.id}`}>{node.label}</option>
        ))}
      </datalist>

      {/* 4. Execute */}
      <button 
        onClick={handleSave}
        style={{ background: '#111827', color: 'white', padding: '1rem 3rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', border: 'none' }}
      >
        마스터 테마 퍼블리싱 (Publish Design)
      </button>

    </div>
  );
}
