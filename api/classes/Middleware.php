<?php

require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/Response.php';

class Middleware {
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

        $userId = $auth->verifyToken($token);
        
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
        $store = $db->fetchOne(
            "SELECT id FROM stores WHERE user_id = :user_id",
            ['user_id' => $userId]
        );
        
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
     * Check if user is admin
     * You can implement your own admin check logic here
     * For now, checks if user email is in admin list from env
     */
    public static function checkAdmin() {
        require_once __DIR__ . '/Database.php';
        
        $adminEmails = getenv('ADMIN_EMAILS') ? explode(',', getenv('ADMIN_EMAILS')) : [];
        
        if (empty($adminEmails)) {
            return false;
        }
        
        $userId = self::requireAuth();
        $db = Database::getInstance();
        
        $user = $db->fetchOne(
            "SELECT email FROM users WHERE id = :id",
            ['id' => $userId]
        );
        
        if (!$user) {
            return false;
        }
        
        return in_array(trim($user['email']), array_map('trim', $adminEmails));
    }
}



