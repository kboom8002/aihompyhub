import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Activity, BarChart4, Box, Users, BrainCircuit } from 'lucide-react';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const revalidate = 0;

export default async function FactoryAnalyticsPage() {
    // 1. Fetch Global Inquiries
    const { data: inquiries } = await supabaseAdmin.from('inquiries').select('*, tenants(name)');
    const { data: tenants } = await supabaseAdmin.from('tenants').select('id, name');
    
    const safeInquiries = inquiries || [];
    const totalInquiries = safeInquiries.length;
    const structuredInquiries = safeInquiries.filter(i => i.status === 'structured').length;
    
    // Group by tenant
    const tenantStats = (tenants || []).map(t => {
        const tenantInqs = safeInquiries.filter(i => i.tenant_id === t.id);
        const st = tenantInqs.filter(i => i.status === 'structured').length;
        const total = tenantInqs.length;
        return {
            id: t.id,
            name: t.name,
            total,
            structured: st,
            ratio: total > 0 ? Math.round((st / total) * 100) : 0
        };
    }).sort((a,b) => b.total - a.total);

    return (
        <div className="font-sans max-w-7xl mx-auto text-white">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                    <BarChart4 className="text-indigo-500" />
                    Deal Room Central Analytics
                </h1>
                <p className="text-slate-400">모든 테넌트들의 Deal Room 인입 및 AI 분석 전환율 통계를 실시간으로 집계합니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-indigo-500/20 p-3 rounded-xl"><Activity className="text-indigo-400 w-6 h-6"/></div>
                        <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-2 py-1 rounded-full">+12% this week</span>
                    </div>
                    <h3 className="text-slate-400 font-bold mb-1">Total Inbound Leads</h3>
                    <p className="text-4xl font-black">{totalInquiries}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-pink-500/20 p-3 rounded-xl"><BrainCircuit className="text-pink-400 w-6 h-6"/></div>
                        <span className="bg-pink-500/10 text-pink-400 text-xs font-bold px-2 py-1 rounded-full">AI Pipeline Ratio</span>
                    </div>
                    <h3 className="text-slate-400 font-bold mb-1">AI Structured & Coached</h3>
                    <div className="flex items-end gap-2">
                         <p className="text-4xl font-black">{structuredInquiries}</p>
                         <p className="text-slate-500 mb-1 font-bold text-lg">/ {totalInquiries}</p>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-500/20 p-3 rounded-xl"><Users className="text-emerald-400 w-6 h-6"/></div>
                        <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">Top Performer</span>
                    </div>
                    <h3 className="text-slate-400 font-bold mb-1">Highest Conversion Tenant</h3>
                    <p className="text-2xl font-bold truncate pr-4 text-emerald-400">{tenantStats.length > 0 && tenantStats[0].total > 0 ? tenantStats[0].name : 'N/A'}</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Box className="text-indigo-400" size={20}/>
                    Tenant Adoption Leaderboard
                </h2>
                
                <div className="space-y-4">
                    {tenantStats.map((stats, idx) => (
                        <div key={idx} className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-4 w-1/3">
                                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-300">
                                    {idx + 1}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-200">{stats.name}</h4>
                                    <p className="text-xs text-slate-500 font-mono text-ellipsis overflow-hidden whitespace-nowrap w-32">{stats.id}</p>
                                </div>
                            </div>
                            
                            <div className="flex-1 px-8">
                                <div className="w-full bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${stats.ratio}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-slate-400 font-bold">
                                    <span>AI Adoption: {stats.ratio}%</span>
                                    <span>{stats.structured} / {stats.total} Leads Structured</span>
                                </div>
                            </div>
                            
                            <div className="w-32 text-right">
                                {stats.ratio >= 80 ? (
                                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">Excellent</span>
                                ) : stats.ratio >= 50 ? (
                                    <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20">Good</span>
                                ) : (
                                    <span className="bg-slate-700 text-slate-400 px-3 py-1 rounded-full text-xs font-bold border border-slate-600">Needs Training</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {tenantStats.length === 0 && (
                        <p className="text-slate-500 text-center py-10">No tenant data available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
