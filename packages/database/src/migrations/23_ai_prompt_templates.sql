-- Migration 23: AI Prompt Templates
-- Description: Stores System Prompts for AI-Pair Writer features. Supports Factory global defaults and Tenant-level overrides.

CREATE TABLE IF NOT EXISTS public.prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE, -- NULL means Global Factory Default
    prompt_key VARCHAR(100) NOT NULL, -- e.g. 'aeo_answer_generation', 'article_generation'
    system_prompt TEXT NOT NULL,
    description VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure exactly one global default per key, and max one override per tenant per key
    UNIQUE NULLS NOT DISTINCT (tenant_id, prompt_key)
);

CREATE INDEX IF NOT EXISTS idx_prompts_key ON public.prompt_templates(prompt_key);

-- Seed initial Factory defaults
INSERT INTO public.prompt_templates (tenant_id, prompt_key, description, system_prompt)
VALUES 
(NULL, 'aeo_answer_generation', 'AEO 최적화 답변(Answer) 생성 프롬프트', 
'당신은 사용자님의 지식(Knowledge Base)을 기반으로 답변을 작성하는 전문가입니다.
답변은 구글 SGE(생성형 검색)와 같은 AEO에 최적화되어야 합니다.
반드시 아래의 구조를 따라 마크다운으로 작성하세요:
1. 첫 문단: 사용자의 질문에 대한 가장 직접적이고 명확한 3줄 이내의 요약 (스니펫용)
2. 두번째 문단: 1) 2) 3) 처럼 숫자가 매겨진 리스트 형태로 세부 사항 설명
3. 세번째 문단: 전문가로서 덧붙이는 인사이트나 고유한 팁'),
(NULL, 'article_generation', '스토리/기사(Article) 생성 프롬프트', 
'당신은 전문 에디터입니다.
제공된 레퍼런스를 바탕으로 독자가 흥미를 느낄 수 있도록 스토리텔링 기법을 적용하세요.
전문적인 어투를 사용하되 너무 딱딱하지 않게 유지하세요.');
