-- AutoStock Database Update
-- Script 013: Add loyalty_status field to existing stripe_subscriptions table
-- MySQL Version

-- Verificar se a coluna já existe antes de adicionar
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'stripe_subscriptions' 
    AND COLUMN_NAME = 'loyalty_status'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE stripe_subscriptions ADD COLUMN loyalty_status VARCHAR(20) DEFAULT ''locked'' COMMENT ''Estado da fidelidade: locked = em fidelidade, completed = fidelidade cumprida''',
    'SELECT ''Coluna loyalty_status já existe'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Atualizar loyalty_status baseado em meses_pagos e loyalty_months
UPDATE stripe_subscriptions ss
INNER JOIN plans p ON ss.plan_id = p.id
SET ss.loyalty_status = CASE
    WHEN p.loyalty_months = 0 THEN 'completed'
    WHEN ss.meses_pagos >= p.loyalty_months THEN 'completed'
    ELSE 'locked'
END
WHERE ss.loyalty_status IS NULL OR ss.loyalty_status = '';
