-- AutoStock Database Update
-- Script 014: Add checkout_url field to plans table and update with Stripe Payment Links
-- MySQL Version

-- Adicionar campo checkout_url aos planos
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'plans' 
    AND COLUMN_NAME = 'checkout_url'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE plans ADD COLUMN checkout_url VARCHAR(500) NULL COMMENT ''Link direto do Stripe Checkout (Payment Link)''',
    'SELECT ''Coluna checkout_url já existe'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Atualizar planos com os links do Stripe Payment Links
-- Plano Mensal
UPDATE plans 
SET checkout_url = 'https://buy.stripe.com/eVqdR3aUv2Qp4c02s7fjG02'
WHERE slug = 'profissional-mensal';

-- Plano Trimestral
UPDATE plans 
SET checkout_url = 'https://buy.stripe.com/7sY3cpd2D76F5g4eaPfjG01'
WHERE slug = 'profissional-trimestral';

-- Plano Anual
UPDATE plans 
SET checkout_url = 'https://buy.stripe.com/5kQbIV3s3aiR4c07MrfjG00'
WHERE slug = 'profissional-anual';
