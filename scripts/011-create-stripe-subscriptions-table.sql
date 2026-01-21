-- AutoStock Database Update
-- Script 011: Create stripe_subscriptions table for tracking Stripe subscriptions
-- MySQL Version

-- Tabela de Assinaturas Stripe
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id CHAR(36) PRIMARY KEY,
  store_id CHAR(36) NOT NULL,
  subscription_id VARCHAR(255) UNIQUE NOT NULL COMMENT 'ID da assinatura no Stripe (sub_xxx)',
  plan_id CHAR(36) NOT NULL,
  plan_slug VARCHAR(50) NOT NULL COMMENT 'Slug do plano para fácil identificação',
  data_inicio TIMESTAMP NOT NULL COMMENT 'Data de início da assinatura',
  meses_pagos INT DEFAULT 0 COMMENT 'Quantidade de faturas/meses pagos',
  data_liberacao_cancelamento TIMESTAMP NULL COMMENT 'Data a partir da qual o cancelamento é permitido (calculada baseada em invoices pagos)',
  loyalty_status VARCHAR(20) DEFAULT 'locked' COMMENT 'Estado da fidelidade: locked = em fidelidade, completed = fidelidade cumprida',
  status VARCHAR(50) DEFAULT 'active' COMMENT 'active, canceled, past_due, violation, etc',
  cancel_at_period_end BOOLEAN DEFAULT false COMMENT 'Se true, cancela ao final do período atual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
  INDEX idx_stripe_subscriptions_store_id (store_id),
  INDEX idx_stripe_subscriptions_subscription_id (subscription_id),
  INDEX idx_stripe_subscriptions_plan_slug (plan_slug),
  INDEX idx_stripe_subscriptions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
