<?php
/**
 * Script rápido para adicionar coluna body_type
 * Acesse: http://localhost/ESTOCX/api/scripts/add-body-type.php
 */

// Conectar ao banco
require_once __DIR__ . '/../config/load-env.php';

$config = require __DIR__ . '/../config/database.php';

try {
    $pdo = new PDO(
        "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}",
        $config['username'],
        $config['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Verificar se a coluna já existe
    $stmt = $pdo->query(
        "SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'vehicles' 
         AND COLUMN_NAME = 'body_type'"
    );
    
    if ($stmt->rowCount() > 0) {
        echo "<h2>✅ A coluna body_type já existe!</h2>";
        exit;
    }
    
    // Adicionar a coluna
    echo "<h2>Adicionando coluna body_type...</h2>";
    $pdo->exec("ALTER TABLE vehicles ADD COLUMN body_type VARCHAR(50) NULL AFTER color");
    echo "<p>✅ Coluna body_type adicionada com sucesso!</p>";
    
    // Adicionar índice (pode falhar se já existir, mas não importa)
    try {
        $pdo->exec("CREATE INDEX idx_vehicles_body_type ON vehicles(body_type)");
        echo "<p>✅ Índice criado com sucesso!</p>";
    } catch (PDOException $e) {
        echo "<p>⚠️ Índice pode já existir (ok): " . $e->getMessage() . "</p>";
    }
    
    echo "<h2>✅ Migração concluída com sucesso!</h2>";
    echo "<p><a href='javascript:window.close()'>Fechar</a></p>";
    
} catch (PDOException $e) {
    echo "<h2>❌ Erro:</h2>";
    echo "<p style='color: red;'>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

