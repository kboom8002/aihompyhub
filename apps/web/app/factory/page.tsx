import React from 'react';
import { createClient } from '../../lib/supabase/server';
import { approveUserAction } from './actions';
import Link from 'next/link';

export default async function FactoryDashboardPage() {
  const supabaseAuth = await createClient(); // For auth only

  // Validate we are Super Admin (Double Check)
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return <div>Access Denied</div>;

  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await supabaseAdmin.from('user_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') return <div>Unauthorized: Super Admin Only</div>;

  // Fetch pending users
  // Note: RLS allows Super Admin to view all user_profiles, but we bypass RLS due to Postgres infinite recursion bug
  const { data: allUsers } = await supabaseAdmin.from('user_profiles').select('*').order('created_at', { ascending: false });

  // Fetch available tenants to assign
  const { data: tenants } = await supabaseAdmin.from('tenants').select('id, name, slug, status, industry_type').order('created_at', { ascending: true });

  const pendingUsers = allUsers?.filter((u: any) => u.role === 'pending_admin') || [];
  const activeUsers = allUsers?.filter((u: any) => u.role !== 'pending_admin') || [];

  return (
    <div style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
         <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Factory OS Control Room</h1>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>B2B 파트너(Tenant) 승인 및 권한 관리 시스템입니다.</p>
         </div>
         <form action="/login" method="GET">
            <button style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>아웃</button>
         </form>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>가입 승인 대기열 ({pendingUsers.length}명)</h2>
        
        {pendingUsers.length === 0 ? (
           <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>새로운 가입 대기자가 없습니다.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>가입 계정 (이메일)</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>가입 일자</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>상태</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u: any) => (
                <tr key={u.id}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>{u.email}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Pending</span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                    <form action={approveUserAction as any} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <input type="hidden" name="user_id" value={u.id} />
                      <select name="tenant_id" required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', background: '#f9fafb' }}>
                        <option value="">-- 할당할 테넌트 선택 --</option>
                        {tenants?.map((t: any) => (
                           <option key={t.id} value={t.id}>
                             [{t.industry_type || 'skincare'}] {t.name} (/{t.slug || 'no-slug'})
                           </option>
                        ))}
                      </select>
                      <button style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                        승인 및 할당
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginTop: '2rem' }}>
         <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>활성 유저 및 어드민 ({activeUsers.length}명)</h2>
         <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>계정 (이메일)</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>권한 (Role)</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>할당 테넌트 ID</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((u: any) => (
                <tr key={u.id}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>{u.email}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                     <span style={{ 
                        background: u.role === 'super_admin' ? '#fce7f3' : '#dcfce7', 
                        color: u.role === 'super_admin' ? '#be185d' : '#166534', 
                        padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 
                     }}>
                        {u.role}
                     </span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.8rem' }}>{u.tenant_id || 'System Defaults'}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
