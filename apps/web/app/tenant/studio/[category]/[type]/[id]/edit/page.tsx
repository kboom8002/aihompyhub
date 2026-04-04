'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '../../../../../../components/PageHeader';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { RichTextEditor } from '../../../../../../../components/RichTextEditor';

export default function UniversalContentEditView() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const type = params.type as string;
  const id = params.id as string;

  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      title: "",
      generic_body: "",
      thumbnail: "",
      tags: ""
    }
  });

  const genericBodyValue = watch('generic_body');

  const VISUAL_TYPES = ['story', 'article', 'review', 'routine', 'compare', 'product'];
  const requireThumbnail = VISUAL_TYPES.includes(type);

  const formatTitle = (str: string) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/tenant/content?id=${id}`, { headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' } })
      .then(res => res.json())
      .then(payload => {
        if (payload?.data) {
           setValue('title', payload.data.title);
           if (payload.data.json_payload) {
               setValue('generic_body', payload.data.json_payload.body || '');
               setValue('thumbnail', payload.data.json_payload.thumbnail || '');
               setValue('tags', payload.data.json_payload.tags || '');
           }
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/v1/tenant/content?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': '00000000-0000-0000-0000-000000000001' },
        body: JSON.stringify({ 
           title: data.title, 
           json_payload: { body: data.generic_body, tags: data.tags, thumbnail: data.thumbnail }
        })
      });

      if (res.ok) {
         setSubmitStatus('성공적으로 수정되었습니다.');
         setTimeout(() => {
             router.push(`/tenant/studio/${category}/${type}`);
         }, 1000);
      } else {
         alert('저장 실패');
      }
    } catch {
      alert('네트워크 오류');
    }
  };

  if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center' }}>가져오는 중...</div>;

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
         <Link href={`/tenant/studio/${category}/${type}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            &larr; {formatTitle(type)} 목록으로 돌아가기
         </Link>
      </div>

      <PageHeader 
        title={`콘텐츠 수정 (Edit)`} 
        subtitle={`ID: ${id} 의 내용을 덮어씁니다.`} 
      />
      
      <div className="surface" style={{ maxWidth: '900px', marginBottom: '2rem' }}>
        
        {submitStatus && (
          <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', marginBottom: '1.5rem', borderRadius: '4px', fontWeight: 600 }}>
            {submitStatus}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>콘텐츠 제목 (Title)</label>
            <input 
              required
              type="text" 
              {...register('title')}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
            />
          </div>

          {requireThumbnail && (
            <div style={{ background: '#f8fafc', padding: '1.25rem', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: '#0f172a' }}>🖼️ 썸네일/커버 이미지 (Thumbnail Cover)</label>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>시각적 요소가 중요한 부문에서는 리스트 뷰 및 미리보기를 위해 필수로 등록해야 합니다.</p>
              <input 
                required
                type="url" 
                {...register('thumbnail')}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>콘텐츠 매거진 본문 (Rich Tiptap Body)</label>
            <RichTextEditor 
              value={genericBodyValue} 
              onChange={(val: string) => setValue('generic_body', val)} 
            />
          </div>

          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>태그 / 메타데이터</label>
            <input 
              type="text" 
              {...register('tags')}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="button-primary" style={{ alignSelf: 'flex-start', opacity: isSubmitting ? 0.7 : 1, padding: '0.75rem 1.5rem' }}>
            {isSubmitting ? '수정 중...' : '수정 사항 저장하기'}
          </button>
        </form>
      </div>
    </>
  );
}
