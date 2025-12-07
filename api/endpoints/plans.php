<?php

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

// This endpoint is public (no auth required)
if ($method === 'GET') {
    // Return only Professional plan
    $plans = $db->fetchAll(
        "SELECT * FROM plans WHERE slug = 'profissional' AND is_active = true ORDER BY price ASC"
    );
    
    // Parse JSON fields
    foreach ($plans as &$plan) {
        $plan['features'] = json_decode($plan['features'], true);
    }
    
    Response::success(['plans' => $plans]);
} else {
    Response::error('Método não permitido', 405);
}



