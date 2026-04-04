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

      <div className="mt-12 mb-16">
        <h3 className="font-bold text-lg mb-4 font-[family-name:var(--theme-font)]">Action Timeline</h3>
        <RoutineStepCard steps={steps} />
      </div>

      {htmlBody && (
        <div className="mt-12 pt-8 border-t border-[var(--theme-border)]">
          <ProseReader html={htmlBody} />
        </div>
      )}

    </article>
  );
}
