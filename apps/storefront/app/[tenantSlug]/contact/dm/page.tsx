'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Bot, Send, User, ChevronLeft } from 'lucide-react';
import { converseWithAgentAction, finalizeInquiryAction, ChatMessage } from '../../../actions/chat-actions';
import Link from 'next/link';

export default function StorefrontChatAgentPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const tenantSlug = params.tenantSlug as string;
    const offerId = searchParams.get('offerId');
    const contextType = searchParams.get('contextType');
    const contextId = searchParams.get('contextId');
    const contextTitle = searchParams.get('contextTitle');

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const mockSessionUser = { name: '이세션(VIP)', contact: '010-9999-8888' };

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            if (contextType === 'answer' && contextTitle) {
                setMessages([
                    { role: 'model', text: `안녕하세요 ${mockSessionUser.name}님! 조금 전 읽으신 [${contextTitle}] 내용에 대해 더 궁금하신 점이 있으신가요? 편하게 문의 남겨주세요.` }
                ]);
            } else {
                setMessages([
                    { role: 'model', text: `안녕하세요 ${mockSessionUser.name}님! 예약 문의를 도와드릴 수석 상담 실장입니다. 현재 겪고 계신 불편함이나, 원하시는 시술의 우려사항(통증, 다운타임 등)을 자유롭게 말씀해 주시겠어요?` }
                ]);
            }
        }
    }, [messages.length, contextType, contextTitle]);

    // Auto scroll down
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping || isComplete) return;

        const userMsg = input.trim();
        setInput('');
        
        const newHistory: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
        setMessages(newHistory);
        setIsTyping(true);

        const res = await converseWithAgentAction(
            tenantSlug, 
            offerId, 
            messages, 
            userMsg, 
            mockSessionUser, 
            (contextType && contextId) ? { type: contextType, id: contextId } : null
        );
        
        if (res.success && res.reply) {
            const aiReply: ChatMessage = { role: 'model', text: res.reply };
            const updatedHistory = [...newHistory, aiReply];
            setMessages(updatedHistory);
            
            if (res.isComplete) {
                setIsComplete(true);
                // Trigger finalizing logic
                await handleFinalize(updatedHistory);
            }
        } else {
            setMessages([...newHistory, { role: 'model', text: '죄송합니다. 통신 오류가 발생했습니다. 다시 말씀해주시겠어요?' }]);
        }
        
        setIsTyping(false);
    };

    const handleFinalize = async (finalHistory: ChatMessage[]) => {
        const res = await finalizeInquiryAction(tenantSlug, offerId, finalHistory);
        if (res.success) {
            alert('상담이 접수되었습니다! 담당자가 확인 후 곧 연락드리겠습니다.');
            router.push(`/${tenantSlug}/home`);
        } else {
            alert('상담 저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans max-w-2xl mx-auto border-x border-slate-200">
            {/* Header */}
            <header className="bg-white px-4 py-4 border-b border-slate-200 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <Link href={`/${tenantSlug}/offers/${offerId}`} className="text-slate-500 p-2 -ml-2 hover:bg-slate-100 rounded-full">
                    <ChevronLeft size={24} />
                </Link>
                <div className="flex flex-col items-center">
                    <h1 className="font-bold text-slate-800 flex items-center gap-2">
                        <Bot className="text-indigo-600" size={20}/>
                        수석 상담 실장
                    </h1>
                    <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
                        접수 가능
                    </span>
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {contextType === 'offer' && messages.length === 1 && (
                    <div className="text-center text-xs text-slate-400 my-4 bg-slate-100 py-1 px-3 rounded-full mx-auto inline-block max-w-[80%] line-clamp-1">
                        Offer ID <b>{offerId}</b> 에 대한 문의가 시작되었습니다.
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                    <Bot size={16} />
                                </div>
                            )}
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                            }`}>
                                {msg.role === 'model' && msg.text.includes('모든 정보가 확인되었습니다.') ? (
                                    <span>
                                        {msg.text}
                                        <br/><br/>
                                        <div className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 p-2 rounded w-full inline-block mt-2 font-bold animate-pulse">
                                            ✅ 시스템에 상담이 접수되는 중입니다...
                                        </div>
                                    </span>
                                ) : msg.text}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 p-4">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={isTyping || isComplete}
                        placeholder={isComplete ? "상담 접수가 완료되었습니다." : "메시지를 입력하세요..."}
                        className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all rounded-full px-5 py-3 text-sm disabled:opacity-50 outline-none"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isTyping || isComplete}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors shadow-md"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
