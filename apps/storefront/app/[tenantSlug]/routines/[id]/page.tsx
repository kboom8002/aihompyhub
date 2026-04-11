import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '../../../../lib/supabase';
import { resolveTenantId } from '../../../../lib/tenant';

import { HeroQuestionBlock } from '../../../../components/store/HeroQuestionBlock';
import { RoutineStepCard } from '../../../../components/store/RoutineStepCard';
import { ProseReader } from '../../../../components/store/ProseReader';

export const revalidate = 60;

interface Props {
  params: Promise<{
    tenantSlug: string;
    id: string;
  }>;
}

export default async function RoutineDetailPage(props: Props) {
  const params = await props.params;
  const tenantId = await resolveTenantId(params.tenantSlug);
  
  if (!tenantId) return notFound();

  const { data: content, error } = await supabaseAdmin
    .from('universal_content_assets')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !content) return notFound();

  const payload = content.json_payload || {};
  const htmlBody = payload.body || '';

  // Demo fallback extraction for Routine Steps if missing in payload
  const mockSteps = [
    { stepNumber: 1, title: 'Step 1', timing: 'Start', instruction: 'Refer to the detailed guide below.' }
  ];
  const steps = payload.steps || mockSteps;

  return (
    <article className="container mx-auto py-8 text-[var(--theme-text)] px-4 md:px-0">
      <Link href={`/${params.tenantSlug}/routines`} className="text-sm border border-[var(--theme-border)] px-3 py-1 rounded-full mb-8 inline-block hover:bg-black/5 transition-colors">
        &larr; 루틴 목록
      </Link>
      
      <HeroQuestionBlock 
        category="공식 루틴 가이드"
        question={content.title}
        snippet="가장 완벽한 루틴을 제안합니다. SSoT 인증된 루틴 가이드를 확인하세요."
      />

      {payload.summary && (
         <div className="mt-10 p-6 bg-[var(--theme-border)]/20 rounded-xl border-l-4 border-black" itemProp="abstract">
            <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-2">루틴 요약 (How-to Summary)</h3>
            <p className="text-lg font-medium leading-relaxed">{payload.summary}</p>
         </div>
      )}

      <div className="mt-12 mb-16">
        <h3 className="font-bold text-lg mb-4 font-[family-name:var(--theme-font)]">Action Timeline</h3>
        <RoutineStepCard steps={steps} />
      </div>

      {htmlBody && (
        <div className="mt-12 pt-8 border-t border-[var(--theme-border)]">
          <ProseReader html={htmlBody} />
        </div>
      )}

      {payload.cautions && (
         <div className="mt-8 mb-8 p-6 bg-red-50 border border-red-100 rounded-xl text-red-800">
            <div className="flex items-center gap-2 mb-2 font-bold">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               루틴 주의사항
            </div>
            <p className="text-sm leading-relaxed opacity-90 whitespace-pre-wrap">{payload.cautions}</p>
         </div>
      )}

    </article>
  );
}
