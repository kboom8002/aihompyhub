'use client';

import React, { useState, useEffect } from 'react';
import { Database, Check, DownloadCloud, Store } from 'lucide-react';
import { fetchIndustryQuestionPool, pullClusterToTenantAction } from '../../../../../actions/qis-actions';
import { useParams } from 'next/navigation';

export default function TenantQuestionPoolPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const industryType = 'skincare'; // Mocked or fetched from context in prod

  const [pool, setPool] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
     loadPool();
  }, [tenantId]);

  const loadPool = async () => {
      setLoading(true);
      const res = await fetchIndustryQuestionPool(industryType, tenantId);
      if (res.success && res.data) {
          setPool(res.data);
      } else {
          setErrorMsg(res.error || '목록을 불러오는 중 오류가 발생했습니다.');
      }
      setLoading(false);
  };

  const handlePull = async (cluster: any) => {
     const res = await pullClusterToTenantAction(tenantId, cluster.id, cluster.cluster_name);
     if (res.success) {
         alert(`[${cluster.cluster_name}] 질문이 내 Topic Hub로 복사되었습니다.\n이제 공식 답변(Answer)을 작성할 수 있습니다!`);
         // Optimistic update
         setPool(prev => prev.map(c => c.id === cluster.id ? { ...c, isPulled: true } : c));
     } else {
         alert('오류: ' + res.error);
     }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 font-sans">
      <div className="mb-6 border-b pb-4">
         <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="text-pink-500" />
            본사 스탠다드 Question Pool
         </h1>
         <p className="text-slate-500 mt-2">
            AIHompy 본사에서 {industryType} 업종의 트렌드를 분석하여 뽑아낸 표준 질문(Standard Intents) 카탈로그입니다.<br/>
            원하는 질문을 끌어와(Pull) 고객들에게 제공할 공식 답변을 작성해 보세요.
         </p>
      </div>

      {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 rounded">
              {errorMsg}
          </div>
      )}

      {loading ? (
          <p className="text-slate-500">불러오는 중...</p>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pool.length === 0 && (
                  <p className="text-slate-500">현재 업종에 등록된 스탠다드 질문이 없습니다.</p>
              )}

              {pool.map(item => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 font-mono">GLOBAL ID: {item.id.split('-')[0]}</span>
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs">WEIGHT: {item.priority_score}</span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 mb-4">{item.cluster_name}</h3>

                      <div className="pt-3 border-t border-slate-100">
                          {item.isPulled ? (
                              <div className="w-full bg-slate-100 text-emerald-600 font-bold py-2 rounded-lg flex items-center justify-center gap-2 cursor-default">
                                  <Check size={16} />
                                  내 저장소에 추가됨 (작성 진행중)
                              </div>
                          ) : (
                              <button 
                                onClick={() => handlePull(item)}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition"
                              >
                                  <DownloadCloud size={16} />
                                  이 질문 가져오기 (Pull)
                              </button>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}
