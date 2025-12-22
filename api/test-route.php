<?php
/**
 * Test Route - Simple test for routing
 * Acesse: https://nerdparadise.com.br/api/test-route.php
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'ok',
    'message' => 'Arquivo PHP está funcionando!',
    'server' => [
        'php_version' => phpversion(),
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'não definido',
        'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'não definido',
    ],
    'next_step' => 'Se este arquivo funcionou, tente: /api/test.php'
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
