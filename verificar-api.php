<?php
/**
 * Script de Verificação da API
 * Execute: php verificar-api.php
 * 
 * Este script verifica se a API está configurada corretamente
 */

echo "🔍 Verificando configuração da API ESTOX...\n\n";

$errors = [];
$warnings = [];
$success = [];

// 1. Verificar se a pasta api existe
echo "1. Verificando estrutura de pastas...\n";
if (!is_dir(__DIR__ . '/api')) {
    $errors[] = "❌ Pasta 'api' não encontrada!";
} else {
    $success[] = "✅ Pasta 'api' encontrada";
}

// 2. Verificar se index.php existe
if (!file_exists(__DIR__ . '/api/index.php')) {
    $errors[] = "❌ Arquivo 'api/index.php' não encontrado!";
} else {
    $success[] = "✅ Arquivo 'api/index.php' encontrado";
}

// 3. Verificar se .htaccess existe
if (!file_exists(__DIR__ . '/api/.htaccess')) {
    $warnings[] = "⚠️ Arquivo 'api/.htaccess' não encontrado!";
} else {
    $success[] = "✅ Arquivo 'api/.htaccess' encontrado";
}

// 4. Verificar se .env existe
echo "\n2. Verificando arquivo .env...\n";
if (!file_exists(__DIR__ . '/.env')) {
    $warnings[] = "⚠️ Arquivo '.env' não encontrado na raiz do projeto!";
    echo "   💡 Execute: php criar-env.php\n";
} else {
    $success[] = "✅ Arquivo '.env' encontrado";
    
    // Verificar conteúdo do .env
    $envContent = file_get_contents(__DIR__ . '/.env');
    if (strpos($envContent, 'DB_HOST') === false) {
        $warnings[] = "⚠️ Arquivo '.env' parece estar vazio ou incompleto";
    }
}

// 5. Verificar extensões PHP
echo "\n3. Verificando extensões PHP...\n";
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $errors[] = "❌ Extensão PHP '$ext' não está instalada!";
    } else {
        $success[] = "✅ Extensão PHP '$ext' instalada";
    }
}

// 6. Verificar se pode carregar o load-env.php
echo "\n4. Verificando carregamento de configurações...\n";
if (file_exists(__DIR__ . '/api/config/load-env.php')) {
    try {
        require_once __DIR__ . '/api/config/load-env.php';
        $success[] = "✅ Arquivo 'load-env.php' carregado com sucesso";
    } catch (Exception $e) {
        $errors[] = "❌ Erro ao carregar 'load-env.php': " . $e->getMessage();
    }
} else {
    $errors[] = "❌ Arquivo 'api/config/load-env.php' não encontrado!";
}

// 7. Verificar conexão com banco de dados
echo "\n5. Verificando conexão com banco de dados...\n";
if (file_exists(__DIR__ . '/api/config/database.php')) {
    try {
        $config = require __DIR__ . '/api/config/database.php';
        $dsn = sprintf(
            "mysql:host=%s;port=%s;dbname=%s;charset=%s",
            $config['host'],
            $config['port'],
            $config['database'],
            $config['charset']
        );
        
        $pdo = new PDO(
            $dsn,
            $config['username'],
            $config['password'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        $success[] = "✅ Conexão com banco de dados estabelecida";
        
        // Verificar se a tabela plans existe
        $stmt = $pdo->query("SHOW TABLES LIKE 'plans'");
        if ($stmt->rowCount() > 0) {
            $success[] = "✅ Tabela 'plans' existe";
        } else {
            $warnings[] = "⚠️ Tabela 'plans' não encontrada. Execute os scripts SQL.";
        }
        
    } catch (PDOException $e) {
        $errors[] = "❌ Erro ao conectar com banco de dados: " . $e->getMessage();
    }
} else {
    $warnings[] = "⚠️ Arquivo 'api/config/database.php' não encontrado";
}

// 8. Verificar URLs
echo "\n6. Verificando URLs de acesso...\n";
$projectName = basename(__DIR__);
echo "   📍 Projeto está em: " . __DIR__ . "\n";
echo "   🌐 URL com nome da pasta: http://localhost/$projectName/api/plans\n";
echo "   🌐 URL com Virtual Host: http://localhost/api/plans\n";
echo "   💡 Teste primeiro: http://localhost/$projectName/api/test.php\n";

// Resumo
echo "\n" . str_repeat("=", 60) . "\n";
echo "📊 RESUMO DA VERIFICAÇÃO\n";
echo str_repeat("=", 60) . "\n\n";

if (count($success) > 0) {
    echo "✅ SUCESSOS (" . count($success) . "):\n";
    foreach ($success as $msg) {
        echo "   $msg\n";
    }
    echo "\n";
}

if (count($warnings) > 0) {
    echo "⚠️ AVISOS (" . count($warnings) . "):\n";
    foreach ($warnings as $msg) {
        echo "   $msg\n";
    }
    echo "\n";
}

if (count($errors) > 0) {
    echo "❌ ERROS (" . count($errors) . "):\n";
    foreach ($errors as $msg) {
        echo "   $msg\n";
    }
    echo "\n";
}

// Recomendações
echo str_repeat("=", 60) . "\n";
echo "💡 RECOMENDAÇÕES PARA RESOLVER ERRO 404:\n";
echo str_repeat("=", 60) . "\n\n";

echo "1. Verifique se o Apache está rodando no XAMPP\n";
echo "2. Habilite o módulo mod_rewrite no httpd.conf:\n";
echo "   - Abra: C:\\xampp\\apache\\conf\\httpd.conf\n";
echo "   - Procure: #LoadModule rewrite_module modules/mod_rewrite.so\n";
echo "   - Remova o # para descomentar\n";
echo "   - Reinicie o Apache\n\n";

echo "3. Configure AllowOverride no httpd.conf:\n";
echo "   - Procure por: <Directory \"C:/xampp/htdocs\">\n";
echo "   - Altere: AllowOverride None para AllowOverride All\n";
echo "   - Reinicie o Apache\n\n";

echo "4. Use a URL correta:\n";
echo "   - Com nome da pasta: http://localhost/$projectName/api/plans\n";
echo "   - Ou configure Virtual Host para usar: http://localhost/api/plans\n\n";

echo "5. Teste primeiro: http://localhost/$projectName/api/test.php\n";
echo "   Se este funcionar, o problema é no roteamento.\n";
echo "   Se não funcionar, o problema é na configuração do Apache.\n\n";

if (count($errors) > 0) {
    echo "⚠️ RESOLVA OS ERROS ACIMA ANTES DE CONTINUAR!\n";
    exit(1);
} elseif (count($warnings) > 0) {
    echo "⚠️ Verifique os avisos acima.\n";
    exit(0);
} else {
    echo "✅ Tudo parece estar configurado corretamente!\n";
    echo "   Se ainda receber 404, verifique a configuração do Apache.\n";
    exit(0);
}





