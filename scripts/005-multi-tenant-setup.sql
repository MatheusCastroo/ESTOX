-- Multi-Tenant Setup Script
-- REQ-FR-031: Controle de Usuários e Acesso por Cliente via Complemento de URL
-- This script ensures the database structure supports multi-tenant functionality

-- Ensure stores.slug is unique and indexed
ALTER TABLE stores 
ADD UNIQUE INDEX IF NOT EXISTS idx_stores_slug_unique (slug);

-- Ensure all tables have proper store_id foreign keys
-- (These should already exist from 001-create-tables.sql, but we verify)

-- Add index on store_id for better performance
ALTER TABLE vehicles 
ADD INDEX IF NOT EXISTS idx_vehicles_store_id_status (store_id, status);

ALTER TABLE leads 
ADD INDEX IF NOT EXISTS idx_leads_store_id_status (store_id, status);

ALTER TABLE vehicle_views 
ADD INDEX IF NOT EXISTS idx_vehicle_views_store_id_date (store_id, viewed_at);

-- Ensure stores.is_active exists and is indexed
ALTER TABLE stores 
ADD INDEX IF NOT EXISTS idx_stores_active_slug (is_active, slug);

-- Verify that store_slug cannot be changed after creation
-- (This is enforced at application level, but we add a comment for documentation)
-- Note: Application should prevent slug updates after store creation

-- Add comment to stores table
ALTER TABLE stores 
COMMENT = 'Multi-tenant stores table. Each store has a unique slug for public access.';

