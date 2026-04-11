'use client';
import React, { useState } from 'react';
import { useIndustry } from './ThemeProvider';
import { X } from 'lucide-react';

export function BoundaryWarning() {
  const industry = useIndustry();
  const [isVisible, setIsVisible] = useState(true);

  if (industry !== 'clinic') return null;
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-5 duration-500 max-w-sm">
      <div className="bg-slate-900 border border-slate-700 text-slate-300 p-4 rounded-lg shadow-2xl relative">
         <button onClick={() => setIsVisible(false)} className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors">
            <X size={16} />
         </button>
         <div className="flex gap-3">
            <div className="text-xl">⚠️</div>
            <div>
               <h4 className="text-white font-bold text-sm mb-1">[의료법 제 56조 관련 공지]</h4>
               <p className="text-xs leading-relaxed opacity-80">
                 모든 시술 전후 사진 및 사례는 환자의 동의를 얻어 게재되었으며, 개인에 따라 출혈, 염증, 감염 등 부작용이 발생할 수 있습니다. 본 사이트의 내용은 참고용이며 전문의의 진료를 대신할 수 없습니다.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
