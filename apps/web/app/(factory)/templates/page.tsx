'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import Link from 'next/link';
import type { FactoryHomeSnapshotDTO } from '@aihompyhub/database/dto/factory';

export default function TemplatePromptRegistry() {
  const [data, setData] = useState<FactoryHomeSnapshotDTO['data'] | null>(null);

  useEffect(() => {
    // Reusing factory-home-snapshot's active rollouts to showcase Template impacts.
    fetch('/api/v1/queries/factory-home-snapshot', { headers: { 'x-tenant-id': 'SYSTEM', 'x-role': 'factory_admin' } })
      .then(res => res.json())
      .then(payload => setData(payload.data.data));
  }, []);

  if(!data) return <div style={{ padding: '2rem' }}>Loading Global Registries...</div>;

  return (
    <div>
      <PageHeader title="Template & Prompt Registry" subtitle="Global Operating Assets & Impact Radius" />

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
         <div style={{ flex: 1 }}>
            <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Active Global Rollouts</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Observe the propagation phase of updated Assets across the multi-tenant base.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
               {data.activeRollouts.map(r => (
                  <div key={r.id} className="surface" style={{ padding: '1.5rem', border: '1px solid var(--color-border)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{r.campaignName}</h4>
                        <span style={{ fontSize: '0.8rem', background: '#3b82f6', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{r.status.toUpperCase()}</span>
                     </div>
                     <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                        Type: {r.targetObjectType} <br />
                        Asset ID: {r.targetObjectId} <br />
                        Coverage: {r.progressPercentage}%
                     </div>
                     <div style={{ marginTop: '1rem' }}>
                        <Link href={`/factory/rollouts/${r.id}`} className="button-secondary" style={{ textDecoration: 'none' }}>View Impact & Control »</Link>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div style={{ flex: 1 }}>
             {/* Read-only Static Mocks indicating Registry structure */}
            <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Prompt Engine Dictionary</h3>
            <div className="surface" style={{ padding: '1rem', borderLeft: '3px solid var(--color-trust-green)', marginBottom: '1rem' }}>
               <div style={{ fontWeight: 600 }}>Brand Positioning Extractor (v1.0.0)</div>
               <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.3rem' }}>Domain: BrandFoundation | Active on 120/120 Tenants</div>
            </div>
            <div className="surface" style={{ padding: '1rem', borderLeft: '3px solid var(--color-risk-yellow)', marginBottom: '1rem' }}>
               <div style={{ fontWeight: 600 }}>Routine Flow Extractor (v1.0.0)</div>
               <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.3rem' }}>Domain: RoutineBuilder | Currently in Phased Canary (23% Coverage) | <span style={{ color: 'var(--color-risk-red)' }}>Regression Alert</span></div>
            </div>
         </div>
      </div>
    </div>
  );
}
