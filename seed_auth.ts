import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  try {
      console.log('Dropping user_profiles if exists...');
      await supabaseAdmin.rpc('run_sql', { sql: 'DROP TABLE IF EXISTS user_profiles;' }).catch(() => null);

      console.log('Creating user_profiles table...');
      const createSql = `
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          tenant_id UUID REFERENCES tenants(id),
          role TEXT NOT NULL DEFAULT 'tenant_admin',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      // Instead of raw execute (Supabase JS doesn't have it natively unless rpc is exposed),
      // Since it's MVP and we might not have 'run_sql' generic RPC, we can just hit the API or insert into it,
      // but wait, creating tables requires SQL execution.
      // I'll try raw POST to rest/v1 or just proceed if it succeeds, but usually we use a `seed.sql` with CLI.
  } catch (e: any) {
      console.error(e.message);
  }
}
run();
