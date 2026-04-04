'use client';
import React from 'react';

// We pass down pre-fetched config rather than fetching it in client to avoid waterfall.
export function ThemeProvider({ 
  children, 
  config 
}: { 
  children: React.ReactNode, 
  config: any 
}) {
  
  // Maps the Design Config JSON to raw CSS custom properties
  const themeStyles = {
    '--theme-bg': config.base_neutral_palette.bg,
    '--theme-surface': config.base_neutral_palette.surface,
    '--theme-text': config.base_neutral_palette.text,
    '--theme-border': config.base_neutral_palette.border,
    '--theme-primary': config.primary_color,
    '--theme-radius': config.radius,
    '--theme-font': config.font_family,
    // --- TAILWIND SHADCN CSS OVERRIDES ---
    '--primary': config.primary_color,
    '--background': config.base_neutral_palette.bg,
    '--foreground': config.base_neutral_palette.text,
    '--radius': config.radius,
    '--border': config.base_neutral_palette.border,
  } as React.CSSProperties;

  return (
    <div 
      suppressHydrationWarning
      style={themeStyles} 
      className="main-theme-wrapper w-full h-full min-h-screen text-[var(--theme-text)] bg-[var(--theme-bg)] font-[family-name:var(--theme-font)]"
    >
      {/* 
        By nesting it here, all components underneath can use these variables:
        e.g. className="bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-primary)]"
      */}
      {children}
    </div>
  );
}
