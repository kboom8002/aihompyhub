import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bot, Camera as Instagram, PenTool, CheckCircle, Clock, Search, ExternalLink } from 'lucide-react';

// Mock UI Layout for Content Studio Admin
export default async function TenantInstagramStudioPage({ params }: { params: { tenantId: string } }) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Fetch Drafts
    const { data: drafts } = await supabaseAdmin.from('content_drafts')
        .select('*')
        .eq('tenant_id', params.tenantId)
        .order('created_at', { ascending: false })
        .limit(20);

    return (
        <div className="p-8 max-w-6xl mx-auto font-sans">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Instagram className="text-pink-600" size={32} />
                        Instagram Studio
                    </h1>
                    <p className="text-slate-500 mt-2">정본(SSoT) 기반 소셜 콘텐츠 기획 및 자동 배포</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-md font-medium">
                        <PenTool size={16} /> Creator Requests
                    </button>
                    <button className="flex gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md font-medium">
                        <Bot size={16} /> 신규 AI 초안 생성
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-4 gap-4 mb-8">
                {['draft', 'brand_review', 'scheduled', 'published'].map((status) => (
                    <div key={status} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">{status}</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {drafts?.filter(d => d.status === status).length || 0}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-semibold text-slate-700">Content Drafts & Workspace</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Search UTM or Campaign..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white w-64 outline-none focus:ring-2 focus:ring-pink-100" />
                    </div>
                </div>
                
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 bg-slate-50">
                            <th className="p-4 font-semibold">Campaign / Target SSoT</th>
                            <th className="p-4 font-semibold">Format</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Landing UTM (AEO/GEO)</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {drafts && drafts.length > 0 ? (
                            drafts.map((d: any) => (
                                <tr key={d.id} className="hover:bg-slate-50 transition">
                                    <td className="p-4">
                                        <div className="font-semibold text-indigo-900">{d.campaign_id || 'Campaign Name'}</div>
                                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            {d.format_type === 'reel' ? <Instagram size={12}/> : <PenTool size={12}/>}
                                            {d.topic_refs && d.topic_refs.length > 0 ? `Topic Linked` : 'General Update'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs uppercase font-medium">{d.format_type}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold flex items-center gap-1 w-max ${
                                            d.status === 'published' ? 'bg-green-100 text-green-700' :
                                            d.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                            d.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {d.status === 'published' && <CheckCircle size={12}/>}
                                            {d.status === 'scheduled' && <Clock size={12}/>}
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {d.landing_url ? (
                                            <div className="flex flex-col gap-1">
                                                <a href={d.landing_url} target="_blank" className="text-pink-600 hover:underline flex items-center gap-1 text-xs font-semibold truncate max-w-[200px]">
                                                    {d.landing_url.replace('https://', '')} <ExternalLink size={10} />
                                                </a>
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded truncate max-w-[200px]">
                                                    UTM: {d.campaign_id}
                                                </span>
                                            </div>
                                        ) : <span className="text-xs text-slate-400 italic">No Landing Bind</span>}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-indigo-600 text-sm p-2 hover:bg-indigo-50 font-semibold rounded">
                                            Review & Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full text-slate-300 border border-slate-200 border-dashed">
                                            <Instagram size={24} />
                                        </div>
                                        <p>아직 생성된 콘텐츠 초안이 없습니다.<br/>우측 상단 <b>신규 AI 초안 생성</b>을 눌러 SSoT 기반 콘텐츠를 기획해보세요.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
