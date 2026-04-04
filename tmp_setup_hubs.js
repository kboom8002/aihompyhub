const fs = require('fs');
const path = require('path');

const HUBS = ['solutions', 'compare', 'media', 'trust', 'products'];

HUBS.forEach(hub => {
  const dirPath = path.join('apps', 'storefront', 'app', '[tenantSlug]', hub, '[id]');
  fs.mkdirSync(dirPath, { recursive: true });

  const detailCode = `import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '../../../../../lib/supabase';
import { resolveTenantId } from '../../../../../lib/tenant';
import { HeroQuestionBlock } from '../../../../../components/store/HeroQuestionBlock';
import { ProseReader } from '../../../../../components/store/ProseReader';
import { TrustStrip } from '../../../../../components/store/TrustStrip';
${hub === 'compare' ? "import { CompareQuickDecision } from '../../../../../components/store/CompareQuickDecision';" : ''}

export const revalidate = 60;

export default async function ${hub.charAt(0).toUpperCase() + hub.slice(1)}DetailPage(props: { params: Promise<{ tenantSlug: string, id: string }> }) {
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
  
  return (
    <article className="container mx-auto py-8 text-[var(--theme-text)] px-4 md:px-0">
      <Link href={\`/\${params.tenantSlug}/${hub}\`} className="text-sm border border-[var(--theme-border)] px-3 py-1 rounded-full mb-8 inline-block hover:bg-black/5 transition-colors">
        &larr; 돌아가기
      </Link>
      
      <HeroQuestionBlock 
        category={\`${hub.toUpperCase()} Node\`}
        question={content.title}
        snippet={payload.summary || ""}
      />

      {payload.sources && payload.sources.length > 0 && (
        <TrustStrip sources={payload.sources} reviewerName={payload.reviewer} updatedAt={new Date(content.updated_at || content.created_at).toLocaleDateString()} />
      )}

      ${hub === 'compare' ? `
      {payload.profileA && payload.profileB && (
         <div className="mt-8 mb-16"><CompareQuickDecision profileA={payload.profileA} profileB={payload.profileB} /></div>
      )}
      ` : ''}

      <div className="mt-12 pt-8 border-t border-[var(--theme-border)]">
        <ProseReader html={payload.body || ''} />
      </div>
    </article>
  );
}`;

  fs.writeFileSync(path.join(dirPath, 'page.tsx'), detailCode);
});
console.log('Hub detail pages created.');
