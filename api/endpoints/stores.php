<?php

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();
$userId = Middleware::requireAuth();

// Helper function to get user's store
function getUserStore($db, $userId) {
    $store = $db->fetchOne(
        "SELECT * FROM stores WHERE user_id = :user_id",
        ['user_id' => $userId]
    );
    
    if (!$store) {
        Response::error('Loja não encontrada', 404);
    }
    
    return $store;
}

switch ($method) {
    case 'GET':
        if (isset($_GET['check_slug'])) {
            $slug = $_GET['check_slug'];
            $exists = $db->fetchOne(
                "SELECT id FROM stores WHERE slug = :slug",
                ['slug' => $slug]
            );
            
            Response::success(['available' => !$exists]);
        } else {
            $store = $db->fetchOne(
                "SELECT * FROM stores WHERE user_id = :user_id",
                ['user_id' => $userId]
            );
            
            Response::success(['store' => $store]);
        }
        break;
        
    case 'POST':
        $data = Middleware::getJsonInput();
        
        // Check if user already has a store
        $existing = $db->fetchOne(
            "SELECT id FROM stores WHERE user_id = :user_id",
            ['user_id' => $userId]
        );
        
        if ($existing) {
            Response::error('Usuário já possui uma loja cadastrada', 400);
        }
        
        // Check if slug is available
        if (isset($data['slug'])) {
            $slugCheck = $db->fetchOne(
                "SELECT id FROM stores WHERE slug = :slug",
                ['slug' => $data['slug']]
            );
            
            if ($slugCheck) {
                Response::error('Este slug já está em uso. Escolha outro.', 400);
            }
        }
        
        // Get plan if specified
        $planId = null;
        if (isset($data['plan_slug'])) {
            $plan = $db->fetchOne(
                "SELECT id FROM plans WHERE slug = :slug",
                ['slug' => $data['plan_slug']]
            );
            $planId = $plan['id'] ?? null;
        }
        
        // Create store
        $storeData = [
            'id' => $db->generateUuid(),
            'user_id' => $userId,
            'plan_id' => $planId,
            'name' => $data['name'] ?? '',
            'slug' => $data['slug'] ?? '',
            'phone' => $data['phone'] ?? null,
            'whatsapp' => $data['whatsapp'] ?? null,
            'email' => $data['email'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'description' => $data['description'] ?? null,
            'subscription_status' => 'trial',
            'subscription_ends_at' => date('Y-m-d H:i:s', strtotime('+14 days')),
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $store = $db->insert('stores', $storeData);
        
        // Create default notification settings
        $db->insert('notification_settings', [
            'id' => $db->generateUuid(),
            'store_id' => $store['id'],
            'new_lead_email' => true,
            'weekly_report' => true,
            'platform_updates' => false,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        
        Response::success(['store' => $store], 'Loja criada com sucesso');
        break;
        
    case 'PUT':
        $data = Middleware::getJsonInput();
        $store = getUserStore($db, $userId);
        
        // If updating slug, check if it's available
        if (isset($data['slug']) && $data['slug'] !== $store['slug']) {
            $slugCheck = $db->fetchOne(
                "SELECT id, user_id FROM stores WHERE slug = :slug",
                ['slug' => $data['slug']]
            );
            
            if ($slugCheck && $slugCheck['user_id'] !== $userId) {
                Response::error('Este slug já está em uso. Escolha outro.', 400);
            }
        }
        
        $updateData = [];
        $allowedFields = ['name', 'slug', 'phone', 'whatsapp', 'email', 'address', 'city', 'state', 'description', 'logo_url'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }
        
        if (empty($updateData)) {
            Response::error('Nenhum campo para atualizar', 400);
        }
        
        $updateData['updated_at'] = date('Y-m-d H:i:s');
        
        $updatedStore = $db->update('stores', $updateData, 'id = :id', ['id' => $store['id']]);
        
        Response::success(['store' => $updatedStore], 'Loja atualizada com sucesso');
        break;
        
    default:
        Response::error('Método não permitido', 405);
}
