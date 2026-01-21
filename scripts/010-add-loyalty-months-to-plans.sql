-- AutoStock Database Update
-- Script 010: Add loyalty_months field to plans table
-- MySQL Version

-- Adicionar campo loyalty_months aos planos
-- Verificar se a coluna já existe antes de adicionar
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'plans' 
    AND COLUMN_NAME = 'loyalty_months'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE plans ADD COLUMN loyalty_months INT DEFAULT 0 COMMENT ''Período mínimo de fidelidade em meses (0 = sem fidelidade)''',
    'SELECT ''Coluna loyalty_months já existe'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Atualizar fidelidade dos planos existentes
-- Mensal: sem fidelidade (0 meses)
UPDATE plans SET loyalty_months = 0 WHERE slug = 'profissional-mensal';

-- Trimestral: 3 meses de fidelidade
UPDATE plans SET loyalty_months = 3 WHERE slug = 'profissional-trimestral';

-- Anual: 12 meses de fidelidade
UPDATE plans SET loyalty_months = 12 WHERE slug = 'profissional-anual';

-- Outros planos: sem fidelidade por padrão
UPDATE plans SET loyalty_months = 0 WHERE loyalty_months IS NULL;
