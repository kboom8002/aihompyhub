import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '../../../../lib/supabase';
import { resolveTenantId } from '../../../../lib/tenant';
import { CompareQuickDecision } from '../../../../components/store/CompareQuickDecision';
import { ProseReader } from '../../../../components/store/ProseReader';

export const revalidate = 60;

export default async function CompareDetailPage(props: { params: Promise<{ tenantSlug: string, id: string }> }) {
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
  
  // Create mock profiles if missing from the old seed data to demonstrate the UI
  const splitTitle = content.title.split(' vs ');
  const pA_Name = payload.profileA?.name || splitTitle[0] || '옵션 A';
  const pB_Name = payload.profileB?.name || splitTitle[1] || '옵션 B';

  const pA = payload.profileA || {
     name: pA_Name,
     targetFit: '해당 정보 없음',
     description: payload.summary || '상세 데이터가 누락되었습니다.'
  };

  const pB = payload.profileB || {
     name: pB_Name,
     targetFit: '해당 정보 없음',
     description: '상세 데이터가 누락되었습니다.'
  };

  return (
    <article className="container mx-auto py-8 text-[var(--theme-text)] px-4 md:px-0 max-w-5xl">
      <Link href={`/${params.tenantSlug}/compare`} className="text-sm font-medium border border-[var(--theme-border)] px-4 py-2 rounded-full mb-8 inline-block hover:bg-black/5 transition-colors">
        &larr; 비교 목록으로
      </Link>
      
      <div className="mb-12">
        <span className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 block">A/B COMPARE</span>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight font-[family-name:var(--theme-font)] mb-4">{content.title}</h1>
      </div>

      <CompareQuickDecision profileA={pA} profileB={pB} />

      {payload.body && (
        <div className="mt-16 pt-8 border-t border-[var(--theme-border)] max-w-3xl mx-auto">
          <ProseReader html={payload.body} />
        </div>
      )}
    </article>
  );
}