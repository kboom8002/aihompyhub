'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '../../../../../components/PageHeader';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { RichTextEditor } from '../../../../../../components/RichTextEditor';

export default function UniversalContentNewView() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const type = params.type as string;

  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      title: "",
      generic_body: "",
      thumbnail: "",
      tags: ""
    }
  });

  const genericBodyValue = watch('generic_body');
  
  // Decide if visual thumbnail is required by type
  const VISUAL_TYPES = ['story', 'article', 'review', 'routine', 'compare', 'product'];
  const requireThumbnail = VISUAL_TYPES.includes(type);

  const formatTitle = (str: string) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch('/api/v1/tenant/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': '00000000-0000-0000-0000-000000000001' },
        body: JSON.stringify({ 
           category, 
           type, 
           title: data.title, 
           json_payload: { body: data.generic_body, tags: data.tags, thumbnail: data.thumbnail }
        })
      });

      if (res.ok) {
         setSubmitStatus('성공적으로 저장되었습니다.');
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

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
         <Link href={`/tenant/studio/${category}/${type}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            &larr; {formatTitle(type)} 목록으로 돌아가기
         </Link>
      </div>

      <PageHeader 
        title={`새 ${formatTitle(type)} 작성`} 
        subtitle={`유니버셜 폼을 통해 ${formatTitle(category)} 계층의 콘텐츠를 SSoT로 추가합니다.`} 
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
              placeholder={`${formatTitle(type)}의 고유 제목을 입력하세요.`}
            />
          </div>

          {requireThumbnail && (
            <div style={{ background: '#f8fafc', padding: '1.25rem', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: '#0f172a' }}>🖼️ 썸네일/커버 이미지 (Thumbnail Cover)</label>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>시각적 요소가 중요한 스토리, 리뷰, 루틴 등에서는 필수 항목입니다.</p>
              <input 
                required
                type="url" 
                {...register('thumbnail')}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                placeholder="https://example.com/image.jpg (이미지 URL 주소를 복사해 넣으세요!)"
              />
            </div>
          )}

          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>콘텐츠 매거진 본문 (Rich Tiptap Body)</label>
            <RichTextEditor 
              value={genericBodyValue} 
              onChange={(val) => setValue('generic_body', val)} 
            />
          </div>

          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>태그 / 메타데이터 (,로 구분)</label>
            <input 
              type="text" 
              {...register('tags')}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
              placeholder="예: #민감성, #여름철"
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="button-primary" style={{ alignSelf: 'flex-start', opacity: isSubmitting ? 0.7 : 1, padding: '0.75rem 1.5rem' }}>
            {isSubmitting ? '저장 중...' : 'SSoT 보관함에 저장하기'}
          </button>
        </form>
      </div>
    </>
  );
}
