-- AutoStock Database Migration
-- Script 016: Assign Free Plan to Stores Without Plan
-- MySQL Version (for phpMyAdmin)

-- Atualizar lojas que não têm plano associado para usar o plano gratuito
UPDATE stores s
LEFT JOIN plans p ON s.plan_id = p.id
SET s.plan_id = (
    SELECT id FROM plans WHERE slug = 'gratuito' AND is_active = true LIMIT 1
)
WHERE s.plan_id IS NULL 
   OR (p.id IS NULL AND s.plan_id IS NOT NULL);

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

-- Atualizar o plano gratuito se já existir para garantir que tem limite de 5
UPDATE plans 
SET 
    vehicle_limit = 5,
    price = 0.00,
    is_active = true,
    updated_at = NOW()
WHERE slug = 'gratuito';

-- Nota: Este script garante que:
-- 1. Todas as lojas sem plano recebem o plano gratuito
-- 2. O plano gratuito existe e tem limite de 5 veículos
-- 3. A validação em api/endpoints/vehicles.php agora verifica corretamente o plano
