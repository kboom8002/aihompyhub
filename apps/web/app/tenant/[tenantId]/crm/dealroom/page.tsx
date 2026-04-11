'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { User, Phone, BrainCircuit, MessageSquare, AlertCircle, Inbox, Send, Lightbulb, Database, Edit3, RefreshCw, Save } from 'lucide-react';
import { fetchInquiriesAction, runPreVisitCoachAction, updateInquiryManualAction } from '../../../../actions/dealroom-actions';

export default function TenantDealRoomPage() {
    const params = useParams();
    const tenantId = params.tenantId as string;

    const [inquiries, setInquiries] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState<any>({});

    useEffect(() => {
        loadInquiries();
    }, [tenantId]);

    const loadInquiries = async () => {
        setLoading(true);
        const res = await fetchInquiriesAction(tenantId);
        if (res.success && res.data) {
            setInquiries(res.data);
            if (res.data.length > 0) setSelected(res.data[0]);
        }
        setLoading(false);
    };

    const handleSelect = (inq: any) => {
        setSelected(inq);
        setIsEditing(false);
        setEditedContent({ ...inq });
    };

    const handleRunCoach = async () => {
        if (!selected) return;
        setAiLoading(true);
        const res = await runPreVisitCoachAction(tenantId, selected.id);
        if (res.success) {
            // Update local state
            const updated = { ...selected, status: 'structured', ai_structured_brief: res.ai_brief };
            setSelected(updated);
            setEditedContent(updated);
            setInquiries(prev => prev.map(q => q.id === selected.id ? updated : q));
        } else {
            alert('AI 코칭 분석 실패: ' + res.error);
        }
        setAiLoading(false);
    };

    const handleSaveManual = async () => {
        if (!selected) return;
        const res = await updateInquiryManualAction(tenantId, selected.id, {
            raw_message: editedContent.raw_message,
            ai_structured_brief: editedContent.ai_structured_brief
        });
        if (res.success) {
            setSelected(editedContent);
            setInquiries(prev => prev.map(q => q.id === selected.id ? editedContent : q));
            setIsEditing(false);
        } else {
            alert('저장 실패: ' + res.error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto flex h-[calc(100vh-60px)] font-sans border rounded-2xl overflow-hidden bg-white shadow-xl mt-4">
            {/* Left ListView */}
            <div className="w-1/3 border-r bg-slate-50 flex flex-col h-full">
                <div className="p-5 border-b bg-white">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <Inbox className="text-indigo-600"/>
                        Deal Room (Lead 관리)
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">고객의 문의를 AI 코치와 함께 분석하고 대응하세요.</p>
                </div>
                
                <div className="overflow-y-auto flex-1 p-3 space-y-2">
                    {loading && <p className="text-center p-4">Loading...</p>}
                    {inquiries.map(inq => (
                        <div 
                           key={inq.id} 
                           onClick={() => handleSelect(inq)}
                           className={`p-4 rounded-xl cursor-pointer border transition-all ${selected?.id === inq.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-200'}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-800 flex items-center gap-1"><User size={14}/> {inq.customer_name}</span>
                                {inq.status === 'unstructured' ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">미분석 (Raw)</span>
                                ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1"><BrainCircuit size={10}/> 코칭 완료</span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-2">{inq.raw_message}</p>
                        </div>
                    ))}
                    {inquiries.length === 0 && !loading && (
                        <div className="text-center p-10 text-slate-400">접수된 문의가 없습니다.</div>
                    )}
                </div>
            </div>

            {/* Right Detail View */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 relative">
                {selected ? (
                    <div className="p-8 space-y-8 max-w-3xl mx-auto h-full flex flex-col">
                        
                        {/* 원본 메시지 카드 */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><MessageSquare size={100}/></div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xl">{selected.customer_name[0]}</div>
                                <div>
                                    <h3 className="font-bold text-lg">{selected.customer_name} 고객님</h3>
                                    <p className="text-sm text-slate-500 flex items-center gap-1"><Phone size={14}/> {selected.customer_contact}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl text-slate-700 leading-relaxed text-sm relative z-10 border">
                                "{selected.raw_message}"
                            </div>
                        </div>

                        {/* AI Pre-Visit Coach Area */}
                        {selected.status === 'unstructured' ? (
                            <div className="flex flex-col items-center justify-center p-10 bg-indigo-50 border border-indigo-100 rounded-2xl mt-4 text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-indigo-500">
                                    <BrainCircuit size={32}/>
                                </div>
                                <h4 className="text-xl font-bold text-indigo-900 mb-2">고객 맞춤 상담 전략 추출기</h4>
                                <p className="text-sm text-indigo-700/80 mb-6 max-w-sm">
                                    이 길고 두서없는 문의에서 <b>진짜 의도(Intent)</b>를 추출하고, 우리 병원의 <b>지식 자산(SSoT)</b>을 엮어 완벽한 상담 브리핑을 만들어 드릴까요?
                                </p>
                                <button 
                                    onClick={handleRunCoach} 
                                    disabled={aiLoading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition disabled:opacity-50 shadow-md"
                                >
                                    <BrainCircuit size={18}/>
                                    {aiLoading ? 'AI가 지식 검색 후 분석 중...' : '✨ 코치에게 분석 요청 (Structure)'}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 shadow-2xl relative overflow-hidden mt-4 text-white">
                                <div className="absolute top-0 right-0 p-8 opacity-20"><BrainCircuit size={120} className="text-indigo-300"/></div>
                                
                                <div className="relative z-10 flex items-center justify-between border-b border-indigo-700/50 pb-4 mb-6">
                                    <h3 className="text-2xl font-bold flex items-center gap-2"><BrainCircuit className="text-indigo-400"/> AI Pre-Visit Coach 브리핑</h3>
                                    <div className="flex gap-2">
                                        {!isEditing ? (
                                            <>
                                                <button onClick={() => setIsEditing(true)} className="bg-indigo-800 hover:bg-indigo-700 text-indigo-200 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all"><Edit3 size={12}/> Edit</button>
                                                <button onClick={handleRunCoach} disabled={aiLoading} className="bg-pink-600 hover:bg-pink-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 disabled:opacity-50 transition-all">
                                                    <RefreshCw size={12} className={aiLoading ? "animate-spin" : ""}/> Re-analyze
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => setIsEditing(false)} className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition-all">Cancel</button>
                                                <button onClick={handleSaveManual} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all"><Save size={12}/> Save</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-6 relative z-10">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-xl">
                                        <h4 className="font-bold text-indigo-200 mb-2 flex items-center gap-2"><AlertCircle size={16}/> 🎯 발견된 고객 인텐트</h4>
                                        {isEditing ? (
                                            <textarea 
                                                className="w-full bg-slate-800/50 border border-slate-600 rounded p-2 text-sm text-slate-200"
                                                rows={2}
                                                value={(editedContent?.ai_structured_brief?.intents || []).join(', ')}
                                                onChange={(e) => setEditedContent({...editedContent, ai_structured_brief: {...editedContent.ai_structured_brief, intents: e.target.value.split(',').map((s: string) => s.trim())}})}
                                            />
                                        ) : (
                                            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-200">
                                                {selected.ai_structured_brief?.intents?.map((intent: string, idx: number) => (
                                                    <li key={idx}>{intent}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-xl border-l-4 border-l-pink-500">
                                        <h4 className="font-bold text-pink-300 mb-2 flex items-center gap-2"><Database size={16}/> 💡 우리 브랜드 지식 (SSoT) 매칭</h4>
                                        {isEditing ? (
                                            <textarea 
                                                className="w-full bg-slate-800/50 border border-slate-600 rounded p-2 text-sm text-slate-200"
                                                rows={3}
                                                value={editedContent?.ai_structured_brief?.matched_ssot || ''}
                                                onChange={(e) => setEditedContent({...editedContent, ai_structured_brief: {...editedContent.ai_structured_brief, matched_ssot: e.target.value}})}
                                            />
                                        ) : (
                                            <p className="text-sm text-slate-200 leading-relaxed">
                                                {selected.ai_structured_brief?.matched_ssot}
                                            </p>
                                        )}
                                    </div>

                                    <div className="bg-indigo-600/30 backdrop-blur-md border border-indigo-400/30 p-5 rounded-xl border-l-4 border-l-emerald-400">
                                        <h4 className="font-bold text-emerald-300 mb-2 flex items-center gap-2"><Lightbulb size={16}/> 📋 코치의 후속 상담 제안</h4>
                                        {isEditing ? (
                                            <textarea 
                                                className="w-full bg-slate-800/50 border border-slate-600 rounded p-2 text-sm text-slate-200"
                                                rows={3}
                                                value={editedContent?.ai_structured_brief?.coach_recommendation || ''}
                                                onChange={(e) => setEditedContent({...editedContent, ai_structured_brief: {...editedContent.ai_structured_brief, coach_recommendation: e.target.value}})}
                                            />
                                        ) : (
                                            <p className="text-sm text-slate-100 font-medium leading-relaxed">
                                                {selected.ai_structured_brief?.coach_recommendation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mt-8 relative z-10 text-right">
                                    <button className="bg-white text-indigo-900 font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-slate-100 transition flex items-center gap-2 inline-flex">
                                        <Send size={16}/>
                                        전화 상담하기 / 완료처리
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-400 flex-col">
                        <Inbox size={48} className="mb-4 opacity-20"/>
                        <p>좌측에서 상담이 필요한 문의를 선택하세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
