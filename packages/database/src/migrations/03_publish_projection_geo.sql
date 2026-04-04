-- Migration: 03_publish_projection_geo
-- Purpose: Schema for Phase 2 Publish, Projection, Search, GEO, and Template assignments

-- 1. Template Profile & Assignments
CREATE TABLE template_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  family_type TEXT NOT NULL, -- GenericCore, HighTrustVariant, etc.
  overrides JSONB, -- Navigation emphasis, visual skin overrides
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Publish Bundles
CREATE TABLE publish_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  template_profile_id UUID REFERENCES template_profiles(id),
  status TEXT NOT NULL CHECK (status IN ('draft', 'validating', 'published', 'rolled_back', 'failed')),
  target_locale TEXT,
  target_market TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Route Projections
CREATE TABLE route_projections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  bundle_id UUID NOT NULL REFERENCES publish_bundles(id),
  route_path TEXT NOT NULL,
  target_object_type TEXT NOT NULL,
  target_object_id UUID NOT NULL,
  version_ref UUID, -- Source truth snapshot version
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Search & GEO 
CREATE TABLE search_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  target_object_type TEXT NOT NULL,
  target_object_id UUID NOT NULL,
  version_ref UUID, -- Source truth snapshot version
  sync_status TEXT NOT NULL CHECK (sync_status IN ('pending', 'synced', 'failed', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE geo_exclusions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  target_object_type TEXT NOT NULL,
  target_object_id UUID NOT NULL,
  version_ref UUID, -- Source truth snapshot version
  excluded_regions JSONB NOT NULL, -- e.g., ["EU", "CN"]
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
