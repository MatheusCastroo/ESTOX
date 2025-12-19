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
}



