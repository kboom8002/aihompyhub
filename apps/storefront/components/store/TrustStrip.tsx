import React from 'react';

export function TrustStrip({ sources, updatedAt, reviewerName, reviewerLink }: { sources?: string[], updatedAt?: string, reviewerName?: string, reviewerLink?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-3 px-4 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-[var(--theme-radius)] shadow-sm text-xs text-[var(--theme-text)] opacity-90 my-6">
      <div className="flex items-center gap-1.5 font-medium text-green-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
        <span>Canonical Trust</span>
      </div>
      
      <div className="w-px h-4 bg-[var(--theme-border)] hidden sm:block"></div>
      
      {reviewerName && (
        <div className="flex items-center gap-1.5 opacity-80">
          <span>Reviewed by:</span>
          {reviewerLink ? (
             <a href={reviewerLink} className="font-semibold text-[var(--theme-primary)] hover:underline decoration-[var(--theme-primary)] underline-offset-2 transition-colors">
               {reviewerName}
             </a>
          ) : (
             <span className="font-semibold">{reviewerName}</span>
          )}
        </div>
      )}

      {sources && sources.length > 0 && (
         <>
           <div className="w-px h-4 bg-[var(--theme-border)] hidden sm:block"></div>
           <div className="flex items-center gap-1.5 opacity-80">
             <span>Evidence:</span>
             <span className="font-medium">{sources.length} sources verified</span>
           </div>
         </>
      )}

      {updatedAt && (
        <>
          <div className="w-px h-4 bg-[var(--theme-border)] hidden sm:block"></div>
          <div className="flex items-center gap-1.5 opacity-70 ml-auto">
            <span>Last sync: {updatedAt}</span>
          </div>
        </>
      )}
    </div>
  );
}
