'use client';

import React, { useState, useEffect } from 'react';
import { BrainCircuit, Check, CheckSquare, Sparkles, Database } from 'lucide-react';
import { runGeminiClusteringAction, createCanonicalIntentAction, fetchRawInbox, ClusteringResult, RawIntakeQuestion } from '../../../../../actions/qis-actions';
import { useParams } from 'next/navigation';

export default function QisStudioClient() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const industryType = 'skincare'; // Hardcoded for demo, normally fetched from tenantInfo

  const [rawInbox, setRawInbox] = useState<RawIntakeQuestion[]>([]);
  const [approvedCanonicals, setApprovedCanonicals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<ClusteringResult[] | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedRawIds, setSelectedRawIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'taxonomy' | 'scenes'>('taxonomy');

  useEffect(() => {
     // Fetch Inbox
     fetchRawInbox(tenantId, industryType).then(res => {
        if (res.success && res.data) setRawInbox(res.data);
     });
     
     // Fetch Existing Clusters (Canonical)
     fetch(`/api/v1/tenant/content?category=foundation&type=question_clusters`, { headers: { 'x-tenant-id': tenantId }})
      .then(res => res.json())
      .then(payload => {
         if (payload?.data) setApprovedCanonicals(payload.data);
      }).catch(e => console.error(e));
  }, [tenantId]);

  const handleToggleRawId = (id: string) => {
    setSelectedRawIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleRunAI = async () => {
    setLoading(true);
    setErrorMsg("");
    
    const selectedItems = rawInbox.filter(r => selectedRawIds.includes(r.id));
    if (selectedItems.length === 0) {
      setErrorMsg("최소 1개 이상의 Raw Question을 선택해주세요.");
      setLoading(false);
      return;
    }

    const result = await runGeminiClusteringAction(selectedItems, industryType);
    if (result.success && result.data) {
      setAiSuggestions(result.data);
    } else {
      setErrorMsg(result.error || "AI Clustering 실패.");
    }
    setLoading(false);
  };

  const handleApprove = async (suggestion: ClusteringResult) => {
    const res = await createCanonicalIntentAction(tenantId, industryType, suggestion, selectedRawIds);
    if (res.success) {
      // Visually add to approved
      setApprovedCanonicals(prev => [{
         id: res.clusterId,
         cluster_name: suggestion.canonical_intent,
         intent_type: suggestion.category,
         priority_score: suggestion.matched_raw_count
      }, ...prev]);

      // Remove from suggestions array visually
      setAiSuggestions(prev => prev ? prev.filter(s => s.proposed_id !== suggestion.proposed_id) : null);

      // Remove selected from RawInbox visually
      setRawInbox(prev => prev.filter(r => !selectedRawIds.includes(r.id)));
      setSelectedRawIds([]);
      
      alert(`업종 [${industryType}] - SSoT Taxonomy에 표준 클러스터가 배포되었습니다!`);
    } else {
      setErrorMsg(`저장 실패: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 font-sans">
      <div className="mb-6 border-b pb-4">
         <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="text-pink-500" />
            업종 통합 질문 자본 (QIS) 관리 시스템
         </h1>
         <p className="text-slate-500 mt-2">
            사용자들이 남긴 원천 질문(Raw Intake)들을 AI가 스탠다드 의도(Canonical Intent)로 클러스터링합니다. 생성된 규격 질문은 동일 업종 내에서 추천 모델의 기본 뼈대가 됩니다.
         </p>
      </div>

      <div className="flex border-b border-slate-200 space-x-8 mb-6">
        <button 
          onClick={() => setActiveTab('taxonomy')}
          className={`py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'taxonomy' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          1. Taxonomy Board (AI Clustering 벤치)
        </button>
      </div>

      {activeTab === 'taxonomy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
          {/* Left Column: AI HITL Workbench */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 text-slate-800 border-b border-slate-200 pb-2">
              <BrainCircuit size={20} className="text-pink-500" />
              <h2 className="text-lg font-bold">AI Taxonomy HITL Workbench</h2>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
              <p className="text-sm text-slate-500 mb-4">현재 <span className="font-bold text-slate-800">{rawInbox.length}개</span>의 미분류 Raw 질문이 있습니다.</p>
              
              <div className="max-h-80 overflow-y-auto space-y-2 mb-4 scrollbar-thin">
                {rawInbox.map(raw => (
                  <label key={raw.id} className="flex items-start space-x-3 bg-slate-50 p-3 rounded-lg cursor-pointer hover:bg-slate-100 transition border border-slate-200">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                      checked={selectedRawIds.includes(raw.id)}
                      onChange={() => handleToggleRawId(raw.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{raw.text}</p>
                      <p className="text-xs text-slate-400 mt-1 flex justify-between items-center">
                        <span>Source: {raw.source}</span>
                        <span className="bg-white px-2 py-0.5 rounded shadow-sm text-slate-500 border border-slate-100 font-mono">Occurrences: {raw.count}</span>
                      </p>
                    </div>
                  </label>
                ))}
                {rawInbox.length === 0 && <p className="text-sm text-slate-400 text-center py-6">모든 Raw 질문이 클러스터링 되었습니다!</p>}
              </div>

              <button 
                onClick={handleRunAI} 
                disabled={loading || selectedRawIds.length === 0}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 transition"
              >
                <Sparkles size={18} className={loading ? "animate-spin text-pink-400" : "text-pink-400"} />
                <span>{loading ? "Gemini 3.1이 의상을 클러스터링하고 있습니다..." : "선택 항목 AI 분류 진행 (Run Clustering)"}</span>
              </button>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
                  {errorMsg}
                </div>
              )}

              {aiSuggestions && (
                <div className="mt-8 space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="text-slate-800 font-bold flex items-center gap-2">
                    <Check className="text-emerald-500" size={18} /> 
                    AI가 제안하는 Canonical 의도 추출 결과
                  </h3>
                  
                  {aiSuggestions.length === 0 && <p className="text-slate-500 text-sm">적합한 클러스터를 찾지 못했습니다.</p>}

                  {aiSuggestions.map((s, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border-2 border-pink-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-pink-600 font-mono font-bold">{s.proposed_id}</span>
                        <span className="text-[10px] uppercase font-bold bg-pink-50 text-pink-600 px-2 py-0.5 rounded border border-pink-200">
                          {s.matched_raw_count} RAW MATCHES
                        </span>
                      </div>
                      
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-bold mb-2 focus:ring-2 focus:ring-pink-500 outline-none" defaultValue={s.canonical_intent} />
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm font-semibold text-slate-500 px-2 py-1 bg-slate-100 rounded">{s.category}</span>
                        <button 
                          onClick={() => handleApprove(s)}
                          className="bg-emerald-500 hover:bg-emerald-600 shadow text-white font-bold text-xs px-4 py-2 rounded-lg transition"
                        >
                          승인 및 배포 (Approve)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Right Column: Canonical Manager (Taxonomy Board) */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 text-slate-800 border-b border-slate-200 pb-2">
              <Database size={20} className="text-emerald-500" />
              <h2 className="text-lg font-bold">Taxonomy Board (Canonical Clusters)</h2>
            </div>

            <div className="space-y-4">
              {approvedCanonicals.length === 0 && <p className="text-slate-500 text-sm py-4">아직 생성된 Question Cluster가 없습니다.</p>}
              
              {approvedCanonicals.map(cq => (
                <div key={cq.id} className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-slate-400 font-bold">{cq.id.split('-')[0]}...</span>
                    <div className="flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded text-xs text-emerald-700 border border-emerald-100 font-semibold">
                      <CheckSquare size={12} />
                      <span>{cq.intent_type}</span>
                    </div>
                  </div>

                  <h3 className="text-slate-800 font-bold text-lg mb-4">{cq.cluster_name}</h3>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">가중치 점수: {cq.priority_score || 0}</span>
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Topic 파생하기 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
