'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function TenantSwitcher({ currentTenantId, userRole = 'tenant_admin' }: { currentTenantId: string, userRole?: string }) {
   const router = useRouter();
   const isSuperAdmin = userRole === 'super_admin';

   return (
       <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#f1f5f9', borderRadius: '6px' }}>
           <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
              현재 작업 중인 브랜드 {isSuperAdmin && <span style={{ color: '#ec4899', fontSize: '0.7rem', marginLeft: '4px' }}>(Super)</span>}
           </label>
           <select 
             style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '0.9rem', cursor: isSuperAdmin ? 'pointer' : 'not-allowed', outline: 'none', background: isSuperAdmin ? 'white' : '#e2e8f0', color: isSuperAdmin ? '#0f172a' : '#64748b' }}
             defaultValue={currentTenantId}
             disabled={!isSuperAdmin}
             onChange={(e) => {
                 const newId = e.target.value;
                 if (newId && newId !== currentTenantId) {
                     const currentPath = window.location.pathname;
                     const newPath = currentPath.replace(currentTenantId, newId);
                     router.push(newPath);
                 }
             }}
           >
              <option value="00000000-0000-0000-0000-000000000001">Dr.Oracle (스킨케어)</option>
              <option value="00000000-0000-0000-0000-000000000002">VEGAN ROOT (헤어케어)</option>
           </select>
        </div>
   );
}
