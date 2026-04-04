import React from 'react';
import { PageHeader } from '../../components/PageHeader';

export default async function BuilderStudioPage() {
  const res = await fetch('http://localhost:3000/api/v1/queries/builder-studio-snapshot', { cache: 'no-store', headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' } })
    .catch(() => null);
  const snapshot = res ? await res.json() : null;
  const data = snapshot?.data;

  // SSoT requires Builder UI to focus on structure, NOT visual rendering matching
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader 
        title="Builder Studio" 
        subtitle="Visual Editor가 아닌, 디자인 시스템과 도메인 룰셋의 결합(Mapping) 구조를 통제합니다." 
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', marginTop: '2rem' }}>
        
        <div className="surface flex-col">
          <h3>도메인 템플릿 매핑 구조 (Structure Box)</h3>
          <p style={{ color: 'var(--color-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>이 뷰는 SSoT에 따라 웹페이지의 디자인이 아닌 기능과 배치 AST(Ast)만 확인합니다.</p>
          
          <pre style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px', minHeight: '300px', fontSize: '0.875rem', overflowX: 'auto' }}>
            {data?.previewStructure ? JSON.stringify(data.previewStructure, null, 2) : '로드 중 또는 구조 정의 없음...'}
          </pre>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="surface flex-col">
            <h3 style={{ margin: 0 }}>Template Assignment</h3>
            <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
              할당 패밀리: <strong>{data?.currentProfile?.familyType || '없음'}</strong>
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem' }}>Nav Priority Override</label>
                <select style={{ padding: '0.5rem', width: '100%', marginTop: '0.5rem', border: '1px solid var(--color-border)' }} defaultValue={data?.currentProfile?.overrides?.navEmphasis || "routine"}>
                  <option value="routine">Routine First</option>
                  <option value="product">Product First (Warning: YMYL risk)</option>
                  <option value="editorial">Editorial First</option>
                </select>
              </div>
              <button className="button-primary" style={{ width: '100%' }}>규칙 저장 (Update Assignment)</button>
            </div>
          </div>

          <div className="surface flex-col" style={{ background: '#fdfdfd', border: '1px solid var(--color-border)' }}>
            <h3 style={{ margin: 0 }}>Validation Summary</h3>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '1rem', color: 'var(--color-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {data?.validationSummary ? data.validationSummary.map((v: any, i: number) => (
                <li key={i}>
                  <span style={{ fontWeight: 600, color: v.type === 'pass' ? 'var(--color-trust-green)' : 'var(--color-risk-red)' }}>
                    [{v.type.toUpperCase()}]
                  </span> {v.message}
                </li>
              )) : <li>No validation data</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
