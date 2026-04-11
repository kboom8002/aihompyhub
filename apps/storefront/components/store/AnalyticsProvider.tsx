'use client';

import { useEffect } from 'react';
import { initializeGlobalAttribution, trackEvent } from '../../lib/analytics';
import { usePathname } from 'next/navigation';

export function AnalyticsProvider({ tenantId }: { tenantId: string }) {
    const pathname = usePathname();

    useEffect(() => {
        // Initialize Attribution Cache on first load
        initializeGlobalAttribution();
    }, []);

    useEffect(() => {
        // Track page view on route change
        trackEvent(tenantId, 'page_view', 'content', { path: pathname });
    }, [pathname, tenantId]);

    return null;
}
