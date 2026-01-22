<?php

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

// Check if this is a public endpoint (no auth required)
$isPublic = isset($_GET['public']) && $_GET['public'] === 'true';
$storeSlug = $_GET['slug'] ?? null;

// Only require auth if not a public request
if (!$isPublic) {
    $userId = Middleware::requireAuth();
} else {
    $userId = null;
}

// REQ-FR-031: Helper function to get user's store
// This function ensures data isolation - users can only access their own store
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
        } elseif ($isPublic && $storeSlug) {
            // Public endpoint - return store data by slug (including whatsapp)
            $store = $db->fetchOne(
                "SELECT id, name, slug, logo_url, phone, whatsapp, email, address, city, state, description, 
                        subscription_status, subscription_ends_at, is_active
                 FROM stores WHERE slug = :slug AND is_active = true",
                ['slug' => $storeSlug]
            );
            
            if (!$store) {
                Response::error('Loja não encontrada', 404);
            }
            
            // Block access if subscription is pending, suspended, or canceled
            if (in_array($store['subscription_status'], ['pending', 'suspended', 'canceled'])) {
                Response::error('Esta loja está temporariamente indisponível. Entre em contato com o proprietário.', 403);
            }
            
            // Check if trial expired
            if ($store['subscription_status'] === 'trial' && 
                $store['subscription_ends_at'] && 
                strtotime($store['subscription_ends_at']) < time()) {
                Response::error('Esta loja está temporariamente indisponível. Entre em contato com o proprietário.', 403);
            }
            
            Response::success(['store' => $store]);
        } else {
            // Private endpoint - require auth
            if (!$userId) {
                Response::error('Não autorizado', 401);
            }
            
            $store = $db->fetchOne(
                "SELECT * FROM stores WHERE user_id = :user_id",
                ['user_id' => $userId]
            );
            
            Response::success(['store' => $store]);
        }
        break;
        
    case 'POST':
        $data = Middleware::getJsonInput();
        
        // Ensure user_id is trimmed and valid
        $userId = trim($userId);
        if (empty($userId)) {
            Response::error('ID do usuário inválido', 400);
        }
        
        // Check if user already has a store using COUNT for more reliable check
        $countResult = $db->fetchOne(
            "SELECT COUNT(*) as count FROM stores WHERE user_id = :user_id",
            ['user_id' => $userId]
        );
        
        // Check if store exists (count should be 0 for new users)
        $storeCount = isset($countResult['count']) ? (int)$countResult['count'] : 0;
        if ($storeCount > 0) {
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
        
        // Get plan if specified, otherwise assign free plan
        $planId = null;
        if (isset($data['plan_slug']) && !empty($data['plan_slug'])) {
            $plan = $db->fetchOne(
                "SELECT id FROM plans WHERE slug = :slug AND is_active = true",
                ['slug' => $data['plan_slug']]
            );
            $planId = $plan['id'] ?? null;
        }
        
        // Se não foi especificado um plano, atribuir o plano gratuito automaticamente
        if ($planId === null) {
            $freePlan = $db->fetchOne(
                "SELECT id FROM plans WHERE slug = 'gratuito' AND is_active = true",
                []
            );
            if ($freePlan) {
                $planId = $freePlan['id'];
            }
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
            'subscription_ends_at' => date('Y-m-d H:i:s', strtotime('+15 days')),
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
