<?php
/**
 * API Router
 * Main entry point for all API requests
 */

// Load environment variables
require_once __DIR__ . '/config/load-env.php';

// Set timezone
date_default_timezone_set('America/Sao_Paulo');

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Autoload classes
spl_autoload_register(function ($class) {
    $file = __DIR__ . '/classes/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// Get request path
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

// Remove query string
$requestUri = strtok($requestUri, '?');

// Remove base path if running in subdirectory
$basePath = dirname($scriptName);
if ($basePath !== '/' && $basePath !== '\\') {
    // Remove the base path from request URI
    if (strpos($requestUri, $basePath) === 0) {
        $requestUri = substr($requestUri, strlen($basePath));
    }
}

// Remove leading slash
$requestUri = ltrim($requestUri, '/');

// Split path into segments
$pathSegments = explode('/', $requestUri);

// Remove 'api' if present (in case it's still in the path)
if (isset($pathSegments[0]) && $pathSegments[0] === 'api') {
    array_shift($pathSegments);
}

// Route to appropriate endpoint
$endpoint = $pathSegments[0] ?? '';

// Debug mode (uncomment for debugging)
// error_log("Request URI: " . $_SERVER['REQUEST_URI']);
// error_log("Script Name: " . $scriptName);
// error_log("Base Path: " . $basePath);
// error_log("Request URI after processing: " . $requestUri);
// error_log("Endpoint: " . $endpoint);

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
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Endpoint não encontrado']);
        break;
}
