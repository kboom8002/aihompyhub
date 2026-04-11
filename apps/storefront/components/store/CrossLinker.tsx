import React from 'react';
import Link from 'next/link';

interface CrossLinkItem {
  id: string;
  title: string;
  type?: string;
}

interface CrossLinkerProps {
  tenantSlug: string;
  experts?: CrossLinkItem[];
  evidence?: CrossLinkItem[];
  topics?: CrossLinkItem[];
}

export function CrossLinker({ tenantSlug, experts, evidence, topics }: CrossLinkerProps) {
  const hasExperts = experts && experts.length > 0;
  const hasEvidence = evidence && evidence.length > 0;
  const hasTopics = topics && topics.length > 0;

  if (!hasExperts && !hasEvidence && !hasTopics) return null;

  return (
    <div className="mt-16 p-6 md:p-8 bg-gray-50 border border-gray-200 rounded-2xl">
      <h3 className="text-lg font-bold mb-6 font-[family-name:var(--theme-font)] flex items-center gap-2">
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
         연관 지식 및 보증 보드
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Experts */}
        {hasExperts && (
          <div className="flex flex-col gap-3">
             <div className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                🩺 참여 전문가
             </div>
             {experts.map(expert => (
                <Link key={expert.id} href={`/${tenantSlug}/trust/experts/${expert.id}`} className="group block bg-white border border-gray-200 p-4 rounded-xl hover:border-[var(--theme-primary)] hover:shadow-md transition-all">
                   <div className="text-sm font-bold group-hover:text-[var(--theme-primary)] mb-1">{expert.title}</div>
                   <div className="text-xs text-blue-600 font-medium group-hover:underline">프로필 확인 &rarr;</div>
                </Link>
             ))}
          </div>
        )}

        {/* Evidence */}
        {hasEvidence && (
          <div className="flex flex-col gap-3">
             <div className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                🔬 신뢰 근거 문서
             </div>
             {evidence.map(ev => (
                <Link key={ev.id} href={`/${tenantSlug}/trust/${ev.id}`} className="group block bg-white border border-gray-200 p-4 rounded-xl hover:border-[var(--theme-primary)] hover:shadow-md transition-all">
                   <div className="text-sm font-bold group-hover:text-[var(--theme-primary)] mb-1 line-clamp-2">{ev.title}</div>
                   <div className="text-xs text-green-600 font-medium group-hover:underline">문헌 원본 보기 &rarr;</div>
                </Link>
             ))}
          </div>
        )}

        {/* Topics Hub */}
        {hasTopics && (
          <div className="flex flex-col gap-3">
             <div className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                📚 대분류 지식 허브
             </div>
             {topics.map(topic => (
                <Link key={topic.id} href={`/${tenantSlug}/topics/${topic.id}`} className="group block bg-white border border-gray-200 p-4 rounded-xl hover:border-[var(--theme-primary)] hover:shadow-md transition-all">
                   <div className="text-xs text-gray-400 mb-1">Topic Hub</div>
                   <div className="text-sm font-bold group-hover:text-[var(--theme-primary)]">{topic.title}</div>
                </Link>
             ))}
          </div>
        )}

      </div>
    </div>
  );
}
