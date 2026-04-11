import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabase';
import { resolveTenantId } from '../../../../../lib/tenant';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get('tenantSlug');
  if (!tenantSlug) return NextResponse.json({ error: 'Missing tenantSlug' }, { status: 400 });

  const tenantId = await resolveTenantId(tenantSlug);
  if (!tenantId) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  // Fetch all universal_content_assets (Trust, Expert, Topic, Story, etc.)
  const { data: assets } = await supabaseAdmin
    .from('universal_content_assets')
    .select('id, title, type, json_payload')
    .eq('tenant_id', tenantId);

  // Fetch all answer_cards
  const { data: answers } = await supabaseAdmin
    .from('answer_cards')
    .select('id, topic_id, structured_body, topics(title, cluster_id)')
    .eq('tenant_id', tenantId);

  const nodes: any[] = [];
  const edges: any[] = [];

  const addedIds = new Set<string>();

  // Helper to add nodes
  const addNode = (id: string, label: string, type: string, color: string, payload?: any) => {
    if (addedIds.has(id)) return;
    nodes.push({
      id,
      type: 'customNode', // using standard node or a custom wrapper
      data: { label, type, color, ...payload },
      position: { x: Math.random() * 800 - 400, y: Math.random() * 600 - 300 } // initial scatter, react-flow layouting better handled frontend via dagre or d3-force
    });
    addedIds.add(id);
  };

  const addEdge = (source: string, target: string, label?: string) => {
    const edgeId = `${source}->${target}`;
    edges.push({
      id: edgeId,
      source,
      target,
      label,
      animated: true,
      style: { stroke: '#a1a1aa', strokeWidth: 1.5 }
    });
  };

  // 1. Map Universal Content Assets
  assets?.forEach((asset) => {
    const payload = asset.json_payload || {};
    let color = '#d4d4d8'; // default
    if (asset.type === 'expert') color = '#3b82f6';
    if (asset.type === 'trust') color = '#22c55e';
    if (asset.type === 'topic_hub') color = '#f59e0b';
    if (asset.type === 'compare') color = '#a855f7';
    if (asset.type === 'story' || asset.type === 'routine') color = '#ec4899';

    addNode(asset.id, asset.title || asset.type, asset.type, color, { profile_url: payload.profile_url });

    // Extract Relations
    if (payload.related_experts) {
       const rs = Array.isArray(payload.related_experts) ? payload.related_experts : [payload.related_experts];
       rs.filter(Boolean).forEach((r: string) => addEdge(asset.id, r, 'reviewedBy'));
    }
    if (payload.related_evidence) {
       const rs = Array.isArray(payload.related_evidence) ? payload.related_evidence : [payload.related_evidence];
       rs.filter(Boolean).forEach((r: string) => addEdge(asset.id, r, 'citation'));
    }
    if (payload.related_topics) {
       const rs = Array.isArray(payload.related_topics) ? payload.related_topics : [payload.related_topics];
       rs.filter(Boolean).forEach((r: string) => addEdge(asset.id, r, 'about'));
    }
    if (payload.related_answers) {
       const rs = Array.isArray(payload.related_answers) ? payload.related_answers : [payload.related_answers];
       rs.filter(Boolean).forEach((r: string) => addEdge(asset.id, r, 'references'));
    }
  });

  // 2. Map Answers
  answers?.forEach((ans) => {
    const payload = ans.structured_body || {};
    const title = payload.title || ans.topics?.title || '공식 답변';
    addNode(ans.id, title, 'answer', '#14b8a6'); // Teal

    if (ans.topic_id) {
       // Answer to Topic Edge
       // Wait, topics from topics table are not universal_content_assets.
       // Let's add topic nodes from DB as well to connect answers to them.
       addNode(ans.topic_id, ans.topics?.title || 'Topic', 'topic', '#orange');
       addEdge(ans.topic_id, ans.id, 'contains');
    }

    if (payload.related_experts) {
       const rs = Array.isArray(payload.related_experts) ? payload.related_experts : [payload.related_experts];
       rs.filter(Boolean).forEach((r: string) => addEdge(ans.id, r, 'reviewedBy'));
    }
    if (payload.related_evidence) {
       const rs = Array.isArray(payload.related_evidence) ? payload.related_evidence : [payload.related_evidence];
       rs.filter(Boolean).forEach((r: string) => addEdge(ans.id, r, 'citation'));
    }
    // Note: MVP string matching for reviewer backward compat
    if (payload.reviewer && payload.reviewer !== 'Brand Official') {
       // Find expert node match
       const matchedExpert = assets?.find(a => a.type === 'expert' && a.title === payload.reviewer);
       if (matchedExpert) {
          addEdge(ans.id, matchedExpert.id, 'reviewedBy');
       }
    }
  });

  return NextResponse.json({ nodes, edges });
}
