import { createClient } from '@supabase/supabase-js';

export default async function TenantLeadsFeed(props: { params: Promise<{ tenantId: string }> }) {
  const params = await props.params;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const { data: tenant } = await supabase.from('tenants').select('industry_type').eq('id', params.tenantId).single();
  
  let memos: any[] = [];
  if (tenant?.industry_type) {
    const { data: pod } = await supabase.from('vertical_pods').select('id').eq('industry_type', tenant.industry_type).single();
    if (pod) {
       const res = await supabase.from('pod_memos')
          .select('*')
          .eq('pod_id', pod.id)
          .order('created_at', { ascending: false })
          .limit(20);
       memos = res.data || [];
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Deal Match Feed</h1>
        <p className="text-slate-500 mt-2">Shared Global Hub에서 실시간으로 수집된 잠재 고객(Lead) 메모와 질문 리스트입니다.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {memos.length === 0 ? (
           <p className="text-slate-400">새로운 매칭된 메모가 없습니다.</p>
        ) : memos.map(memo => {
           const intent = memo.structured_intent || {};
           const isUrgent = intent.urgency === 'high' || intent.urgency === 'immediate';
           return (
             <div key={memo.id} className="border border-slate-200 shadow-sm flex flex-col rounded-xl bg-white overflow-hidden">
               <div className="p-4 pb-3 border-b border-slate-100">
                 <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs px-2 py-1 rounded uppercase font-mono font-bold ${isUrgent ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                      {intent.urgency || 'Normal'}
                    </span>
                    <span className="text-slate-500 border border-slate-200 px-2 py-1 rounded text-xs capitalize font-mono">
                      {memo.visibility}
                    </span>
                 </div>
                 <h3 className="text-lg font-bold leading-snug">{intent.core_requirement || 'No Core Requirement identified'}</h3>
                 <div className="text-xs mt-2 text-slate-500">
                    Intent: <span className="font-semibold text-slate-700">{intent.primary_intent}</span>
                    {intent.budget_range && <span className="ml-2 block mt-1 text-emerald-600 font-mono font-bold">Budget: {intent.budget_range}</span>}
                 </div>
               </div>
               <div className="p-4 pt-4 flex-1">
                 <p className="text-sm text-slate-600 line-clamp-4 bg-slate-50 p-3 rounded-lg font-mono leading-relaxed">
                   "{memo.raw_text}"
                 </p>
                 {intent.industry_keywords?.length > 0 && (
                   <div className="mt-4 flex flex-wrap gap-1">
                     {intent.industry_keywords.map((kw: string, i: number) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-sm">#{kw}</span>
                     ))}
                   </div>
                 )}
               </div>
               <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                 <div className="text-xs text-slate-500 font-mono">
                    Score: <span className="text-emerald-500 font-bold text-sm ml-1">{intent.deal_probability_score || 0}/100</span>
                 </div>
                 <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded font-bold cursor-pointer transition-colors">
                    제안/답변 보내기
                 </button>
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}
