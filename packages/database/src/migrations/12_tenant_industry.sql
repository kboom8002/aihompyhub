-- Migration: 12_tenant_industry
-- Target: Expand tenants table to support multi-industry definitions

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' 
                   AND table_name='tenants' 
                   AND column_name='industry_type') THEN
        
        ALTER TABLE public.tenants ADD COLUMN industry_type VARCHAR(50) DEFAULT 'skincare' NOT NULL;
    END IF;
END $$;
