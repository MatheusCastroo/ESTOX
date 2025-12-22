<?php
/**
 * API Router
 * Main entry point for all API requests
 */

// Load environment variables first
require_once __DIR__ . '/config/load-env.php';

// Set timezone
date_default_timezone_set('America/Sao_Paulo');

// Error reporting (disable in production, enable for debugging)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Autoload classes
spl_autoload_register(function ($class) {
    $file = __DIR__ . '/classes/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// Load Middleware and Response classes explicitly
require_once __DIR__ . '/classes/Middleware.php';
require_once __DIR__ . '/classes/Response.php';

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Middleware::cors();
    http_response_code(200);
    exit;
}

// Ensure CORS headers are set for all requests
Middleware::cors();

// Get request path - improved routing
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '/api/index.php';

// Remove query string but save it
$queryString = $_SERVER['QUERY_STRING'] ?? '';
$requestUriWithoutQuery = strtok($requestUri, '?');

// Remove base path if running in subdirectory
$basePath = dirname($scriptName);
if ($basePath !== '/' && $basePath !== '\\' && $basePath !== '.') {
    // If script is in /api/index.php, basePath will be /api
    if (strpos($requestUriWithoutQuery, $basePath) === 0) {
        $requestUriWithoutQuery = substr($requestUriWithoutQuery, strlen($basePath));
    }
}

// Remove leading slash
$requestUriWithoutQuery = ltrim($requestUriWithoutQuery, '/');

// Split path into segments
$pathSegments = array_filter(explode('/', $requestUriWithoutQuery));
$pathSegments = array_values($pathSegments); // Re-index array

// Remove 'api' if present
if (isset($pathSegments[0]) && $pathSegments[0] === 'api') {
    array_shift($pathSegments);
}

// Route to appropriate endpoint
$endpoint = $pathSegments[0] ?? '';

switch ($endpoint) {
    case 'auth':
        require_once __DIR__ . '/endpoints/auth.php';
        break;
        
    case 'stores':
        require_once __DIR__ . '/endpoints/stores.php';
        break;
        
    case 'vehicles':
        require_once __DIR__ . '/endpoints/vehicles.php';
        break;
        
    case 'leads':
        require_once __DIR__ . '/endpoints/leads.php';
        break;
        
    case 'dashboard':
        require_once __DIR__ . '/endpoints/dashboard.php';
        break;
        
    case 'plans':
        require_once __DIR__ . '/endpoints/plans.php';
        break;
        
    case 'notifications':
        require_once __DIR__ . '/endpoints/notifications.php';
        break;
        
    default:
        // If endpoint is empty, might be accessing /api/ directly
        if (empty($endpoint)) {
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'message' => 'ESTOX API v1.0',
                'status' => 'ok',
                'endpoints' => [
                    'auth' => '/api/auth?action=register ou /api/auth?action=login',
                    'stores' => '/api/stores',
                    'vehicles' => '/api/vehicles',
                    'leads' => '/api/leads',
                    'dashboard' => '/api/dashboard',
                    'plans' => '/api/plans',
                    'notifications' => '/api/notifications'
                ],
                'debug' => [
                    'endpoint_received' => $endpoint,
                    'path_segments' => $pathSegments,
                    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'não definido',
                ]
            ]);
        } else {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Endpoint não encontrado',
                'endpoint' => $endpoint,
                'available_endpoints' => ['auth', 'stores', 'vehicles', 'leads', 'dashboard', 'plans', 'notifications'],
                'debug' => [
                    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'não definido',
                    'path_segments' => $pathSegments,
                ]
            ]);
        }
        break;
}
