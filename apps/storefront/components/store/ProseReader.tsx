import React from 'react';

// A lightweight wrapper to render Tiptap generated HTML with basic generic styling.
// We avoid @tailwindcss/typography (prose) dependency here to maintain strict control over the design system variables.
export function ProseReader({ html }: { html: string }) {
  return (
    <div 
      className="max-w-3xl prose-reader [&>p]:mb-6 [&>p]:leading-relaxed [&>p]:opacity-90 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 [&>h2]:font-[family-name:var(--theme-font)] [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-8 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-6 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-6 [&>li]:mb-2 [&>img]:rounded-xl [&>img]:my-8 [&>img]:shadow-md [&>a]:text-[var(--theme-primary)] [&>a]:underline [&>strong]:font-semibold"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
