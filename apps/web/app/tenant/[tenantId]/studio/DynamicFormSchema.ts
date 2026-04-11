export interface FormFieldSchema {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'richtext' | 'relation';
  relationTarget?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
}

export const CONTENT_TYPE_SCHEMAS: Record<string, FormFieldSchema[]> = {
  compare: [
    { name: 'profileA.name', label: '[Option A] 이름', type: 'text', required: true, placeholder: '예: 메디텐션 하이드로겔' },
    { name: 'profileA.targetFit', label: '[Option A] 추천 타겟 (Best For)', type: 'text', placeholder: '예: 즉각적인 탄력 리프팅' },
    { name: 'profileA.description', label: '[Option A] 기본 설명', type: 'textarea', placeholder: '선택 군의 주요 특징이나 기능을 입력하세요.' },

    { name: 'profileB.name', label: '[Option B] 이름', type: 'text', required: true, placeholder: '예: 메디글로우 모델링' },
    { name: 'profileB.targetFit', label: '[Option B] 추천 타겟 (Best For)', type: 'text', placeholder: '예: 데일리 장벽 강화' },
    { name: 'profileB.description', label: '[Option B] 기본 설명', type: 'textarea', placeholder: '선택 군의 주요 특징이나 기능을 입력하세요.' },
    { name: 'conclusion', label: '최종 결론 (Conclusion)', type: 'textarea', helpText: 'AI가 파싱할 1줄 결론 (예: 어떤 타겟은 A, 어떤 타겟은 B)' },
    { name: 'body', label: '상세 비교 딥다이브 (Rich Text)', type: 'richtext', helpText: '하단에 텍스트 형태로 부연 설명할 디테일한 비교글을 작성합니다.' },
    { name: 'cautions', label: '병용 / 선택 주의사항 (Cautions)', type: 'textarea' },
    
    { name: 'related_topics', label: '🔗 연관 Topic Hub 연결', type: 'relation', relationTarget: 'topic_hub', helpText: '이 콘텐츠 하단에 아코디언 위젯으로 띄워줄 연관 지식들을 검색하여 엮어둡니다.' },
    { name: 'related_experts', label: '🩺 제안/감수 전문가', type: 'relation', relationTarget: 'expert' },
    { name: 'related_evidence', label: '🔬 연관 신뢰 근거 (Evidence)', type: 'relation', relationTarget: 'trust' }
  ],
  trust: [
    { name: 'evidenceType', label: '증명 자료 구분 (Evidence Type)', type: 'text', required: true, placeholder: '예: 임상 시험(Clinical Trial), 특허(Patent), 성분검증 등' },
    { name: 'reviewer', label: '검토자 / 인증 기관명', type: 'text', required: true, placeholder: '예: 대한피부과학회 연구소' },
    { name: 'sources', label: '관련 출처 / 참고 문헌', type: 'textarea', placeholder: '출처가 여러 개인 경우 쉼표(,)로 구분하여 입력하세요.' },
    { name: 'body', label: '증명 자료 요약 / 상세 리포트', type: 'richtext', helpText: '논문의 핵심 결과나 특허의 주요 효능을 요약하여 작성합니다.' },
    { name: 'related_answers', label: '🔗 연관 SSoT 공식 답변 연결', type: 'relation', relationTarget: 'answer', helpText: '이 신뢰 문서를 근거로 삼는 공식 답변들을 연결합니다.' }
  ],
  expert: [
    { name: 'role_title', label: '역할 / 직함', type: 'text', required: true, placeholder: '예: 수석 연구원, 메디컬 자문위원, 뷰티 에디터' },
    { name: 'credentials', label: '이력 및 자격 (Credentials)', type: 'textarea', placeholder: '학위, 병원 소속 등. 줄바꿈으로 여러 개 작성 가능합니다.' },
    { name: 'profile_url', label: '프로필 사진 URL', type: 'text', placeholder: '이미지 링크 주소' },
    { name: 'social_links', label: '소셜 / 인증 링크 (EEAT 검증)', type: 'text', placeholder: 'Linkedin 주소나 공식 학회/병원 링크 (쉼표로 구분)' },
    { name: 'bio', label: '전문가 소개 / 약력 요약', type: 'textarea' },
    { name: 'body', label: '상세 이력 (RichText)', type: 'richtext' }
  ],
  answer: [
    { name: 'summary', label: '핵심 요약 (Summary / Direct Answer)', type: 'textarea', helpText: 'AI 검색기 및 최상단에 노출될 가장 직접적인 한 문단 답변.' },
    { name: 'body', label: '상세 본문 (Why it matters / How to apply)', type: 'richtext', helpText: '자세한 방식과 이유를 작성합니다.' },
    { name: 'cautions', label: '의학적 주의사항 / 경계 문구 (Cautions)', type: 'textarea', helpText: '시술 대체나 효과 보장으로 읽히지 않도록 방어하는 문구 (EEAT 필수).' },
    { name: 'related_experts', label: '🩺 연관 전문가 (Reviewer)', type: 'relation', relationTarget: 'expert', helpText: '이 답변을 검수하거나 보증한 전문가를 연결합니다.' },
    { name: 'related_evidence', label: '🔬 연관 신뢰 근거 (Evidence)', type: 'relation', relationTarget: 'trust', helpText: '이 답변의 근거가 된 임상, 논문, 특허 자료를 연결합니다.' },
    { name: 'related_topics', label: '📚 상위 토픽 허브 (Topic)', type: 'relation', relationTarget: 'topic_hub', helpText: '이 답변이 속한 대분류 지식 허브를 연결합니다.' }
  ],
  routine: [
    { name: 'summary', label: '핵심 루틴 요약 (How-to Summary)', type: 'textarea', helpText: 'AI가 파싱할 1~3단계의 간결한 순서 요약' },
    { name: 'body', label: '루틴 가이드 본문 (RichText)', type: 'richtext' },
    { name: 'cautions', label: '루틴 수행 시 주의사항 (Cautions)', type: 'textarea' },
    { name: 'related_experts', label: '🩺 제안/감수 전문가', type: 'relation', relationTarget: 'expert' },
    { name: 'related_answers', label: '💡 연관 SSoT 공식 답변', type: 'relation', relationTarget: 'answer' }
  ],
  story: [
    { name: 'summary', label: '아티클 초록 (Article Abstract)', type: 'textarea', helpText: 'AI 검색기 및 카드 목록에 노출될 아티클의 핵심 요약' },
    { name: 'body', label: '아티클 본문 (RichText)', type: 'richtext' },
    { name: 'related_experts', label: '🩺 에디터/인터뷰이 (Expert)', type: 'relation', relationTarget: 'expert' },
    { name: 'related_answers', label: '💡 연관 SSoT 공식 답변', type: 'relation', relationTarget: 'answer' }
  ],
  creator: [
    { name: 'handle', label: '소셜 핸들 (SNS ID)', type: 'text', required: true, placeholder: '예: @creator_name' },
    { name: 'platform', label: '주 활동 플랫폼', type: 'text', placeholder: '예: Instagram, TikTok, YouTube' },
    { name: 'bio_short', label: '한 줄 소개 (Bio)', type: 'textarea', placeholder: '해당 크리에이터를 설명하는 핵심 멘트.' },
    { name: 'proof_assets', label: '비포/애프터 및 인증 영상 URL', type: 'textarea', helpText: '쉼표로 구분하여 여러 개의 이미지/영상 링크 입력 가능' },
    { name: 'body', label: '크리에이터 코멘트 / 심층 스토리', type: 'richtext' },
    { name: 'related_answers', label: '💡 자주 묻는 질문 (FAQ)', type: 'relation', relationTarget: 'answer', helpText: '이 크리에이터 랜딩에서 미리 답해줄 SSoT 공식 답변 연결' }
  ],
  offer: [
    { name: 'offer_type', label: '오퍼 유형', type: 'text', placeholder: '예: jointbuy, launch, bundle, campaign' },
    { name: 'campaign_period', label: '캠페인 진행 기간', type: 'text', placeholder: '예: 2026.04.11 ~ 2026.04.15' },
    { name: 'price_regular', label: '정상가', type: 'text' },
    { name: 'price_offer', label: '공동구매/오퍼 할인가', type: 'text' },
    { name: 'countdown_end_at', label: '타이머 종료 일시', type: 'text', placeholder: '예: 2026-04-15T23:59:59 (ISO 형태 권장)' },
    { name: 'fit_summary', label: '이 오퍼가 잘 맞는 타겟 (Fit Summary)', type: 'textarea' },
    { name: 'body', label: '오퍼 상세 설명 (RichText)', type: 'richtext' },
    { name: 'related_creator', label: '협업 크리에이터 (Creator)', type: 'relation', relationTarget: 'creator' },
    { name: 'related_answers', label: '💡 연관 FAQ 및 정책 답변', type: 'relation', relationTarget: 'answer', helpText: '배송/환불 정책 등 이 오퍼에서 방어해야 할 필수 답변 연결' }
  ],
  product: [
    { name: 'one_liner', label: '제품 한 줄 정의 (One-liner)', type: 'textarea', required: true },
    { name: 'fit_summary', label: '이 제품과 맞는 타겟 (Best Fit for)', type: 'textarea' },
    { name: 'not_fit_summary', label: '이 제품과 맞지 않는 타겟 (Not Fit for)', type: 'textarea' },
    { name: 'benefits', label: '핵심 효익 요약', type: 'textarea' },
    { name: 'ingredients_or_key_points', label: '주요 성분 / 차별화 포인트', type: 'textarea' },
    { name: 'body', label: '제품 상세 스토리 (RichText)', type: 'richtext' },
    { name: 'related_answers', label: '💡 자주 묻는 질문 (FAQ)', type: 'relation', relationTarget: 'answer' },
    { name: 'related_topics', label: '📚 해결 가능한 문제 허브 (Topic)', type: 'relation', relationTarget: 'topic_hub' }
  ],
  portfolio: [
    { name: 'client_or_context', label: '클라이언트 / 의뢰 맥락', type: 'text', required: true, placeholder: '예: 30대 후반, 급격한 탄력 저하 고민 환자' },
    { name: 'challenge', label: '도전 과제 (Problem/Challenge)', type: 'textarea', placeholder: '해결해야만 했던 구체적 증상이나 사업적 한계를 입력하세요' },
    { name: 'approach', label: '접근 방식 (Approach)', type: 'textarea', placeholder: '문제를 해결하기 위해 어떤 방법/시술/솔루션을 적용했는지 요약' },
    { name: 'outcome', label: '최종 결과 (Outcome)', type: 'textarea', placeholder: '도입 전후 비교 및 성과' },
    { name: 'visual_assets', label: '시각 증명 에셋 URL', type: 'textarea', helpText: 'Before/After 사진 또는 VR 매물 등. 쉼표로 구분하여 여러 개 입력 가능' },
    { name: 'body', label: '상세 케이스 스터디 (RichText)', type: 'richtext' },
    { name: 'related_offer', label: '🎁 관련 오퍼/진료과목', type: 'relation', relationTarget: 'offer', helpText: '이 결과물을 만든 실제 제공 상품/패키지 연결' },
    { name: 'related_answers', label: '💡 도중 자주 발생한 질문/답변', type: 'relation', relationTarget: 'answer' }
  ],
  readiness_checker: [
    { name: 'target_audience', label: '주 타겟 고객', type: 'text', placeholder: '예: 시리즈 A 이상 스타트업 B2B 기업' },
    { name: 'not_fit_criteria', label: '우리가 돕지 못하는 분들 (Not fit)', type: 'textarea', helpText: '줄바꿈으로 여러 개 작성. 상담을 미리 필터링하기 위한 필수 요건입니다.' },
    { name: 'expected_budget', label: '예상 소요 예산/단가', type: 'text', placeholder: '예: 월 300만원 ~ 500만원 선' },
    { name: 'prerequisites', label: '사전 준비/요구 사항', type: 'textarea', placeholder: '상담 전 고객이 파악해야 할 지점' },
    { name: 'body', label: '세부 안내 사항 (RichText)', type: 'richtext' }
  ],
  default: [
    { name: 'body', label: '콘텐츠 본문 (Rich Tiptap Body)', type: 'richtext' },
    { name: 'related_experts', label: '🩺 연관 전문가 (Reviewer)', type: 'relation', relationTarget: 'expert' },
    { name: 'related_evidence', label: '🔬 연관 신뢰 근거 (Evidence)', type: 'relation', relationTarget: 'trust' }
  ]
};
