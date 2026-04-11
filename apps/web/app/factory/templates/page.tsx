'use client';

import React, { useState, useEffect } from 'react';
import { Save, BrainCircuit } from 'lucide-react';
import { fetchActivePromptAction, savePromptAction } from '../../actions/ai-pair-actions';

export default function FactoryPromptTemplatesPage() {
   const [aeoPrompt, setAeoPrompt] = useState('Loading...');
   const [chatPersonaPrompt, setChatPersonaPrompt] = useState('Loading...');
   const [qisExtractorPrompt, setQisExtractorPrompt] = useState('Loading...');
   
   const [loading1, setLoading1] = useState(false);
   const [loading2, setLoading2] = useState(false);
   const [loading3, setLoading3] = useState(false);

   useEffect(() => {
       fetchActivePromptAction(null, 'aeo_answer_generation').then(res => {
           if (res.success) setAeoPrompt(res.activePrompt || '');
       });
       fetchActivePromptAction(null, 'chat_consultant_persona').then(res => {
           if (res.success) setChatPersonaPrompt(res.activePrompt || '');
       });
       fetchActivePromptAction(null, 'chat_qis_extractor').then(res => {
           if (res.success) setQisExtractorPrompt(res.activePrompt || '');
       });
   }, []);

   const handleSaveAeo = async () => {
       setLoading1(true);
       const res = await savePromptAction(null, 'aeo_answer_generation', aeoPrompt);
       setLoading1(false);
       if (res.success) alert('Factory Global Default 프롬프트가 저장되었습니다.');
       else alert('오류: ' + res.error);
   };

   const handleSaveChatPersona = async () => {
       setLoading2(true);
       const res = await savePromptAction(null, 'chat_consultant_persona', chatPersonaPrompt);
       setLoading2(false);
       if (res.success) alert('Chat Persona 프롬프트가 저장되었습니다.');
       else alert('오류: ' + res.error);
   };

   const handleSaveQisExtractor = async () => {
       setLoading3(true);
       const res = await savePromptAction(null, 'chat_qis_extractor', qisExtractorPrompt);
       setLoading3(false);
       if (res.success) alert('QIS Extractor 프롬프트가 저장되었습니다.');
       else alert('오류: ' + res.error);
   };

   return (
       <div className="max-w-5xl space-y-6">
           <div className="border-b border-slate-800 pb-4 mb-8">
               <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
                   <BrainCircuit className="text-emerald-500" />
                   AI-Pair / Factory Prompt Templates
               </h1>
               <p className="text-slate-400 mt-2">
                   전체 테넌트에 디폴트로 탑재될 핵심 시스템 커스텀 인스트럭션(Prompt)입니다. 수퍼 어드민이 전역 수정할 수 있으며, 이 파이프라인의 엔지니어링이 플랫폼의 결과물 품질을 결정합니다.
               </p>
           </div>

           <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
               <h2 className="text-xl font-bold text-emerald-400 mb-2">1. AEO 최적화 공식 답변 (Answer) 프롬프트</h2>
               <p className="text-sm text-slate-500 mb-4">
                   QIS(Question Intake System)를 기반으로 Answer Card(공식 답변)를 작성할 때 테넌트 에디터에게 자동 주입되는 전역 AEO 구조화 프롬프트입니다.
               </p>
               
               <textarea 
                   className="w-full h-80 bg-slate-950 border border-slate-700 text-slate-200 p-4 rounded-xl font-mono text-sm focus:ring-emerald-500 outline-none"
                   value={aeoPrompt}
                   onChange={e => setAeoPrompt(e.target.value)}
               />

               <div className="mt-4 flex justify-end">
                   <button 
                       onClick={handleSaveAeo} 
                       disabled={loading1}
                       className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                   >
                       <Save size={18} />
                       {loading1 ? 'Saving...' : '전역 디폴트로 저장 (Save Global)'}
                   </button>
               </div>
           </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-emerald-400 mb-2">2. 스토어프론트 AI 챗봇 페르소나 (Chat Persona) 프롬프트</h2>
                <p className="text-sm text-slate-500 mb-4">
                    스토어프론트 우측 하단에서 대기하는 수석 상담 실장 역할의 핵심 성격을 정의합니다.
                </p>
                <textarea 
                    className="w-full h-40 bg-slate-950 border border-slate-700 text-slate-200 p-4 rounded-xl font-mono text-sm focus:ring-emerald-500 outline-none"
                    value={chatPersonaPrompt}
                    onChange={e => setChatPersonaPrompt(e.target.value)}
                />
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={handleSaveChatPersona} 
                        disabled={loading2}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading2 ? 'Saving...' : '전역 디폴트로 저장 (Save Global)'}
                    </button>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-emerald-400 mb-2">3. 챗봇 종료 시 QIS 질문 추출 (Extractor) 프롬프트</h2>
                <p className="text-sm text-slate-500 mb-4">
                    상담이 종료된 후, 고객이 챗봇과 나눈 텍스트에서 '새로운 호기심, 불만, 의문점' 등 QIS로 수집할 문장들을 추출하는 백그라운드 프롬프트입니다.
                </p>
                <textarea 
                    className="w-full h-40 bg-slate-950 border border-slate-700 text-slate-200 p-4 rounded-xl font-mono text-sm focus:ring-emerald-500 outline-none"
                    value={qisExtractorPrompt}
                    onChange={e => setQisExtractorPrompt(e.target.value)}
                />
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={handleSaveQisExtractor} 
                        disabled={loading3}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading3 ? 'Saving...' : '전역 디폴트로 저장 (Save Global)'}
                    </button>
                </div>
            </div>
       </div>
   );
}
