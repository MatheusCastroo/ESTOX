<?php
/**
 * Test Database Connection
 * Acesse: http://localhost/ESTOX/api/test-db-connection.php
 * 
 * Este arquivo ajuda a diagnosticar problemas de conexão com o banco de dados
 */

// Load database config
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/load-env.php';

// Get config
$config = require __DIR__ . '/config/database.php';

// Detect environment
function isLocalhost() {
    $hostname = isset($_SERVER['HTTP_HOST']) ? strtolower($_SERVER['HTTP_HOST']) : '';
    if (empty($hostname)) {
        $hostname = isset($_SERVER['SERVER_NAME']) ? strtolower($_SERVER['SERVER_NAME']) : 'localhost';
    }
    $serverAddr = isset($_SERVER['SERVER_ADDR']) ? $_SERVER['SERVER_ADDR'] : '';
    $remoteAddr = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
    
    if (!empty($hostname) && 
        $hostname !== 'localhost' && 
        $hostname !== '127.0.0.1' && 
        strpos($hostname, '192.168.') !== 0 &&
        strpos($hostname, 'localhost') === false &&
        strpos($hostname, '.') !== false &&
        !strpos($hostname, '.local') &&
        !strpos($hostname, '.test')) {
        return false;
    }
    
    if ($serverAddr === '127.0.0.1' || $serverAddr === '::1') {
        return true;
    }
    
    if ($remoteAddr === '127.0.0.1' || $remoteAddr === '::1' || strpos($remoteAddr, '192.168.') === 0) {
        return true;
    }
    
    return (
        empty($hostname) ||
        $hostname === 'localhost' || 
        $hostname === '127.0.0.1' || 
        strpos($hostname, '192.168.') === 0 ||
        strpos($hostname, 'localhost') !== false ||
        strpos($hostname, '.local') !== false ||
        strpos($hostname, '.test') !== false
    );
}

$isLocal = isLocalhost();

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste de Conexão - Banco de Dados</title>
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
            color: #2563EB;
            margin-bottom: 30px;
        }
        .info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            border-left: 4px solid #2563EB;
        }
        .success {
            background: #d1fae5;
            border-left-color: #22C55E;
            color: #065f46;
        }
        .error {
            background: #fee2e2;
            border-left-color: #EF4444;
            color: #991b1b;
        }
        .warning {
            background: #fef3c7;
            border-left-color: #F59E0B;
            color: #92400e;
        }
        code {
            background: #f1f1f1;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f8f9fa;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Teste de Conexão - Banco de Dados</h1>

        <div class="info">
            <strong>Ambiente Detectado:</strong> <?php echo $isLocal ? '🏠 LOCALHOST (Desenvolvimento)' : '🌐 PRODUÇÃO (Hostinger)'; ?>
        </div>

        <h2>📋 Configuração Atual</h2>
        <table>
            <tr>
                <th>Parâmetro</th>
                <th>Valor</th>
            </tr>
            <tr>
                <td>Host</td>
                <td><code><?php echo htmlspecialchars($config['host']); ?></code></td>
            </tr>
            <tr>
                <td>Porta</td>
                <td><code><?php echo htmlspecialchars($config['port']); ?></code></td>
            </tr>
            <tr>
                <td>Banco de Dados</td>
                <td><code><?php echo htmlspecialchars($config['database']); ?></code></td>
            </tr>
            <tr>
                <td>Usuário</td>
                <td><code><?php echo htmlspecialchars($config['username']); ?></code></td>
            </tr>
            <tr>
                <td>Senha</td>
                <td><code><?php echo empty($config['password']) ? '(vazia)' : '***' . substr($config['password'], -3); ?></code></td>
            </tr>
        </table>

        <h2>🔌 Teste de Conexão</h2>
        <?php
        try {
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
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_TIMEOUT => 5,
                ]
            );
            
            echo '<div class="info success">';
            echo '<strong>✅ Conexão bem-sucedida!</strong><br>';
            echo 'O banco de dados está acessível e funcionando corretamente.';
            echo '</div>';
            
            // Test query
            $stmt = $pdo->query("SELECT VERSION() as version, DATABASE() as current_db");
            $result = $stmt->fetch();
            
            echo '<div class="info">';
            echo '<strong>Informações do Servidor:</strong><br>';
            echo 'MySQL Version: <code>' . htmlspecialchars($result['version']) . '</code><br>';
            echo 'Database Atual: <code>' . htmlspecialchars($result['current_db']) . '</code>';
            echo '</div>';
            
        } catch (PDOException $e) {
            echo '<div class="info error">';
            echo '<strong>❌ Erro de Conexão:</strong><br>';
            echo htmlspecialchars($e->getMessage());
            echo '</div>';
            
            // Diagnostic suggestions
            echo '<div class="info warning">';
            echo '<strong>💡 Sugestões:</strong><br>';
            
            if ($isLocal) {
                echo '1. Verifique se o MySQL está rodando no XAMPP<br>';
                echo '2. Verifique se o banco de dados <code>estox</code> existe<br>';
                echo '3. Verifique se o usuário <code>root</code> não tem senha (padrão XAMPP)<br>';
                echo '4. Se você configurou senha para root, crie um arquivo <code>.env</code> na pasta <code>api/</code> com:<br>';
                echo '<code>DB_PASSWORD=sua_senha</code>';
            } else {
                echo '1. Verifique as credenciais do banco no painel da Hostinger<br>';
                echo '2. Verifique se o arquivo <code>.env</code> está configurado corretamente<br>';
                echo '3. Verifique se o banco de dados existe e está ativo<br>';
            }
            echo '</div>';
        }
        ?>

        <h2>🌐 Informações do Servidor</h2>
        <table>
            <tr>
                <th>Variável</th>
                <th>Valor</th>
            </tr>
            <tr>
                <td>HTTP_HOST</td>
                <td><code><?php echo htmlspecialchars($_SERVER['HTTP_HOST'] ?? 'N/A'); ?></code></td>
            </tr>
            <tr>
                <td>SERVER_NAME</td>
                <td><code><?php echo htmlspecialchars($_SERVER['SERVER_NAME'] ?? 'N/A'); ?></code></td>
            </tr>
            <tr>
                <td>SERVER_ADDR</td>
                <td><code><?php echo htmlspecialchars($_SERVER['SERVER_ADDR'] ?? 'N/A'); ?></code></td>
            </tr>
            <tr>
                <td>REMOTE_ADDR</td>
                <td><code><?php echo htmlspecialchars($_SERVER['REMOTE_ADDR'] ?? 'N/A'); ?></code></td>
            </tr>
        </table>

        <div class="info">
            <strong>📝 Nota:</strong> Este arquivo é apenas para diagnóstico. 
            Remova ou proteja este arquivo em produção por questões de segurança.
        </div>
    </div>
</body>
</html>
