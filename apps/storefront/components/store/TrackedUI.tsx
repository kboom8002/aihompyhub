'use client';

import React from 'react';
import { trackEvent } from '../../lib/analytics';

export function TrackedButton({ 
   tenantId, 
   eventName, 
   category, 
   payload, 
   onClick, 
   children, 
   className, 
   disabled 
}: { 
   tenantId: string, 
   eventName: string, 
   category: string, 
   payload?: any, 
   onClick?: () => void, 
   children: React.ReactNode, 
   className?: string, 
   disabled?: boolean 
}) {
    const handleClick = (e: React.MouseEvent) => {
        if (!disabled) {
            trackEvent(tenantId, eventName, category, payload);
            if (onClick) onClick();
        }
    };

    return (
        <button onClick={handleClick} className={className} disabled={disabled}>
            {children}
        </button>
    );
}

export function TrackedLink({ 
   tenantId, 
   eventName, 
   category, 
   payload, 
   href, 
   children, 
   className 
}: { 
   tenantId: string, 
   eventName: string, 
   category: string, 
   payload?: any, 
   href: string, 
   children: React.ReactNode, 
   className?: string 
}) {
    const handleClick = (e: React.MouseEvent) => {
        trackEvent(tenantId, eventName, category, { ...payload, navigation_dest: href });
        // Let natural navigation occur 
    };

    return (
        <a href={href} onClick={handleClick} className={className}>
            {children}
        </a>
    );
}
