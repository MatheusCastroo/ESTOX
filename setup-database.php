<?php
/**
 * Script de Setup do Banco de Dados ESTOX
 * Cria o banco de dados e executa todos os scripts SQL necessários
 * 
 * Acesse via navegador: http://localhost/ESTOX/setup-database.php
 * OU execute via linha de comando: php setup-database.php
 */

// Configurações do banco de dados (LOCALHOST)
$dbHost = 'localhost';
$dbPort = '3306';
$dbUser = 'root';
$dbPass = '';
$dbName = 'estox';

// Cores para output no terminal
$colors = [
    'reset' => "\033[0m",
    'green' => "\033[32m",
    'red' => "\033[31m",
    'yellow' => "\033[33m",
    'blue' => "\033[34m",
];

// Função para output colorido
function output($message, $color = 'reset') {
    global $colors;
    if (php_sapi_name() === 'cli') {
        echo $colors[$color] . $message . $colors['reset'] . "\n";
    } else {
        $colorMap = [
            'green' => 'color: green;',
            'red' => 'color: red;',
            'yellow' => 'color: orange;',
            'blue' => 'color: blue;',
        ];
        $style = isset($colorMap[$color]) ? $colorMap[$color] : '';
        echo "<p style='$style'>$message</p>";
    }
}

// Função para executar SQL
function executeSQL($pdo, $sql, $description = '') {
    try {
        if ($description) {
            output("Executando: $description", 'blue');
        }
        
        // Dividir em múltiplas queries se necessário
        // Remover comentários de bloco /* */
        $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);
        
        // Dividir por ponto e vírgula, mas preservar strings
        $queries = [];
        $current = '';
        $inString = false;
        $stringChar = '';
        
        for ($i = 0; $i < strlen($sql); $i++) {
            $char = $sql[$i];
            
            if (($char === '"' || $char === "'") && ($i === 0 || $sql[$i-1] !== '\\')) {
                if (!$inString) {
                    $inString = true;
                    $stringChar = $char;
                } elseif ($char === $stringChar) {
                    $inString = false;
                    $stringChar = '';
                }
            }
            
            $current .= $char;
            
            if (!$inString && $char === ';') {
                $queries[] = trim($current);
                $current = '';
            }
        }
        
        if (!empty(trim($current))) {
            $queries[] = trim($current);
        }
        
        $queries = array_filter($queries, function($q) {
            return !empty($q) && strpos(trim($q), '--') !== 0;
        });
        
        foreach ($queries as $query) {
            $query = trim($query);
            if (empty($query) || strpos($query, '--') === 0) {
                continue;
            }
            
            try {
                // Usar exec() para queries DDL (CREATE, ALTER, etc)
                if (preg_match('/^\s*(CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|SET|PREPARE|EXECUTE|DEALLOCATE)/i', $query)) {
                    $pdo->exec($query);
                } else {
                    // Para outras queries, usar prepare/execute
                    $stmt = $pdo->prepare($query);
                    $stmt->execute();
                    $stmt->closeCursor();
                }
            } catch (PDOException $e) {
                // Ignorar erros de coluna/índice já existente
                $errorCode = $e->getCode();
                $errorMsg = $e->getMessage();
                
                if (strpos($errorMsg, 'Duplicate column') !== false || 
                    strpos($errorMsg, 'Duplicate key') !== false ||
                    strpos($errorMsg, 'already exists') !== false ||
                    strpos($errorMsg, 'Duplicate entry') !== false ||
                    $errorCode == '42S21' || // Column already exists
                    $errorCode == '42000') { // Syntax error or access violation (sometimes for duplicate)
                    // Coluna/índice já existe, ignorar
                    continue;
                }
                throw $e; // Re-lançar outros erros
            }
        }
        
        return true;
    } catch (PDOException $e) {
        output("ERRO: " . $e->getMessage(), 'red');
        return false;
    }
}

// Função para ler arquivo SQL
function readSQLFile($filepath) {
    if (!file_exists($filepath)) {
        output("Arquivo não encontrado: $filepath", 'red');
        return false;
    }
    
    $content = file_get_contents($filepath);
    
    // Remover comentários de linha única que começam com --
    $lines = explode("\n", $content);
    $cleaned = [];
    foreach ($lines as $line) {
        $trimmed = trim($line);
        if (!empty($trimmed) && strpos($trimmed, '--') !== 0) {
            $cleaned[] = $line;
        }
    }
    
    return implode("\n", $cleaned);
}

// HTML header se executado via navegador
if (php_sapi_name() !== 'cli') {
    echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Setup Banco de Dados</title>";
    echo "<style>body{font-family:monospace;padding:20px;background:#f5f5f5;}p{margin:5px 0;}</style></head><body>";
    echo "<h1>🔧 Setup do Banco de Dados ESTOX</h1>";
}

output("==========================================", 'blue');
output("Setup do Banco de Dados ESTOX", 'blue');
output("==========================================", 'blue');
output("");

try {
    // Conectar sem especificar o banco (para criar se necessário)
    output("Conectando ao MySQL...", 'blue');
    $pdo = new PDO(
        "mysql:host=$dbHost;port=$dbPort;charset=utf8mb4",
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
        ]
    );
    output("✅ Conectado ao MySQL", 'green');
    
    // Criar banco de dados se não existir
    output("Verificando banco de dados '$dbName'...", 'blue');
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    output("✅ Banco de dados '$dbName' criado/verificado", 'green');
    
    // Selecionar o banco
    $pdo->exec("USE `$dbName`");
    output("✅ Banco de dados '$dbName' selecionado", 'green');
    output("");
    
    // Lista de scripts SQL na ordem correta
    $scripts = [
        '001-create-tables.sql' => 'Criando tabelas principais...',
        '009-add-duration-days-to-plans.sql' => 'Adicionando campo duration_days aos planos...',
        '010-add-role-to-users.sql' => 'Adicionando campo role aos usuários...',
        '005-add-body-type-to-vehicles.sql' => 'Adicionando campo body_type aos veículos...',
        '003-alter-logo-url-to-mediumtext.sql' => 'Alterando logo_url para MEDIUMTEXT...',
        '006-create-subscription-tables.sql' => 'Criando tabelas de assinatura...',
        '007-rename-payment-table.sql' => 'Renomeando tabela de pagamentos...',
        '011-create-stripe-subscriptions-table.sql' => 'Criando tabela de assinaturas Stripe...',
        '012-create-stripe-invoices-table.sql' => 'Criando tabela de faturas Stripe...',
        '010-add-loyalty-months-to-plans.sql' => 'Adicionando campo loyalty_months aos planos...',
        '013-add-loyalty-status-to-subscriptions.sql' => 'Adicionando campo loyalty_status...',
        '008-seed-professional-plans.sql' => 'Inserindo planos profissionais...',
        '009-add-free-plan.sql' => 'Adicionando plano gratuito...',
        '014-add-checkout-url-to-plans.sql' => 'Adicionando checkout_url aos planos...',
        '015-fix-vehicle-limits.sql' => 'Corrigindo limites de veículos...',
        '016-assign-free-plan-to-stores.sql' => 'Atribuindo plano gratuito às lojas...',
    ];
    
    $scriptsDir = __DIR__ . '/scripts';
    $successCount = 0;
    $errorCount = 0;
    
    foreach ($scripts as $script => $description) {
        $filepath = $scriptsDir . '/' . $script;
        
        if (!file_exists($filepath)) {
            output("⚠️  Script não encontrado: $script (pulando...)", 'yellow');
            continue;
        }
        
        output("", 'reset');
        output("📄 $script", 'blue');
        $sql = readSQLFile($filepath);
        
        if ($sql === false) {
            $errorCount++;
            continue;
        }
        
        // Substituir UUID() por função MySQL compatível
        $sql = str_replace('UUID()', "CONCAT(SUBSTRING(MD5(RAND()), 1, 8), '-', SUBSTRING(MD5(RAND()), 1, 4), '-', SUBSTRING(MD5(RAND()), 1, 4), '-', SUBSTRING(MD5(RAND()), 1, 4), '-', SUBSTRING(MD5(RAND()), 1, 12))", $sql);
        
        // Remover IF NOT EXISTS de ALTER TABLE (não suportado em MySQL < 5.7)
        // Vamos tratar erros de coluna já existente
        $sql = preg_replace('/ADD COLUMN IF NOT EXISTS/i', 'ADD COLUMN', $sql);
        $sql = preg_replace('/ADD INDEX IF NOT EXISTS/i', 'ADD INDEX', $sql);
        
        if (executeSQL($pdo, $sql, $description)) {
            output("✅ $script executado com sucesso", 'green');
            $successCount++;
        } else {
            output("❌ Erro ao executar $script", 'red');
            $errorCount++;
        }
    }
    
    output("");
    output("==========================================", 'blue');
    output("Resumo:", 'blue');
    output("✅ Scripts executados com sucesso: $successCount", 'green');
    if ($errorCount > 0) {
        output("❌ Scripts com erro: $errorCount", 'red');
    }
    output("==========================================", 'blue');
    output("");
    output("🎉 Setup concluído!", 'green');
    output("Agora você pode acessar: http://localhost/ESTOX/login.html", 'blue');
    
} catch (PDOException $e) {
    output("❌ ERRO FATAL: " . $e->getMessage(), 'red');
    exit(1);
}

if (php_sapi_name() !== 'cli') {
    echo "</body></html>";
}
