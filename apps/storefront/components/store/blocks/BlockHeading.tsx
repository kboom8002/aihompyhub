import React from 'react';

export function BlockHeading({ title, subtitle }: { title?: string, subtitle?: string }) {
  return (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--theme-border)]">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
         {title || 'Section Heading'}
      </h2>
      {subtitle && (
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
           </span>
           {subtitle}
         </div>
      )}
    </div>
  );
}
