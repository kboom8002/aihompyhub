import { createClient } from '@supabase/supabase-js';

// Note: Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are provided
export const createBrowserClient = (url: string, key: string) => {
  return createClient(url, key);
};
