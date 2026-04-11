'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function DmRedirectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantSlug = params.tenantSlug as string;
  
  // 파라미터에서 컨텍스트 추출 (어디서 유입되었는지)
  const sourceContext = searchParams.get('context') || 'homepage';
  const offerId = searchParams.get('offerId');
  const creatorId = searchParams.get('creatorId');
  const platform = searchParams.get('platform') || 'ig'; // ig = Instagram, kk = Kakao

  useEffect(() => {
    // 1. (가상의) 분석 API로 click_dm 리드(lead) 전환 이벤트 전송
    const logEvent = async () => {
      try {
        console.log(`[Analytics] Track Event: click_dm for ${tenantSlug}`, {
          source: sourceContext,
          offer_id: offerId,
          creator_id: creatorId,
          platform: platform
        });
        // await fetch('/api/analytics/track', { method: 'POST', body: JSON.stringify({...}) });
      } catch (err) {
        console.warn('Analytics track failed', err);
      }
    };

    const redirect = () => {
       // 2. 브랜드 설정에서 불러온 DM/카카오톡 채널로 리다이렉트
       // 하드코딩 대신 나중에는 dbBrandProfile.instagram_handle 등으로 연결
       const IG_HANDLE = 'brand_official'; // SSoT Demo Handle
       const KAKAO_CHANNEL = 'brand_official_pf';

       // 문맥에 맞춰 초기 메시지 세팅 (고객 편의성)
       let prefilledText = '안녕하세요! 상담 문의드립니다.';
       if (offerId) prefilledText = `안녕하세요! 공동구매/오퍼(${offerId}) 관련해서 문의드립니다.`;
       if (creatorId) prefilledText = `안녕하세요! 크리에이터(${creatorId}) 랜딩을 보고 문의드립니다.`;

       setTimeout(() => {
          if (platform === 'kk') {
             // Kakao Plus Friend Link
             window.location.href = `http://pf.kakao.com/${KAKAO_CHANNEL}/chat`;
          } else {
             // Instagram DM Link (IG.me)
             // 참고: ig.me는 기본적으로 앱을 열어주며, 길찾기가 부드러움
             window.location.href = `https://ig.me/m/${IG_HANDLE}?text=${encodeURIComponent(prefilledText)}`;
          }
       }, 800); // 사용자에게 짧게 '진입 중' 피드백을 주기 위한 시간
    };

    logEvent().then(redirect);
  }, [tenantSlug, sourceContext, offerId, creatorId, platform]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans px-4 text-center">
       <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
       <h1 className="text-2xl font-bold text-gray-900 mb-2">상담 채널로 연결 중입니다</h1>
       <p className="text-gray-500">빠르고 정확한 답변 준비를 위해 안전하게 이동하고 있습니다...</p>
       <div className="mt-8 text-sm text-gray-400 bg-gray-50 p-4 rounded-xl border border-gray-100 max-w-sm">
          <strong>Tip.</strong> 자주 묻는 질문(FAQ)이나 정책은 상담원이 SSoT 공식 문서 링크로 정확하게 답변해 드릴 예정입니다.
       </div>
    </div>
  );
}
