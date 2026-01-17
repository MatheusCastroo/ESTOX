<?php
/**
 * Script ÚNICO para Configurar Acesso ao Painel Admin
 * 
 * Este script faz TUDO automaticamente:
 * 1. Verifica se a coluna 'role' existe na tabela users
 * 2. Adiciona a coluna 'role' se não existir
 * 3. Cria o usuário admin
 * 4. Fornece as credenciais de acesso
 * 
 * IMPORTANTE: Execute este script apenas UMA VEZ.
 * Após configurar, delete este arquivo por segurança.
 * 
 * Uso:
 * Acesse via navegador: http://localhost/ESTOCX/criar-admin.php
 */

require_once __DIR__ . '/api/config/load-env.php';
require_once __DIR__ . '/api/classes/Database.php';
require_once __DIR__ . '/api/classes/Auth.php';

// Configuração padrão do admin (altere se necessário via URL)
$adminEmail = $_GET['email'] ?? 'admin@estocx.com';
$adminPassword = $_GET['password'] ?? 'admin123'; // ALTERE ESTA SENHA APÓS O PRIMEIRO ACESSO!
$adminName = $_GET['name'] ?? 'Administrador';

// Headers para resposta HTML (se acessado via web)
if (php_sapi_name() !== 'cli') {
    header('Content-Type: text/html; charset=utf-8');
}

// Função para criar mensagem de resposta
function createResponse($success, $title, $message, $details = [], $credentials = null) {
    if (php_sapi_name() === 'cli') {
        // Modo CLI
        echo "\n" . str_repeat("=", 60) . "\n";
        echo ($success ? "✅ " : "❌ ") . $title . "\n";
        echo str_repeat("=", 60) . "\n";
        echo $message . "\n\n";
        
        if (!empty($details)) {
            echo "Detalhes:\n";
            foreach ($details as $detail) {
                echo "  • " . $detail . "\n";
            }
            echo "\n";
        }
        
        if ($credentials) {
            echo "Credenciais de Acesso:\n";
            echo "  Email: " . $credentials['email'] . "\n";
            echo "  Senha: " . $credentials['password'] . "\n";
            echo "\n";
            if (isset($credentials['warning'])) {
                echo "⚠️  " . $credentials['warning'] . "\n\n";
            }
        }
    } else {
        // Modo Web - HTML
        $icon = $success ? '✅' : '❌';
        $bgColor = $success ? '#d1e7dd' : '#f8d7da';
        $textColor = $success ? '#0f5132' : '#842029';
        $borderColor = $success ? '#badbcc' : '#f5c2c7';
        
        echo "<!DOCTYPE html>
<html lang='pt-BR'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Configuração Admin - ESTOCX</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            margin: 0;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 700px;
            width: 100%;
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .header p {
            color: #666;
            margin: 0;
        }
        .result-box {
            background: $bgColor;
            border: 2px solid $borderColor;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 25px;
        }
        .result-title {
            font-size: 20px;
            font-weight: bold;
            color: $textColor;
            margin: 0 0 15px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .result-message {
            color: $textColor;
            line-height: 1.6;
            margin: 0 0 15px 0;
        }
        .details {
            margin: 15px 0;
        }
        .details ul {
            margin: 0;
            padding-left: 25px;
        }
        .details li {
            margin: 8px 0;
            color: $textColor;
        }
        .credentials-box {
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .credentials-box h3 {
            margin: 0 0 15px 0;
            color: #856404;
            font-size: 18px;
        }
        .credential-item {
            background: white;
            padding: 12px 15px;
            border-radius: 6px;
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .credential-label {
            font-weight: 600;
            color: #333;
        }
        .credential-value {
            font-family: 'Courier New', monospace;
            color: #856404;
            font-weight: bold;
        }
        .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning strong {
            color: #856404;
        }
        .steps {
            background: #e7f3ff;
            border-left: 4px solid #0d6efd;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .steps h3 {
            margin: 0 0 15px 0;
            color: #084298;
        }
        .steps ol {
            margin: 0;
            padding-left: 25px;
        }
        .steps li {
            margin: 10px 0;
            color: #084298;
            line-height: 1.6;
        }
        .steps a {
            color: #0d6efd;
            text-decoration: none;
            font-weight: 600;
        }
        .steps a:hover {
            text-decoration: underline;
        }
        .button {
            display: inline-block;
            background: #0d6efd;
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 10px 5px;
            transition: background 0.3s;
        }
        .button:hover {
            background: #0b5ed7;
        }
        .button-danger {
            background: #dc3545;
        }
        .button-danger:hover {
            background: #bb2d3b;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔐 Configuração do Painel Admin</h1>
            <p>ESTOCX - Sistema de Gestão</p>
        </div>
        
        <div class='result-box'>
            <div class='result-title'>
                $icon $title
            </div>
            <div class='result-message'>$message</div>";
        
        if (!empty($details)) {
            echo "<div class='details'><ul>";
            foreach ($details as $detail) {
                echo "<li>" . htmlspecialchars($detail) . "</li>";
            }
            echo "</ul></div>";
        }
        
        if ($credentials) {
            echo "<div class='credentials-box'>
                    <h3>📋 Credenciais de Acesso</h3>
                    <div class='credential-item'>
                        <span class='credential-label'>Email:</span>
                        <span class='credential-value'>" . htmlspecialchars($credentials['email']) . "</span>
                    </div>
                    <div class='credential-item'>
                        <span class='credential-label'>Senha:</span>
                        <span class='credential-value'>" . htmlspecialchars($credentials['password']) . "</span>
                    </div>
                  </div>";
            
            if (isset($credentials['warning'])) {
                echo "<div class='warning'><strong>⚠️ IMPORTANTE:</strong> " . htmlspecialchars($credentials['warning']) . "</div>";
            }
        }
        
        echo "</div>";
        
        if ($success && $credentials) {
            echo "<div class='steps'>
                    <h3>📝 Próximos Passos:</h3>
                    <ol>
                        <li><strong>Acesse:</strong> <a href='login.html' target='_blank'>login.html</a></li>
                        <li><strong>Faça login</strong> com as credenciais acima</li>
                        <li><strong>Após login, acesse:</strong> <a href='admin-panel.html' target='_blank'>admin-panel.html</a></li>
                        <li><strong>DELETE este arquivo</strong> (criar-admin.php) por segurança após configurar</li>
                    </ol>
                  </div>
                  <div style='text-align: center; margin-top: 30px;'>
                    <a href='login.html' class='button'>➡️ Ir para Login</a>
                    <a href='admin-panel.html' class='button' style='opacity: 0.6; pointer-events: none;'>⏳ Admin Panel (após login)</a>
                  </div>";
        }
        
        echo "</div>
    </div>
</body>
</html>";
    }
}

try {
    $db = Database::getInstance();
    $auth = new Auth();
    
    // PASSO 1: Verificar e adicionar coluna 'role' se não existir
    $roleColumnExists = false;
    try {
        $db->query("SELECT role FROM users LIMIT 1");
        $roleColumnExists = true;
    } catch (Exception $e) {
        // Coluna role não existe - vamos adicionar automaticamente
        try {
            $db->query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' COMMENT 'Role: user, admin' AFTER name");
            $db->query("ALTER TABLE users ADD INDEX IF NOT EXISTS idx_users_role (role)");
            $db->query("UPDATE users SET role = 'user' WHERE role IS NULL OR role = ''");
            $roleColumnExists = true;
            
            if (php_sapi_name() === 'cli') {
                echo "✅ Coluna 'role' adicionada automaticamente à tabela users\n";
            }
        } catch (Exception $e2) {
            createResponse(
                false,
                'Erro ao adicionar coluna role',
                'Não foi possível adicionar a coluna "role" à tabela users automaticamente.',
                [
                    'Erro: ' . $e2->getMessage(),
                    'Solução: Execute manualmente o script SQL: scripts/010-add-role-to-users.sql'
                ]
            );
            exit(1);
        }
    }
    
    if (!$roleColumnExists) {
        exit(1);
    }
    
    // Verificar se o usuário admin já existe
    $existing = $db->fetchOne(
        "SELECT id, email, role FROM users WHERE email = :email",
        ['email' => $adminEmail]
    );
    
    // PASSO 2: Verificar se o usuário admin já existe
    if ($existing) {
        // Usuário existe - verificar e atualizar role se necessário
        if ($existing['role'] === 'admin') {
            createResponse(
                true,
                'Usuário Admin Já Configurado',
                'O usuário admin já existe e está configurado corretamente no sistema.',
                [
                    'Email: ' . $existing['email'],
                    'Role: ' . $existing['role'],
                    'ID: ' . $existing['id']
                ],
                [
                    'email' => $adminEmail,
                    'password' => '*** (senha já definida anteriormente)',
                    'warning' => 'Se você não lembra a senha, use o parâmetro ?password=novasenha na URL para redefinir.'
                ]
            );
        } else {
            // Atualizar role para admin
            $db->update('users', 
                ['role' => 'admin'], 
                'id = :id', 
                ['id' => $existing['id']]
            );
            
            createResponse(
                true,
                'Usuário Promovido para Admin',
                'O usuário existente foi promovido para administrador com sucesso.',
                [
                    'Email: ' . $existing['email'],
                    'Role atualizado: admin',
                    'ID: ' . $existing['id']
                ],
                [
                    'email' => $adminEmail,
                    'password' => '*** (use sua senha atual)',
                    'warning' => 'Use a senha que você já tinha cadastrada para fazer login.'
                ]
            );
        }
    } else {
        // Criar novo usuário admin
        $hashedPassword = password_hash($adminPassword, PASSWORD_BCRYPT);
        $userId = $db->generateUuid();
        
        $db->insert('users', [
            'id' => $userId,
            'email' => $adminEmail,
            'password' => $hashedPassword,
            'name' => $adminName,
            'role' => 'admin',
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        createResponse(
            true,
            'Usuário Admin Criado com Sucesso!',
            'O usuário administrador foi criado e configurado com sucesso. Agora você pode acessar o painel admin.',
            [
                'Coluna role: ✅ Verificada e configurada',
                'Usuário admin: ✅ Criado',
                'Permissões: ✅ Configuradas'
            ],
            [
                'email' => $adminEmail,
                'password' => $adminPassword,
                'warning' => 'IMPORTANTE: Altere esta senha após o primeiro acesso por segurança!'
            ]
        );
    }
    
} catch (Exception $e) {
    createResponse(
        false,
        'Erro ao Configurar Admin',
        'Ocorreu um erro ao tentar configurar o usuário admin.',
        [
            'Erro: ' . $e->getMessage(),
            'Arquivo: ' . $e->getFile(),
            'Linha: ' . $e->getLine()
        ]
    );
    exit(1);
}

