<?php

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

// This endpoint is public (no auth required)
if ($method === 'GET') {
    try {
        // Return Professional plans (Mensal, Trimestral)
        $plans = $db->fetchAll(
            "SELECT * FROM plans WHERE slug IN ('profissional-mensal', 'profissional-trimestral') AND is_active = true ORDER BY price ASC"
        );
        
        // Parse JSON fields
        foreach ($plans as &$plan) {
            if (isset($plan['features'])) {
                $decoded = json_decode($plan['features'], true);
                $plan['features'] = $decoded !== null ? $decoded : [];
            } else {
                $plan['features'] = [];
            }
        }
        
        Response::success(['plans' => $plans]);
    } catch (Exception $e) {
        // If there's an error, return empty array so frontend can use fallback
        Response::success(['plans' => []]);
    }
} else {
    Response::error('Método não permitido', 405);
}



