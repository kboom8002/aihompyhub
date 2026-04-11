'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '../../../../../../components/PageHeader';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { RichTextEditor } from '../../../../../../../components/RichTextEditor';
import { CONTENT_TYPE_SCHEMAS } from '../../../DynamicFormSchema';
import { ContentRelationMultiSelect } from '../../../../../../../components/ContentRelationMultiSelect';

export default function UniversalContentNewView() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const type = params.type as string;
  const tenantId = params.tenantId as string;

  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      title: "",
      thumbnail: "",
      tags: ""
      // dynamic fields will be populated organically
    }
  });

  const VISUAL_TYPES = ['story', 'article', 'review', 'routine', 'compare', 'product'];
  const requireThumbnail = VISUAL_TYPES.includes(type);

  const schema = CONTENT_TYPE_SCHEMAS[type] || CONTENT_TYPE_SCHEMAS.default;

  const formatTitle = (str: string) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const onSubmit = async (data: any) => {
    const { title, thumbnail, tags, ...dynamicFields } = data;

    // Filter out undefined and reconstruct
    // react-hook-form creates nested objects for dotted keys like `profileA.name`
    const json_payload = {
       tags: tags,
       thumbnail: thumbnail,
       ...dynamicFields
    };

    try {
      const res = await fetch('/api/v1/tenant/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
        body: JSON.stringify({ 
           category, 
           type, 
           title, 
           json_payload
        })
      });

      if (res.ok) {
         setSubmitStatus('성공적으로 저장되었습니다.');
         setTimeout(() => {
             router.push(`/tenant/${tenantId}/studio/${category}/${type}`);
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
         <Link href={`/tenant/${tenantId}/studio/${category}/${type}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            &larr; {formatTitle(type)} 목록으로 돌아가기
         </Link>
      </div>

      <PageHeader 
        title={`새 ${formatTitle(type)} 작성`} 
        subtitle={`유니버셜 Schema 폼을 통해 ${formatTitle(type)} 특화 메타데이터를 작성합니다.`} 
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
              <input 
                required
                type="url" 
                {...register('thumbnail')}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          {/* Dynamic Fields Mapping from Schema */}
          <div style={{ padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              <h3 style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '-0.5rem' }}>{formatTitle(type)} Data Fields</h3>
              {schema.map(field => {
                 return (
                    <div key={field.name} style={{ width: field.type === 'richtext' ? '100%' : 'calc(50% - 0.75rem)', minWidth: '300px' }}>
                      <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                         {field.label} {field.required && <span style={{color: 'red', marginLeft: '4px'}}>*</span>}
                      </label>
                      {field.helpText && <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>{field.helpText}</p>}
                      
                      {field.type === 'text' && (
                        <input 
                           type="text"
                           {...register(field.name as any, { required: field.required })}
                           placeholder={field.placeholder}
                           style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        />
                      )}
                      
                      {field.type === 'textarea' && (
                        <textarea 
                           {...register(field.name as any, { required: field.required })}
                           placeholder={field.placeholder}
                           style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', minHeight: '80px' }}
                        />
                      )}

                      {field.type === 'richtext' && (
                        // We must wrap RHF setValue inside the custom RichTextEditor onChange
                        <RichTextEditor 
                           value={watch(field.name as any) || ''} 
                           onChange={(val) => setValue(field.name as any, val)} 
                        />
                      )}

                      {field.type === 'relation' && (
                        <ContentRelationMultiSelect 
                           value={watch(field.name as any) || []} 
                           onChange={(val) => setValue(field.name as any, val)} 
                           tenantId={tenantId}
                           relationTarget={field.relationTarget || 'topic_hub'}
                        />
                      )}
                    </div>
                 );
              })}
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
