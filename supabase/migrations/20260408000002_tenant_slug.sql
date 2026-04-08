-- Migration: 04_tenant_slug
-- Purpose: Add slug unique identifier to tenants table for storefront and portal URL mapping

ALTER TABLE tenants
ADD COLUMN slug TEXT UNIQUE;

-- Create default slugs for standard MVP tenants using their IDs or names if missing
UPDATE tenants 
SET slug = lower(regexp_replace(name, '\s+', '-', 'g')) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;

-- Enforce NOT NULL now that existing rows have a slug
ALTER TABLE tenants
ALTER COLUMN slug SET NOT NULL;
