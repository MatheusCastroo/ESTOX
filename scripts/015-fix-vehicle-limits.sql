-- AutoStock Database Migration
-- Script 015: Fix Vehicle Limits (Corrigir Limites de Veículos)
-- MySQL Version (for phpMyAdmin)

-- Garantir que o plano gratuito tenha limite de 5 veículos
UPDATE plans 
SET vehicle_limit = 5 
WHERE slug = 'gratuito' AND (vehicle_limit IS NULL OR vehicle_limit = 0 OR vehicle_limit != 5);

-- Garantir que os planos profissionais tenham limite de 50 veículos
UPDATE plans 
SET vehicle_limit = 50 
WHERE slug IN ('profissional-mensal', 'profissional-trimestral', 'profissional-anual', 'profissional')
  AND (vehicle_limit IS NULL OR vehicle_limit = 0 OR vehicle_limit != 50);

-- Verificar se o plano gratuito existe, se não existir, criar
INSERT INTO plans (id, name, slug, price, vehicle_limit, features, is_active, created_at, updated_at)
SELECT 
    UUID(),
    'Gratuito',
    'gratuito',
    0.00,
    5,
    '["Até 5 veículos", "Catálogo com URL personalizada", "Integração WhatsApp"]',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM plans WHERE slug = 'gratuito'
);

-- Atualizar o plano gratuito se já existir
UPDATE plans 
SET 
    name = 'Gratuito',
    price = 0.00,
    vehicle_limit = 5,
    features = '["Até 5 veículos", "Catálogo com URL personalizada", "Integração WhatsApp"]',
    is_active = true,
    updated_at = NOW()
WHERE slug = 'gratuito';

-- Nota: Este script garante que:
-- - Plano gratuito: 5 veículos
-- - Planos profissionais: 50 veículos
-- - O código em api/endpoints/vehicles.php agora permite status 'trial' além de 'active'
