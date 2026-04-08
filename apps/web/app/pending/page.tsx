import React from 'react';
import Link from 'next/link';

export default function PendingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <div style={{ background: '#ffffff', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', width: '100%', maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0 }}>계정 승인 대기중</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', marginTop: '1rem', marginBottom: '2rem', lineHeight: 1.5 }}>
          현재 파트너 가입 요청이 접수되어 <strong>심사 상태</strong>(pending)에 있습니다. <br/>
          슈퍼관리자의 승인이 완료되어 권한이 활성화되면<br/>테넌트 스튜디오에 접근하실 수 있습니다.
        </p>

        <div style={{ background: '#fef3c7', color: '#92400e', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '2rem', textAlign: 'left' }}>
          <strong>진행 상황 확인:</strong> 주기적으로 시스템에 로그인하여 상태를 확인하시거나, 담당자에게 문의 바랍니다.
        </div>
        
        <Link 
           href="/login"
           style={{ display: 'inline-block', width: '100%', padding: '0.875rem', background: '#111827', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, textDecoration: 'none' }}
        >
           다시 로그인하기
        </Link>
      </div>
    </div>
  );
}
