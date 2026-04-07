import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AnswerCardGridProps {
  cards: any[];
}

export function AnswerCardGrid({ cards }: AnswerCardGridProps) {
  if (!cards || cards.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg">
        No Canonical Answers available yet.
      </div>
    );
  }

  // Inject images for visual demo
  const getDemoImage = (idx: number) => {
    return idx % 2 === 0 ? '/skincare_product_1775271168586.png' : '/skincare_texture_1775271187123.png';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {cards.map((card, idx) => (
        <div key={idx} className="group relative flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100">
          {/* Media Section */}
          <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
             <Image 
               src={getDemoImage(idx)} 
               alt="SSoT Media" 
               fill 
               sizes="(max-width: 768px) 100vw, 40vw"
               className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-in-out" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-md border-white/10 shadow-lg font-normal tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 animate-pulse" />
                  Media SSoT
                </Badge>
             </div>
          </div>
          
          {/* Content Section */}
          <div className="flex-1 flex flex-col p-6 md:p-8">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">
                {card.structured_body?.type || 'Routine Step'}
              </span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                Verified Truth
              </Badge>
            </div>
            
            <h3 className="text-2xl font-semibold text-slate-900 leading-snug mb-3">
              {card.structured_body?.title || card.topics?.title || 'Unknown SSoT Object'}
            </h3>
            
            <div className="flex-1 text-slate-600 font-light leading-relaxed mb-6">
              {card.structured_body?.content 
                 ? card.structured_body.content 
                 : (Array.isArray(card.structured_body?.blocks) 
                      ? card.structured_body.blocks.map((b: any) => b.content).join('\n') 
                      : JSON.stringify(card.structured_body)
                   )
              }
            </div>

            <div className="mt-auto">
              {(card.structured_body?.evidence || card.structured_body?.sources) && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Clinical Source</div>
                      <div className="text-sm text-slate-700 font-medium truncate">
                        {card.structured_body.sources?.[0] || 'Internal R&D Lab'}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-transform active:scale-95">
                    View Verified Product
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
