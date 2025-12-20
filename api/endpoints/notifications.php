<?php

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();
$userId = Middleware::requireAuth();

// REQ-FR-031: Get user's store_id to ensure data isolation
$storeId = Middleware::getUserStoreId($db, $userId);

switch ($method) {
    case 'GET':
        $settings = $db->fetchOne(
            "SELECT * FROM notification_settings WHERE store_id = :store_id",
            ['store_id' => $storeId]
        );
        
        Response::success(['settings' => $settings]);
        break;
        
    case 'PUT':
        $data = Middleware::getJsonInput();
        
        $updateData = [];
        $allowedFields = ['new_lead_email', 'weekly_report', 'platform_updates'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = (bool)$data[$field];
            }
        }
        
        if (empty($updateData)) {
            Response::error('Nenhum campo para atualizar', 400);
        }
        
        $updateData['updated_at'] = date('Y-m-d H:i:s');
        
        $updatedSettings = $db->update('notification_settings', $updateData, 'store_id = :store_id', ['store_id' => $storeId]);
        
        Response::success(['settings' => $updatedSettings], 'Configurações atualizadas com sucesso');
        break;
        
    default:
        Response::error('Método não permitido', 405);
}



