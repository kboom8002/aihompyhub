'use client';

import React, { useState, useEffect } from 'react';
import { BrainCircuit, Check, CheckSquare, Sparkles, Database, Send } from 'lucide-react';
import { runGeminiClusteringAction, createGlobalCanonicalIntentAction, fetchGlobalRawInbox, pushClusterToTenantsAction, ClusteringResult, RawIntakeQuestion } from '../../actions/qis-actions';

export default function FactoryQisPage() {
  const [activeIndustry, setActiveIndustry] = useState('skincare');
  const [rawInbox, setRawInbox] = useState<RawIntakeQuestion[]>([]);
  const [approvedCanonicals, setApprovedCanonicals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<ClusteringResult[] | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedRawIds, setSelectedRawIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'taxonomy' | 'distribution'>('taxonomy');

  const industries = [
     { id: 'skincare', name: '뷰티/스킨케어 (Skincare)' },
     { id: 'clinic', name: '클리닉/개원의 (Clinic)' },
     { id: 'real_estate', name: '부동산 중개 (Real Estate)' },
     { id: 'consulting', name: '전문가/컨설팅 (Consulting)' }
  ];

  useEffect(() => {
     // Fetch Global Inbox
     fetchGlobalRawInbox().then(res => {
        if (res.success && res.data) {
           // We filter visually by industry for the workbench
           setRawInbox(res.data);
        }
     });
     
     // Note: In real app, we should fetch global canonicals. We'll simply mock the fetch pattern or reuse existing topics if empty.
     fetch(`/api/v1/tenant/content?category=foundation&type=question_clusters`) // using tenantId=null trick in API ideally
      .then(res => res.json())
      .then(payload => {
         if (payload?.data) {
             // filter where tenant_id === null
             setApprovedCanonicals(payload.data.filter((c: any) => !c.tenant_id));
         }
      }).catch(e => console.error(e));
  }, []);

  const visibleInbox = rawInbox.filter(r => r.industry_type === activeIndustry);

  const handleToggleRawId = (id: string) => {
    setSelectedRawIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleRunAI = async () => {
    setLoading(true);
    setErrorMsg("");
    
    const selectedItems = visibleInbox.filter(r => selectedRawIds.includes(r.id));
    if (selectedItems.length === 0) {
      setErrorMsg("최소 1개 이상의 Raw Question을 선택해주세요.");
      setLoading(false);
      return;
    }

    const result = await runGeminiClusteringAction(selectedItems, activeIndustry);
    if (result.success && result.data) {
      setAiSuggestions(result.data);
    } else {
      setErrorMsg(result.error || "AI Clustering 실패.");
    }
    setLoading(false);
  };

  const handleApprove = async (suggestion: ClusteringResult) => {
    const res = await createGlobalCanonicalIntentAction(activeIndustry, suggestion, selectedRawIds);
    if (res.success) {
      setApprovedCanonicals(prev => [{
         id: res.clusterId,
         cluster_name: suggestion.canonical_intent,
         intent_type: activeIndustry,
         priority_score: suggestion.matched_raw_count
      }, ...prev]);

      setAiSuggestions(prev => prev ? prev.filter(s => s.proposed_id !== suggestion.proposed_id) : null);
      setRawInbox(prev => prev.filter(r => !selectedRawIds.includes(r.id)));
      setSelectedRawIds([]);
      alert(`[${activeIndustry}] Global Standard 클러스터로 승인되었습니다.`);
    } else {
      setErrorMsg(`저장 실패: ${res.error}`);
    }
  };

  const handlePushToTenants = async (clusterId: string) => {
      if(!window.confirm("이 클러스터를 해당 업종의 모든 테넌트에게 강제 푸시(Top-down)하시겠습니까?")) return;
      const res = await pushClusterToTenantsAction(clusterId, activeIndustry);
      if(res.success) {
          alert(`완료! ${res.pushedCount}개의 테넌트에게 Draft 답변 작성 태스크가 전달되었습니다.`);
      } else {
          alert(`오류: ${res.error}`);
      }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="mb-6 border-b pb-4">
         <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
            <BrainCircuit className="text-pink-500" />
            Global Question Factory
         </h1>
         <p className="text-slate-400 mt-2">
            플랫폼 전체에서 유입되는 질문을 수집하여 메가 클러스터링을 수행하고, 각 업종 마스터 스탠다드를 배포(Push)합니다.
         </p>
      </div>

      <div className="flex gap-2 mb-6">
          {industries.map(ind => (
              <button 
                key={ind.id}
                onClick={() => { setActiveIndustry(ind.id); setAiSuggestions(null); setSelectedRawIds([]); }}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeIndustry === ind.id ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                  {ind.name}
              </button>
          ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column: AI HITL Workbench */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 text-slate-200 border-b border-slate-800 pb-2">
              <BrainCircuit size={20} className="text-pink-500" />
              <h2 className="text-lg font-bold">Global Raw Inbox & AI Clustering</h2>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
              <p className="text-sm text-slate-400 mb-4">{activeIndustry} 업종 미분류 Raw 질문: <span className="font-bold text-white">{visibleInbox.length}개</span></p>
              
              <div className="max-h-80 overflow-y-auto space-y-2 mb-4 scrollbar-thin">
                {visibleInbox.map(raw => (
                  <label key={raw.id} className="flex items-start space-x-3 bg-slate-800 p-3 rounded-lg cursor-pointer hover:bg-slate-700 transition border border-slate-700">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-pink-500 focus:ring-pink-500"
                      checked={selectedRawIds.includes(raw.id)}
                      onChange={() => handleToggleRawId(raw.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">{raw.text}</p>
                      <p className="text-xs text-slate-500 mt-1 flex justify-between items-center">
                        <span>Source: {raw.source}</span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded shadow-sm text-slate-400 font-mono">Occurrences: {raw.count}</span>
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <button 
                onClick={handleRunAI} 
                disabled={loading || selectedRawIds.length === 0}
                className="w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 transition"
              >
                <Sparkles size={18} className={loading ? "animate-spin text-pink-600" : "text-pink-600"} />
                <span>{loading ? "Gemini 3.1 is analyzing clusters..." : "Extract Canonical Intents"}</span>
              </button>

              {errorMsg && (
                <div className="p-3 bg-red-900/30 text-red-400 border border-red-800/50 rounded-lg text-sm">
                  {errorMsg}
                </div>
              )}

              {aiSuggestions && (
                <div className="mt-8 space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="text-slate-300 font-bold flex items-center gap-2">
                    <Check className="text-emerald-500" size={18} /> 
                    Global Standard Intent Proposals
                  </h3>
                  
                  {aiSuggestions.map((s, idx) => (
                    <div key={idx} className="bg-slate-800 p-4 rounded-xl border-2 border-pink-500/20 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-pink-400 font-mono font-bold">{s.proposed_id}</span>
                        <span className="text-[10px] uppercase font-bold bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/30">
                          {s.matched_raw_count} MATCHES
                        </span>
                      </div>
                      
                      <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold mb-2 focus:ring-2 focus:ring-pink-500 outline-none" defaultValue={s.canonical_intent} />
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm font-semibold text-slate-400 px-2 py-1 bg-slate-900 rounded">{s.category}</span>
                        <button 
                          onClick={() => handleApprove(s)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-xs px-4 py-2 rounded-lg transition"
                        >
                          Approve (Save to Pool)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Right Column: Global SSoT Pool & Distribution */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 text-slate-200 border-b border-slate-800 pb-2">
              <Database size={20} className="text-indigo-400" />
              <h2 className="text-lg font-bold">Global Question Pool & Distribution</h2>
            </div>

            <div className="space-y-4">
              {approvedCanonicals.length === 0 && <p className="text-slate-500 text-sm py-4">해당 업종의 Global Question Pool이 비어 있습니다.</p>}
              
              {approvedCanonicals.map(cq => (
                <div key={cq.id} className="bg-slate-900 border border-indigo-500/20 shadow-sm rounded-xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-slate-500 font-bold">GLOBAL: {cq.id.split('-')[0]}...</span>
                    <div className="flex items-center space-x-1 bg-indigo-500/10 px-2 py-0.5 rounded text-xs text-indigo-400 border border-indigo-500/20 font-semibold">
                      <span>WEIGHT: {cq.priority_score || 0}</span>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-lg mb-4">{cq.cluster_name}</h3>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">테넌트 작성률 모니터링: 0%</span>
                    <button 
                      onClick={() => handlePushToTenants(cq.id)}
                      className="text-xs font-bold bg-white text-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-200 transition-colors"
                    >
                      <Send size={12} /> Push to All Tenants
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
      </div>
    </div>
  );
}
