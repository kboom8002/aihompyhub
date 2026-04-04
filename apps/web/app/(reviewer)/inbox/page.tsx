import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';

export default async function ReviewInboxPage() {
  const res = await fetch('http://localhost:3000/api/v1/queries/reviewer-home-snapshot', { cache: 'no-store', headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' } })
    .catch(() => null);
  const snapshot = res ? await res.json() : null;
  const reviewTasks = snapshot?.data?.inbox || [];

  return (
    <>
      <PageHeader title="검수함 (Inbox)" subtitle="대기 중인 검수 항목들입니다." />
      <div className="surface">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 0' }}>객체 구분</th>
              <th>객체 명</th>
              <th>리스크 등급</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {reviewTasks.map((t: any) => (
              <tr key={t.reviewTaskId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem 0' }}>{t.targetRef.type}</td>
                <td style={{ fontWeight: 500 }}>{t.targetRef.title}</td>
                <td><StatusBadge status={t.severity} /></td>
                <td><StatusBadge status="ready_for_review" label={t.status} /></td>
                <td>
                  <a href={`/reviews/${t.reviewTaskId}`} className="button-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>검토하기</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
