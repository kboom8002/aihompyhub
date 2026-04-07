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
    
    { name: 'body', label: '상세 비교 딥다이브 (Rich Text)', type: 'richtext', helpText: '하단에 텍스트 형태로 부연 설명할 디테일한 비교글을 작성합니다.' },
    
    { name: 'related_topics', label: '🔗 연관 Topic Hub 연결', type: 'relation', relationTarget: 'topic_hub', helpText: '이 콘텐츠 하단에 아코디언 위젯으로 띄워줄 연관 지식들을 검색하여 엮어둡니다.' }
  ],
  default: [
    { name: 'body', label: '콘텐츠 본문 (Rich Tiptap Body)', type: 'richtext' }
  ]
};
