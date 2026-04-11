'use client';
import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { useIndustry } from './ThemeProvider';
import Link from 'next/link';

interface BrandHeroProps {
  summary: string;
  voice: string;
  skinTheme?: string;
  tenantSlug?: string;
  heroImage?: string;
  heroTemplate?: 'glass_card' | 'transparent_text';
  description?: string;
  textMode?: 'dark' | 'light';
  voiceBadge?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export function BrandHero({ summary, voice, skinTheme, tenantSlug, heroImage, heroTemplate = 'glass_card', description, textMode = 'dark', voiceBadge, primaryCtaText, primaryCtaLink, secondaryCtaText, secondaryCtaLink }: BrandHeroProps) {
  const isLightText = textMode === 'dark'; // 'dark' mode means dark background -> needs light text
  const industry = useIndustry();

  // 업종별 기본 라벨 오버라이딩 처리
  const defaultCta1 = industry === 'clinic' ? '진료/예약하기' : 
                      industry === 'real_estate' ? '매물 의뢰하기' : 
                      industry === 'consulting' ? '사전 상담 신청' : '내 루틴/리셋 찾기';

  const defaultCta2 = industry === 'clinic' ? '주요 시술 및 FAQ' :
                      industry === 'real_estate' ? '계약 및 중개 절차' :
                      industry === 'consulting' ? '성공 케이스 보기' : '고민별 공식 답변 보기';

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
      
      {/* Hero Content (Glassmorphism or Transparent Text) */}
      {heroTemplate === 'glass_card' ? (
        <div className={`relative z-10 p-10 md:p-14 text-center border rounded-2xl backdrop-blur-md shadow-2xl max-w-4xl mx-4 transition-all ${isLightText ? 'border-white/20 bg-white/10 hover:bg-white/15' : 'border-black/10 bg-white/40 hover:bg-white/50'}`}>
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase mb-6 shadow-sm ${isLightText ? 'bg-white/20 text-white' : 'bg-black/10 text-gray-900 border border-gray-900/20'}`}>
            {voiceBadge || `${voice} Voice`}
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
                 {primaryCtaText || defaultCta1}
               </Button>
            </Link>
            <Link href={secondaryCtaLink || `/${tenantSlug || 'skincare-brand'}/solutions`}>
               <Button size="lg" style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-surface)', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 'var(--theme-radius)' }} className="border-2 hover:bg-black/60 px-8 tracking-wider font-semibold">
                 {secondaryCtaText || defaultCta2}
               </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative z-10 p-4 md:p-14 text-center max-w-5xl mx-4 transition-all">
          <h1 className={`text-4xl md:text-6xl lg:text-8xl font-black tracking-tight leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] ${isLightText ? 'text-white' : 'text-gray-900 drop-shadow-sm'}`} style={{ fontFamily: 'var(--theme-font, inherit)' }}>
            {summary || 'Premium Botanical Skincare'}
          </h1>
          {description && (
             <p className={`mt-8 text-xl md:text-2xl font-medium max-w-3xl mx-auto tracking-wide whitespace-pre-line drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${isLightText ? 'text-white/95' : 'text-gray-800'}`}>
                {description}
             </p>
          )}
          {(primaryCtaText || secondaryCtaText) && (
            <div className="mt-12 flex gap-6 justify-center">
              {primaryCtaText || defaultCta1 && (
                <Link href={primaryCtaLink || `/${tenantSlug || 'skincare-brand'}/routines`}>
                   <Button size="lg" style={{ background: isLightText ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: isLightText ? '#fff' : '#000', borderRadius: 'var(--theme-radius)', backdropFilter: 'blur(10px)' }} className="hover:bg-white/20 px-10 tracking-widest border border-white/30 font-semibold shadow-lg text-lg py-6">
                     {primaryCtaText || defaultCta1}
                   </Button>
                </Link>
              )}
              {secondaryCtaText || defaultCta2 && (
                <Link href={secondaryCtaLink || `/${tenantSlug || 'skincare-brand'}/solutions`}>
                   <Button size="lg" variant="ghost" style={{ color: isLightText ? '#fff' : '#000', borderRadius: 'var(--theme-radius)' }} className="hover:bg-white/10 px-8 tracking-widest font-semibold text-lg py-6 underline underline-offset-4">
                     {secondaryCtaText || defaultCta2}
                   </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
