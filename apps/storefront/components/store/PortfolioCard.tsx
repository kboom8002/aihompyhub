import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PortfolioCardProps {
  portfolio: any;
  tenantSlug: string;
  industryType?: string;
}

export function PortfolioCard({ portfolio, tenantSlug, industryType = 'skincare' }: PortfolioCardProps) {
  const isClinic = industryType === 'clinic';
  const isRealEstate = industryType === 'real_estate';

  // Extract first image if exists
  let firstThumb = '/skincare_texture_1775271187123.png'; // fallback
  if (portfolio.structured_body?.visual_assets) {
     const assets = portfolio.structured_body.visual_assets.split(',');
     if (assets[0]) firstThumb = assets[0].trim();
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full border-slate-200 group">
      {/* Visual Asset Header */}
      <div className="relative w-full h-[240px] bg-slate-100 overflow-hidden">
        <Image 
          src={firstThumb}
          alt={portfolio.structured_body?.client_or_context || 'Portfolio Image'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {isClinic && (
           <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 font-semibold rounded shadow-sm text-stone-700">
             의료법 준수 Case
           </div>
        )}
      </div>

      <CardHeader className="pb-3 border-b border-slate-50 relative">
        <Badge variant="outline" className="w-fit mb-2 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          {isRealEstate ? '계약 및 거래건' : isClinic ? '시술 적용례' : '성공 사례'}
        </Badge>
        <CardTitle className="text-xl font-bold leading-snug">
          {portfolio.structured_body?.client_or_context || '의뢰 맥락 미상'} 
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4 flex-1 flex flex-col gap-3">
        {/* Challenge / Problem */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            {isClinic ? '기존 병증/고민' : '도전 과제 (Challenge)'}
          </h4>
          <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-relaxed">
            {portfolio.structured_body?.challenge || '상세 내용 없음'}
          </p>
        </div>
        
        {/* Outcome / Result */}
        <div className="mt-2">
          <h4 className="text-xs font-bold text-[var(--theme-primary)] uppercase tracking-widest mb-1.5">
            {isClinic ? '치료 성과' : '최종 결과 (Outcome)'}
          </h4>
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {portfolio.structured_body?.outcome || '결과 요약 없음'}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-slate-50 bg-slate-50/50">
        <Button variant="ghost" className="w-full justify-between hover:bg-slate-100/80 font-semibold text-slate-700">
           <span>상세 내용 및 갤러리 보기</span>
           <span>→</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
