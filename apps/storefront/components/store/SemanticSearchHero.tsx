'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  tenantSlug: string;
  summary?: string;
  description?: string;
}

export function SemanticSearchHero({ tenantSlug, summary, description }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const resetMoments = [
    { label: '🔥 토닝 후 열감 (After Toning)', q: '토닝 후 열감 진정' },
    { label: '⚡ 시술 후 집중 관리 (Clinic-Care)', q: '시술 후 관리' },
    { label: '✨ 중요한 날 전 (Special Day)', q: '중요한 날 광채' },
    { label: '🛡️ 장벽 붕괴 응급 (Barrier Emergency)', q: '피부 장벽 복구' }
  ];

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    router.push(`/${tenantSlug}/search?q=${encodeURIComponent(query)}`);
  };

  const handleChipClick = (q: string) => {
    setQuery(q);
    router.push(`/${tenantSlug}/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#f8fafc] to-white border-b border-[var(--theme-border)]">
      {/* Abstract Background pattern */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      <div className="container relative z-10 mx-auto px-4 py-20 md:py-32 flex flex-col items-center justify-center text-center">
        
        <span className="inline-block py-1 px-3 rounded-full bg-black/5 text-[#0f172a] text-xs font-bold tracking-widest uppercase mb-6">
          The Interval &middot; Home Derma Reset
        </span>

        <h1 className="text-4xl md:text-6xl font-[family-name:var(--theme-font)] tracking-tight text-gray-900 mb-6 font-semibold max-w-4xl leading-tight">
          {summary || "오늘 어떤 피부 고민으로\n정확한 타이밍의 리셋이 필요하신가요?"}
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl font-light">
          {description || "일반 스킨케어가 아닙니다. 무너진 피부 상태를 가장 빠르게 정상화하는 SSoT 클리닉 로직을 질문해 보세요."}
        </p>

        {/* Semantic Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-3xl relative mb-12 group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <svg className="w-6 h-6 text-gray-400 group-focus-within:text-[var(--theme-primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white border border-gray-200 shadow-sm text-lg outline-none focus:ring-4 ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] transition-all font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
            placeholder="예) 리프팅 후 페이스라인 정리는 어떻게 하나요?"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className="absolute inset-y-2 right-2 px-6 bg-[var(--theme-text)] text-[var(--theme-surface)] rounded-xl font-bold hover:opacity-90 transition-opacity">
            AI 검색
          </button>
        </form>

        {/* Moments Chips */}
        <div className="flex flex-col items-center w-full max-w-4xl">
          <span className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Quick Reset Moments</span>
          <div className="flex flex-wrap justify-center gap-3">
            {resetMoments.map((moment, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(moment.q)}
                className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-600 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] hover:shadow-md transition-all whitespace-nowrap"
              >
                {moment.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
