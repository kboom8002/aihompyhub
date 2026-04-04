import React from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { StatusBadge } from '../../../components/StatusBadge';
import { DecisionPanel } from './DecisionPanel';

export default function ReviewWorkspacePage({ params }: { params: { reviewTaskId: string } }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: '2rem', alignItems: 'start' }}>
      
      {/* Target Content Panel */}
      <section>
        <PageHeader 
          title="작업 공간 (Review Workspace)"
          subtitle="Topic: Gentle Anti-aging Routine (Lumiere)"
          badges={<StatusBadge status="warning" label="검수 대기" />}
        />
        <div className="surface" style={{ marginTop: '1rem', minHeight: '500px' }}>
          <p style={{ color: 'var(--color-secondary)' }}>원본 콘텐츠 (Answer Card Body 등)가 여기에 렌더링됩니다.</p>
          <hr style={{ margin: '2rem 0', borderColor: 'var(--color-border)' }} />
          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '4px' }}>
            <p><strong>Structured Body:</strong></p>
            <p>Our revitalizing serum is clinically designed to minimize irritation.</p>
          </div>
        </div>
      </section>

      {/* Trust & Boundary Panel */}
      <section style={{ position: 'sticky', top: '2rem' }}>
        <DecisionPanel reviewTaskId={params.reviewTaskId} />
      </section>
      
    </div>
  );
}
