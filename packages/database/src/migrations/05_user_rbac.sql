CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  role TEXT NOT NULL DEFAULT 'tenant_admin' CHECK (role IN ('super_admin', 'tenant_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
