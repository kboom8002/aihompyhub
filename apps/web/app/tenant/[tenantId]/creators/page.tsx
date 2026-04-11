import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, MailOpen, TrendingUp, Calendar, CheckSquare, Plus, ExternalLink } from 'lucide-react';
import { acceptCreatorRequestAction } from '../../../actions/instagram-actions';

export default async function TenantCreatorWorkspacePage({ params }: { params: { tenantId: string } }) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch Creators
    const { data: creators } = await supabaseAdmin.from('creators')
        .select('*')
        .eq('tenant_id', params.tenantId)
        .order('created_at', { ascending: false });

    // 2. Fetch Creator Requests (Intake)
    const { data: requests } = await supabaseAdmin.from('creator_requests')
        .select(`
            *,
            creators ( creator_name, handle )
        `)
        .eq('tenant_id', params.tenantId)
        .order('created_at', { ascending: false });

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Users className="text-indigo-600" size={32} />
                        Creator Workspace
                    </h1>
                    <p className="text-slate-500 mt-2">제휴 크리에이터 콘텐츠 통합 인테이크 및 퍼포먼스 관리</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium">
                        <Plus size={16} /> 신규 크리에이터 등록
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <MailOpen className="text-indigo-500" size={20} />
                        <h3 className="font-bold text-slate-700">대기 중인 요청 (Requests)</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900">
                        {requests?.filter(r => r.status === 'submitted' || r.status === 'under_review').length || 0}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">AI 초안 생성이 필요한 요청</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckSquare className="text-emerald-500" size={20} />
                        <h3 className="font-bold text-slate-700">활성 파트너십 (Active)</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900">
                        {creators?.filter(c => c.professional_account_status === 'connected').length || 0}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">자동 배포 연동 완료 계정</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-pink-500" size={20} />
                        <h3 className="font-bold text-slate-700">Total Attribution</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900">--</p>
                    <p className="text-sm text-slate-400 mt-2">UTM 측정 기반 프로젝트 예약 (Beta)</p>
                </div>
            </div>

            {/* Request Inbox */}
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                Request Inbox <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{requests?.length || 0}</span>
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-12">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 bg-slate-50">
                            <th className="p-4 font-semibold">Creator</th>
                            <th className="p-4 font-semibold">Goal / Topic Interest</th>
                            <th className="p-4 font-semibold">Deadline</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {requests && requests.length > 0 ? (
                            requests.map((r: any) => (
                                <tr key={r.id} className="hover:bg-slate-50 transition">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900">{r.creators?.creator_name || 'Unknown'}</div>
                                        <div className="text-xs text-slate-400">@{r.creators?.handle || 'unknown'}</div>
                                    </td>
                                    <td className="p-4 max-w-xs">
                                        <div className="font-semibold text-indigo-900 truncate">{r.goal || 'General Launch'}</div>
                                        <div className="text-xs text-slate-500 truncate mt-1">Topic: {r.topic_interest || 'N/A'}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-1 text-slate-600">
                                            <Calendar size={14} />
                                            {r.deadline ? new Date(r.deadline).toLocaleDateString() : 'ASAP'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                                            r.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                                            r.status === 'ready_for_creator' ? 'bg-green-100 text-green-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {r.status === 'submitted' ? (
                                            <form action={acceptCreatorRequestAction} className="inline-block">
                                                <input type="hidden" name="tenantId" value={params.tenantId} />
                                                <input type="hidden" name="requestId" value={r.id} />
                                                <input type="hidden" name="creatorId" value={r.creator_id} />
                                                <input type="hidden" name="goal" value={r.goal} />
                                                <input type="hidden" name="topicId" value={r.topic_interest} />
                                                <button type="submit" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-3 rounded shadow-sm hover:shadow transition">
                                                    AI 초안 기획 (Approve)
                                                </button>
                                            </form>
                                        ) : (
                                            <button className="text-indigo-600 text-sm p-2 hover:bg-indigo-50 font-semibold rounded">
                                                View Draft
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">
                                    새로 인입된 크리에이터 요청이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Creators Roster */}
            <h2 className="text-xl font-bold text-slate-800 mb-4">Partner Roster</h2>
            <div className="grid grid-cols-3 gap-6">
                {creators && creators.length > 0 ? (
                    creators.map((c: any) => (
                        <div key={c.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-900">{c.creator_name}</h3>
                                    <a href={`https://instagram.com/${c.handle}`} target="_blank" className="text-xs text-indigo-500 hover:underline flex items-center gap-1 mt-1">
                                        @{c.handle} <ExternalLink size={10} />
                                    </a>
                                </div>
                                <span className={`w-2 h-2 rounded-full ${c.professional_account_status === 'connected' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                            </div>
                            <div className="text-xs text-slate-500 space-y-1 mb-4">
                                <p><span className="font-semibold w-16 inline-block">Platform:</span> <span className="uppercase">{c.platform}</span></p>
                                <p><span className="font-semibold w-16 inline-block">Disclosure:</span> {c.disclosure_required ? 'Required (Paid)' : 'Organic'}</p>
                            </div>
                            <button className="w-full text-center text-sm font-semibold text-slate-700 border border-slate-200 py-2 rounded hover:bg-slate-50 transition">
                                View Profile & Scorecard
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 p-8 border border-dashed border-slate-300 rounded-xl text-center text-slate-400">
                        등록된 파트너 크리에이터가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
