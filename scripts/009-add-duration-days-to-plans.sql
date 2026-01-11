-- AutoStock Database Migration
-- Script 009: Add duration_days column to plans table
-- MySQL Version (for phpMyAdmin)

-- Add duration_days column if it doesn't exist
ALTER TABLE plans 
  ADD COLUMN IF NOT EXISTS duration_days INT NOT NULL DEFAULT 30 COMMENT 'Duração do plano em dias' AFTER vehicle_limit;

-- Update existing plans with correct duration_days
-- Mensal: 30 dias
UPDATE plans SET duration_days = 30 WHERE slug = 'profissional-mensal';

-- Trimestral: 90 dias
UPDATE plans SET duration_days = 90 WHERE slug = 'profissional-trimestral';

-- Anual: 365 dias
UPDATE plans SET duration_days = 365 WHERE slug = 'profissional-anual';

-- Update any other plans that might exist (legacy plans)
-- Default to 30 days if not set
UPDATE plans SET duration_days = 30 WHERE duration_days = 0 OR duration_days IS NULL;

