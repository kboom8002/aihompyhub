'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReadinessCheckerProps {
  notFitCriteria: string[];
  prerequisites: string[];
  expectedBudget?: string;
  onReady: () => void;
  brandName?: string;
}

export function ReadinessChecker({ notFitCriteria, prerequisites, expectedBudget, onReady, brandName }: ReadinessCheckerProps) {
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [isChecked3, setIsChecked3] = useState(false);

  const canProceed = isChecked1 && isChecked2 && (!expectedBudget || isChecked3);

  return (
    <Card className="max-w-2xl mx-auto border-2 border-red-100 shadow-xl bg-white overflow-hidden">
      <CardHeader className="bg-red-50/50 border-b border-red-100 pb-6">
        <div className="flex items-center gap-3 mb-2">
           <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold">!</span>
           <CardTitle className="text-xl font-bold text-red-900">상담 신청 전 반드시 확인해주세요</CardTitle>
        </div>
        <p className="text-sm text-red-800/80 pl-11">
          가장 높은 퀄리티의 결과물을 보장하기 위해, {brandName || '저희'}는 아래 항목에 해당될 경우 <strong>정중히 의뢰를 거절</strong>하고 있습니다.
        </p>
      </CardHeader>
      
      <CardContent className="pt-6 flex flex-col gap-6">
        <label className="flex items-start gap-4 cursor-pointer group">
           <input type="checkbox" className="mt-1 w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" checked={isChecked1} onChange={e => setIsChecked1(e.target.checked)} />
           <div className="flex-1">
             <div className="font-semibold text-slate-800 group-hover:text-black mb-1">다음과 같은 분들은 도와드릴 수 없습니다 (Not Fit)</div>
             <ul className="text-sm text-slate-600 list-disc pl-4 space-y-1">
                {notFitCriteria.map((c, i) => <li key={i}>{c}</li>)}
             </ul>
           </div>
        </label>

        <label className="flex items-start gap-4 cursor-pointer group pt-4 border-t border-slate-100">
           <input type="checkbox" className="mt-1 w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" checked={isChecked2} onChange={e => setIsChecked2(e.target.checked)} />
           <div className="flex-1">
             <div className="font-semibold text-slate-800 group-hover:text-black mb-1">사전 준비 사항 (Prerequisites)</div>
             <p className="text-sm text-slate-600">성공적인 논의를 위해 아래 사항이 준비되어 있으신지 확인했습니다.</p>
             <ul className="text-sm text-slate-600 list-disc pl-4 space-y-1 mt-2">
                {prerequisites.map((c, i) => <li key={i}>{c}</li>)}
             </ul>
           </div>
        </label>

        {expectedBudget && (
          <label className="flex items-start gap-4 cursor-pointer group pt-4 border-t border-slate-100">
             <input type="checkbox" className="mt-1 w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" checked={isChecked3} onChange={e => setIsChecked3(e.target.checked)} />
             <div className="flex-1">
               <div className="font-semibold text-slate-800 group-hover:text-black mb-1">예상 소요 예산 확인</div>
               <p className="text-sm text-slate-600">이 프로젝트/의뢰의 시작 단가는 대략 <strong className="text-slate-800">{expectedBudget}</strong> 선입니다. 예산 범위가 확보되었음을 인지했습니다.</p>
             </div>
          </label>
        )}
      </CardContent>

      <CardFooter className="bg-slate-50 border-t p-6 flex justify-end">
         <Button 
           size="lg" 
           disabled={!canProceed} 
           onClick={onReady}
           className={`font-bold px-8 transition-all ${canProceed ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}
         >
           모두 확인했습니다 (상담 시작하기)
         </Button>
      </CardFooter>
    </Card>
  );
}
