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
  let analyticsStats = {
    totalEvents: 0,
    topSources: [] as any[],
    topFaqs: [] as any[]
  };
  let tenantName = 'Lumiere Skincare';
  let realTenantId = tenantId;
  try {
     const { createClient } = require('../../../../lib/supabase/server');
     const supabase = await createClient();
     const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId);
     const { data: tenantRow } = await supabase.from('tenants').select('id, name').eq(isUuid ? 'id' : 'slug', tenantId).single();
     if (tenantRow) {
        tenantName = tenantRow.name;
        realTenantId = tenantRow.id;
     }

     // 1. Fetch Analytics data (Server Action approach inside RSC)
     try {
       // Just attempting raw counts since we don't have robust GROUP BY in Postgrest easily without RPC, 
       // but we can fetch recent records and aggregate in JS for now as a PoC.
       const { data: recentEvents } = await supabase
         .from('tenant_analytics_events')
         .select('*')
         .eq('tenant_id', realTenantId)
         .order('created_at', { ascending: false })
         .limit(100);

       if (recentEvents) {
         analyticsStats.totalEvents = recentEvents.length;
         
         const sourceCount: Record<string, number> = {};
         const faqCount: Record<string, number> = {};

         recentEvents.forEach((ev: any) => {
           // Aggregate sources
           const src = ev.attribution?.utm_source || 'organic';
           sourceCount[src] = (sourceCount[src] || 0) + 1;

           // Aggregate FAQ clicks
           if (ev.event_name === 'click_answer_card' && ev.payload?.answer_id) {
             const ansId = ev.payload.answer_id;
             faqCount[ansId] = (faqCount[ansId] || 0) + 1;
           }
         });

         analyticsStats.topSources = Object.entries(sourceCount).sort((a,b) => b[1] - a[1]).slice(0, 3);
         analyticsStats.topFaqs = Object.entries(faqCount).sort((a,b) => b[1] - a[1]).slice(0, 3);
       }
     } catch (err) {
        console.warn('Analytics query failed (DB might be migrating):', err);
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
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <section className="surface">
          <h3>🚀 트래픽 유입 컨텍스트 ({analyticsStats.totalEvents}건의 최근 이벤트)</h3>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
             {analyticsStats.topSources.length > 0 ? analyticsStats.topSources.map((srcInfo, i) => (
                <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--color-secondary)' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>[{srcInfo[0]}]</span> 유입 비중: {srcInfo[1]} 히트
                </li>
             )) : (
                <li style={{ color: 'var(--color-secondary)' }}>아직 수집된 유입(Attribution) 데이터가 부족합니다.</li>
             )}
          </ul>
        </section>

        <section className="surface">
          <h3>💡 구매 전환된 FAQ 클러스터</h3>
          <p style={{ color: 'var(--color-secondary)', marginTop: '0.5rem' }}>어떤 답변 카드가 고객의 불안감을 종식시켰는지 (expand_faq 히트수):</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
             {analyticsStats.topFaqs.length > 0 ? analyticsStats.topFaqs.map((faqInfo, i) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>
                   답변 문서 ID: <a href={`/tenant/${tenantId}/answers/${faqInfo[0]}`}>{faqInfo[0]}</a> <span style={{ marginLeft: '1rem' }}><StatusBadge status="published" label={`${faqInfo[1]} Views`} /></span>
                </li>
             )) : (
                <li style={{ color: 'var(--color-secondary)' }}>아직 확장된 답변 카드가 없습니다.</li>
             )}
          </ul>
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
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
          <h3>💰 크리에이터/오퍼 수익 랭킹</h3>
          <p style={{ color: 'var(--color-secondary)', marginTop: '0.5rem' }}>이번 주 가장 높은 전환을 일으킨 파트너:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
             <li style={{ marginBottom: '0.5rem' }}>상세 리포트 준비 중... (공동구매 거래 데이터 결합 예정)</li>
          </ul>
        </section>
      </div>
    </>
  );
}
