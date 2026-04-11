-- 1. Ensure the pgvector extension exists
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Add embedding columns to existing universal content and answers
ALTER TABLE public.universal_content_assets ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE public.answer_cards ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 2. Create the vertical_pods table (The shared spaces)
CREATE TABLE IF NOT EXISTS public.vertical_pods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_type VARCHAR NOT NULL UNIQUE,       -- e.g., 'k-beauty', 'consulting'
    title VARCHAR NOT NULL,                      -- e.g., 'K-Beauty SSoT Platform'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the pod_memos table (Customer Memos & QIS routing source)
CREATE TABLE IF NOT EXISTS public.pod_memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pod_id UUID NOT NULL REFERENCES public.vertical_pods(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    visibility VARCHAR NOT NULL DEFAULT 'public', -- 'public' or 'private_match'
    
    raw_text TEXT NOT NULL,
    structured_intent JSONB DEFAULT '{}'::jsonb,  -- AI Extracted Context (Budget, Problem, Goal)
    embedding vector(768),                        -- Semantic matching vector
    
    status VARCHAR NOT NULL DEFAULT 'open',       -- 'open', 'matched', 'closed'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.vertical_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_memos ENABLE ROW LEVEL SECURITY;

-- 5. Open Read Access for Pods
CREATE POLICY "Enable read access for all pods" 
ON public.vertical_pods FOR SELECT USING (true);

-- 6. Memo RLS Policies
-- Anyone can view 'public' memos OR if they are the sender
CREATE POLICY "Enable memo access based on visibility or ownership" 
ON public.pod_memos FOR SELECT USING (
    visibility = 'public' OR auth.uid() = sender_id
);

-- Only authenticated users can insert memos
CREATE POLICY "Enable insert for authenticated users only" 
ON public.pod_memos FOR INSERT WITH CHECK (
    auth.uid() = sender_id
);

-- 7. Semantic Matching Function (RPC)
-- Matches a given memo embedding against verified answer_cards using pgvector cosine distance
CREATE OR REPLACE FUNCTION match_memo_to_tenant_assets(
  query_embedding vector(768),
  target_industry VARCHAR,
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  tenant_id UUID,
  asset_id UUID,
  similarity float,
  asset_type VARCHAR,
  title VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uca.tenant_id,
    uca.id as asset_id,
    1 - (uca.embedding <=> query_embedding) AS similarity,
    uca.type as asset_type,
    uca.title
  FROM public.universal_content_assets uca
  JOIN public.tenants t ON t.id = uca.tenant_id
  WHERE t.industry_type = target_industry 
    AND uca.embedding IS NOT NULL
    AND 1 - (uca.embedding <=> query_embedding) > match_threshold
  ORDER BY uca.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
