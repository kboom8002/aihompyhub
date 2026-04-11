'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Send, User, Building, Languages } from 'lucide-react';
import { sendDealRoomMessageAction } from '@/app/actions/deal-room-actions';

// Ensure browser client exists or instantiate standard one for subscriptions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Usually available, but we can't do realtime without it, wait, we can just fetch via API and interval if no anon key. 
// Assuming the workspace has a client side provider or we create one here
const supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy');

export interface DealRoomMessengerProps {
    initialInquiryId: string | null;
    locale: string; 
    userId?: string; 
    tenantSlug: string;
    tenantId: string;
    senderType?: 'customer' | 'tenant';
}

export function DealRoomMessenger({ initialInquiryId, locale, userId, tenantSlug, tenantId, senderType = 'customer' }: DealRoomMessengerProps) {
    const [inquiryId, setInquiryId] = useState<string | null>(initialInquiryId);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Fetch
    useEffect(() => {
        const fetchMessages = async () => {
            if (!inquiryId) return;
            const { data } = await supabase
                .from('deal_messages')
                .select('*')
                .eq('inquiry_id', inquiryId)
                .order('created_at', { ascending: true });
            if (data) setMessages(data);
        };
        fetchMessages();
    }, [inquiryId]);

    // Realtime Subscription
    useEffect(() => {
        if (!inquiryId) return;
        const channel = supabase
            .channel(`room:${inquiryId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'deal_messages', 
                filter: `inquiry_id=eq.${inquiryId}` 
            }, (payload) => {
                setMessages((prev) => {
                    if (prev.find(m => m.id === payload.new.id)) return prev;
                    return [...prev, payload.new];
                });
            })
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'deal_messages', 
                filter: `inquiry_id=eq.${inquiryId}` 
            }, (payload) => {
                setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new : m));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [inquiryId]);

    // Auto scroll down
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTranslating) return;

        const content = input.trim();
        setInput('');
        setIsTranslating(true);

        // Extract email if customer is typing
        let extractedEmail: string | undefined = undefined;
        if (senderType === 'customer') {
            const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            if (emailMatch) {
                extractedEmail = emailMatch[0];
            }
        }

        const res = await sendDealRoomMessageAction(
            inquiryId,
            tenantId,
            senderType,
            content,
            locale,
            userId,
            extractedEmail
        );

        if (res.success && res.inquiryId && !inquiryId) {
            setInquiryId(res.inquiryId);
            // Optimistically add message
            setMessages(prev => [...prev, { id: 'optimistic-new', content, sender_type: 'customer', created_at: new Date().toISOString() }]);
        }
        
        if (!res.success) {
            console.error(res.error);
        }
        setIsTranslating(false);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            <div className="bg-indigo-600 text-white p-3 text-sm font-medium flex justify-between shadow-md items-center">
                <div className="flex gap-2 items-center">
                    <Building size={16} /> 
                    Deal Room (Live)
                </div>
                <div className="text-[10px] flex items-center gap-1 opacity-80 uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                    <Languages size={12} /> Auto-Translate
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-xs text-slate-400 mt-10">
                        진행 중인 대화가 없습니다.
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isMe = msg.sender_type === senderType;
                    
                    // Render locally mapped string if it exists in translation payload, else fallback to original structure
                    let displayContent = msg.content;
                    if (msg.translations && typeof msg.translations === 'object') {
                        if (msg.translations[locale]) {
                            displayContent = msg.translations[locale];
                        }
                    }

                    return (
                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col gap-1 max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`p-3 text-sm leading-relaxed rounded-2xl shadow-sm ${
                                    isMe 
                                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                                        : 'bg-white border text-slate-800 rounded-tl-none border-slate-200'
                                }`}>
                                    {displayContent}
                                </div>
                                <span className="text-[10px] text-slate-400 mx-1">
                                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 bg-white border-t border-slate-200">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={isTranslating}
                        placeholder={isTranslating ? "Translating..." : "메시지 보내기..."}
                        className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isTranslating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                        <Send size={16} className="-ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
