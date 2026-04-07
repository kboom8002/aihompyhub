'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaveBrandProfileSchema } from '@aihompyhub/database/validations';
import { PageHeader } from '../../../../components/PageHeader';
import { GeneratorAssistPanel } from '../../../../components/GeneratorAssistPanel';

export default function BrandFoundationStudio() {
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(SaveBrandProfileSchema),
    defaultValues: {
      brandId: '11111111-1111-1111-1111-111111111111', // Seed Mock
      positioningSummary: "Premium botanical anti-aging solutions targeting sensitive skin demographics.",
      brandVoice: "Professional yet empathetic"
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setSubmitStatus(null);
      const res = await fetch('/api/v1/commands/brand-foundation/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '00000000-0000-0000-0000-000000000001'
        },
        body: JSON.stringify(data)
      });
      
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message || 'Failed to save');
      
      setSubmitStatus('성공적으로 저장되었습니다.');
    } catch (e: any) {
      setSubmitStatus(`오류: ${e.message}`);
    }
  };

  return (
    <>
      <PageHeader title="Brand Foundation Studio" subtitle="AI가 정본을 작성할 때 최상위 제약으로 참고하는 브랜드 지침입니다." />
      <div className="surface" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        
        {submitStatus && (
          <div style={{ padding: '1rem', background: submitStatus.startsWith('오류') ? 'var(--color-risk-red-bg)' : 'var(--color-trust-green-bg)', marginBottom: '1.5rem', borderRadius: '4px' }}>
            {submitStatus}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Positioning Summary</label>
            <textarea 
              rows={3} 
              {...register('positioningSummary')}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
            />
            {errors.positioningSummary && <p style={{ color: 'var(--color-risk-red)', marginTop: '0.25rem', fontSize: '0.875rem' }}>{errors.positioningSummary.message as string}</p>}
          </div>

          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Brand Voice (Tone & Manner)</label>
            <input 
              type="text" 
              {...register('brandVoice')}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
            />
            {errors.brandVoice && <p style={{ color: 'var(--color-risk-red)', marginTop: '0.25rem', fontSize: '0.875rem' }}>{errors.brandVoice.message as string}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="button-primary" style={{ alignSelf: 'flex-start', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? '저장 중...' : '저장하기'}
          </button>
        </form>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <GeneratorAssistPanel targetFilter="BrandFoundation" onAccept={(data) => {
           if (data.positioningSummary) setValue('positioningSummary', data.positioningSummary);
           if (data.brandVoice) setValue('brandVoice', data.brandVoice);
           setSubmitStatus('Draft accepted. Please review and Save.');
        }} />
      </div>
    </>
  );
}
