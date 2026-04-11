'use server';

import { createClient } from '@supabase/supabase-js';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const ContentDraftSchema = z.object({
  brandTone: z.string().describe("노련함, 진실성, 과장없는 자신감 등을 유지하는 브랜드 톤 분석"),
  angles: z.array(z.string()).length(3).describe("Instagram 포지셔닝에 맞는 3가지 방향의 기획(Angle)"),
  hooks: z.array(z.string()).length(5).describe("사용자의 시선을 멈추게 하는 첫 2줄 후킹 카피 5가지"),
  captions: z.array(z.string()).length(2).describe("최종 Instagram Caption 초안 2가지 (문제장면 -> Welby 관점 -> CTA)"),
  suggestedHashtags: z.array(z.string()).describe("추천 해시태그 5~7개")
});

export async function generateContentDraftAction({ 
    tenantId, 
    creatorId, 
    topicId, 
    goal, 
    formatType 
}: { 
    tenantId: string, 
    creatorId?: string, 
    topicId?: string, 
    goal: string, 
    formatType: string 
}) {
    // 1. Get Topic Info (SSoT Origin)
    let contextInput = `Objective: ${goal}\nFormat: ${formatType}`;
    let baseLandingUrl = `https://welby.co.kr`; 

    if (topicId) {
        const { data: topic } = await supabaseAdmin.from('topics').select('*').eq('id', topicId).single();
        if (topic) {
            contextInput += `\n\n[Sourced Knowledge (SSoT)]\nTitle: ${topic.title}\nContent: ${JSON.stringify(topic.json_payload)}`;
            baseLandingUrl = `https://welby.co.kr/answers/${topic.id}`; // 딥링크 연결
        }
    }

    // 2. Generate Content using AI
    const result = await generateObject({
        model: google('gemini-2.5-pro'),
        schema: ContentDraftSchema,
        system: `당신은 Welby 브랜드의 인스타그램 전문 컨텐츠 리드입니다. 
주어진 SSoT 지식을 바탕으로 인스타그램 포맷에 맞는 기획안을 도출하세요.
- 금지: 과장된 표현, 의료효능 암시.
- 필수: 첫 2줄 훅, 문제 분석, Welby 관점의 해결, 강력한 행동 유도(CTA).
`,
        prompt: contextInput,
    });

    const aiOutput = result.object;

    // 3. Create UTM Bundle
    const dt = new Date();
    const isBrand = !creatorId;
    const utm_campaign = `welby_${goal}_${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}`;
    const utm_content = `${isBrand ? 'brand' : 'creator'}_${formatType}_auto`;
    const utm_id = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}_welby_ig_${isBrand ? 'brand' : 'creator'}_1`;

    const landing_url = `${baseLandingUrl}?utm_source=instagram&utm_medium=${formatType}&utm_campaign=${utm_campaign}&utm_content=${utm_content}&utm_id=${utm_id}`;

    // 4. Save to content_drafts Table
    const { data: inserted, error } = await supabaseAdmin.from('content_drafts').insert({
        tenant_id: tenantId,
        creator_id: creatorId,
        campaign_id: utm_campaign,
        goal,
        format_type: formatType,
        topic_refs: topicId ? [topicId] : [],
        draft_caption: aiOutput.captions[0], // fallback to first caption
        draft_hooks: aiOutput.hooks,
        draft_assets: aiOutput.angles, // using angles as asset prompts for now
        landing_url: landing_url,
        utm_bundle: {
            utm_source: 'instagram',
            utm_medium: formatType,
            utm_campaign,
            utm_content,
            utm_id
        },
        status: 'draft'
    }).select().single();

    if (error) {
        throw error;
    }

    return inserted;
}

export async function acceptCreatorRequestAction(formData: FormData) {
    const requestId = formData.get('requestId') as string;
    const creatorId = formData.get('creatorId') as string;
    const goal = formData.get('goal') as string;
    const topicId = formData.get('topicId') as string;
    const tenantId = formData.get('tenantId') as string;

    if (!requestId || !tenantId) return;

    // 1. Update Request Status
    await supabaseAdmin.from('creator_requests').update({ status: 'drafting' }).eq('id', requestId);

    // 2. Generate Draft (AI Pipeline)
    await generateContentDraftAction({
        tenantId,
        creatorId,
        topicId: topicId !== 'undefined' && topicId !== 'N/A' ? topicId : undefined,
        goal: goal || 'Creator Collaboration',
        formatType: 'reel' // Default for now
    });

    // 3. Mark request as ready
    await supabaseAdmin.from('creator_requests').update({ status: 'ready_for_creator' }).eq('id', requestId);

    revalidatePath(`/tenant/${tenantId}/creators`);
}
