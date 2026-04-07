import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { resolveTenantId } from '../../../lib/tenant';

export const revalidate = 600; // Cache for 10 minutes (edge)

export async function GET(request: Request, props: { params: Promise<{ tenantSlug: string }> }) {
  const params = await props.params;
  const tenantSlug = params.tenantSlug;
  const tenantId = await resolveTenantId(tenantSlug);
  
  if (!tenantId) {
    return new NextResponse(JSON.stringify({ error: 'Tenant Not Found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  const { data: contents, error } = await supabaseAdmin
    .from('universal_content_assets')
    .select('id, type, title, json_payload')
    .eq('tenant_id', tenantId);

  if (error) {
    return new NextResponse(JSON.stringify({ error: 'Database Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const graph: any[] = [];
  const siteUrl = `https://store.aihompyhub.com/${tenantSlug}`;

  // Build the Knowledge Graph
  contents?.forEach(content => {
     const payload = content.json_payload || {};
     const related = payload.related_topics || [];
     
     if (content.type === 'topic_hub') {
         // Transform Topic Hub to FAQPage/Question
         graph.push({
             "@type": "Question",
             "@id": `${siteUrl}/#topic-${content.id}`,
             "name": content.title,
             "acceptedAnswer": {
                "@type": "Answer",
                "text": payload.body || "Detailed Content"
             }
         });
     } else {
         // Transform Standard Content (Compare, Story, etc.) to Article
         // and explicitly declare "about" references to link to Topic Hubs
         const node: any = {
             "@type": content.type === 'compare' ? 'TechArticle' : 'Article',
             "@id": `${siteUrl}/${content.type}/${content.id}`,
             "headline": content.title,
             "description": payload.profileA?.description || payload.summary || "Brand Content",
             "url": `${siteUrl}/${content.type}/${content.id}`
         };

         if (related.length > 0) {
             node["about"] = related.map((topicId: string) => ({
                 "@id": `${siteUrl}/#topic-${topicId}`
             }));
         }
         graph.push(node);
     }
  });

  const jsonLd = {
      "@context": "https://schema.org",
      "@graph": graph
  };

  return NextResponse.json(jsonLd, {
    headers: {
      'Content-Type': 'application/ld+json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
