<?php
/**
 * Script para atualizar arquivo .env na Hostinger com novas credenciais
 * Execute este arquivo via navegador: https://estocx.com.br/api/atualizar-env-hostinger.php
 * Ou execute: php atualizar-env-hostinger.php
 * 
 * ⚠️ IMPORTANTE: DELETE este arquivo após usar (segurança)
 */

// Novas credenciais da Hostinger
$newEnvContent = <<<'ENV'
# Configuração para Produção - Hostinger
# Arquivo atualizado automaticamente

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u193499788_estocx
DB_USER=u193499788_estocx
DB_PASSWORD=Estocx1522023!

# JWT Secret (IMPORTANTE: Altere para uma chave segura em produção)
JWT_SECRET=change-this-to-a-very-secure-random-string-in-production

# CORS Origins (domínios permitidos para acessar a API)
CORS_ORIGINS=https://estocx.com.br,https://www.estocx.com.br
ENV;

// Caminhos possíveis para o arquivo .env (na ordem que load-env.php procura)
$paths = [
    __DIR__ . '/.env',           // Prioridade 1: api/.env
    dirname(__DIR__) . '/.env',  // Prioridade 2: root/.env
];

$updated = false;
$messages = [];

// Verificar se deve sobrescrever (via GET parameter ?force=1)
$forceOverwrite = isset($_GET['force']) && $_GET['force'] == '1';

foreach ($paths as $path) {
    $dir = dirname($path);
    
    // Criar diretório se não existir
    if (!is_dir($dir)) {
        if (@mkdir($dir, 0755, true)) {
            $messages[] = "✅ Diretório criado: $dir";
        }
    }
    
    // Verificar se arquivo já existe
    if (file_exists($path)) {
        // Ler conteúdo atual
        $currentContent = file_get_contents($path);
        
        // Verificar se já está atualizado
        if (strpos($currentContent, 'u193499788_estocx') !== false && 
            strpos($currentContent, 'Estocx1522023!') !== false &&
            strpos($currentContent, 'u507824066') === false) {
            $messages[] = "ℹ️ Arquivo já está atualizado: $path";
            if (!$forceOverwrite) {
                $updated = true;
                continue;
            }
        }
        
        // Se tem credenciais antigas, sempre atualizar
        $hasOldCredentials = (
            strpos($currentContent, 'u507824066') !== false ||
            strpos($currentContent, 'Estox7204') !== false
        );
        
        if ($hasOldCredentials || $forceOverwrite) {
            // Fazer backup do arquivo antigo
            $backupPath = $path . '.backup.' . date('Y-m-d_H-i-s');
            if (copy($path, $backupPath)) {
                $messages[] = "✅ Backup criado: $backupPath";
            }
            
            // Atualizar arquivo
            if (file_put_contents($path, $newEnvContent)) {
                $messages[] = "✅ Arquivo atualizado com sucesso: $path";
                
                // Tentar definir permissões
                if (@chmod($path, 0644)) {
                    $messages[] = "   Permissões configuradas: 644";
                }
                $updated = true;
                break; // Para após atualizar no primeiro local disponível
            } else {
                $messages[] = "❌ Erro ao atualizar arquivo: $path";
                $messages[] = "   Verifique permissões de escrita no diretório";
            }
        }
    } else {
        // Criar novo arquivo .env
        if (file_put_contents($path, $newEnvContent)) {
            $messages[] = "✅ Arquivo criado com sucesso: $path";
            
            // Tentar definir permissões
            if (@chmod($path, 0644)) {
                $messages[] = "   Permissões configuradas: 644";
            }
            
            $updated = true;
            break; // Para após criar no primeiro local disponível
        } else {
            $messages[] = "❌ Erro ao criar arquivo: $path";
            $messages[] = "   Verifique permissões de escrita no diretório";
        }
    }
}

// Se executado via CLI
if (php_sapi_name() === 'cli') {
    echo "=== Atualizando arquivo .env para Hostinger ===\n\n";
    foreach ($messages as $msg) {
        echo "$msg\n";
    }
    
    if ($updated) {
        echo "\n✅ Processo concluído!\n";
        echo "⚠️  IMPORTANTE: Altere o JWT_SECRET para uma chave segura!\n";
        echo "⚠️  DELETE este arquivo (atualizar-env-hostinger.php) após usar!\n";
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
        <title>Atualizar .env - Hostinger</title>
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
            .btn {
                display: inline-block;
                padding: 10px 20px;
                background: #0D47A1;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px 5px;
            }
            .btn:hover {
                background: #1565C0;
            }
            .btn-danger {
                background: #dc3545;
            }
            .btn-danger:hover {
                background: #c82333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔧 Atualizar Arquivo .env para Hostinger</h1>
            
            <?php foreach ($messages as $msg): ?>
                <div class="message <?php echo (strpos($msg, '✅') !== false ? 'success' : (strpos($msg, '❌') !== false ? 'error' : '')); ?>">
                    <?php echo htmlspecialchars($msg); ?>
                </div>
            <?php endforeach; ?>
            
            <?php if ($updated): ?>
                <div class="warning">
                    <strong>⚠️ IMPORTANTE:</strong><br>
                    1. Altere o <code>JWT_SECRET</code> para uma chave segura e única<br>
                    2. Verifique se as credenciais do banco estão corretas<br>
                    3. Teste a conexão: <a href="test-env.php" target="_blank">test-env.php</a> ou <a href="test.php" target="_blank">test.php</a><br>
                    4. <strong>DELETE este arquivo (atualizar-env-hostinger.php) após usar por segurança!</strong>
                </div>
            <?php elseif (!$forceOverwrite): ?>
                <div class="warning">
                    <strong>ℹ️ Arquivo .env já existe e pode estar desatualizado</strong><br>
                    Se você deseja forçar a atualização (fazendo backup do arquivo atual), 
                    <a href="?force=1" style="font-weight: bold; color: #f44336;">clique aqui para forçar atualização</a><br><br>
                    <small>⚠️ Isso irá criar um backup do arquivo existente antes de atualizar.</small>
                </div>
            <?php endif; ?>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <a href="test-env.php" class="btn">Testar Conexão</a>
                <a href="test.php" class="btn">Testar API</a>
                <a href="../index.html" class="btn">Voltar ao Site</a>
            </div>
        </div>
    </body>
    </html>
    <?php
}
