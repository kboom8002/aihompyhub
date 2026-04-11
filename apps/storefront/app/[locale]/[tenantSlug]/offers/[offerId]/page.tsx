import { notFound } from 'next/navigation';
import { resolveTenantId } from '@/lib/tenant';
import { supabaseAdmin } from '@/lib/supabase';
import { BlockRenderer } from '@/components/store/blocks/BlockRenderer';
import { TrackedButton, TrackedLink } from '@/components/store/TrackedUI';

export const revalidate = 0;

export default async function OfferLandingPage(props: { params: Promise<{ tenantSlug: string, offerId: string }> }) {
  const params = await props.params;
  const { tenantSlug, offerId } = params;

  const tenantId = await resolveTenantId(tenantSlug);
  if (!tenantId) {
    notFound();
  }

  const { data: dbOffer } = await supabaseAdmin
     .from('universal_content_assets')
     .select('*')
     .eq('id', offerId)
     .eq('tenant_id', tenantId)
     .eq('type', 'offer')
     .single();

  if (!dbOffer) {
    notFound();
  }

  const payload = dbOffer.json_payload || {};

  // Resolve related Creator if exists
  let relatedCreator = null;
  if (payload.related_creator && payload.related_creator.length > 0) {
      const { data: creatorData } = await supabaseAdmin
        .from('universal_content_assets')
        .select('title, json_payload')
        .in('id', payload.related_creator)
        .limit(1);
      if (creatorData && creatorData[0]) {
          relatedCreator = creatorData[0];
      }
  }

  // Resolve related FAQs
  let relatedAnswers: any[] = [];
  if (payload.related_answers && payload.related_answers.length > 0) {
      const { data: answersData } = await supabaseAdmin
        .from('answer_cards')
        .select('*, topics(title)')
        .in('id', payload.related_answers);
      
      if (answersData) relatedAnswers = answersData;
  }

  const now = new Date().getTime();
  const endTime = payload.countdown_end_at ? new Date(payload.countdown_end_at).getTime() : 0;
  const isClosed = endTime > 0 && now > endTime;

  return (
    <div className="flex flex-col font-sans pt-12 pb-24 max-w-4xl mx-auto px-4">
       
       {/* Urgency & Countdown Banner */}
       {endTime > 0 && (
         <div className={`mb-8 p-4 text-center font-bold text-white rounded-lg shadow-md ${isClosed ? 'bg-gray-800' : 'bg-rose-600 animate-pulse'}`}>
            {isClosed ? '⚠️ 본 공동구매/오퍼는 마감되었습니다.' : `🚨 혜택 마감까지 시간이 얼마 남지 않았습니다! (${new Date(endTime).toLocaleString()})`}
         </div>
       )}

       {/* Offer Hero */}
       <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 font-bold text-sm rounded-full mb-4 uppercase tracking-wider">
             {payload.offer_type || 'Special Promotion'}
          </span>
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900 leading-tight">{dbOffer.title}</h1>
          {payload.campaign_period && <p className="text-indigo-600 font-bold text-lg mb-6">{payload.campaign_period}</p>}
          
          <div className="flex justify-center items-end gap-4 bg-gray-50 border border-gray-200 py-6 px-12 rounded-2xl mx-auto max-w-md shadow-sm">
             {payload.price_regular && <span className="line-through text-gray-400 text-xl">{payload.price_regular}</span>}
             {payload.price_offer && <span className="text-4xl font-black text-rose-600">{payload.price_offer}</span>}
          </div>
       </div>

       {/* Fit Summary (AEO specific feature) */}
       {payload.fit_summary && (
         <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-xl mb-12">
            <h3 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">🎯 이 오퍼가 딱 맞는 타겟</h3>
            <p className="text-indigo-800 leading-relaxed">{payload.fit_summary}</p>
         </div>
       )}

       {/* Creator Proof Block */}
       {relatedCreator && (
         <div className="mb-12 flex items-center gap-6 p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
            {relatedCreator.json_payload?.proof_assets && (
               <img src={relatedCreator.json_payload.proof_assets.split(',')[0]} className="w-20 h-20 rounded-full object-cover border border-gray-300" alt="Creator" />
            )}
            <div>
               <p className="text-sm font-bold text-indigo-600 mb-1">Collaboration Creator</p>
               <h3 className="text-xl font-bold text-gray-900">{relatedCreator.title}</h3>
               {relatedCreator.json_payload?.handle && <p className="text-gray-500 text-sm mt-1">{relatedCreator.json_payload.handle}</p>}
            </div>
         </div>
       )}

       {/* Main Content */}
       {payload.body && (
          <div className="prose prose-indigo mx-auto mb-16 text-gray-800" dangerouslySetInnerHTML={{ __html: payload.body }} />
       )}

       {/* Policies and FAQs */}
       {relatedAnswers.length > 0 && (
         <div className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">🛡️ 구매 전 꼭 질문/확인하세요</h2>
            <BlockRenderer 
              layoutSettings={[{ type: 'AnswerCardGrid' }]}
              context={{ tenantSlug, brandProfile: null, answerCards: relatedAnswers, heroConfig: {} }}
            />
         </div>
       )}

       {/* CTA */}
       <div className="sticky bottom-6 left-0 right-0 z-50 mt-12 flex justify-center px-4 gap-4">
          <TrackedButton 
             tenantId={tenantId} 
             eventName="click_buy" 
             category="commerce" 
             payload={{ offer_id: offerId }}
             disabled={isClosed} 
             className={`flex-1 max-w-xs py-4 rounded-full font-bold text-lg shadow-xl transition-all ${isClosed ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:scale-105'}`}
          >
             {isClosed ? '마감되었습니다' : '구매하기 (장바구니 이동)'}
          </TrackedButton>
          <TrackedLink 
             tenantId={tenantId}
             eventName="click_dm"
             category="sns"
             payload={{ offer_id: offerId, context: 'offer_landing' }}
             href={`/${tenantSlug}/contact/dm?context=offer&offerId=${offerId}`} 
             className="flex-1 max-w-[120px] flex items-center justify-center py-4 rounded-full font-bold text-indigo-700 bg-white border border-indigo-200 shadow-xl hover:bg-indigo-50 transition-all"
          >
             문의하기
          </TrackedLink>
       </div>
    </div>
  );
}
