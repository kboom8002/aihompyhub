-- Migration 24: Deal Room CRM & AI Coach
-- Description: Stores customer inquiries from the Storefront and holds the AI Pre-Visit Coach analysis briefing.

CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL, -- Nullable, generic inquiries allowed
    status VARCHAR(50) DEFAULT 'unstructured' CHECK (status IN ('unstructured', 'structured', 'consulting', 'closed')),
    
    -- Raw Customer Inputs
    customer_name VARCHAR(255) NOT NULL,
    customer_contact VARCHAR(255) NOT NULL, -- Phone or email
    raw_message TEXT NOT NULL,
    
    -- AI Pre-Visit Coach Results
    ai_structured_brief JSONB DEFAULT '{}'::jsonb, 
    -- Expected JSON structure:
    -- {
    --    "intents": ["시술 단가 문의", "통증 우려"],
    --    "matched_ssot": "마취 크림을 30분 적용하므로 견딜만 하다는 공식 답변 매핑됨.",
    --    "coach_recommendation": "통증에 예민한 고객이므로 예약 확정 전 수면마취 옵션(추가금)을 먼저 제안하는 것이 유리합니다."
    -- }
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inquiries_tenant_id ON public.inquiries(tenant_id);

-- Optional: RLS (Row Level Security)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can manage their own inquiries" 
ON public.inquiries FOR ALL 
USING (tenant_id = auth.uid()); -- Needs actual service-role or context auth

-- Insert mock Data for Deal Room testing (Welcome Lead)
INSERT INTO public.inquiries (tenant_id, customer_name, customer_contact, raw_message, status)
VALUES 
('bbbbbbbb-0000-0000-0000-000000000005', '김고객', '010-1234-5678', '여드름 흉터 때문에 프락셀 3회 패키지 보고 문의드립니당. 근데 제가 예전에 다른곳에서 프락셀 받았을때 2주 넘게 붉은기가 안빠져서 밖에 못나갔거든요ㅠㅠ 이번에도 그러면 곤란한데.. 혹시 강도 조절하면 나을까요? 아니면 피코가 나을까요? 가격은 그대로 150인가요?', 'unstructured');
