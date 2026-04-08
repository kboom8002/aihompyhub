const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('./apps/web/.env.local'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
   const { data, error } = await supabaseAdmin.from('user_profiles').select('*').limit(1);
   if (error) {
       console.log('ERROR:', error.message);
   } else {
       console.log('TABLE EXISTS! Data:', data);
       const { data: u } = await supabaseAdmin.auth.admin.listUsers();
       const id = u.users.find(x => x.email === 'kboom8002@gmail.com')?.id;
       console.log('User ID:', id);
       const { data: prof } = await supabaseAdmin.from('user_profiles').select('*').eq('id', id).single();
       console.log('Profile for user:', prof);
   }
}
check();
