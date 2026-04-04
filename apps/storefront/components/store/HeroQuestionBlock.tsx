import React from 'react';

export function HeroQuestionBlock({ question, snippet, category }: { question: string, snippet: string, category: string }) {
  return (
    <div className="py-16 md:py-24 max-w-4xl">
      <div className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest uppercase bg-black text-white rounded-sm">
        {category}
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-8 font-[family-name:var(--theme-font)]">
        &quot;{question}&quot;
      </h1>
      <p className="text-xl md:text-2xl opacity-80 font-light leading-relaxed max-w-3xl border-l-[3px] border-[var(--theme-primary)] pl-6 py-2">
        {snippet}
      </p>
    </div>
  );
}
