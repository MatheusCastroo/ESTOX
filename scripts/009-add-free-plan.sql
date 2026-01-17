-- AutoStock Database Migration
-- Script 009: Add Free Plan (Plano Gratuito)
-- MySQL Version (for phpMyAdmin)

-- Adicionar plano gratuito
INSERT INTO plans (id, name, slug, price, vehicle_limit, features, is_active, created_at, updated_at)
VALUES (
    UUID(),
    'Gratuito',
    'gratuito',
    0.00,
    5,
    '["Até 5 veículos", "Catálogo com URL personalizada", "Integração WhatsApp"]',
    true,
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE 
    name = 'Gratuito',
    price = 0.00,
    vehicle_limit = 5,
    features = '["Até 5 veículos", "Catálogo com URL personalizada", "Integração WhatsApp"]',
    is_active = true,
    updated_at = NOW();

-- Nota: Este script cria o plano gratuito com:
-- - Limite de 5 veículos
-- - Preço: R$ 0,00 (grátis)
-- - Features: Até 5 veículos, Catálogo com URL personalizada, Integração WhatsApp
-- - Status: Ativo (is_active = true)

-- IMPORTANTE: Para permitir cadastro de veículos no plano gratuito (status 'trial'),
-- é necessário ajustar o código em api/endpoints/vehicles.php linha 270-273
-- para permitir status 'trial' além de 'active'.

