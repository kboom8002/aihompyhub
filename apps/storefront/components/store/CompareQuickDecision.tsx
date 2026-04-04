import React from 'react';

interface CompareProfile {
  name: string;
  targetFit: string;
  description: string;
  isPrimary?: boolean;
}

export function CompareQuickDecision({ profileA, profileB }: { profileA: CompareProfile, profileB: CompareProfile }) {
  return (
    <div className="flex flex-col md:flex-row gap-0 overflow-hidden rounded-[var(--theme-radius)] border border-[var(--theme-border)] shadow-sm my-8">
      {/* Profile A */}
      <div className={`flex-1 p-6 flex flex-col ${profileA.isPrimary ? 'bg-[var(--theme-surface)]' : 'bg-[#f8fafc]'}`}>
         <div className="text-xs font-bold tracking-widest uppercase mb-2 opacity-60">Option A</div>
         <h3 className="text-2xl font-semibold mb-3 font-[family-name:var(--theme-font)]">{profileA.name}</h3>
         <div className="bg-green-50 text-green-800 text-sm font-medium py-1.5 px-3 rounded-md mb-4 self-start">
            Best for: {profileA.targetFit}
         </div>
         <p className="opacity-80 leading-relaxed text-sm flex-1">{profileA.description}</p>
         <button className="mt-6 text-sm font-semibold border border-[var(--theme-primary)] text-[var(--theme-primary)] py-2 px-4 rounded-full self-start hover:bg-black/5 transition-colors">
            자세히 보기
         </button>
      </div>

      <div className="w-full md:w-px h-px md:h-auto bg-[var(--theme-border)] flex items-center justify-center relative">
         <span className="absolute bg-[var(--theme-surface)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-full px-2 py-1 text-xs font-black shadow-sm z-10">VS</span>
      </div>

      {/* Profile B */}
      <div className={`flex-1 p-6 flex flex-col ${profileB.isPrimary ? 'bg-[var(--theme-surface)]' : 'bg-[#f8fafc]'}`}>
         <div className="text-xs font-bold tracking-widest uppercase mb-2 opacity-60">Option B</div>
         <h3 className="text-2xl font-semibold mb-3 font-[family-name:var(--theme-font)]">{profileB.name}</h3>
         <div className="bg-blue-50 text-blue-800 text-sm font-medium py-1.5 px-3 rounded-md mb-4 self-start">
            Best for: {profileB.targetFit}
         </div>
         <p className="opacity-80 leading-relaxed text-sm flex-1">{profileB.description}</p>
         <button className="mt-6 text-sm font-semibold border border-[var(--theme-primary)] text-[var(--theme-primary)] py-2 px-4 rounded-full self-start hover:bg-black/5 transition-colors">
            자세히 보기
         </button>
      </div>
    </div>
  );
}
