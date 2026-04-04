import React from 'react';
import { PageHeader } from '../../components/PageHeader';

export default function ReviewerHomePage() {
  return (
    <>
      <PageHeader 
        title="검수 홈" 
        subtitle="우선 처리해야 할 고위험 검수 건과 라이브 신뢰 리스크를 확인합니다." 
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <section className="surface">
          <h3>High Risk Queue (Inbox)</h3>
          <p style={{ marginTop: '1rem', color: 'var(--color-secondary)' }}>
            <a href="/inbox" className="button-primary">검수함 가기</a>
          </p>
        </section>
        <section className="surface">
          <h3>Live Trust Risk</h3>
          <p style={{ marginTop: '1rem', color: 'var(--color-secondary)' }}>No live critical risks found.</p>
        </section>
      </div>
    </>
  );
}
