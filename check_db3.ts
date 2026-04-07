import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabaseAdmin.from('universal_content_assets').select('id').limit(1);
  console.log("Assets data:", data);
  console.log("Assets err:", error);
}
run();
