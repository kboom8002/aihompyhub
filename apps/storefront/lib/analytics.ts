'use client';

// Helper to construct a robust session id
const getSessionId = () => {
    if (typeof window === 'undefined') return 'server';
    let sid = sessionStorage.getItem('aihompy_sid');
    if (!sid) {
        sid = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('aihompy_sid', sid);
    }
    return sid;
};

// Parse and cache AI Search / UTM Attribution globally on initial visit
export const initializeGlobalAttribution = () => {
    if (typeof window === 'undefined') return;
    
    // Check if we already cached attribution this session
    if (sessionStorage.getItem('aihompy_attribution')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer || '';
    
    let baseMedium = urlParams.get('utm_medium') || '';
    let baseSource = urlParams.get('utm_source') || '';

    // Smart Referrer Override (detect AI search engines)
    const refHost = referrer ? new URL(referrer).hostname : '';
    if (refHost.includes('gemini.google.com') || refHost.includes('bard.google.com')) {
        // Explicitly catch Gemini Workspace/Web interactions
        baseSource = 'gemini';
        baseMedium = 'ai_search';
    } else if (refHost.includes('perplexity.ai')) {
        baseSource = 'perplexity';
        baseMedium = 'ai_search';
    } else if (refHost.includes('chatgpt.com') || refHost.includes('openai.com')) {
        baseSource = 'chatgpt';
        baseMedium = 'ai_search';
    } else if (refHost.includes('google.com')) {
        // For Google AI Overviews (SGE), the referrer is typically google.com.
        // If utm_source is explicitly set to SGE by our partner links, we respect it.
        if (!baseSource) baseSource = 'google';
        
        // We classify this primarily as ai_search since SGE is our main target context, 
        // unless it's a paid ads click (cpc) which should be preserved.
        if (!baseMedium) baseMedium = 'organic_or_ai_search';
    }

    const attribution = {
        utm_source: baseSource,
        utm_medium: baseMedium,
        utm_campaign: urlParams.get('utm_campaign') || '',
        utm_content: urlParams.get('utm_content') || '',
        referrer_domain: refHost
    };

    sessionStorage.setItem('aihompy_attribution', JSON.stringify(attribution));
};

export const trackEvent = async (tenantId: string, eventName: string, category: string, payload: any = {}) => {
    if (typeof window === 'undefined') return; // Do not run on SSR
    
    let attribution = {};
    try {
       const cachedAttrs = sessionStorage.getItem('aihompy_attribution');
       if (cachedAttrs) attribution = JSON.parse(cachedAttrs);
    } catch(e) {}

    const eventBody = {
        tenantId,
        sessionId: getSessionId(),
        eventName,
        category,
        attribution,
        payload
    };

    // 1. Internal BD Logging
    try {
       // Fire-and-forget logging to not block UX
       fetch('/api/v1/analytics/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventBody)
       });
    } catch(err) {
       console.error('Failed to log analytics internally:', err);
    }

    // 2. Dual-Tracking: External Google Analytics (GA4) / GTM if gtag exists
    if (typeof (window as any).gtag !== 'undefined') {
       (window as any).gtag('event', eventName, { ...attribution, ...payload, event_category: category });
    }
};
