<?php
/**
 * Criar arquivo .env para Hostinger
 * 
 * ⚠️ IMPORTANTE: DELETE ESTE ARQUIVO APÓS USAR (segurança)
 * 
 * Acesse: https://nerdparadise.com.br/api/criar-env.php
 */

header('Content-Type: text/html; charset=utf-8');

// Credenciais do banco de dados Hostinger
$envContent = <<<'ENV'
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u507824066_estox
DB_USER=u507824066_estox_user
DB_PASSWORD=Estox7204.

JWT_SECRET=change-this-to-a-very-secure-random-string-in-production-make-it-long-and-random

CORS_ORIGINS=https://nerdparadise.com.br,https://www.nerdparadise.com.br

ENV;

$envPath = __DIR__ . '/.env';
$created = false;
$message = '';

// Se já existe, mostra mensagem
if (file_exists($envPath)) {
    $message = '<div class="alert alert-warning"><strong>Atenção:</strong> O arquivo .env já existe!</div>';
    $message .= '<p>Se deseja recriar, delete o arquivo primeiro ou use o método manual.</p>';
} else {
    // Tenta criar o arquivo
    if (file_put_contents($envPath, $envContent)) {
        // Define permissões
        chmod($envPath, 0644);
        $created = true;
        $message = '<div class="alert alert-success"><strong>Sucesso!</strong> Arquivo .env criado com sucesso!</div>';
    } else {
        $message = '<div class="alert alert-danger"><strong>Erro:</strong> Não foi possível criar o arquivo .env.</div>';
        $message .= '<p>Você precisa criar manualmente ou verificar permissões da pasta.</p>';
    }
}

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Criar arquivo .env</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .alert { padding: 15px; margin: 20px 0; border-radius: 5px; }
        .alert-success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .alert-warning { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; }
        .alert-danger { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .alert-info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .btn:hover { background: #0056b3; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }
    </style>
</head>
<body>
    <h1>🔧 Criar Arquivo .env</h1>
    
    <?php echo $message; ?>
    
    <?php if ($created): ?>
        <div class="alert alert-info">
            <strong>Próximos passos:</strong>
            <ol>
                <li><strong>DELETE este arquivo (criar-env.php) por segurança!</strong></li>
                <li>Teste a conexão: <a href="test-env.php">test-env.php</a></li>
                <li>Tente fazer um cadastro novamente</li>
            </ol>
        </div>
    <?php else: ?>
        <div class="alert alert-info">
            <strong>Para criar manualmente:</strong>
            <ol>
                <li>Via File Manager do cPanel, crie um arquivo chamado <code>.env</code> em <code>public_html/api/</code></li>
                <li>Cole o seguinte conteúdo:</li>
            </ol>
        </div>
    <?php endif; ?>
    
    <h3>Conteúdo do arquivo .env:</h3>
    <pre><?php echo htmlspecialchars($envContent); ?></pre>
    
    <div class="alert alert-info">
        <strong>Localização do arquivo:</strong><br>
        <code><?php echo $envPath; ?></code>
    </div>
    
    <?php if (file_exists($envPath)): ?>
        <div class="alert alert-success">
            <strong>Arquivo existe:</strong> ✅<br>
            <strong>Tamanho:</strong> <?php echo filesize($envPath); ?> bytes<br>
            <strong>Permissões:</strong> <?php echo substr(sprintf('%o', fileperms($envPath)), -4); ?><br>
            <strong>Legível:</strong> <?php echo is_readable($envPath) ? '✅ Sim' : '❌ Não'; ?>
        </div>
    <?php endif; ?>
    
    <p>
        <a href="test-env.php" class="btn">Testar Conexão</a>
        <a href="../cadastro.html" class="btn">Voltar ao Cadastro</a>
    </p>
    
    <div class="alert alert-warning">
        <strong>⚠️ Segurança:</strong><br>
        Este arquivo contém credenciais sensíveis. Certifique-se de:
        <ul>
            <li>Nunca commitar o arquivo .env no Git</li>
            <li>Não compartilhar o conteúdo publicamente</li>
            <li>DELETE este arquivo (criar-env.php) após usar</li>
        </ul>
    </div>
</body>
</html>








