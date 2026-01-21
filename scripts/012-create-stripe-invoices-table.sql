-- AutoStock Database Update
-- Script 012: Create stripe_invoices table to track processed invoices
-- Prevents duplicate processing of invoice.paid webhooks
-- MySQL Version

-- Tabela de Invoices Stripe Processados
CREATE TABLE IF NOT EXISTS stripe_invoices (
  id CHAR(36) PRIMARY KEY,
  invoice_id VARCHAR(255) UNIQUE NOT NULL COMMENT 'ID da invoice no Stripe (in_xxx)',
  subscription_id VARCHAR(255) NOT NULL COMMENT 'ID da assinatura (sub_xxx)',
  store_id CHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL COMMENT 'paid, open, void, etc',
  paid_at TIMESTAMP NULL COMMENT 'Data em que a invoice foi paga',
  period_start TIMESTAMP NULL COMMENT 'Início do período cobrado',
  period_end TIMESTAMP NULL COMMENT 'Fim do período cobrado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  INDEX idx_stripe_invoices_invoice_id (invoice_id),
  INDEX idx_stripe_invoices_subscription_id (subscription_id),
  INDEX idx_stripe_invoices_store_id (store_id),
  INDEX idx_stripe_invoices_status (status),
  INDEX idx_stripe_invoices_paid_at (paid_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
