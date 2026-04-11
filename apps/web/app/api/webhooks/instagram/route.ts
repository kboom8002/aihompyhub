import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Meta Webhook Verification
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'welby-instagram-webhook-token';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 });
    } else {
        return new NextResponse('Forbidden', { status: 403 });
    }
}

export async function POST(request: Request) {
    const body = await request.json();

    // Check if it's a page/instagram subscription
    if (body.object !== 'instagram' && body.object !== 'page') {
        return new NextResponse('Not Found', { status: 404 });
    }

    try {
        for (const entry of body.entry) {
            const messagingItems = entry.messaging || [];
            
            for (const messaging of messagingItems) {
                if (messaging.message && !messaging.message.is_echo) {
                    const senderId = messaging.sender.id;
                    const text = messaging.message.text?.toLowerCase() || '';

                    // 1. Intent Classification (dm-routing-spec.md)
                    let intent = 'General';
                    let contextType = '';
                    let replyText = '';
                    const tenantBaseUrl = 'https://welby.co.kr/welby-seoul'; // Placeholder tenant

                    if (/(할인|이벤트|혜택|프로모션)/.test(text)) {
                        intent = 'S3_Offer';
                        contextType = 'dm_offer';
                        replyText = '진행 중인 혜택과 프로모션이 궁금하시군요! 고객님께 맞는 맞춤 혜택을 아래 링크에서 수석 실장이 직접 안내해 드려요 👇\n';
                    } else if (/(제휴|협찬|크리에이터|파트너십)/.test(text)) {
                        intent = 'S2_Partnership';
                        contextType = 'dm_partnership';
                        replyText = 'Welby와의 제휴 및 크리에이터 협업에 관심 가져주셔서 감사합니다🥰 아래 크리에이터 전용 라우트로 접속해주시면 빠른 안내 도와드릴게요!\n';
                    } else if (/(시술|가격|예약|아픈가요|다운타임)/.test(text)) {
                        intent = 'S1_Service';
                        contextType = 'answer';
                        replyText = '예약 및 시술 관련 문의시군요! 대기 없이 가장 빠르게 상담받으실 수 있는 프라이빗 채팅방을 열어드릴게요 👇\n';
                    } else {
                        // General inquiry
                        intent = 'Undefined';
                        contextType = 'dm';
                        replyText = '안녕하세요! Welby입니다. 어떤 점이 궁금하신가요? 아래 링크를 통해 문의를 남겨주시면 AI 실장님이 친절히 상담해 드립니다.\n';
                    }

                    const deepLink = `${tenantBaseUrl}/contact/dm?contextType=${contextType}&utm_source=instagram&utm_medium=dm&utm_campaign=auto_routing`;
                    const finalMessage = `${replyText}\n👉 ${deepLink}`;

                    console.log(`[Instagram Webhook] Routed User ${senderId} | Intent: ${intent} | DeepLink: ${deepLink}`);

                    // 2. Reply back to Meta Graph API 
                    // (Simulated here. In production, this would `fetch('https://graph.facebook.com/v20.0/me/messages', ...)`
                    // using the Tenant's specific PAGE_ACCESS_TOKEN stored in the database.
                }
            }
        }
        
        return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } catch (err) {
        console.error('Webhook processing error:', err);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
