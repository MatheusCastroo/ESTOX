-- Script 005: Adicionar campo body_type (tipo de carro) à tabela vehicles
-- Adiciona campo para classificar veículos: Sedan, Hatch, SUV, Pickup

ALTER TABLE vehicles 
ADD COLUMN body_type VARCHAR(50) NULL 
AFTER color;

-- Adicionar índice para melhor performance nas consultas
CREATE INDEX idx_vehicles_body_type ON vehicles(body_type);

-- Comentário da coluna
ALTER TABLE vehicles 
MODIFY COLUMN body_type VARCHAR(50) NULL 
COMMENT 'Tipo de carro: Sedan, Hatch, SUV, Pickup';

