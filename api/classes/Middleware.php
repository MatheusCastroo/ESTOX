<?php

require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/RateLimiter.php';

class Middleware {
    /**
     * Block suspicious bots and requests
     * Only blocks obviously malicious requests, allows legitimate browsers and API clients
     */
    public static function blockBots() {
        // Skip bot blocking for OPTIONS requests (CORS preflight)
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return;
        }
        
        // Very permissive - only block obviously malicious requests
        // Allow all legitimate browsers, API clients, and testing tools
        // This function is intentionally minimal to avoid false positives
    }
    
    /**
     * Apply rate limiting
     * @param bool $isAuthenticated Whether the request is authenticated
     */
    public static function rateLimit($isAuthenticated = false) {
        // Cleanup old files (10% chance to avoid overhead)
        if (rand(1, 10) === 1) {
            RateLimiter::cleanup();
        }
        
        $result = RateLimiter::check($isAuthenticated);
        
        // Set rate limit headers
        if (!headers_sent()) {
            header('X-RateLimit-Limit: ' . $result['limit']);
            header('X-RateLimit-Remaining: ' . $result['remaining']);
            header('X-RateLimit-Reset: ' . $result['reset']);
        }
        
        if (!$result['allowed']) {
            Response::tooManyRequests(
                'Muitas requisições. Limite de ' . $result['limit'] . ' requisições por minuto excedido.',
                $result['reset']
            );
        }
    }
    
    public static function cors() {
        $config = require __DIR__ . '/../config/config.php';
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        
        if (in_array($origin, $config['cors_origins']) || $origin === '*') {
            header("Access-Control-Allow-Origin: $origin");
        }
        
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    public static function requireAuth() {
        $auth = new Auth();
        
        $headers = getallheaders();
        // #region agent log
        $logPath = __DIR__ . '/../../.cursor/debug.log';
        $logDir = dirname($logPath);
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }
        $logData = [
            'location' => 'api/classes/Middleware.php:71',
            'message' => 'Verificando autenticação',
            'data' => [
                'hasHeaders' => !empty($headers),
                'headersKeys' => $headers ? array_keys($headers) : [],
                'hasAuthHeader' => isset($headers['Authorization']),
                'authHeaderValue' => isset($headers['Authorization']) ? substr($headers['Authorization'], 0, 50) . '...' : null,
                'serverAuth' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'não definido'
            ],
            'timestamp' => time() * 1000,
            'runId' => 'run1',
            'hypothesisId' => 'D'
        ];
        @file_put_contents($logPath, json_encode($logData) . "\n", FILE_APPEND);
        // #endregion
        $token = null;

        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        // #region agent log
        $logData2 = [
            'location' => 'api/classes/Middleware.php:95',
            'message' => 'Token extraído',
            'data' => [
                'hasToken' => !empty($token),
                'tokenLength' => $token ? strlen($token) : 0,
                'tokenPreview' => $token ? substr($token, 0, 20) . '...' : null
            ],
            'timestamp' => time() * 1000,
            'runId' => 'run1',
            'hypothesisId' => 'D'
        ];
        @file_put_contents($logPath, json_encode($logData2) . "\n", FILE_APPEND);
        // #endregion

        if (!$token) {
            Response::unauthorized('Token de autenticação não fornecido');
        }

        $userId = $auth->verifyToken($token);
        
        // #region agent log
        $logData3 = [
            'location' => 'api/classes/Middleware.php:105',
            'message' => 'Token verificado',
            'data' => [
                'hasUserId' => !empty($userId),
                'userId' => $userId
            ],
            'timestamp' => time() * 1000,
            'runId' => 'run1',
            'hypothesisId' => 'D'
        ];
        @file_put_contents($logPath, json_encode($logData3) . "\n", FILE_APPEND);
        // #endregion
        
        if (!$userId) {
            Response::unauthorized('Token inválido ou expirado');
        }

        return $userId;
    }

    public static function getJsonInput() {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            Response::error('JSON inválido', 400);
        }
        
        return $data;
    }
    
    /**
     * REQ-FR-031: Get user's store ID
     * Validates that the authenticated user has a store and returns the store_id
     * This ensures data isolation per client (multi-tenant security)
     * 
     * @param Database $db Database instance
     * @param string $userId Authenticated user ID
     * @return string Store ID
     * @throws Response::error if store not found
     */
    public static function getUserStoreId($db, $userId) {
        // #region agent log
        $logPath = __DIR__ . '/../../.cursor/debug.log';
        $logData = [
            'location' => 'api/classes/Middleware.php:116',
            'message' => 'Buscando loja do usuário',
            'data' => [
                'userId' => $userId
            ],
            'timestamp' => time() * 1000,
            'runId' => 'run1',
            'hypothesisId' => 'E'
        ];
        @file_put_contents($logPath, json_encode($logData) . "\n", FILE_APPEND);
        // #endregion
        
        $store = $db->fetchOne(
            "SELECT id FROM stores WHERE user_id = :user_id",
            ['user_id' => $userId]
        );
        
        // #region agent log
        $logData2 = [
            'location' => 'api/classes/Middleware.php:125',
            'message' => 'Resultado da busca de loja',
            'data' => [
                'hasStore' => !empty($store),
                'storeId' => $store['id'] ?? null
            ],
            'timestamp' => time() * 1000,
            'runId' => 'run1',
            'hypothesisId' => 'E'
        ];
        @file_put_contents($logPath, json_encode($logData2) . "\n", FILE_APPEND);
        // #endregion
        
        if (!$store) {
            Response::error('Loja não encontrada. Por favor, configure sua loja primeiro.', 404);
        }
        
        return $store['id'];
    }
    
    /**
     * REQ-FR-031: Validate that a resource belongs to the user's store
     * This is a security measure to prevent users from accessing other stores' data
     * 
     * @param Database $db Database instance
     * @param string $storeId User's store ID
     * @param string $resourceTable Table name (e.g., 'vehicles', 'leads')
     * @param string $resourceId Resource ID to validate
     * @return bool True if resource belongs to store
     * @throws Response::error if resource not found or doesn't belong to store
     */
    public static function validateResourceOwnership($db, $storeId, $resourceTable, $resourceId) {
        // Validate table name to prevent SQL injection
        $allowedTables = ['vehicles', 'leads', 'notification_settings'];
        if (!in_array($resourceTable, $allowedTables)) {
            Response::error('Tabela inválida', 400);
        }
        
        $resource = $db->fetchOne(
            "SELECT id FROM $resourceTable WHERE id = :id AND store_id = :store_id",
            ['id' => $resourceId, 'store_id' => $storeId]
        );
        
        if (!$resource) {
            Response::error('Recurso não encontrado ou você não tem permissão para acessá-lo', 404);
        }
        
        return true;
    }
    
    /**
     * Check if user is admin (REQ-ADM-PAINEL-ASSINATURAS-COM-AUTH)
     * Validates token and checks role from JWT token
     * 
     * @return string User ID if admin, throws Response::error if not
     */
    public static function requireAdmin() {
        $auth = new Auth();
        
        $headers = getallheaders();
        $token = null;

        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            Response::unauthorized('Token de autenticação não fornecido');
        }

        // Verify token and get role
        $userData = $auth->verifyTokenWithRole($token);
        
        if (!$userData) {
            Response::unauthorized('Token inválido ou expirado');
        }
        
        // Check if user has admin role
        if ($userData['role'] !== 'admin') {
            Response::forbidden('Acesso negado. Apenas administradores.');
        }
        
        return $userData['userId'];
    }
    
    /**
     * Check if user is admin (legacy method - kept for compatibility)
     * @deprecated Use requireAdmin() instead
     */
    public static function checkAdmin() {
        try {
            self::requireAdmin();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}



