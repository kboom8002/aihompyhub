'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const MOCK_ACCOUNTS = [
  { label: 'Super Admin (Lumiere)', email: 'super@lumiere.com', role: 'super_admin', tenantId: '00000000-0000-0000-0000-000000000001' },
  { label: 'Dr.Oracle Marketer (스킨케어)', email: 'marketer@dr-oracle.com', role: 'tenant_admin', tenantId: '00000000-0000-0000-0000-000000000001' },
  { label: 'Vegan Root Staff (헤어케어)', email: 'brand@vegan-root.com', role: 'tenant_admin', tenantId: '00000000-0000-0000-0000-000000000002' }
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedEmail, setSelectedEmail] = useState(MOCK_ACCOUNTS[0].email);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = () => {
    setIsLoggingIn(true);
    const account = MOCK_ACCOUNTS.find(a => a.email === selectedEmail);
    if (account) {
      // Set the session cookie via document.cookie
      const sessionData = { email: account.email, role: account.role, tenantId: account.tenantId };
      document.cookie = `aihompy_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=86400`; // 1 day
      
      setTimeout(() => {
        router.push(`/tenant/${account.tenantId}/home`);
      }, 800);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <div style={{ background: '#ffffff', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>AihompyHub <span style={{ color: '#ec4899' }}>OS</span></h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '2.5rem' }}>B2B 파트너 포털에 오신 것을 환영합니다</p>
        
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
           <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>개발자 전용 임시 로그인 (1-Click)</label>
           <select 
              value={selectedEmail} 
              onChange={e => setSelectedEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb', fontSize: '0.9rem', marginBottom: '1rem' }}
           >
              {MOCK_ACCOUNTS.map(a => (
                 <option key={a.email} value={a.email}>{a.label} - {a.email}</option>
              ))}
           </select>

           <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.75rem', color: '#1d4ed8', fontSize: '0.8rem' }}>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>RBAC 시뮬레이터</strong>
              선택한 계정의 <code>Role</code> 과 <code>TenantID</code>가 서버 미들웨어 및 UI 격리 검증에 즉시 반영됩니다.
           </div>
        </div>

        <button 
           onClick={handleLogin}
           disabled={isLoggingIn}
           style={{ width: '100%', padding: '0.875rem', background: '#111827', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: isLoggingIn ? 'wait' : 'pointer', letterSpacing: '0.025em', transition: 'all 0.2s' }}
        >
           {isLoggingIn ? '인증 및 접속 중...' : '시스템 입장'}
        </button>
        
        <div style={{ marginTop: '1.5rem' }}>
           <a href="/" style={{ color: '#9ca3af', fontSize: '0.8rem', textDecoration: 'none' }}>스토어프론트로 돌아가기</a>
        </div>
      </div>
    </div>
  );
}
