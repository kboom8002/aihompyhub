import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing_url';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing_key';
console.log("URL:", url);
console.log("KEY LENGTH:", key.length);

const s = createClient(url, key);
s.from('brand_profiles').select('*').limit(1).then(r => console.log('profiles:', r.error || r.data));
