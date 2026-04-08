import { login, signup } from './actions';

export default function LoginPage(props: { searchParams: { message?: string } }) {
  const message = props.searchParams?.message;
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <div style={{ background: '#ffffff', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>AihompyHub <span style={{ color: '#ec4899' }}>OS</span></h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>B2B 파트너 포털에 오신 것을 환영합니다</p>
        
        {message && (
           <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
             {message}
           </div>
        )}
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
           <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>이메일</label>
              <input id="email" name="email" type="email" required placeholder="admin@domain.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }} />
           </div>
           
           <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>비밀번호</label>
              <input id="password" name="password" type="password" required placeholder="••••••••" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }} />
           </div>

           <div style={{ display: 'flex', gap: '0.5rem' }}>
             <button formAction={login} style={{ flex: 1, padding: '0.875rem', background: '#111827', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                로그인
             </button>
             <button formAction={signup} style={{ flex: 1, padding: '0.875rem', background: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                파트너 가입 신청
             </button>
           </div>
        </form>
        
        <div style={{ marginTop: '1.5rem' }}>
           <a href="/" style={{ color: '#9ca3af', fontSize: '0.8rem', textDecoration: 'none' }}>스토어프론트로 돌아가기</a>
        </div>
      </div>
    </div>
  );
}
