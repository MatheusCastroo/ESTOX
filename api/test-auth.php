<?php
/**
 * Test Auth Endpoint
 * Use this to test if the auth endpoint is accessible
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$test = [
    'status' => 'ok',
    'message' => 'Auth endpoint está acessível',
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'request_uri' => $_SERVER['REQUEST_URI'],
    'query_string' => $_SERVER['QUERY_STRING'] ?? '',
    'path_info' => $_SERVER['PATH_INFO'] ?? 'não definido',
    'script_name' => $_SERVER['SCRIPT_NAME'],
    'server_name' => $_SERVER['SERVER_NAME'],
    'endpoint_info' => [
        'auth_endpoint_exists' => file_exists(__DIR__ . '/endpoints/auth.php'),
        'index_exists' => file_exists(__DIR__ . '/index.php'),
        'htaccess_exists' => file_exists(__DIR__ . '/.htaccess'),
    ],
    'suggested_url' => 'https://' . ($_SERVER['SERVER_NAME'] ?? 'estocx.com.br') . '/api/auth?action=register',
    'instructions' => [
        'Para testar registro, faça uma requisição POST para:',
        'URL: /api/auth?action=register',
        'Method: POST',
        'Headers: Content-Type: application/json',
        'Body: {"email":"test@example.com","password":"senha123","name":"Test User"}'
    ]
];

echo json_encode($test, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);








