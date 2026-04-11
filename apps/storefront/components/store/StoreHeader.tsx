'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useIndustry } from './ThemeProvider';

interface StoreHeaderProps {
  tenantName: string;
  tenantSlug: string;
  customNodes?: { id: string, label: string, enabled: boolean }[];
  logoUrl?: string;
}

const INDUSTRY_NODES: Record<string, { id: string, label: string, enabled: boolean }[]> = {
  skincare: [
    { id: 'solutions', label: '고민별 솔루션', enabled: true },
    { id: 'answers', label: '공식 답변', enabled: true },
    { id: 'compare', label: '비교', enabled: true },
    { id: 'media', label: '스토리·가이드·리뷰', enabled: true },
    { id: 'trust', label: '신뢰(Trust)', enabled: true },
    { id: 'trust/experts', label: '전문가 위원회', enabled: true },
    { id: 'routines', label: '루틴', enabled: true },
    { id: 'products', label: '제품·번들', enabled: true }
  ],
  clinic: [
    { id: 'solutions', label: '진료 과목', enabled: true },
    { id: 'answers', label: '시술 FAQ', enabled: true },
    { id: 'media', label: '치료 케이스', enabled: true },
    { id: 'trust', label: '의학적 신뢰', enabled: true },
    { id: 'trust/experts', label: '의료진 소개', enabled: true },
    { id: 'products', label: '원내 화장품', enabled: true }
  ],
  real_estate: [
    { id: 'solutions', label: '테마별 매물', enabled: true },
    { id: 'answers', label: '계약 절차/가이드', enabled: true },
    { id: 'media', label: '거래 완료 레퍼런스', enabled: true },
    { id: 'trust', label: '중개 법인 정보', enabled: true },
    { id: 'trust/experts', label: '책임 중개인', enabled: true }
  ],
  consulting: [
    { id: 'solutions', label: '컨설팅 솔루션', enabled: true },
    { id: 'answers', label: '진행 절차/과정', enabled: true },
    { id: 'media', label: '인사이트 칼럼', enabled: true },
    { id: 'trust', label: 'Why Us', enabled: true },
    { id: 'trust/experts', label: '주요 파트너', enabled: true },
    { id: 'portfolio', label: '성공 사례', enabled: true }
  ]
};

export function StoreHeader({ tenantName, tenantSlug, customNodes, logoUrl }: StoreHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const industry = useIndustry();
  const defaultNodes = INDUSTRY_NODES[industry] || INDUSTRY_NODES['skincare'];

  // Merge custom nodes over default nodes
  let activeNodes = defaultNodes.map(def => {
     if (!customNodes) return def;
     const found = customNodes.find((n: any) => n.id === def.id);
     return found ? { ...def, label: found.label, enabled: found.enabled } : def;
  });

  // Filter out disabled nodes
  activeNodes = activeNodes.filter(n => n.enabled);

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-[var(--theme-surface)]/60" style={{ borderBottom: '1px solid var(--theme-border)', backgroundColor: 'var(--theme-surface)' }}>
        <div className="container mx-auto flex h-[70px] items-center px-4 justify-between">
          
          <div className="flex items-center">
            <Link href={`/${tenantSlug}`} className="font-bold tracking-tight text-lg mr-8 flex items-center">
              {logoUrl ? (
                <img src={logoUrl} alt={tenantName} className="h-10 w-auto mr-1 object-contain dark:invert-0" style={{ maxWidth: '180px' }} />
              ) : (
                tenantName
              )}
              <span className="text-muted-foreground font-normal ml-2 text-sm hidden sm:inline">| 공식 홈</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 gap-6 items-center text-sm font-medium">
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

          {/* Utilities & Mobile Toggle */}
          <div className="flex gap-3 items-center ml-auto">
            <Link href={`/${tenantSlug}/search`} className="text-sm font-medium hover:text-primary bg-muted px-3 py-1.5 rounded-full flex gap-2 items-center">
               <span>🔍</span> <span className="hidden sm:inline">검색</span>
            </Link>
            <button className="hidden sm:block text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 rounded-md font-medium">
               로그인
            </button>

            {/* Hamburger Button (Mobile Only) */}
            <button 
              className="md:hidden p-2 rounded-md hover:bg-muted text-foreground ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[70px] z-40 bg-[var(--theme-surface)] overflow-y-auto" style={{ borderTop: '1px solid var(--theme-border)' }}>
          <nav className="flex flex-col p-6 gap-6">
            {activeNodes.map(node => (
              <Link 
                 key={node.id}
                 href={`/${tenantSlug}/${node.id}`} 
                 onClick={() => setIsMobileMenuOpen(false)}
                 className={`text-lg font-medium border-b border-[var(--theme-border)] pb-4 hover:text-primary transition-colors ${node.id === 'trust' ? 'flex items-center gap-2 hover:text-green-600' : ''} ${node.id === 'routines' ? 'text-blue-600 font-bold' : ''}`}
              >
                 {node.id === 'trust' && (
                    <span className="relative flex h-3 w-3 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                 )}
                 {node.label}
              </Link>
            ))}
            <div className="mt-8 pt-4 border-t border-[var(--theme-border)] flex flex-col gap-4">
               <button className="w-full text-base border border-input bg-background hover:bg-accent hover:text-accent-foreground py-3 rounded-md font-medium">
                 로그인 / 회원가입
               </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
