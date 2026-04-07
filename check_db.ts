import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321', process.env.SUPABASE_SERVICE_ROLE_KEY || 'stub-service-key');
s.from('brand_profiles').select('*').then(r => console.log(JSON.stringify(r.data, null, 2)));
s.from('tenants').select('*').then(r => console.log('tenants', JSON.stringify(r.data, null, 2)));
