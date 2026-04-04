import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';

export default async function RuntimeConsolePage() {
  const res = await fetch('http://localhost:3000/api/v1/queries/runtime-health-snapshot', { cache: 'no-store', headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' } })
    .catch(() => null);
  const snapshot = res ? await res.json() : null;
  const data = snapshot?.data?.data;

  const isGlobalDegraded = data?.globalStatus !== 'healthy';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {isGlobalDegraded && (
        <div style={{ padding: '0.75rem', background: 'var(--color-risk-red)', color: 'white', textAlign: 'center', fontWeight: 600, borderRadius: '8px', marginBottom: '2rem' }}>
           DEGRADED STATE: One or more Generator/Publish lanes are congested or failing.
        </div>
      )}
      <PageHeader 
        title="Runtime Console" 
        subtitle="워커 큐(Lanes)의 상태와 Dead Letter Queue(DLQ)를 조회하는 Execution 모니터링 조종석." 
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', marginTop: '2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>Active Runtime Lanes</h3>
          
          {data?.lanes?.map((lane: any) => (
            <div key={lane.laneId} className="surface flex-col" style={{ borderLeft: `4px solid ${lane.status === 'healthy' ? 'var(--color-trust-green)' : 'var(--color-risk-red)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{lane.laneId}</span>
                <StatusBadge status={lane.status} />
              </div>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', fontSize: '0.875rem' }}>
                <div>
                  <div style={{ color: 'var(--color-secondary)' }}>Current Backlog</div>
                  <div style={{ fontWeight: 600, fontSize: '1.25rem', color: lane.currentBacklog > 100 ? 'var(--color-risk-red)' : 'var(--color-primary)' }}>{lane.currentBacklog} jobs</div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-secondary)' }}>Last Heartbeat</div>
                  <div style={{ fontWeight: 600 }}>{new Date(lane.lastHeartbeat).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="surface flex-col" style={{ background: '#fdfdfd' }}>
           <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-risk-red)' }}>DLQ Events (Dead Letters)</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {data?.recentDlqEvents?.map((dlq: any) => (
               <div key={dlq.eventId} style={{ padding: '1rem', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{dlq.laneId}</span>
                    <StatusBadge status={dlq.status} />
                 </div>
                 <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-primary)' }}><strong>Reason:</strong> {dlq.errorReason}</p>
                 <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button className="button-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', background: 'var(--color-trust-green)', border: 'none' }}>Requeue Job</button>
                    <button className="button-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', border: '1px solid var(--color-border)' }}>Drop</button>
                 </div>
               </div>
             ))}
             {(!data?.recentDlqEvents || data.recentDlqEvents.length === 0) && (
               <p style={{ textAlign: 'center', color: 'var(--color-secondary)', fontSize: '0.875rem', padding: '2rem 0' }}>No DLQ events detected.</p>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}
