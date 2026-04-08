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
  description?: string;
  textMode?: 'dark' | 'light';
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export function BrandHero({ summary, voice, skinTheme, tenantSlug, heroImage, description, textMode = 'dark', primaryCtaText, primaryCtaLink, secondaryCtaText, secondaryCtaLink }: BrandHeroProps) {
  const isLightText = textMode === 'dark'; // 'dark' mode means dark background -> needs light text

  return (
    <div className="relative w-full h-[450px] md:h-[500px] min-h-[45vh] flex items-center justify-center overflow-hidden">
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
      <div className={`absolute inset-0 bg-gradient-to-b ${isLightText ? 'from-black/40 via-transparent to-black/60 mix-blend-multiply' : 'from-white/40 via-transparent to-white/60 mix-blend-overlay'}`} />
      
      {/* Hero Content (Glassmorphism) */}
      <div className={`relative z-10 p-10 md:p-14 text-center border rounded-2xl backdrop-blur-md shadow-2xl max-w-4xl mx-4 transition-all ${isLightText ? 'border-white/20 bg-white/10 hover:bg-white/15' : 'border-black/10 bg-white/40 hover:bg-white/50'}`}>
        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase mb-6 shadow-sm ${isLightText ? 'bg-white/20 text-white' : 'bg-black/10 text-gray-900 border border-gray-900/20'}`}>
          {voice} Voice
        </span>
        <h1 className={`text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight ${isLightText ? 'text-white drop-shadow-2xl' : 'text-gray-900 drop-shadow-md'}`} style={{ fontFamily: 'var(--theme-font, inherit)' }}>
          {summary || 'Premium Botanical Skincare'}
        </h1>
        <p className={`mt-6 text-lg md:text-xl font-medium max-w-2xl mx-auto tracking-wide whitespace-pre-line ${isLightText ? 'text-white/90 font-light' : 'text-gray-700 font-medium'}`}>
          {description || 'AI-Crafted canonical answers and routines for absolute trust and transparency.\nDiscover the verified difference.'}
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link href={primaryCtaLink || `/${tenantSlug || 'skincare-brand'}/routines`}>
             <Button size="lg" style={{ background: 'var(--theme-primary)', color: 'var(--theme-surface)', borderRadius: 'var(--theme-radius)' }} className="hover:opacity-90 px-8 tracking-wider border-none font-semibold">
               {primaryCtaText || '내 루틴/리셋 찾기'}
             </Button>
          </Link>
          <Link href={secondaryCtaLink || `/${tenantSlug || 'skincare-brand'}/solutions`}>
             <Button size="lg" style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-surface)', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 'var(--theme-radius)' }} className="border-2 hover:bg-black/60 px-8 tracking-wider font-semibold">
               {secondaryCtaText || '고민별 공식 답변 보기'}
             </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
