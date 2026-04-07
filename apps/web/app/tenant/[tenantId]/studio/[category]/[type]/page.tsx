'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '../../../../../components/PageHeader';
import Link from 'next/link';

export default function UniversalContentListView() {
  const params = useParams();
  const category = params.category as string;
  const type = params.type as string;
  const tenantId = params.tenantId as string;

  const [contents, setContents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Formatting helpers
  const formatTitle = (str: string) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const loadContents = () => {
    fetch(`/api/v1/tenant/content?category=${category}&type=${type}`, { headers: { 'x-tenant-id': tenantId } })
      .then(res => res.json())
      .then(payload => {
        if (payload?.data) {
           setContents(payload.data);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    if (category && type) loadContents();
  }, [category, type]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('항목을 정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/v1/tenant/content?id=${id}`, { method: 'DELETE', headers: { 'x-tenant-id': tenantId } });
      if (res.ok) {
         loadContents();
      }
    } catch {
      alert('네트워크 오류');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      let items = [];
      try {
        items = JSON.parse(text);
      } catch (e) {
        alert('올바른 JSON 파일 형태가 아닙니다. 배열 형태여야 합니다.');
        return;
      }

      if (!Array.isArray(items)) {
         alert('JSON 내용은 배열 형태의 객체여야 합니다. [ {title, body, tags} ]');
         return;
      }

      const res = await fetch('/api/v1/mutations/import-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
        body: JSON.stringify({ category, type, items })
      });

      if (res.ok) {
        alert(`데이터 임포트 완료! 기존 항목들은 제목(Title) 기준으로 덮어씌워졌습니다.`);
        loadContents();
      } else {
        alert('임포트 실패');
      }
    } catch {
      alert('네트워크 오류');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageHeader 
          title={`${formatTitle(type)} 목록`} 
          subtitle={`${formatTitle(category)} 층위의 ${formatTitle(type)} 데이터를 조회하고 관리합니다.`}
        />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
          <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={isImporting}
             style={{ padding: '0.6rem 1.2rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: isImporting ? 'wait' : 'pointer', fontWeight: 600 }}
          >
            {isImporting ? '⏳ 업로드 중...' : '📤 대량 Import (.json)'}
          </button>
          <Link 
             href={`/tenant/${tenantId}/studio/${category}/${type}/new`}
             style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}
          >
            + 새 항목 작성
          </Link>
        </div>
      </div>

      <div className="surface" style={{ marginTop: '1rem' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 0', width: '50%' }}>제목 (Title)</th>
              <th>상태</th>
              <th>데이터 미리보기 (Payload)</th>
              <th>작성일</th>
              <th style={{ textAlign: 'right' }}>액션</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr><td colSpan={5} style={{ padding: '2rem 0', textAlign: 'center' }}>데이터를 불러오는 중입니다...</td></tr>
            ) : contents.length === 0 ? (
               <tr><td colSpan={5} style={{ padding: '2rem 0', textAlign: 'center', color: '#6b7280' }}>등록된 항목이 없습니다. 우측 버튼을 눌러 새로 만드세요.</td></tr>
            ) : (
              contents.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ padding: '1.25rem 0', borderBottom: '1px solid #e5e7eb', fontWeight: 500, color: '#111827' }}>
                    {c.title}
                  </td>
                  <td style={{ padding: '1.25rem 0', borderBottom: '1px solid #e5e7eb' }}>
                     <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{c.status.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '1.25rem 0', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                     {JSON.stringify(c.json_payload)}
                  </td>
                  <td style={{ padding: '1.25rem 0', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.85rem' }}>
                     {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1.25rem 0', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <Link href={`/tenant/${tenantId}/studio/${category}/${type}/${c.id}/edit`} title="수정" style={{ padding: '0.35rem', background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </Link>
                      <button onClick={() => handleDelete(c.id)} title="삭제" style={{ padding: '0.35rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
