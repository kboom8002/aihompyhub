'use client';

import React, { useState, useEffect } from 'react';
import { Database, Plus, Check, X, Link as LinkIcon, Save, Ticket, HelpCircle } from 'lucide-react';
import { saveDealAction, fetchDealsByTenantAction } from '../../../../../actions/deal-actions';
import { useParams } from 'next/navigation';

// MOCK: In production, fetch this from tenant context / layout
const getIndustryType = (tenantId: string): string => {
    if (tenantId === 'welby') return 'skincare';
    if (tenantId === 'clinic_mock') return 'clinic';
    return 'skincare'; // default fallback
};

export default function TenantDealOSPage() {
    const params = useParams();
    const tenantId = params.tenantId as string;
    const industryType = getIndustryType(tenantId);

    const [deals, setDeals] = useState<any[]>([]);
    const [qisPool, setQisPool] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0);
    const [includes, setIncludes] = useState<string[]>(['']);
    const [excludes, setExcludes] = useState<string[]>(['']);
    const [linkedQis, setLinkedQis] = useState<string>('');
    const [protocolData, setProtocolData] = useState<Record<string, any>>({});

    useEffect(() => {
        loadData();
    }, [tenantId]);

    const loadData = async () => {
        setLoading(true);
        // 1. Fetch Deals
        const res = await fetchDealsByTenantAction(tenantId);
        if (res.success && res.data) setDeals(res.data);
        
        // 2. Fetch Topics (SSoT) to link
        const qisRes = await fetch(`/api/v1/tenant/content?category=foundation&type=topics`, { headers: { 'x-tenant-id': tenantId }});
        const qisData = await qisRes.json();
        if (qisData?.data) {
           // filter clusters that are actually populated/approved or just show all topics
           setQisPool(qisData.data);
        }
        setLoading(false);
    };

    const handleSave = async () => {
         const payload = {
             tenant_id: tenantId,
             industry_type: industryType,
             title,
             description: '...',
             base_price: Number(price),
             what_is_included: includes.filter(x => x.trim()),
             what_is_not_included: excludes.filter(x => x.trim()),
             protocol_data: protocolData,
             qis_cluster_id: linkedQis || null,
             status: 'active' as const
         };

         const res = await saveDealAction(payload);
         if (res.success) {
            alert("Deal이 안전한 프로토콜 기반으로 블록체인(DB)에 동기화되었습니다!");
            setIsEditing(false);
            loadData();
         } else {
            alert("오류: " + res.error);
         }
    };

    // Array Updaters
    const updateArray = (setter: any, arr: string[], index: number, val: string) => {
        const newArr = [...arr];
        newArr[index] = val;
        setter(newArr);
    };
    const addArrayItem = (setter: any, arr: string[]) => setter([...arr, '']);

    // Dynamic Form Renderer based on Industry
    const renderProtocolForm = () => {
        switch(industryType) {
            case 'clinic': return (
                <div className="space-y-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-800">🏥 클리닉 / 시술 투명성 프로토콜</h3>
                    <div>
                        <label className="text-xs font-bold text-slate-500">예상 다운타임 (일)</label>
                        <input type="number" className="w-full p-2 rounded border focus:ring-blue-500 mt-1" 
                               value={protocolData.downtime || ''} 
                               onChange={e => setProtocolData({...protocolData, downtime: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">주의해야 할 부작용</label>
                        <input type="text" className="w-full p-2 rounded border focus:ring-blue-500 mt-1" placeholder="예: 붉은 기, 각질 일어남" 
                               value={protocolData.side_effects || ''} 
                               onChange={e => setProtocolData({...protocolData, side_effects: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">시술 소요시간 (분)</label>
                        <input type="number" className="w-full p-2 rounded border focus:ring-blue-500 mt-1" 
                               value={protocolData.duration || ''} 
                               onChange={e => setProtocolData({...protocolData, duration: e.target.value})} />
                    </div>
                </div>
            );
            case 'skincare': return (
                <div className="space-y-4 bg-pink-50 p-4 rounded-xl border border-pink-100">
                    <h3 className="font-bold text-pink-800">✨ 코스메틱 오퍼 투명성 프로토콜</h3>
                    <div>
                        <label className="text-xs font-bold text-slate-500">핵심 활성성분 함량 (%)</label>
                        <input type="text" className="w-full p-2 rounded border focus:ring-pink-500 mt-1" placeholder="예: 레티놀 0.1%, 나이아신아마이드 2%" 
                               value={protocolData.active_ingredients || ''} 
                               onChange={e => setProtocolData({...protocolData, active_ingredients: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">예상 최초 호전기간 (일)</label>
                        <input type="number" className="w-full p-2 rounded border focus:ring-pink-500 mt-1" placeholder="통상적인 결과 가시화 시점" 
                               value={protocolData.results_expected || ''} 
                               onChange={e => setProtocolData({...protocolData, results_expected: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">동시 사용 불가 성분 (충돌주의)</label>
                        <input type="text" className="w-full p-2 rounded border focus:ring-pink-500 mt-1" placeholder="예: 비타민C, 아하/바하" 
                               value={protocolData.clash_warnings || ''} 
                               onChange={e => setProtocolData({...protocolData, clash_warnings: e.target.value})} />
                    </div>
                </div>
            );
            case 'real_estate': return (
                <div className="space-y-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <h3 className="font-bold text-emerald-800">🏢 부동산 중개 투명성 프로토콜</h3>
                    <div>
                        <label className="text-xs font-bold text-slate-500">실평수 (전용면적 ㎡)</label>
                        <input type="number" className="w-full p-2 rounded border mt-1" 
                               value={protocolData.area_sqm || ''} 
                               onChange={e => setProtocolData({...protocolData, area_sqm: e.target.value})} />
                    </div>
                    <div className="flex gap-4">
                       <label className="flex items-center space-x-2 text-sm text-slate-700 font-bold">
                          <input type="checkbox" checked={protocolData.has_loan || false} onChange={e => setProtocolData({...protocolData, has_loan: e.target.checked})} />
                          <span>융자(근저당) 있음</span>
                       </label>
                       <label className="flex items-center space-x-2 text-sm text-slate-700 font-bold">
                          <input type="checkbox" checked={protocolData.has_defects || false} onChange={e => setProtocolData({...protocolData, has_defects: e.target.checked})} />
                          <span>주요 하자 보수 이력 있음</span>
                       </label>
                    </div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8 font-sans">
            <div className="border-b border-slate-200 pb-4">
                <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-900">
                    <Ticket className="text-indigo-600" />
                    Deal OS: {industryType.toUpperCase()} Protocol
                </h1>
                <p className="text-slate-500 mt-2">
                    단순 커머스 기능이 아닙니다. 업종별로 구매자가 가장 두려워하는 <b>정보 비대칭성</b>을 
                    프로토콜화 하여, <span className="font-bold text-indigo-600">투명성 계약(Deal)</span> 형태로 랜딩을 발행합니다.
                </p>
            </div>

            {!isEditing ? (
                <div className="space-y-6">
                    <button onClick={() => { setIsEditing(true); setTitle(''); setPrice(0); setIncludes(['']); setExcludes(['']); setProtocolData({}); setLinkedQis(''); }} className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition flex items-center gap-2">
                        <Plus /> 새로운 Deal Protocol 발행
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {loading && <p>Loading deals...</p>}
                        {deals.map(d => (
                            <div key={d.id} className="bg-white border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold">{d.status.toUpperCase()}</span>
                                        <h3 className="text-xl font-bold text-slate-900 mt-2">{d.title}</h3>
                                        <p className="text-slate-500 mt-1 font-bold">{Number(d.base_price).toLocaleString()} {d.currency}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-400 font-mono">INDUSTRY: {d.industry_type}</span>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-emerald-50 rounded-lg p-3">
                                        <p className="text-emerald-800 font-bold flex items-center gap-1 mb-1"><Check size={14}/> 포함 사항</p>
                                        <ul className="text-emerald-700 pl-4 list-disc text-xs space-y-1">
                                            {d.what_is_included?.map((x:string, i:number)=><li key={i}>{x}</li>)}
                                        </ul>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-3">
                                        <p className="text-red-800 font-bold flex items-center gap-1 mb-1"><X size={14}/> 불포함/위험 요인</p>
                                        <ul className="text-red-700 pl-4 list-disc text-xs space-y-1">
                                            {d.what_is_not_included?.map((x:string, i:number)=><li key={i}>{x}</li>)}
                                        </ul>
                                    </div>
                                </div>

                                {/* Polymorphic Data Preview */}
                                <div className="mt-4 bg-slate-50 p-3 rounded-lg border text-xs text-slate-600 font-mono">
                                    <p className="font-bold text-slate-400 mb-1">PROTOCOL_METADATA</p>
                                    {JSON.stringify(d.protocol_data)}
                                </div>

                                {/* QIS Link Preview */}
                                {d.question_clusters?.cluster_name && (
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-sm text-pink-600 font-bold">
                                        <HelpCircle size={16} /> 연동된 QIS SSoT: {d.question_clusters.cluster_name}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white border rounded-2xl shadow-xl p-8 max-w-4xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Ticket/> Deal 생성 파이프라인</h2>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Deal 타이틀</label>
                                <input type="text" className="w-full p-3 rounded-xl border bg-slate-50 focus:bg-white transition" value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 스킨 부스터 풀패키지" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">기본 제안가 (KRW)</label>
                                <input type="number" className="w-full p-3 rounded-xl border bg-slate-50 focus:bg-white transition" value={price} onChange={e => setPrice(Number(e.target.value))} />
                            </div>
                        </div>

                        {renderProtocolForm()}

                        <div className="grid grid-cols-2 gap-6">
                            {/* Includes */}
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-3"><Check size={18}/> 가격 포함 내역</h4>
                                {includes.map((inc, i) => (
                                    <input key={i} type="text" className="w-full p-2 text-sm mb-2 rounded border border-emerald-200 focus:ring-emerald-500 outline-none" value={inc} onChange={e => updateArray(setIncludes, includes, i, e.target.value)} placeholder="제공되는 혜택/결과물" />
                                ))}
                                <button className="text-emerald-600 text-xs font-bold hover:underline" onClick={() => addArrayItem(setIncludes, includes)}>+ 항목 추가</button>
                            </div>

                            {/* Excludes */}
                            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                <h4 className="font-bold text-red-800 flex items-center gap-2 mb-3"><X size={18}/> 불포함 / 별도 과금 요소</h4>
                                {excludes.map((exc, i) => (
                                    <input key={i} type="text" className="w-full p-2 text-sm mb-2 rounded border border-red-200 focus:ring-red-500 outline-none" value={exc} onChange={e => updateArray(setExcludes, excludes, i, e.target.value)} placeholder="고객이 오해할 수 있는 미포함 요소" />
                                ))}
                                <button className="text-red-600 text-xs font-bold hover:underline" onClick={() => addArrayItem(setExcludes, excludes)}>+ 항목 추가</button>
                            </div>
                        </div>

                        {/* QIS Connection */}
                        <div className="bg-slate-50 border p-5 rounded-xl">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2"><HelpCircle size={18}/> QIS 지식 자산(SSoT) 연동</h4>
                            <p className="text-xs text-slate-500 mb-4">해당 상품을 열람하는 고객이 가장 많이 묻는 표준 질문(Canonical Intent)을 연결해두면, 상품 카드 하단에 공식 답변이 노출되어 전환율이 80% 상승합니다.</p>
                            <select className="w-full p-3 rounded-lg border outline-none font-medium text-slate-700" value={linkedQis} onChange={e => setLinkedQis(e.target.value)}>
                                <option value="">-- 연동할 QIS Topic 선택 (선택 사항) --</option>
                                {qisPool.map(q => (
                                    <option key={q.id} value={q.cluster_id}>{q.title} (SSoT)</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-4 pt-6 border-t">
                            <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition">
                                <Save /> Deal 발행 완료
                            </button>
                            <button onClick={() => setIsEditing(false)} className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition">
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
