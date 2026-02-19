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

// Anti-Stress: Set execution limits to prevent server overload
ini_set('max_execution_time', 30);  // 30 seconds max per request
ini_set('memory_limit', '64M');     // Limit memory per request
set_time_limit(30);                 // PHP timeout

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

// Register error handler to ensure JSON response
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        $isDebug = isset($_GET['__debug']) && $_GET['__debug'] === '1';
        // Fatal error occurred
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
        }
        
        // Try to send JSON response, but if that fails, send minimal response
        try {
            echo json_encode([
                'success' => false,
                'error' => 'Erro interno do servidor',
                // Debug info is only returned when explicitly requested.
                // Never include secrets (tokens/passwords/keys).
                'debug' => $isDebug ? [
                    'type' => $error['type'] ?? null,
                    'message' => $error['message'] ?? null,
                    'file' => $error['file'] ?? null,
                    'line' => $error['line'] ?? null,
                ] : null
            ]);
        } catch (Exception $e) {
            // Last resort: send minimal response
            echo '{"success":false,"error":"Erro interno do servidor"}';
        }
    }
});

// Set error handler for non-fatal errors
set_error_handler(function($severity, $message, $file, $line) {
    // Only handle errors that would cause issues
    if (error_reporting() & $severity) {
        // Log error but don't break execution
        error_log("PHP Error: $message in $file on line $line");
    }
    return true; // Don't execute PHP internal error handler
}, E_WARNING | E_NOTICE);

// Handle OPTIONS preflight requests (no rate limit for OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Middleware::cors();
    http_response_code(200);
    exit;
}

// Block suspicious bots before any processing
try {
    Middleware::blockBots();
} catch (Exception $e) {
    // Already handled by Response class
    exit;
}

// Apply rate limiting (before authentication check for public endpoints)
try {
    // Check if authenticated (has Authorization header)
    $headers = getallheaders();
    $hasAuth = isset($headers['Authorization']) && !empty($headers['Authorization']);
    
    // Apply rate limiting (less restrictive for authenticated)
    Middleware::rateLimit($hasAuth);
} catch (Exception $e) {
    // Already handled by Response class
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

// Allow calling the router directly without rewrite, e.g. /api/index.php/auth
// Some hosts don't apply .htaccess rewrite rules, so PATH_INFO style URLs are used.
if (isset($pathSegments[0]) && ($pathSegments[0] === 'index.php' || $pathSegments[0] === 'index.php/')) {
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
        // #region agent log
        file_put_contents(__DIR__ . '/../.cursor/debug.log', json_encode(['location'=>'api/index.php:152','message'=>'Roteamento para vehicles','data'=>['endpoint'=>$endpoint,'pathSegments'=>$pathSegments,'requestUri'=>$_SERVER['REQUEST_URI']??'','method'=>$_SERVER['REQUEST_METHOD']??''],'timestamp'=>time()*1000,'runId'=>'run1','hypothesisId'=>'B'])."\n", FILE_APPEND);
        // #endregion
        require_once __DIR__ . '/endpoints/vehicles.php';
        break;
        
    // case 'leads':
    //     require_once __DIR__ . '/endpoints/leads.php';
    //     break;
    // Removido temporariamente - será usado futuramente
        
    case 'dashboard':
        require_once __DIR__ . '/endpoints/dashboard.php';
        break;
        
    case 'plans':
        require_once __DIR__ . '/endpoints/plans.php';
        break;
        
    case 'notifications':
        require_once __DIR__ . '/endpoints/notifications.php';
        break;
        
    case 'subscriptions':
        require_once __DIR__ . '/endpoints/subscriptions.php';
        break;
        
    case 'admin':
        // Handle admin endpoints (e.g., /api/admin/subscriptions)
        $adminEndpoint = $pathSegments[1] ?? '';
        switch ($adminEndpoint) {
            case 'subscriptions':
                require_once __DIR__ . '/endpoints/admin/subscriptions.php';
                break;
            default:
                http_response_code(404);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'Endpoint admin não encontrado',
                    'endpoint' => $adminEndpoint,
                    'available_admin_endpoints' => ['subscriptions'],
                    'debug' => [
                        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'não definido',
                        'path_segments' => $pathSegments,
                    ]
                ]);
                break;
        }
        break;
        
    default:
        // If endpoint is empty, might be accessing /api/ directly
        if (empty($endpoint)) {
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'message' => 'ESTOCX API v1.0',
                'status' => 'ok',
                'endpoints' => [
                    'auth' => '/api/auth?action=register ou /api/auth?action=login',
                    'stores' => '/api/stores',
                    'vehicles' => '/api/vehicles',
                    // 'leads' => '/api/leads', // Removido temporariamente
                    'dashboard' => '/api/dashboard',
                    'plans' => '/api/plans',
                    'notifications' => '/api/notifications',
                    'subscriptions' => '/api/subscriptions',
                    'admin' => '/api/admin/subscriptions'
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
                'available_endpoints' => ['auth', 'stores', 'vehicles', 'dashboard', 'plans', 'notifications', 'subscriptions', 'admin'],
                'debug' => [
                    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'não definido',
                    'path_segments' => $pathSegments,
                ]
            ]);
        }
        break;
}
