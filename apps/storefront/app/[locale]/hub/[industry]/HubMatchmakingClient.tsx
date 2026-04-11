'use client';

import { useState } from 'react';
import { submitPodMemoAction, getPodMatchmakingAction, ensureVerticalPodAction } from '@/app/actions/pod-actions';

export default function HubMatchmakingClient({ locale, industry }: { locale: string, industry: string }) {
  const [memo, setMemo] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private_match'>('public');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);

  const handleSubmit = async () => {
    if (!memo.trim()) return;

    // Hardcode test user for demo since auth isn't fully piped to storefront yet, or use 'guest'
    // Ideally user is from a Session context. Using an empty guid for demo placeholder:
    const mockUserId = '00000000-0000-0000-0000-000000000000'; 

    setLoading(true);
    try {
      const podId = await ensureVerticalPodAction(industry);
      if (!podId) throw new Error("Could not initialize the Global Pod for this industry.");

      const res = await submitPodMemoAction(mockUserId, podId, memo, visibility);
      if (res.success) {
        setResult(res.structuredIntent);
        
        // Fetch matches
        if (res.memoId) {
           const matchRes = await getPodMatchmakingAction(res.memoId, industry);
           if (matchRes.success) setMatches(matchRes.matches);
        }
      } else {
        alert('Failed to submit memo: ' + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-neutral-200">
      <div className="mb-6">
        <label className="block text-sm font-semibold text-neutral-800 mb-2">당신의 상황이나 필요를 구체적으로 적어주세요. (AI 매치메이커가 분석합니다)</label>
        <textarea 
          placeholder="예: 예산 5천만원으로 초기 스킨케어 브랜드 기초 라인업 런칭을 준비하고 있습니다..."
          className="w-full min-h-[160px] p-4 text-base border-2 border-neutral-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer text-sm">
            <input type="radio" checked={visibility === 'public'} onChange={() => setVisibility('public')} className="accent-emerald-600 w-4 h-4" />
            <span>모두에게 공개 (Public Board)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer text-sm">
            <input type="radio" checked={visibility === 'private_match'} onChange={() => setVisibility('private_match')} className="accent-emerald-600 w-4 h-4" />
            <span className="text-neutral-500">은밀한 제안 (Private Match)</span>
          </label>
        </div>
        
        <button 
          onClick={handleSubmit} 
          disabled={loading || !memo.trim()}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full disabled:opacity-50 transition-all"
        >
          {loading ? 'AI 분석 및 매칭중...' : '매칭 및 답변 요청하기'}
        </button>
      </div>

      {result && (
        <div className="mt-8 pt-8 border-t border-neutral-200">
          <h3 className="text-xl font-bold text-neutral-800 mb-4">🚀 AI Intent Analysis</h3>
          <div className="bg-neutral-50 rounded-xl p-6 overflow-x-auto text-sm font-mono whitespace-pre-wrap border border-neutral-200 text-neutral-700 mb-8">
            {JSON.stringify(result, null, 2)}
          </div>

          <h3 className="text-xl font-bold text-neutral-800 mb-4">🎯 Top Matches ({matches.length})</h3>
          {matches.length === 0 ? (
            <p className="text-neutral-500">조건에 완벽하게 일치하는 검증된 답변/역량이 아직 없습니다.</p>
          ) : (
            <div className="grid gap-4">
              {matches.map((m, idx) => (
                <div key={idx} className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-emerald-800 font-bold">{m.title}</div>
                    <div className="text-emerald-600 text-sm mt-1">Tenant ID: {m.tenant_id} | Type: {m.asset_type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-600">{(m.similarity * 100).toFixed(1)}%</div>
                    <div className="text-emerald-500 text-xs">Match Score</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
