import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";

import Link from 'next/link';

interface BrandHeroProps {
  summary: string;
  voice: string;
  skinTheme?: string;
  tenantSlug?: string;
  heroImage?: string;
}

export function BrandHero({ summary, voice, skinTheme, tenantSlug, heroImage }: BrandHeroProps) {
  return (
    <div className="relative w-full h-[650px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src={heroImage || "/skincare_hero_1775271155116.png"}
        alt="Brand Hero"
        fill
        sizes="100vw"
        className="object-cover object-center scale-105 animate-in fade-in zoom-in duration-1000"
        priority
      />
      {/* Dynamic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 mix-blend-multiply" />
      
      {/* Hero Content (Glassmorphism) */}
      <div className="relative z-10 p-10 md:p-14 text-center border border-white/20 rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl max-w-4xl mx-4 transition-all hover:bg-white/15">
        <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold tracking-[0.2em] uppercase mb-6 shadow-sm">
          {voice} Voice
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-tight drop-shadow-2xl" style={{ fontFamily: 'var(--theme-font, inherit)' }}>
          {summary || 'Premium Botanical Skincare'}
        </h1>
        <p className="mt-6 text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto tracking-wide">
          AI-Crafted canonical answers and routines for absolute trust and transparency. 
          Discover the verified difference.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link href={`/${tenantSlug || 'skincare-brand'}/routines`}>
             <Button size="lg" style={{ background: 'var(--theme-primary)', color: 'var(--theme-surface)', borderRadius: 'var(--theme-radius)' }} className="hover:opacity-90 px-8 tracking-wider border-none font-semibold">
               내 루틴/리셋 찾기
             </Button>
          </Link>
          <Link href={`/${tenantSlug || 'skincare-brand'}/solutions`}>
             <Button size="lg" style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-surface)', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 'var(--theme-radius)' }} className="border-2 hover:bg-black/60 px-8 tracking-wider font-semibold">
               고민별 공식 답변 보기
             </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
