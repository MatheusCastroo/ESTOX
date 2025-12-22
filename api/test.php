<?php
/**
 * Test API Connection
 * Acesse: http://localhost/api/test.php
 */

// Load environment variables
require_once __DIR__ . '/config/load-env.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$test = [
    'status' => 'ok',
    'message' => 'API está funcionando!',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'environment' => [
        'DB_HOST' => getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? 'não configurado'),
        'DB_PORT' => getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? 'não configurado'),
        'DB_NAME' => getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? 'não configurado'),
        'DB_USER' => getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? 'não configurado'),
        'JWT_SECRET' => (getenv('JWT_SECRET') || isset($_ENV['JWT_SECRET'])) ? 'configurado' : 'não configurado',
        'CORS_ORIGINS' => getenv('CORS_ORIGINS') ?: ($_ENV['CORS_ORIGINS'] ?? 'não configurado'),
    ],
    'env_file_locations' => [
        'api/.env' => file_exists(__DIR__ . '/.env') ? 'existe' : 'não existe',
        'root/.env' => file_exists(__DIR__ . '/../.env') ? 'existe' : 'não existe',
    ],
    'extensions' => [
        'pdo' => extension_loaded('pdo') ? 'instalado' : 'NÃO instalado',
        'pdo_mysql' => extension_loaded('pdo_mysql') ? 'instalado' : 'NÃO instalado',
        'json' => extension_loaded('json') ? 'instalado' : 'NÃO instalado',
        'mbstring' => extension_loaded('mbstring') ? 'instalado' : 'NÃO instalado',
    ],
    'database' => 'não testado'
];

// Test database connection
try {
    $config = require __DIR__ . '/config/database.php';
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
    
    $test['database'] = 'conectado com sucesso';
    $test['db_info'] = [
        'host' => $config['host'],
        'database' => $config['database'],
    ];
    
} catch (Exception $e) {
    $test['database'] = 'erro na conexão';
    $test['db_error'] = $e->getMessage();
}

echo json_encode($test, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);




