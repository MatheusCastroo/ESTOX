-- AutoStock Subscription & Payment Tables
-- Script 006: Create subscription, transactions and email logs tables
-- MySQL Version (for phpMyAdmin)

-- Tabela de Transações de Pagamento (genérica para Stripe, Pagar.me, etc)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id CHAR(36) PRIMARY KEY,
  store_id CHAR(36) NOT NULL,
  gateway VARCHAR(50) NOT NULL DEFAULT 'stripe' COMMENT 'stripe, pagarme, etc',
  order_id VARCHAR(255) COMMENT 'ID do pedido no gateway',
  transaction_id VARCHAR(255) COMMENT 'ID da transação (compatibilidade)',
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL COMMENT 'approved, refused, canceled, waiting_payment, expired, refunded',
  payment_method VARCHAR(50) COMMENT 'credit_card, boleto, pix',
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  metadata JSON DEFAULT ('{}') COMMENT 'Dados adicionais da transação',
  payload_json JSON DEFAULT ('{}') COMMENT 'Dados completos recebidos do webhook',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  INDEX idx_payment_store_id (store_id),
  INDEX idx_payment_order_id (order_id),
  INDEX idx_payment_gateway (gateway),
  INDEX idx_payment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Logs de Subscrição
CREATE TABLE IF NOT EXISTS subscription_logs (
  id CHAR(36) PRIMARY KEY,
  store_id CHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL COMMENT 'created, renewed, suspended, reactivated, canceled',
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  old_ends_at TIMESTAMP NULL,
  new_ends_at TIMESTAMP NULL,
  performed_by VARCHAR(255) COMMENT 'user_id ou "system"',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  INDEX idx_subscription_logs_store_id (store_id),
  INDEX idx_subscription_logs_action (action),
  INDEX idx_subscription_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de E-mails Enviados
CREATE TABLE IF NOT EXISTS subscription_emails (
  id CHAR(36) PRIMARY KEY,
  store_id CHAR(36) NOT NULL,
  email_type VARCHAR(50) NOT NULL COMMENT 'trial_reminder_7d, trial_reminder_10d, trial_reminder_14d, payment_success, payment_failed',
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'sent' COMMENT 'sent, failed',
  error_message TEXT,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  INDEX idx_subscription_emails_store_id (store_id),
  INDEX idx_subscription_emails_type (email_type),
  INDEX idx_subscription_emails_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Atualizar tabela stores para garantir constraint no subscription_status
ALTER TABLE stores 
  MODIFY COLUMN subscription_status VARCHAR(20) DEFAULT 'trial' 
  CHECK (subscription_status IN ('trial', 'active', 'pending', 'suspended', 'canceled'));

-- Adicionar índice para busca por status e data de expiração
-- Verificar se os índices já existem antes de criar (idempotente)
SET @index_exists_status = (
  SELECT COUNT(*) 
  FROM information_schema.statistics 
  WHERE table_schema = DATABASE() 
    AND table_name = 'stores' 
    AND index_name = 'idx_stores_subscription_status'
);

SET @index_exists_ends_at = (
  SELECT COUNT(*) 
  FROM information_schema.statistics 
  WHERE table_schema = DATABASE() 
    AND table_name = 'stores' 
    AND index_name = 'idx_stores_subscription_ends_at'
);

SET @sql_status = IF(@index_exists_status = 0, 
  'ALTER TABLE stores ADD INDEX idx_stores_subscription_status (subscription_status)', 
  'SELECT "Índice idx_stores_subscription_status já existe" AS message');

SET @sql_ends_at = IF(@index_exists_ends_at = 0, 
  'ALTER TABLE stores ADD INDEX idx_stores_subscription_ends_at (subscription_ends_at)', 
  'SELECT "Índice idx_stores_subscription_ends_at já existe" AS message');

PREPARE stmt FROM @sql_status;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

PREPARE stmt FROM @sql_ends_at;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;



