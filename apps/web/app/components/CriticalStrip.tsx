import React from 'react';
import '../globals.css';

interface CriticalStripProps {
  items: Array<{
    label: string;
    count: number;
    intent?: 'danger' | 'warning' | 'neutral';
  }>;
}

export function CriticalStrip({ items }: CriticalStripProps) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '1rem 2rem', backgroundColor: '#111827', color: 'white' }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ 
            color: item.intent === 'danger' ? 'var(--color-risk-red)' : 
                   item.intent === 'warning' ? 'var(--color-warning-yellow)' : '#9CA3AF',
            fontWeight: 700 
          }}>
            {item.count}
          </span>
          <span style={{ fontSize: '0.875rem' }}>{item.label}</span>
          {idx < items.length - 1 && <span style={{ marginLeft: '1rem', color: '#4B5563' }}>|</span>}
        </div>
      ))}
    </div>
  );
}
