import React from 'react';
import '../globals.css';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'risk' | 'trust';
  label?: string;
}

const statusMap: Record<string, { className: string; defaultLabel: string }> = {
  'draft': { className: 'status-neutral', defaultLabel: '초안' },
  'ready_for_review': { className: 'status-warning', defaultLabel: '검수 필요' },
  'approved': { className: 'status-success', defaultLabel: '검수 승인' },
  'published': { className: 'status-success', defaultLabel: '라이브' },
  'medium': { className: 'status-warning', defaultLabel: 'Medium Risk' },
  'high': { className: 'status-danger', defaultLabel: 'High Risk' },
  'trust_ok': { className: 'status-success', defaultLabel: '신뢰 완결' },
  'trust_gap': { className: 'status-danger', defaultLabel: '근거 부족' },
};

export function StatusBadge({ status, type = 'status', label }: StatusBadgeProps) {
  const mapping = statusMap[status] || { className: 'status-neutral', defaultLabel: status };
  const displayLabel = label || mapping.defaultLabel;

  return (
    <span className={`badge ${mapping.className}`}>
      {displayLabel}
    </span>
  );
}
