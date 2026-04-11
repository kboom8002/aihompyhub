'use server';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { DealRoomMessenger } from '@/components/store/DealRoomMessenger';
import { resolveTenantId } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function StorefrontChatAgentPage(props: any) {
    const params = await props.params;
    const { tenantSlug, locale = 'ko' } = params as any;
    const searchParams = await props.searchParams;
    
    // In a real logged-in flow, you'll retrieve the authenticated user UUID here.
    // For now we assume they are guests or mapped, so we pass null/dummy.
    // Replace this with actual supabase.auth.getUser() when Auth UI is built for the storefront.
    const userId = undefined; 
    
    const offerId = searchParams?.offerId;
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return notFound();

    // We can also fetch an active inquiryId if they are logged in.
    // const activeInquiries = await supabaseAdmin.from('inquiries').select('id').eq('customer_auth_id', userId).eq('tenant_id', tenantId).limit(1);
    // const initialInquiryId = activeInquiries?.data?.[0]?.id || null;
    const initialInquiryId = null; 

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans max-w-2xl mx-auto border-x border-slate-200">
            {/* Header */}
            <header className="bg-white px-4 py-4 border-b border-slate-200 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <Link href={`/${locale}/${tenantSlug}${offerId ? `/offers/${offerId}` : ''}`} className="text-slate-500 p-2 -ml-2 hover:bg-slate-100 rounded-full">
                    <ChevronLeft size={24} />
                </Link>
                <div className="flex flex-col items-center">
                    <h1 className="font-bold text-slate-800 text-lg">
                        Customer Deal Room
                    </h1>
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            <div className="flex-1 overflow-hidden relative">
                <DealRoomMessenger 
                    initialInquiryId={initialInquiryId}
                    locale={locale}
                    userId={userId}
                    tenantSlug={tenantSlug}
                    tenantId={tenantId}
                />
            </div>
        </div>
    );
}
