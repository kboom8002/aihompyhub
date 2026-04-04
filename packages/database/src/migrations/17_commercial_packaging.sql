-- Migration: 17_commercial_packaging
-- Purpose: Schema for GTM Plans, Tenant Subscriptions, and Catalog Provisioning

-- 1. Commercial Plans
-- Defines the tier definitions (Basic, Pro, Enterprise)
CREATE TABLE commercial_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_code TEXT NOT NULL UNIQUE, -- e.g. 'basic', 'pro', 'enterprise'
  display_name TEXT NOT NULL,
  monthly_price_usd DECIMAL(10, 2) NOT NULL,
  features_allowed JSONB NOT NULL, -- e.g. ["core_generation", "ab_testing", "autonomy"]
  limits_definition JSONB NOT NULL, -- e.g. {"max_generations_per_month": 1000}
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'legacy', 'deprecated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tenant Subscriptions
-- Maps a specific brand tenant to their current operating plan
CREATE TABLE tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL, -- References external tenant/brand ID
  tenant_name TEXT NOT NULL, -- Hydrated string for local queries
  plan_id UUID NOT NULL REFERENCES commercial_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tenant_subscription UNIQUE(tenant_id)
);

-- 3. Pack Catalogs
-- Blueprints and initial seeds that tenants can browse during Onboarding
CREATE TABLE pack_catalogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pack_name TEXT NOT NULL,
  description TEXT NOT NULL,
  pack_type TEXT NOT NULL CHECK (pack_type IN ('website_template', 'prompt_bundle', 'ops_dashboard')),
  minimum_plan_code TEXT NOT NULL, -- e.g. 'pro', restricts who can install this pack
  payload_manifest JSONB NOT NULL, -- Contains instructions on what specific PromptVersions/Templates to instantiate
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
