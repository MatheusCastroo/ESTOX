<?php

require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$auth = new Auth();

switch ($method) {
    case 'POST':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'register') {
            $data = Middleware::getJsonInput();
            
            if (!isset($data['email']) || !isset($data['password'])) {
                Response::error('Email e senha são obrigatórios', 400);
            }
            
            try {
                $user = $auth->register(
                    $data['email'],
                    $data['password'],
                    $data['name'] ?? null
                );
                
                $token = $auth->generateToken($user['id']);
                
                Response::success([
                    'user' => $user,
                    'token' => $token
                ], 'Usuário criado com sucesso');
            } catch (Exception $e) {
                Response::error($e->getMessage(), 400);
            }
        } 
        elseif ($action === 'login') {
            $data = Middleware::getJsonInput();
            
            if (!isset($data['email']) || !isset($data['password'])) {
                Response::error('Email e senha são obrigatórios', 400);
            }
            
            try {
                $user = $auth->login($data['email'], $data['password']);
                $token = $auth->generateToken($user['id']);
                
                Response::success([
                    'user' => $user,
                    'token' => $token
                ]);
            } catch (Exception $e) {
                Response::error($e->getMessage(), 401);
            }
        }
        else {
            Response::error('Ação inválida', 400);
        }
        break;
        
    case 'GET':
        $userId = Middleware::requireAuth();
        $user = $auth->getUserById($userId);
        
        if (!$user) {
            Response::notFound('Usuário não encontrado');
        }
        
        Response::success(['user' => $user]);
        break;
        
    default:
        Response::error('Método não permitido', 405);
}



