import React from 'react';
import Link from 'next/link';

interface StoreHeaderProps {
  tenantName: string;
  tenantSlug: string;
  customNodes?: { id: string, label: string, enabled: boolean }[];
}

const DEFAULT_NODES = [
  { id: 'solutions', label: '고민별 솔루션', enabled: true },
  { id: 'answers', label: '공식 답변', enabled: true },
  { id: 'compare', label: '비교', enabled: true },
  { id: 'media', label: '스토리·가이드·리뷰', enabled: true },
  { id: 'trust', label: '신뢰(Trust)', enabled: true },
  { id: 'routines', label: '루틴', enabled: true },
  { id: 'products', label: '제품·번들', enabled: true }
];

export function StoreHeader({ tenantName, tenantSlug, customNodes }: StoreHeaderProps) {
  // Merge custom nodes over default nodes
  let activeNodes = DEFAULT_NODES.map(def => {
     if (!customNodes) return def;
     const found = customNodes.find((n: any) => n.id === def.id);
     return found ? { ...def, label: found.label, enabled: found.enabled } : def;
  });

  // Filter out disabled nodes
  activeNodes = activeNodes.filter(n => n.enabled);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-[var(--theme-surface)]/60" style={{ borderBottom: '1px solid var(--theme-border)', backgroundColor: 'var(--theme-surface)' }}>
      <div className="container mx-auto flex h-[70px] items-center px-4">
        <Link href={`/${tenantSlug}`} className="font-bold tracking-tight text-lg mr-8 flex items-center">
          {tenantName} 
          <span className="text-muted-foreground font-normal ml-2 text-sm">| 공식 홈</span>
        </Link>
        
        {/* Dynamic IA Configured LNB */}
        <nav className="flex-1 flex gap-6 items-center text-sm font-medium">
          {activeNodes.map(node => (
            <Link 
               key={node.id}
               href={`/${tenantSlug}/${node.id}`} 
               className={`hover:text-primary transition-colors ${node.id === 'trust' ? 'flex items-center gap-1 hover:text-green-600' : ''} ${node.id === 'routines' ? 'text-blue-600 font-semibold' : ''}`}
            >
               {node.id === 'trust' && (
                  <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
               )}
               {node.label}
            </Link>
          ))}
        </nav>

        {/* Utilities */}
        <div className="flex gap-3 items-center ml-auto">
          <Link href={`/${tenantSlug}/search`} className="text-sm font-medium hover:text-primary bg-muted px-3 py-1.5 rounded-full flex gap-2 items-center">
             <span>🔍</span> 검색
          </Link>
          <button className="text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 rounded-md font-medium">
             로그인
          </button>
        </div>
      </div>
    </header>
  );
}
