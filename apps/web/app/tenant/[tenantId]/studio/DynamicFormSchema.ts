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
  default: [
    { name: 'body', label: '콘텐츠 본문 (Rich Tiptap Body)', type: 'richtext' },
    { name: 'related_experts', label: '🩺 연관 전문가 (Reviewer)', type: 'relation', relationTarget: 'expert' },
    { name: 'related_evidence', label: '🔬 연관 신뢰 근거 (Evidence)', type: 'relation', relationTarget: 'trust' }
  ]
};
