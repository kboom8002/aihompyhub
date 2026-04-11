CREATE TABLE IF NOT EXISTS public.deal_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    sender_type text NOT NULL CHECK (sender_type IN ('customer', 'tenant', 'ai')),
    sender_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    translations JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deal_messages_inquiry ON public.deal_messages(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_deal_messages_created ON public.deal_messages(created_at);

ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS customer_auth_id UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE public.deal_messages ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for now if customer is anonymous (we will restrict properly in backend, but for realtime subscriptions we need policies)
CREATE POLICY "Allow public select on deal_messages for now" ON public.deal_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert on deal_messages for now" ON public.deal_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on deal_messages for now" ON public.deal_messages FOR UPDATE USING (true);

-- Enable Realtime for deal_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'deal_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_messages;
  END IF;
END
$$;
