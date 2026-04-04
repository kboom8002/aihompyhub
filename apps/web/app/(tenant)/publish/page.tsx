import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';

export default async function PublishManagerPage() {
  const res = await fetch('http://localhost:3000/api/v1/queries/publish-bundle-snapshot', { cache: 'no-store', headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' } })
    .catch(() => null);
  const snapshot = res ? await res.json() : null;
  const bundles = snapshot?.data?.bundles || [];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader 
        title="Publish Bundles" 
        subtitle="생성완료 및 검증된 Canonical Object 들을 실제 외부 경로로 투영(Projection)하기 위한 패키지들입니다." 
      />
      <div className="surface" style={{ marginTop: '2rem' }}>
        <div style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontWeight: 600 }}>Total Bundles:</span> {snapshot?.data?.totalBundles || 0} |  
          <span style={{ marginLeft: '1rem', fontWeight: 600 }}>Health:</span> 
          <StatusBadge status={snapshot?.data?.healthStatus || 'degraded'} riskType="none" />
        </div>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-secondary)' }}>
              <th style={{ padding: '1rem 0' }}>Bundle ID (Target)</th>
              <th>Status</th>
              <th>Template Profile</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bundles.map((b: any) => (
              <tr key={b.bundleId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem 0', fontWeight: 500 }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginBottom: '0.25rem' }}>{b.bundleId}</div>
                  {b.targetLocale} / {b.targetMarket}
                </td>
                <td><StatusBadge status={b.status} riskType={b.status === 'failed' ? 'high' : 'none'} /></td>
                <td style={{ fontSize: '0.875rem' }}>{b.templateProfileId}</td>
                <td style={{ color: 'var(--color-secondary)', fontSize: '0.875rem' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="button-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', background: b.status === 'published' ? 'var(--color-secondary)' : undefined }}>
                    {b.status === 'published' ? 'Rollback' : 'Publish'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
