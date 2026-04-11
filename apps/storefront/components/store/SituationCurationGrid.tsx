import React from 'react';
import Link from 'next/link';

interface Props {
  tenantSlug: string;
  answerCards: any[];
  situations?: { id: string, title: string, desc: string }[];
}

export function SituationCurationGrid({ tenantSlug, answerCards, situations }: Props) {
  // If there are no real categorized answers, just show them as a masonry grid
  // with a "Context-first" header or group them randomly for demo purposes.
  // Real implementation would group by "related_reset_moment" or "intent" in json_payload.

  const currentSituations = situations || [
    { id: 'clinic', title: '시술 후 관리 Q&A', desc: '집에서 시술 효과를 극대화하는 법' },
    { id: 'trouble', title: '응급 트러블 진정', desc: '열감, 붉은기 등 빠른 대처가 필요할 때' }
  ];

  // Distribute cards dynamically for demo if no strict relation mapping is enforced
  // Real implementation would use card.json_payload.intent === situation.id
  const groupedData: Record<string, any[]> = {};
  currentSituations.forEach((sit, idx) => {
     // Evenly distribute cards into the number of situations provided
     const total = answerCards.length;
     const chunkSize = Math.ceil(total / currentSituations.length);
     groupedData[sit.id] = answerCards.slice(idx * chunkSize, (idx + 1) * chunkSize);
  });

  return (
    <div className="w-full">
      <div className="text-center mb-12">
         <span className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2 block">Situation First</span>
         <h2 className="text-3xl font-[family-name:var(--theme-font)] font-semibold text-gray-900">상황별 필수 지식 & 루틴</h2>
      </div>

      <div className="flex flex-col gap-16 max-w-6xl mx-auto px-4 md:px-0">
        {currentSituations.map(situation => (
           <div key={situation.id} className="w-full">
              <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between border-b border-[var(--theme-border)] pb-4">
                 <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                       <span className="w-2 h-6 bg-[var(--theme-primary)] inline-block rounded-sm"></span>
                       {situation.title}
                    </h3>
                    <p className="text-gray-500 mt-2 text-sm">{situation.desc}</p>
                 </div>
                 <Link href={`/${tenantSlug}/search?q=${encodeURIComponent(situation.title)}`} className="text-sm font-semibold text-[var(--theme-primary)] hover:underline mt-4 md:mt-0">
                    전체 보기 &rarr;
                 </Link>
              </div>

              {groupedData[situation.id as keyof typeof groupedData]?.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedData[situation.id as keyof typeof groupedData].map((card: any, idx: number) => {
                       const payload = card.json_payload || {};
                       const sb = card.structured_body || {};
                       const title = payload.title || sb.title || card.topics?.title || '상황 대처 메뉴얼';
                       const snippet = payload.summary || sb.snippet || sb.content || '이 상황에 대처하는 브랜드 전문가의 SSoT 솔루션입니다.';
                       const plainSnippet = snippet.replace(/(<([^>]+)>)/gi, "").substring(0, 80) + '...';

                       return (
                          <Link href={`/${tenantSlug}/answers/${card.id}`} key={idx} className="group block h-full bg-white border border-[var(--theme-border)] rounded-2xl overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                             <div className="p-6 flex-1 flex flex-col">
                                <span className="text-[10px] font-bold text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 px-2 py-1 rounded mb-4 inline-table self-start uppercase tracking-widest">
                                   Official Answer
                                </span>
                                <h4 className="text-lg font-bold leading-snug mb-3 group-hover:text-[var(--theme-primary)] transition-colors">
                                   Q. {title}
                                </h4>
                                <p className="text-sm text-gray-500 leading-relaxed font-light">
                                   {plainSnippet}
                                </p>
                             </div>
                             <div className="bg-gray-50 py-3 px-6 border-t border-[var(--theme-border)] flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500">답변 자세히 보기</span>
                                <span className="text-[var(--theme-primary)] group-hover:translate-x-1 transition-transform">&rarr;</span>
                             </div>
                          </Link>
                       );
                    })}
                 </div>
              ) : (
                 <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                    해당 상황에 등록된 SSoT 가이드가 없습니다.
                 </div>
              )}
           </div>
        ))}
      </div>
    </div>
  );
}
