-- Add translations JSONB column to major content tables
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.answer_cards ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.universal_content_assets ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.expert_profiles ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.brand_profiles ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

-- Ensure comments for documentation
COMMENT ON COLUMN public.topics.translations IS 'Multi-language dictionary map. e.g. {"en": {"title": "Title"}}';
COMMENT ON COLUMN public.answer_cards.translations IS 'Multi-language dictionary map for QA content.';
COMMENT ON COLUMN public.universal_content_assets.translations IS 'Multi-language dictionary map for layout/content overrides.';
COMMENT ON COLUMN public.expert_profiles.translations IS 'Multi-language dictionary map for expert bio etc.';
COMMENT ON COLUMN public.brand_profiles.translations IS 'Multi-language map for Brand name, story, tagline etc.';
