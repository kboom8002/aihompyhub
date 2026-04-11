'use client';

import React, { useState, useEffect } from 'react';
import { Save, BrainCircuit, RefreshCcw } from 'lucide-react';
import { fetchActivePromptAction, savePromptAction } from '../../../../actions/ai-pair-actions';
import { useParams } from 'next/navigation';

export default function TenantPromptsPage() {
   const params = useParams();
   const tenantId = params.tenantId as string;

   const [aeoPrompt, setAeoPrompt] = useState('Loading...');
   const [loading1, setLoading1] = useState(false);

   useEffect(() => {
       fetchActivePromptAction(tenantId, 'aeo_answer_generation').then(res => {
           if (res.success) setAeoPrompt(res.activePrompt || '');
       });
   }, [tenantId]);

   const handleSaveAeo = async () => {
       setLoading1(true);
       const res = await savePromptAction(tenantId, 'aeo_answer_generation', aeoPrompt);
       setLoading1(false);
       if (res.success) alert('해당 브랜드(테넌트)만의 AI 커스텀 프롬프트가 저장(Override)되었습니다.');
       else alert('오류: ' + res.error);
   };

   const loadDefault = async () => {
       if(!window.confirm("본사(Factory) 디폴트 프롬프트로 초기화하시겠습니까? (저장되지 않은 내역은 유실됩니다.)")) return;
       const res = await fetchActivePromptAction(null, 'aeo_answer_generation');
       if (res.success) setAeoPrompt(res.activePrompt || '');
   };

   return (
       <div className="max-w-4xl space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200 font-sans">
           <div className="border-b border-slate-200 pb-4 mb-8">
               <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                   <BrainCircuit className="text-pink-600" />
                   브랜드 전용 AI-Pair 프롬프트 (Custom Override)
               </h1>
               <p className="text-slate-500 mt-2 text-sm">
                   본사(Factory)에서 정해준 디폴트 작성 지침(Prompt) 대신, 우리 브랜드만의 독점적인 문체나 강조 사항을 프롬프트에 추가하여 AI 생성물의 결과 패턴을 정교하게 커스터마이즈할 수 있습니다.
               </p>
           </div>

           <div className="bg-pink-50 border border-pink-100 rounded-xl p-6">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-pink-800">1. AEO 최적화 공식 답변 (Answer) 커스텀 지침</h2>
                  <button onClick={loadDefault} className="flex items-center gap-1 text-xs font-bold text-pink-600 hover:text-pink-800 transition">
                      <RefreshCcw size={14} /> 본사 디폴트 불러오기
                  </button>
               </div>
               
               <p className="text-sm text-pink-700/80 mb-4 font-medium">
                   이 텍스트 박스의 프롬프트는 에디터에서 [✨ AI-Pair] 기능을 작동시킬 때 1차적으로 적용됩니다.
               </p>
               
               <textarea 
                   className="w-full h-80 bg-white border border-pink-200 text-slate-800 p-4 rounded-xl font-mono text-sm focus:ring-pink-400 outline-none shadow-inner"
                   value={aeoPrompt}
                   onChange={e => setAeoPrompt(e.target.value)}
               />

               <div className="mt-4 flex justify-end">
                   <button 
                       onClick={handleSaveAeo} 
                       disabled={loading1}
                       className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition disabled:opacity-50 shadow"
                   >
                       <Save size={18} />
                       {loading1 ? 'Saving...' : '브랜드 오버라이드 저장 (Save Override)'}
                   </button>
               </div>
           </div>
       </div>
   );
}
