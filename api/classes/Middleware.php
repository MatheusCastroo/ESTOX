<?php

require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/Response.php';

class Middleware {
    public static function cors() {
        $config = require __DIR__ . '/../config/config.php';
        $origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '*';
        
        // Extract origin from referer if needed
        if ($origin !== '*' && filter_var($origin, FILTER_VALIDATE_URL)) {
            $parsed = parse_url($origin);
            $origin = $parsed['scheme'] . '://' . $parsed['host'] . (isset($parsed['port']) ? ':' . $parsed['port'] : '');
        }
        
        // Get allowed origins from config
        $allowedOrigins = $config['cors_origins'] ?? [];
        
        // In development, allow localhost on any port
        $isDevelopment = in_array($origin, ['http://localhost', 'http://127.0.0.1']) || 
                        preg_match('/^http:\/\/(localhost|127\.0\.0\.1):\d+$/', $origin);
        
        // Allow if origin is in allowed list, is localhost, or is *
        if ($origin === '*' || 
            in_array($origin, $allowedOrigins) || 
            $isDevelopment ||
            empty($allowedOrigins)) {
            header("Access-Control-Allow-Origin: " . ($origin === '*' ? '*' : $origin));
        } else {
            // Default to first allowed origin or *
            header("Access-Control-Allow-Origin: " . (!empty($allowedOrigins) ? $allowedOrigins[0] : '*'));
        }
        
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

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
}



