import { notFound } from 'next/navigation';
import { resolveTenantId } from '@/lib/tenant';
import { supabaseAdmin } from '@/lib/supabase';
import { BlockRenderer } from '@/components/store/blocks/BlockRenderer';
import { TrackedLink } from '@/components/store/TrackedUI';

export const revalidate = 0;

export default async function CreatorLandingPage(props: { params: Promise<{ tenantSlug: string, creatorId: string }> }) {
  const params = await props.params;
  const { tenantSlug, creatorId } = params;

  const tenantId = await resolveTenantId(tenantSlug);
  if (!tenantId) {
    notFound();
  }

  const { data: dbCreator } = await supabaseAdmin
     .from('universal_content_assets')
     .select('*')
     .eq('id', creatorId)
     .eq('tenant_id', tenantId)
     .eq('type', 'creator')
     .single();

  if (!dbCreator) {
    notFound();
  }

  const payload = dbCreator.json_payload || {};

  // Resolve related FAQs
  let relatedAnswers: any[] = [];
  if (payload.related_answers && payload.related_answers.length > 0) {
      const { data: answersData } = await supabaseAdmin
        .from('answer_cards')
        .select('*, topics(title)')
        .in('id', payload.related_answers);
      
      if (answersData) relatedAnswers = answersData;
  }

  return (
    <div className="flex flex-col font-sans pt-12 pb-24 max-w-4xl mx-auto px-4">
       {/* 1. Creator Hero Block */}
       <div className="text-center mb-12">
          {payload.proof_assets && (
             <img src={payload.proof_assets.split(',')[0]} alt={dbCreator.title} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-indigo-100" />
          )}
          <h1 className="text-3xl font-bold mb-2">{dbCreator.title}</h1>
          <p className="text-indigo-600 font-semibold mb-2">{payload.handle} {payload.platform && `on ${payload.platform}`}</p>
          <p className="text-gray-600 max-w-lg mx-auto text-lg">{payload.bio_short}</p>
       </div>

       {/* 2. Full Bio / Details */}
       {payload.body && (
          <div className="prose prose-indigo mx-auto mb-16 text-gray-700 bg-gray-50 p-8 rounded-xl" dangerouslySetInnerHTML={{ __html: payload.body }} />
       )}

       {/* 3. Proof Assets Gallery (Optional) */}
       {payload.proof_assets && payload.proof_assets.split(',').length > 1 && (
         <div className="mb-16">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📷 크리에이터 미디어</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
               {payload.proof_assets.split(',').map((url: string, idx: number) => (
                  <img key={idx} src={url.trim()} className="h-64 object-cover rounded-lg snap-center bg-gray-100 shadow-sm" alt={`Proof ${idx}`} />
               ))}
            </div>
         </div>
       )}

       {/* 4. Cross-related FAQs (SSoT Connection) */}
       {relatedAnswers.length > 0 && (
         <div className="mb-16">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">💡 이 조합을 위한 공식 Q&A</h2>
            <BlockRenderer 
              layoutSettings={[{ type: 'AnswerCardGrid' }]}
              context={{ tenantSlug, brandProfile: null, answerCards: relatedAnswers, heroConfig: {} }}
            />
         </div>
       )}

       {/* CTA */}
       <div className="text-center mt-12 flex flex-col gap-4 items-center">
          <TrackedLink 
             tenantId={tenantId}
             eventName="click_view_offers"
             category="sns"
             payload={{ creator_id: creatorId, context: 'creator_landing' }}
             href={`/${tenantSlug}`} 
             className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-lg shadow-indigo-200 w-full max-w-sm"
          >
             진행 중인 스페셜 오퍼 보기
          </TrackedLink>
          <TrackedLink 
             tenantId={tenantId}
             eventName="click_dm"
             category="sns"
             payload={{ creator_id: creatorId, context: 'creator_landing' }}
             href={`/${tenantSlug}/contact/dm?context=creator&creatorId=${creatorId}`} 
             className="inline-block px-8 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-full font-bold shadow-sm w-full max-w-sm"
          >
             이 크리에이터 관련 1:1 피부 상담
          </TrackedLink>
       </div>
    </div>
  );
}
