import React from 'react';
import { headers } from 'next/headers';
import { CriticalStrip } from '../../../components/CriticalStrip';
import { PageHeader } from '../../../components/PageHeader';
import { StatusBadge } from '../../../components/StatusBadge';

export default async function TenantHomePage(props: { params: Promise<{ tenantId: string }> }) {
  const params = await props.params;
  const tenantId = params.tenantId;
  
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3002';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const cookieHeader = headersList.get('cookie') || '';

  let data: any = {};
  let tenantName = 'Lumiere Skincare';
  let realTenantId = tenantId;
  try {
     const { createClient } = require('../../../../lib/supabase/server');
     const supabase = await createClient();
     const { data: tenantRow } = await supabase.from('tenants').select('id, name').or(`id.eq.${tenantId},slug.eq.${tenantId}`).single();
     if (tenantRow) {
        tenantName = tenantRow.name;
        realTenantId = tenantRow.id;
     }

    const res = await fetch(`${baseUrl}/api/v1/queries/tenant-home-snapshot`, { 
        cache: 'no-store',
        headers: {
            'cookie': cookieHeader,
            'x-tenant-id': realTenantId
        }
    });
    if (res.ok) {
       const snapshot = await res.json();
       data = snapshot?.data || {};
    }
  } catch (e) {
      console.error('Failed to fetch snapshot:', e);
  }

  const criticalItems = [
    { label: '검수 필요', count: data.criticalStrip?.reviewPendingCount || 0, intent: 'warning' as const },
    { label: '배포 대기', count: data.criticalStrip?.publishReadyCount || 0, intent: 'neutral' as const },
    { label: '라이브 신뢰 이슈', count: data.criticalStrip?.liveTrustIssueCount || 0, intent: 'danger' as const }
  ];

  return (
    <>
      <CriticalStrip items={criticalItems} />
      <PageHeader 
        title="홈대시보드" 
        subtitle={`${tenantName}의 AI 홈페이지 현황입니다.`}
        actions={<button className="button-primary">새 배포 번들 생성</button>} 
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <section className="surface">
          <h3>Priority Cluster Gaps</h3>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
            {data.priorityClusterGaps?.items?.length > 0 ? (
              data.priorityClusterGaps.items.map((c: any) => (
                <li key={c.clusterId} style={{ marginBottom: '0.5rem' }}>
                  <a href={`/tenant/${tenantId}/questions/clusters`}>{c.clusterName}</a>
                  <span style={{ marginLeft: '1rem' }}>
                    <StatusBadge status="draft" label="Uncovered" />
                  </span>
                </li>
              ))
            ) : (
              <li>No priority gaps found.</li>
            )}
          </ul>
        </section>

        <section className="surface">
          <h3>Canonical Work Queue</h3>
          <p style={{ color: 'var(--color-secondary)' }}>No items in the work queue.</p>
        </section>
      </div>
    </>
  );
}
