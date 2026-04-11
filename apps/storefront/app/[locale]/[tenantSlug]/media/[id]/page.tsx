import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveTenantId } from '@/lib/tenant';
import { ProseReader } from '@/components/store/ProseReader';

export const revalidate = 60;

export default async function MediaDetailPage(props: { params: Promise<{ tenantSlug: string, id: string }> }) {
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
    <article className="w-full">
      {/* Magazine Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[65vh] bg-gray-100 flex flex-col justify-end">
         {payload.thumbnail && (
            <img src={payload.thumbnail} alt={content.title} className="absolute inset-0 w-full h-full object-cover" />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
         
         <div className="relative z-10 container mx-auto px-4 md:px-0 pb-12 sm:pb-16 text-white max-w-4xl">
            <Link href={`/${params.tenantSlug}/media`} className="text-sm font-medium border border-white/30 bg-black/20 px-4 py-2 rounded-full mb-6 inline-block hover:bg-white/20 transition-colors backdrop-blur-sm">
                &larr; 돌아가기
            </Link>
            <span className="text-xs font-bold tracking-widest uppercase mb-3 block opacity-80">{payload.type || 'Media Editorial'}</span>
            <h1 className="text-4xl md:text-6xl font-medium tracking-tight font-[family-name:var(--theme-font)] mb-4 leading-tight">{content.title}</h1>
            <p className="text-lg opacity-80 flex items-center gap-4">
              <span>{new Date(content.updated_at || content.created_at).toLocaleDateString()}</span>
              {payload.reviewer && <span className="opacity-50">|</span>}
              {payload.reviewer && <span>By {payload.reviewer}</span>}
            </p>
         </div>
      </div>

      <div className="container mx-auto px-4 md:px-0 py-16 max-w-3xl">
        <ProseReader html={payload.body || '<p>본문이 없습니다.</p>'} />
      </div>
    </article>
  );
}