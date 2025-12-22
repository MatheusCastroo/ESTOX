<?php
/**
 * Debug Routing - Shows how the API router processes requests
 * Acesse: https://nerdparadise.com.br/api/debug-route?test=1
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$debug = [
    'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'não definido',
    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'não definido',
    'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'não definido',
    'query_string' => $_SERVER['QUERY_STRING'] ?? 'não definido',
    'path_info' => $_SERVER['PATH_INFO'] ?? 'não definido',
    'php_self' => $_SERVER['PHP_SELF'] ?? 'não definido',
    'server_name' => $_SERVER['SERVER_NAME'] ?? 'não definido',
];

// Simulate routing logic
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '/api/index.php';

$requestUriWithoutQuery = strtok($requestUri, '?');
$basePath = dirname($scriptName);

$debug['parsing'] = [
    'request_uri_original' => $requestUri,
    'request_uri_without_query' => $requestUriWithoutQuery,
    'script_name' => $scriptName,
    'base_path' => $basePath,
];

if ($basePath !== '/' && $basePath !== '\\' && $basePath !== '.') {
    if (strpos($requestUriWithoutQuery, $basePath) === 0) {
        $requestUriWithoutQuery = substr($requestUriWithoutQuery, strlen($basePath));
    }
}

$requestUriWithoutQuery = ltrim($requestUriWithoutQuery, '/');
$pathSegments = array_filter(explode('/', $requestUriWithoutQuery));
$pathSegments = array_values($pathSegments);

if (isset($pathSegments[0]) && $pathSegments[0] === 'api') {
    array_shift($pathSegments);
}

$endpoint = $pathSegments[0] ?? '';

$debug['parsing']['final'] = [
    'request_uri_after_base' => $requestUriWithoutQuery,
    'path_segments' => $pathSegments,
    'endpoint_detected' => $endpoint,
];

$debug['expected_endpoints'] = [
    'auth' => file_exists(__DIR__ . '/endpoints/auth.php'),
    'stores' => file_exists(__DIR__ . '/endpoints/stores.php'),
    'vehicles' => file_exists(__DIR__ . '/endpoints/vehicles.php'),
];

$debug['suggested_test'] = [
    'test_auth' => 'https://' . ($_SERVER['SERVER_NAME'] ?? 'nerdparadise.com.br') . '/api/auth?action=register',
    'test_index' => 'https://' . ($_SERVER['SERVER_NAME'] ?? 'nerdparadise.com.br') . '/api/',
];

echo json_encode($debug, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
