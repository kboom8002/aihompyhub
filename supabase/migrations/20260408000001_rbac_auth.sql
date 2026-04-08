-- Migration: 03_rbac_auth
-- Purpose: Implement user_profiles, link to Supabase Auth, and add tenant approval flows

-- 1. Modify Tenants to add status tracking
ALTER TABLE tenants
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' 
CHECK (status IN ('pending', 'active', 'suspended'));

-- Ensure existing tenants (Lumiere, Dr. Oracle, etc. created in MVP) are marked as active
UPDATE tenants SET status = 'active';

-- 2. Create user_profiles table linking to auth.users
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id), -- Can be null if they are super_admin not tied to one tenant
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'tenant_admin', 'pending_admin', 'store_user')),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: We rely on Supabase RLS but for this SaaS MVP, the Next.js API handles logic.
-- However, we must ensure the trigger works properly when a user signs up.

-- 3. Trigger to auto-create user_profile on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    -- Default to pending_admin if they sign up via the tenant portal. 
    -- Alternatively, 'store_user' if joining from storefront. We default to pending_admin for B2B portal.
    COALESCE(NEW.raw_user_meta_data->>'role', 'pending_admin'),
    -- If they created a tenant ID during signup logic, it would be passed in metadata
    (NEW.raw_user_meta_data->>'tenant_id')::uuid
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Set RLS on user_profiles (optional, mostly accessed via server action / service_role)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Super Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Function to safely mutate user and tenant as a single transaction (for approval)
CREATE OR REPLACE FUNCTION approve_tenant_admin(target_user_id UUID, target_tenant_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Change role to tenant_admin
  UPDATE user_profiles 
  SET role = 'tenant_admin' 
  WHERE id = target_user_id;
  
  -- Change tenant status to active
  UPDATE tenants 
  SET status = 'active' 
  WHERE id = target_tenant_id;
END;
$$;
