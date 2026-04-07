'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '../../../../components/PageHeader';
import { GeneratorAssistPanel } from '../../../../components/GeneratorAssistPanel';

export default function ContentTrustStudio() {
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: {
      questionTitle: "Is retinol safe for sensitive skin?",
      answerBody: "",
      supportingClaims: ""
    }
  });

  const onSubmit = async (data: any) => {
    // Stub save logic
    setSubmitStatus('성공적으로 저장되었습니다. Workflow로 이관됩니다.');
  };

  return (
    <>
      <PageHeader title="Content & Trust Studio" subtitle="Answer, Routine 등 핵심 지식 자산을 Trust 규칙에 맞게 편찬합니다." />
      
      <div className="surface" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        
        {submitStatus && (
          <div style={{ padding: '1rem', background: 'var(--color-trust-green-bg)', marginBottom: '1.5rem', borderRadius: '4px' }}>
            {submitStatus}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Question Target</label>
            <input 
              disabled
              type="text" 
              {...register('questionTitle')}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-bg-secondary)' }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Answer Body</label>
            <textarea 
              rows={5} 
              {...register('answerBody')}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Supporting Claims</label>
            <input 
              type="text" 
              {...register('supportingClaims')}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
              placeholder="Comma-separated claims"
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="button-primary" style={{ alignSelf: 'flex-start', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? '진행 중...' : 'Save Canonical Draft'}
          </button>
        </form>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <GeneratorAssistPanel targetFilter="AnswerCard" onAccept={(data) => {
           if (data.answerBody) setValue('answerBody', data.answerBody);
           if (data.supportingClaims) setValue('supportingClaims', Array.isArray(data.supportingClaims) ? data.supportingClaims.join(', ') : data.supportingClaims);
           setSubmitStatus('Draft accepted from Generator. Please verify Placeholders and Save.');
        }} />
      </div>
    </>
  );
}
