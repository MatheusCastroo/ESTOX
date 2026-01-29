<?php

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

// This endpoint is public (no auth required)
// REQ-PLN-STRIPE-ASSINATURAS: Section 4.2 - All active plans from database (no hardcode)
if ($method === 'GET') {
    try {
        // Return all active plans (Section 4.2 - Source of truth is database)
        $plans = $db->fetchAll(
            "SELECT id, name, slug, price, vehicle_limit, duration_days, features, is_active, checkout_url, created_at, updated_at 
             FROM plans 
             WHERE is_active = true 
             ORDER BY price ASC"
        );
        
        // Parse JSON fields
        foreach ($plans as &$plan) {
            if (isset($plan['features'])) {
                $decoded = json_decode($plan['features'], true);
                $plan['features'] = $decoded !== null ? $decoded : [];
            } else {
                $plan['features'] = [];
            }
            
            // Ensure duration_days is an integer
            $plan['duration_days'] = isset($plan['duration_days']) ? (int)$plan['duration_days'] : 30;
            
            // Ensure vehicle_limit is an integer
            $plan['vehicle_limit'] = isset($plan['vehicle_limit']) ? (int)$plan['vehicle_limit'] : 0;
            
            // Ensure price is a float
            $plan['price'] = isset($plan['price']) ? (float)$plan['price'] : 0.0;
        }
        
        Response::success(['plans' => $plans]);
    } catch (Exception $e) {
        error_log('Error fetching plans: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        
        // Retornar erro detalhado em modo de desenvolvimento
        $isDebug = (isset($_GET['__debug']) && $_GET['__debug'] === '1') || 
                   (isset($_ENV['APP_DEBUG']) && $_ENV['APP_DEBUG'] === 'true');
        
        if ($isDebug) {
            Response::error('Erro ao buscar planos: ' . $e->getMessage(), 500, [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
        } else {
            // Em produção, retornar array vazio para não quebrar o frontend
            Response::success(['plans' => []]);
        }
    }
} else {
    Response::error('Método não permitido', 405);
}



