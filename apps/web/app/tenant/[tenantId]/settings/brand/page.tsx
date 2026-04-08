'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../../components/PageHeader';
import { updateTenantIdentity } from './actions';

export default function BrandSettingsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const [tenantId, setTenantId] = useState<string>('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    params.then(p => {
       setTenantId(p.tenantId);
       // Load initial data
       fetch(`/api/v1/factory/tenants`)
         .then(res => res.json())
         .then(payload => {
            if (payload?.data?.healthSummaries) {
               const tenant = payload.data.healthSummaries.find((t: any) => t.tenantId === p.tenantId);
               if (tenant) {
                  setName(tenant.tenantName || '');
                  setSlug(tenant.slug || '');
               }
            }
         });
    });
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('tenantId', tenantId);
    formData.append('name', name);
    formData.append('slug', slug);

    try {
      const res = await updateTenantIdentity(formData);
      if (res.error) {
        setMessage({ text: res.error, type: 'error' });
      } else {
        setMessage({ text: '성공적으로 저장되었습니다.', type: 'success' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Brand Settings" subtitle="테넌트 기초 정보 및 URL 연결 주소(Slug) 관리" />

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '2rem' }}>
        {message && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px', background: message.type === 'error' ? '#fef2f2' : '#dcfce7', color: message.type === 'error' ? '#991b1b' : '#166534', fontWeight: 600 }}>
            {message.text}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>상호 / 브랜드명 (Tenant Name)</label>
          <input 
             type="text" 
             value={name}
             onChange={e => setName(e.target.value)}
             required
             style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>관리자 포털 식별용 및 메인 프로필에 사용되는 공식 브랜드 명칭입니다.</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>URL 접속 식별자 (Slug)</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ padding: '0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRight: 'none', borderRadius: '4px 0 0 4px', color: '#64748b' }}>
               aihompyhub.com/
            </span>
            <input 
               type="text" 
               value={slug}
               onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
               required
               style={{ flex: 1, padding: '0.75rem', borderRadius: '0 4px 4px 0', border: '1px solid #cbd5e1' }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>소비자용 프론트엔드 접속 주소입니다. 영문 소문자, 숫자, 하이픈(-)만 가능합니다.</p>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          style={{ width: '100%', padding: '0.875rem', background: '#111827', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer' }}
        >
          {isSaving ? '저장 중...' : '저장 및 변경'}
        </button>
      </form>
    </div>
  );
}
