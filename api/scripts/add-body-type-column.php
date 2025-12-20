<?php
/**
 * Script para adicionar a coluna body_type à tabela vehicles
 * Execute este script uma vez para atualizar o banco de dados
 */

require_once __DIR__ . '/../config/load-env.php';
require_once __DIR__ . '/../classes/Database.php';

$db = Database::getInstance();

try {
    // Verificar se a coluna já existe
    $checkColumn = $db->fetchAll(
        "SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'vehicles' 
         AND COLUMN_NAME = 'body_type'"
    );
    
    if (empty($checkColumn)) {
        echo "Adicionando coluna body_type à tabela vehicles...\n";
        
        // Adicionar a coluna
        $db->query(
            "ALTER TABLE vehicles 
             ADD COLUMN body_type VARCHAR(50) NULL 
             AFTER color"
        );
        
        echo "Coluna body_type adicionada com sucesso!\n";
        
        // Adicionar índice
        echo "Adicionando índice...\n";
        try {
            $db->query("CREATE INDEX idx_vehicles_body_type ON vehicles(body_type)");
            echo "Índice criado com sucesso!\n";
        } catch (Exception $e) {
            echo "Aviso: Erro ao criar índice (pode já existir): " . $e->getMessage() . "\n";
        }
        
        echo "\n✅ Migração concluída com sucesso!\n";
    } else {
        echo "✅ A coluna body_type já existe na tabela vehicles.\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
    exit(1);
}

