'use server';

import { createClient } from '@supabase/supabase-js';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const TARGET_LANGUAGES = ['en', 'ja', 'zh', 'es', 'ko'];

/**
 * Sends a message to the deal room and automatically generates translations.
 * 
 * @param inquiryId The ID of the existing inquiry/deal room thread
 * @param senderType Who is sending the message ('customer' | 'tenant')
 * @param content The original text content
 * @param baseLanguage The language the sender wrote the text in (e.g. 'ko' for tenant, 'en' for customer)
 * @param senderId Auth UUID of the sender (customer mapping or tenant admin)
 */
export async function sendDealRoomMessageAction(
    inquiryId: string | null,
    tenantId: string,
    senderType: 'customer' | 'tenant',
    content: string,
    baseLanguage: string = 'ko',
    senderId?: string,
    customerContact?: string
) {
    try {
        console.log(`Sending Deal Room Message. Existing ID: ${inquiryId}`);
        
        // 1. Generate translations async
        const translationDrafts: Record<string, string> = {
            [baseLanguage]: content
        };

        const targetLangsToTranslate = TARGET_LANGUAGES.filter(lang => lang !== baseLanguage);

        if (targetLangsToTranslate.length > 0) {
            let translatedObj = {};
            const systemPrompt = `You are an enterprise AI Translator for an omnichannel Live Chat system.
Translate the following single message from its original language (${baseLanguage.toUpperCase()}) into the following languages: ${targetLangsToTranslate.join(', ')}.
Respond ONLY with a valid JSON document containing the language tags as keys. No markdown blocks.`;

            const prompt = `Message: "${content}"`;

            const { text } = await generateText({
                model: google('gemini-2.5-pro') as any,
                system: systemPrompt,
                prompt: prompt,
                temperature: 0.1
            });

            try {
                const cleanText = text.replace(/```json\n?|\n?```/gi, '').trim();
                translatedObj = JSON.parse(cleanText);
                
                for (const lang of targetLangsToTranslate) {
                    if ((translatedObj as any)[lang]) translationDrafts[lang] = (translatedObj as any)[lang];
                }
            } catch (err) {
                console.error('Failed to parse translation JSON', err, text);
            }
        }

        // 2. Resolve & Update Inquiry
        let activeInquiryId = inquiryId;
        let inquiryContact = null;

        if (!activeInquiryId) {
            const { data: newInq, error: inqErr } = await supabaseAdmin.from('inquiries').insert({
                tenant_id: tenantId,
                customer_name: '스토어 고객',
                status: 'in_progress',
                customer_contact: customerContact || null
            }).select('id, customer_contact').single();
            if (inqErr) throw new Error('Failed to create deal thread: ' + inqErr.message);
            activeInquiryId = newInq.id;
            inquiryContact = newInq.customer_contact;
        } else {
            const { data: currentInq } = await supabaseAdmin.from('inquiries').select('customer_contact').eq('id', activeInquiryId).single();
            inquiryContact = currentInq?.customer_contact;
            
            // Auto update contact if customer provided email mid-thread
            if (customerContact && !inquiryContact && senderType === 'customer') {
                await supabaseAdmin.from('inquiries').update({ customer_contact: customerContact }).eq('id', activeInquiryId);
                inquiryContact = customerContact;
            }
        }

        // 3. Insert into DB
        const { error: insertErr } = await supabaseAdmin
            .from('deal_messages')
            .insert({
                inquiry_id: activeInquiryId,
                sender_type: senderType,
                sender_id: senderId || null,
                content: content,
                translations: translationDrafts,
                is_read: false
            });

        if (insertErr) throw new Error(`Failed to save message: ${insertErr.message}`);

        await supabaseAdmin
            .from('inquiries')
            .update({ status: 'in_progress', updated_at: new Date().toISOString() })
            .eq('id', activeInquiryId);

        // 4. Dispatch Email Magic Link if tenant is replying and customer has an email
        if (senderType === 'tenant' && inquiryContact && inquiryContact.includes('@')) {
            try {
                // Determine target language translation for customer, fallback to base
                let targetLang = 'en'; // default assumption if unknown
                const custMessage = (translationDrafts as any)[targetLang] || content;

                const magicLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/ko/brand/contact/dm?inquiryId=${activeInquiryId}`;
                
                await resend.emails.send({
                    from: 'AI Homepage Deal Room <noreply@aihompy.com>',
                    to: inquiryContact,
                    subject: '[알림] 브랜드 관리자가 답변을 남겼습니다 / New reply in your deal room',
                    html: `
                        <div style="font-family: sans-serif; p-4;">
                            <h2 style="color: #4f46e5;">브랜드 관리자의 코멘트가 도착했습니다.</h2>
                            <p>고객님의 질문에 원장님/담당자가 다음과 같이 답변했습니다:</p>
                            <blockquote style="border-left: 4px solid #e2e8f0; padding-left: 1rem; color: #475569; margin: 1.5rem 0;">
                                "${custMessage}"
                            </blockquote>
                            <a href="${magicLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                딜 룸으로 돌아가서 대화 이어가기
                            </a>
                            <p style="margin-top: 2rem; font-size: 0.8rem; color: #94a3b8;">
                                본 메일은 발신 전용이며, Deal Room 을 통해 실시간으로 소통하실 수 있습니다.
                            </p>
                        </div>
                    `
                });
                console.log(`Dispatched Magic Link Email to ${inquiryContact}`);
            } catch (err) {
                console.error('Failed to dispatch magic link email:', err);
            }
        }

        revalidatePath(`/inquiry/${activeInquiryId}`);
        
        return { success: true, inquiryId: activeInquiryId };
    } catch (e: any) {
        console.error('sendDealRoomMessageAction Error:', e);
        return { success: false, error: e.message || 'Unknown error' };
    }
}
