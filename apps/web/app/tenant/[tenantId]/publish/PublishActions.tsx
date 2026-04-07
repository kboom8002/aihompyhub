'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PublishActions({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [locale, setLocale] = useState('ko-KR');
  const [market, setMarket] = useState('Global');

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/v1/mutations/publish-bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
        body: JSON.stringify({ targetLocale: locale, targetMarket: market })
      });
      if (res.ok) {
        alert('소프트 배포 완료! Storefront 캐시가 새 데이터로 교체되었습니다.');
        router.refresh();
      } else {
        alert('배포 실패');
      }
    } catch {
      alert('네트워크 오류');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>다국어 대상 (Locale)</label>
        <select value={locale} onChange={e => setLocale(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', minWidth: '150px' }}>
          <option value="ko-KR">Korean (ko-KR)</option>
          <option value="en-US">English (en-US)</option>
          <option value="ja-JP">Japanese (ja-JP)</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>시장 (Market)</label>
        <select value={market} onChange={e => setMarket(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', minWidth: '150px' }}>
          <option value="Global">Global</option>
          <option value="US">United States</option>
          <option value="KR">South Korea</option>
        </select>
      </div>
      <button 
        onClick={handlePublish} 
        disabled={isPublishing}
        style={{ padding: '0.5rem 1.25rem', marginLeft: '0.5rem', background: isPublishing ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: isPublishing ? 'not-allowed' : 'pointer' }}
      >
        {isPublishing ? '🚀 배포 중...' : '🚀 새 배포 시도 (Soft Publish)'}
      </button>
    </div>
  );
}
