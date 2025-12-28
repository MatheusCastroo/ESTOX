-- Rename pagarme_transactions to payment_transactions (more generic)
-- Script 007: Rename payment transactions table
-- MySQL Version (for phpMyAdmin)

-- Rename table
RENAME TABLE pagarme_transactions TO payment_transactions;

-- Add gateway column if it doesn't exist
ALTER TABLE payment_transactions 
  ADD COLUMN IF NOT EXISTS gateway VARCHAR(50) DEFAULT 'appmax' AFTER store_id,
  ADD COLUMN IF NOT EXISTS order_id VARCHAR(255) AFTER transaction_id,
  ADD COLUMN IF NOT EXISTS payload_json JSON DEFAULT ('{}') AFTER postback_data;

-- Update existing records
UPDATE payment_transactions SET gateway = 'pagarme' WHERE gateway IS NULL OR gateway = '';

-- Rename transaction_id to order_id for Appmax compatibility (keep both for now)
-- ALTER TABLE payment_transactions 
--   CHANGE COLUMN transaction_id order_id VARCHAR(255);

-- Add index for order_id
ALTER TABLE payment_transactions 
  ADD INDEX idx_payment_order_id (order_id),
  ADD INDEX idx_payment_gateway (gateway);

