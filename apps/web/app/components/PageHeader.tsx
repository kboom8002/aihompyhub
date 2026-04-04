import React, { ReactNode } from 'react';
import '../globals.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, badges, actions }: PageHeaderProps) {
  return (
    <div className="above-the-fold flex-between">
      <div>
        <div className="flex-center" style={{ marginBottom: '0.5rem' }}>
          <h1>{title}</h1>
          {badges && <div className="flex-center">{badges}</div>}
        </div>
        {subtitle && <p style={{ color: 'var(--color-secondary)', margin: 0 }}>{subtitle}</p>}
      </div>
      <div>
        {actions}
      </div>
    </div>
  );
}
