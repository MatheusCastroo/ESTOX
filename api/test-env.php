<?php
/**
 * Test Environment Variables Loading
 * Use this to verify if .env file is being loaded correctly
 */

// Load environment variables
require_once __DIR__ . '/config/load-env.php';

header('Content-Type: application/json; charset=utf-8');

$test = [
    'env_file_paths_checked' => [
        __DIR__ . '/.env',
        dirname(__DIR__) . '/.env',
    ],
    'env_files_found' => [],
    'environment_variables' => [],
    'database_config' => [],
];

// Check which .env files exist
foreach ($test['env_file_paths_checked'] as $path) {
    if (file_exists($path)) {
        $test['env_files_found'][] = [
            'path' => $path,
            'readable' => is_readable($path),
            'size' => filesize($path) . ' bytes',
        ];
    }
}

// Check environment variables
$envVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'CORS_ORIGINS'];
foreach ($envVars as $var) {
    $test['environment_variables'][$var] = [
        'getenv()' => getenv($var) ?: 'não definido',
        '$_ENV' => isset($_ENV[$var]) ? $_ENV[$var] : 'não definido',
        '$_SERVER' => isset($_SERVER[$var]) ? $_SERVER[$var] : 'não definido',
    ];
}

// Get database config
try {
    $config = require __DIR__ . '/config/database.php';
    $test['database_config'] = [
        'host' => $config['host'],
        'port' => $config['port'],
        'database' => $config['database'],
        'username' => $config['username'],
        'password' => $config['password'] ? '***' . substr($config['password'], -2) : '(vazio)',
        'charset' => $config['charset'],
    ];
} catch (Exception $e) {
    $test['database_config'] = ['error' => $e->getMessage()];
}

// Test database connection
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
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    $test['database_connection'] = '✅ Conectado com sucesso!';
} catch (PDOException $e) {
    $test['database_connection'] = '❌ Erro: ' . $e->getMessage();
}

echo json_encode($test, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);







