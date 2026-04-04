import React from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { StatusBadge } from '../../../components/StatusBadge';

export default async function QuestionClustersPage() {
  const res = await fetch('http://localhost:3000/api/v1/queries/tenant-home-snapshot', { cache: 'no-store' })
    .catch(() => null);
  const snapshot = res ? await res.json() : null;
  const clusters = snapshot?.data?.priorityClusterGaps?.items || [];

  return (
    <>
      <PageHeader 
        title="질문 자산 (Clusters)" 
        subtitle="수집된 고객 질문 의도를 그룹핑하여 답변 적용 범위를 확인합니다."
      />
      <div className="surface">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 0' }}>클러스터 명</th>
              <th>의도 (Intent)</th>
              <th>우선순위 점수</th>
              <th>커버리지 상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
              {clusters.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>{c.cluster_name}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>{c.intent_type}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 'bold' }}>{c.priority_score}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                    <a href={`/tenant/objects/Topic/new?clusterId=${c.id}`} className="button-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>토픽 생성</a>
                  </td>
                </tr>
              ))}{clusters.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '2rem 0', textAlign: 'center' }}>데이터가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
