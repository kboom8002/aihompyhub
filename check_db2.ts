import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Load from .env.local manually for debugging if needed, but since we use --env-file it works.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'stub-service-key'
);

async function run() {
  const { data, error } = await supabaseAdmin.from('brand_profiles').select('*').eq('tenant_id', '00000000-0000-0000-0000-000000000002').single();
  console.log("DB RESULT:");
  console.log(JSON.stringify(data, null, 2));
  console.log("DB ERROR:", error);
}
run();
