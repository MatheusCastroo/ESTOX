-- Rename pagarme_transactions to payment_transactions (more generic)
-- Script 007: Rename payment transactions table
-- MySQL Version (for phpMyAdmin)
-- 
-- NOTA: Este script é idempotente. 
-- Se payment_transactions já existe (criado pelo script 006), 
-- ele apenas adiciona as colunas e índices que faltam.
-- 
-- Se você tiver uma tabela pagarme_transactions antiga, renomeie manualmente:
-- RENAME TABLE pagarme_transactions TO payment_transactions;

-- Verificar se a tabela payment_transactions existe antes de adicionar colunas
SET @table_exists = (
  SELECT COUNT(*) 
  FROM information_schema.tables 
  WHERE table_schema = DATABASE() 
    AND table_name = 'payment_transactions'
);

-- Adicionar colunas apenas se a tabela existir
SET @col_gateway_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE() 
    AND table_name = 'payment_transactions' 
    AND column_name = 'gateway'
);

SET @col_order_id_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE() 
    AND table_name = 'payment_transactions' 
    AND column_name = 'order_id'
);

SET @col_payload_json_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE() 
    AND table_name = 'payment_transactions' 
    AND column_name = 'payload_json'
);

-- Adicionar coluna gateway se não existir
SET @sql_add_gateway = IF(@table_exists > 0 AND @col_gateway_exists = 0,
  'ALTER TABLE payment_transactions ADD COLUMN gateway VARCHAR(50) DEFAULT ''stripe'' AFTER store_id',
  'SELECT "Coluna gateway já existe ou tabela não existe" AS message');

PREPARE stmt FROM @sql_add_gateway;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar coluna order_id se não existir
SET @sql_add_order_id = IF(@table_exists > 0 AND @col_order_id_exists = 0,
  'ALTER TABLE payment_transactions ADD COLUMN order_id VARCHAR(255) AFTER transaction_id',
  'SELECT "Coluna order_id já existe ou tabela não existe" AS message');

PREPARE stmt FROM @sql_add_order_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar coluna payload_json se não existir (verificar se existe coluna postback_data)
SET @col_postback_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE() 
    AND table_name = 'payment_transactions' 
    AND column_name = 'postback_data'
);

SET @sql_add_payload = IF(@table_exists > 0 AND @col_payload_json_exists = 0,
  IF(@col_postback_exists > 0,
    'ALTER TABLE payment_transactions ADD COLUMN payload_json JSON DEFAULT (''{}'') AFTER postback_data',
    'ALTER TABLE payment_transactions ADD COLUMN payload_json JSON DEFAULT (''{}'')'),
  'SELECT "Coluna payload_json já existe ou tabela não existe" AS message');

PREPARE stmt FROM @sql_add_payload;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing records (apenas se a tabela e coluna existirem)
SET @table_exists = (
  SELECT COUNT(*) 
  FROM information_schema.tables 
  WHERE table_schema = DATABASE() 
    AND table_name = 'payment_transactions'
);

SET @col_gateway_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE() 
    AND table_name = 'payment_transactions' 
    AND column_name = 'gateway'
);

SET @sql_update = IF(@table_exists > 0 AND @col_gateway_exists > 0,
  'UPDATE payment_transactions SET gateway = ''pagarme'' WHERE gateway IS NULL OR gateway = ''''',
  'SELECT "Tabela ou coluna gateway não existe" AS message');

PREPARE stmt FROM @sql_update;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename transaction_id to order_id for Stripe compatibility (keep both for now)
-- ALTER TABLE payment_transactions 
--   CHANGE COLUMN transaction_id order_id VARCHAR(255);

-- Adicionar índices apenas se não existirem (idempotente)
SET @index_order_id_exists = (
  SELECT COUNT(*) 
  FROM information_schema.statistics 
  WHERE table_schema = DATABASE() 
    AND table_name = 'payment_transactions' 
    AND index_name = 'idx_payment_order_id'
);

SET @index_gateway_exists = (
  SELECT COUNT(*) 
  FROM information_schema.statistics 
  WHERE table_schema = DATABASE() 
    AND table_name = 'payment_transactions' 
    AND index_name = 'idx_payment_gateway'
);

SET @table_exists = (
  SELECT COUNT(*) 
  FROM information_schema.tables 
  WHERE table_schema = DATABASE() 
    AND table_name = 'payment_transactions'
);

SET @sql_add_index_order = IF(@table_exists > 0 AND @index_order_id_exists = 0,
  'ALTER TABLE payment_transactions ADD INDEX idx_payment_order_id (order_id)',
  'SELECT "Índice idx_payment_order_id já existe ou tabela não existe" AS message');SET @sql_add_index_gateway = IF(@table_exists > 0 AND @index_gateway_exists = 0,
  'ALTER TABLE payment_transactions ADD INDEX idx_payment_gateway (gateway)',
  'SELECT "Índice idx_payment_gateway já existe ou tabela não existe" AS message');PREPARE stmt FROM @sql_add_index_order;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;PREPARE stmt FROM @sql_add_index_gateway;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
