<?php
/**
 * Script para criar arquivo .env para Hostinger
 * Execute este arquivo via navegador ou linha de comando
 * 
 * Acesse: http://seudominio.com.br/criar-env-hostinger.php
 * Ou execute: php criar-env-hostinger.php
 */

$envContent = <<<'ENV'
# Configuração para Produção - Hostinger
# Arquivo gerado automaticamente

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u507824066_estox
DB_USER=u507824066_estox_user
DB_PASSWORD=Estox7204.

# JWT Secret (IMPORTANTE: Altere para uma chave segura em produção)
JWT_SECRET=change-this-to-a-very-secure-random-string-in-production

# CORS Origins (domínios permitidos para acessar a API)
CORS_ORIGINS=https://nerdparadise.com.br,https://www.nerdparadise.com.br
ENV;

// Caminhos possíveis para o arquivo .env (na ordem que load-env.php procura)
$paths = [
    __DIR__ . '/api/.env',           // Prioridade 1: api/.env
    __DIR__ . '/.env',                // Prioridade 2: root/.env
];

$created = false;
$overwritten = false;
$messages = [];

// Verificar se deve sobrescrever (via GET parameter ?force=1)
$forceOverwrite = isset($_GET['force']) && $_GET['force'] == '1';

foreach ($paths as $path) {
    $dir = dirname($path);
    
    // Criar diretório se não existir
    if (!is_dir($dir)) {
        if (@mkdir($dir, 0755, true)) {
            $messages[] = "✅ Diretório criado: $dir";
        } else {
            $messages[] = "⚠️ Não foi possível criar diretório: $dir (pode já existir)";
        }
    }
    
    // Verificar se arquivo já existe
    if (file_exists($path)) {
        if ($forceOverwrite) {
            // Sobrescrever arquivo existente
            if (file_put_contents($path, $envContent)) {
                $messages[] = "✅ Arquivo sobrescrito com sucesso: $path";
                $overwritten = true;
                
                // Tentar definir permissões
                if (@chmod($path, 0644)) {
                    $messages[] = "   Permissões configuradas: 644";
                }
                $created = true;
            } else {
                $messages[] = "❌ Erro ao sobrescrever arquivo: $path";
            }
        } else {
            $messages[] = "ℹ️ Arquivo já existe: $path";
            $messages[] = "   Para sobrescrever, acesse: criar-env-hostinger.php?force=1";
            // Não continua, mantém o arquivo existente
            continue;
        }
    } else {
        // Criar novo arquivo .env
        if (file_put_contents($path, $envContent)) {
            $messages[] = "✅ Arquivo criado com sucesso: $path";
            
            // Tentar definir permissões (pode não funcionar em alguns servidores)
            if (@chmod($path, 0644)) {
                $messages[] = "   Permissões configuradas: 644";
            } else {
                $messages[] = "   ⚠️ Não foi possível definir permissões automaticamente";
                $messages[] = "   Configure manualmente as permissões para 644";
            }
            
            $created = true;
            break; // Para após criar no primeiro local disponível
        } else {
            $messages[] = "❌ Erro ao criar arquivo: $path";
            $messages[] = "   Verifique permissões de escrita no diretório";
        }
    }
}

// Se executado via CLI
if (php_sapi_name() === 'cli') {
    echo "=== Criando arquivo .env para Hostinger ===\n\n";
    foreach ($messages as $msg) {
        echo "$msg\n";
    }
    
    if ($created) {
        echo "\n✅ Processo concluído!\n";
        echo "⚠️  IMPORTANTE: Altere o JWT_SECRET para uma chave segura!\n";
    }
} else {
    // Se executado via navegador
    header('Content-Type: text/html; charset=utf-8');
    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Criar .env - Hostinger</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #0D47A1;
                margin-top: 0;
            }
            .message {
                padding: 10px;
                margin: 10px 0;
                border-radius: 4px;
                background: #e3f2fd;
                border-left: 4px solid #2196F3;
            }
            .success {
                background: #e8f5e9;
                border-left-color: #4CAF50;
            }
            .error {
                background: #ffebee;
                border-left-color: #f44336;
            }
            .warning {
                background: #fff3e0;
                border-left-color: #ff9800;
                margin-top: 20px;
                padding: 15px;
            }
            code {
                background: #f5f5f5;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔧 Criar Arquivo .env para Hostinger</h1>
            
            <?php foreach ($messages as $msg): ?>
                <div class="message <?php echo (strpos($msg, '✅') !== false ? 'success' : (strpos($msg, '❌') !== false ? 'error' : '')); ?>">
                    <?php echo htmlspecialchars($msg); ?>
                </div>
            <?php endforeach; ?>
            
            <?php if ($created): ?>
                <div class="warning">
                    <strong>⚠️ IMPORTANTE:</strong><br>
                    1. Altere o <code>JWT_SECRET</code> para uma chave segura e única<br>
                    2. Verifique se as credenciais do banco estão corretas<br>
                    3. Teste a conexão: <a href="api/test.php" target="_blank">api/test.php</a> ou <a href="api/test-env.php" target="_blank">api/test-env.php</a><br>
                    4. <strong>DELETE este arquivo (criar-env-hostinger.php) após usar por segurança!</strong>
                </div>
            <?php elseif (!$forceOverwrite): ?>
                <div class="warning">
                    <strong>ℹ️ Arquivo .env já existe</strong><br>
                    Se você deseja recriar/sobrescrever o arquivo .env, 
                    <a href="?force=1" style="font-weight: bold; color: #f44336;">clique aqui para forçar sobrescrita</a><br><br>
                    <small>⚠️ Isso irá sobrescrever o arquivo existente com os valores padrão.</small>
                </div>
            <?php endif; ?>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <a href="api/test.php">Testar API</a> | 
                <a href="index.html">Voltar ao Site</a>
            </div>
        </div>
    </body>
    </html>
    <?php
}


