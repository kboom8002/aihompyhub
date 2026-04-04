import { createClient } from '@supabase/supabase-js';

// TODO: In a real Next.js application, use @supabase/ssr for proper cookie handling.
// For the MVP stub, we instantiate a direct client simulating a server admin client.
export const createServerSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'stub-service-key';
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
