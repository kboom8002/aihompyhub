import React from 'react';
import { PageHeader } from '../../../../../components/PageHeader';
import { StatusBadge } from '../../../../../components/StatusBadge';

export default async function ObjectWorkspacePage({ params }: { params: { objectType: string; id: string } }) {
  const { objectType, id } = params;

  // Retrieve the snapshot combining Canonical Data, Projection, Search and Geo
  const res = await fetch(`http://localhost:3000/api/v1/queries/object-detail-snapshot?type=${objectType}&id=${id}`, {
    cache: 'no-store',
    headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' }
  }).catch(() => null);

  const snapshot = res ? await res.json() : null;
  const data = snapshot?.data;

  // Note: Seed id '12345678-1234-1234-1234-123456789012' forces EU GEO exclusion in repo mock

  return (
    <>
      <PageHeader 
        title={`${objectType} [${id}]`}
        subtitle="Canonical Truth Object Workspace. 투영된 외부 상태를 함께 모니터링합니다."
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }}>
        
        {/* Main Editor Surface */}
        <section className="surface" style={{ minHeight: '60vh' }}>
          <h3>Editor & Canonical Detail</h3>
          <p style={{ marginTop: '1rem', color: 'var(--color-secondary)' }}>
            원본 (Source of Truth) 구조. 이 데이터는 어떤 외부 표현(투영된 라우트, 스냅샷)과도 분리된 순수 의미 그래프 구조입니다.
          </p>
          <pre style={{ marginTop: '2rem', padding: '1rem', background: '#f4f4f4', borderRadius: '4px', overflowX: 'auto' }}>
            {data ? JSON.stringify(data.canonicalData, null, 2) : 'Loading canonical data...'}
          </pre>
        </section>

        {/* Visibility & Projection Panel */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="surface flex-col">
             <h4 style={{ margin: 0 }}>Publish Projection</h4>
             <div style={{ marginTop: '1rem' }}>
               <StatusBadge status={data?.projectionStatus || 'not_published'} riskType="none" />
             </div>
             <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--color-secondary)' }}>이 객체가 현재 패키징되어 외부 정적 사이트/라우트로 송출되었는지 여부입니다.</p>
          </div>

          <div className="surface flex-col">
             <h4 style={{ margin: 0 }}>Search Index Sync</h4>
             <div style={{ marginTop: '1rem' }}>
               <StatusBadge status={data?.searchStatus || 'pending'} riskType={data?.searchStatus === 'failed' ? 'high' : 'none'} />
             </div>
             <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--color-secondary)' }}>Algolia 등 검색 큐 동기화 상태.</p>
          </div>

          <div className="surface flex-col">
             <h4 style={{ margin: 0 }}>GEO Boundaries</h4>
             {data?.geoExclusions?.length > 0 ? (
               <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                 {data.geoExclusions.map((geo: string) => (
                   <span key={geo} style={{ padding: '0.25rem 0.5rem', background: 'var(--color-risk-red)', color: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                     Blocked: {geo}
                   </span>
                 ))}
               </div>
             ) : (
                <p style={{ fontSize: '0.875rem', marginTop: '1rem', color: 'var(--color-trust-green)' }}>Global 배포 권한 통과됨</p>
             )}
          </div>

        </aside>

      </div>
    </>
  );
}
