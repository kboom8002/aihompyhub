import React from 'react';
import { headers } from 'next/headers';
import { PageHeader } from '../../../components/PageHeader';
import { StatusBadge } from '../../../components/StatusBadge';
import { PublishActions } from './PublishActions';

export default async function PublishManagerPage(props: { params: Promise<{ tenantId: string }> }) {
  const params = await props.params;
  const tenantId = params.tenantId;

  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3002';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const cookieHeader = headersList.get('cookie') || '';

  let snapshot = null;
  try {
    const res = await fetch(`${baseUrl}/api/v1/queries/publish-bundle-snapshot`, { 
      cache: 'no-store', 
      headers: { 'x-tenant-id': tenantId, 'cookie': cookieHeader } 
    });
    if (res.ok) snapshot = await res.json();
  } catch (e) {
    console.error(e);
  }
  
  const bundles = snapshot?.data?.bundles || [];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader 
        title="Publish Bundles" 
        subtitle="생성완료 및 검증된 Canonical Object 들을 실제 외부 경로로 투영(Projection)하기 위한 패키지들입니다." 
      />
      <div className="surface" style={{ marginTop: '2rem' }}>
        
        <PublishActions tenantId={tenantId} />

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
