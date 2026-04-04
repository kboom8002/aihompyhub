import React from 'react';

interface RoutineStep {
  stepNumber: number;
  title: string;
  timing: string;
  instruction: string;
  isOptional?: boolean;
}

export function RoutineStepCard({ steps }: { steps: RoutineStep[] }) {
  return (
    <div className="my-8 relative">
      <div className="absolute left-[38px] top-6 bottom-6 w-px bg-[var(--theme-border)] z-0 hidden sm:block"></div>
      
      <div className="flex flex-col gap-6 relative z-10">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-4 sm:gap-6 bg-[var(--theme-surface)] p-5 rounded-[var(--theme-radius)] border border-[var(--theme-border)] shadow-sm hover:shadow-md transition-shadow">
            
            <div className="w-10 h-10 shrink-0 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
              {step.stepNumber}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="text-lg font-semibold font-[family-name:var(--theme-font)]">{step.title}</h4>
                {step.isOptional && (
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-500 py-0.5 px-2 rounded-sm">Optional</span>
                )}
                <span className="text-sm opacity-60 ml-auto whitespace-nowrap">{step.timing}</span>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">
                {step.instruction}
              </p>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
