'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { RichTextEditor } from '../../../../../../../../components/RichTextEditor';
import { CONTENT_TYPE_SCHEMAS } from '../../../../DynamicFormSchema';
import { ContentRelationMultiSelect } from '../../../../../../../../components/ContentRelationMultiSelect';
import { generateAiPairDraftAction } from '../../../../../../../actions/ai-pair-actions';
import { Wand2 } from 'lucide-react';

export default function UniversalContentEditView() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const type = params.type as string;
  const id = params.id as string;
  const tenantId = params.tenantId as string;

  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      title: "",
      thumbnail: "",
      tags: ""
    }
  });

  const VISUAL_TYPES = ['story', 'article', 'review', 'routine', 'compare', 'product'];
  const requireThumbnail = VISUAL_TYPES.includes(type);

  const schema = CONTENT_TYPE_SCHEMAS[type] || CONTENT_TYPE_SCHEMAS.default;

  const formatTitle = (str: string) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/tenant/content?id=${id}`, { headers: { 'x-tenant-id': tenantId } })
      .then(res => res.json())
      .then(payload => {
        if (payload?.data) {
           setValue('title', payload.data.title);
           if (payload.data.json_payload) {
               // Map schema dynamic fields from json_payload safely using dot notation
               schema.forEach(field => {
                   const value = field.name.split('.').reduce((acc: any, part: string) => acc && acc[part], payload.data.json_payload);
                   if (value !== undefined) setValue(field.name as any, value);
               });
               setValue('thumbnail', payload.data.json_payload.thumbnail || '');
               setValue('tags', payload.data.json_payload.tags || '');
           }
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id, setValue, schema]);

  const handleAIPairGenerate = async () => {
     setIsAiGenerating(true);
     const promptKey = type === 'article' ? 'article_generation' : 'aeo_answer_generation';
     const res = await generateAiPairDraftAction(tenantId, id, promptKey);
     if (res.success && res.result) {
         // Identify which field is the richtext body. In most schemas it's 'body'
         setValue('body' as any, res.result);
         alert('AI 최적화 초안이 성공적으로 작성되었습니다. 내용을 데스킹(수정)한 후 저장해주세요.');
     } else {
         alert('AI 생성 실패: ' + res.error);
     }
     setIsAiGenerating(false);
  };

  const onSubmit = async (data: any) => {
    const { title, thumbnail, tags, ...dynamicFields } = data;
    
    const json_payload = {
       tags: tags,
       thumbnail: thumbnail,
       ...dynamicFields
    };

    try {
      const res = await fetch(`/api/v1/tenant/content?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
        body: JSON.stringify({ 
           title, 
           json_payload
        })
      });

      if (res.ok) {
         setSubmitStatus('성공적으로 수정되었습니다.');
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

  if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center' }}>가져오는 중...</div>;

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
         <Link href={`/tenant/${tenantId}/studio/${category}/${type}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            &larr; {formatTitle(type)} 목록으로 돌아가기
         </Link>
      </div>

      <PageHeader 
        title={`콘텐츠 수정 (Edit)`} 
        subtitle={`ID: ${id} 의 내용을 동적 스키마 폼으로 덮어씁니다.`} 
      />
      
      <div className="surface" style={{ maxWidth: '900px', marginBottom: '2rem' }}>
        
        {submitStatus && (
          <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', marginBottom: '1.5rem', borderRadius: '4px', fontWeight: 600 }}>
            {submitStatus}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {(type === 'answer' || type === 'article') && (
              <div style={{ padding: '1.5rem', background: 'linear-gradient(to right, #ec4899, #8b5cf6)', borderRadius: '8px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>✨ AI-Pair: 지식 그래프 기반 초안 작성</h4>
                      <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '0.85rem', opacity: 0.9 }}>QIS 인텐트와 기본 지식을 참고하여 AEO 최적화 구조를 에디터에 자동 스케치합니다.</p>
                  </div>
                  <button 
                      type="button" 
                      onClick={handleAIPairGenerate} 
                      disabled={isAiGenerating}
                      style={{ background: 'white', color: '#ec4899', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                      <Wand2 size={18} />
                      {isAiGenerating ? '생성 중...' : '지금 바로 초안 작성 (E-to-E)'}
                  </button>
              </div>
          )}

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
