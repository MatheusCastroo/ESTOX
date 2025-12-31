<?php
/**
 * Admin Subscriptions Endpoint
 * Administrative panel for managing subscriptions
 * Requires admin authentication
 */

require_once __DIR__ . '/../../classes/Database.php';
require_once __DIR__ . '/../../classes/Response.php';
require_once __DIR__ . '/../../classes/Middleware.php';
require_once __DIR__ . '/../../classes/EmailService.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

// Check admin authentication (you can implement your own admin check)
$isAdmin = Middleware::checkAdmin(); // You need to implement this

if (!$isAdmin) {
    Response::error('Acesso negado. Apenas administradores.', 403);
}

switch ($method) {
    case 'GET':
        // List all stores with subscription info
        $status = $_GET['status'] ?? null;
        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = ($page - 1) * $limit;
        
        $where = "1=1";
        $params = [];
        
        if ($status) {
            $where .= " AND s.subscription_status = :status";
            $params['status'] = $status;
        }
        
        // Get stores
        $stores = $db->fetchAll(
            "SELECT s.*, 
                    u.name as user_name, 
                    u.email as user_email,
                    p.name as plan_name,
                    p.price as plan_price,
                    (SELECT COUNT(*) FROM vehicles WHERE store_id = s.id) as vehicle_count
             FROM stores s
             LEFT JOIN users u ON s.user_id = u.id
             LEFT JOIN plans p ON s.plan_id = p.id
             WHERE {$where}
             ORDER BY s.created_at DESC
             LIMIT :limit OFFSET :offset",
            array_merge($params, ['limit' => $limit, 'offset' => $offset])
        );
        
        // Get total count
        $total = $db->fetchOne(
            "SELECT COUNT(*) as total FROM stores s WHERE {$where}",
            $params
        )['total'];
        
        Response::success([
            'stores' => $stores,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ]);
        break;
        
    case 'PUT':
        // Update subscription status (suspend/reactivate)
        $data = Middleware::getJsonInput();
        $storeId = $data['store_id'] ?? null;
        $action = $data['action'] ?? null;
        
        if (!$storeId || !$action) {
            Response::error('store_id e action são obrigatórios', 400);
        }
        
        $store = $db->fetchOne(
            "SELECT * FROM stores WHERE id = :id",
            ['id' => $storeId]
        );
        
        if (!$store) {
            Response::error('Loja não encontrada', 404);
        }
        
        $oldStatus = $store['subscription_status'];
        $newStatus = null;
        $actionType = null;
        
        switch ($action) {
            case 'suspend':
                $newStatus = 'suspended';
                $actionType = 'suspended';
                break;
                
            case 'reactivate':
                // Reactivate - set to active if was pending/suspended
                if (in_array($oldStatus, ['pending', 'suspended'])) {
                    $newStatus = 'active';
                    // Extend subscription by 30 days
                    $newEndsAt = date('Y-m-d H:i:s', strtotime('+30 days'));
                    $actionType = 'reactivated';
                } else {
                    Response::error('Apenas contas pendentes ou suspensas podem ser reativadas', 400);
                }
                break;
                
            case 'cancel':
                $newStatus = 'canceled';
                $actionType = 'canceled';
                break;
                
            default:
                Response::error('Ação inválida. Use: suspend, reactivate ou cancel', 400);
        }
        
        $updateData = [
            'subscription_status' => $newStatus,
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        if (isset($newEndsAt)) {
            $updateData['subscription_ends_at'] = $newEndsAt;
        }
        
        $db->update('stores', $updateData, 'id = :id', ['id' => $storeId]);
        
        // Log the change
        $db->insert('subscription_logs', [
            'id' => $db->generateUuid(),
            'store_id' => $storeId,
            'action' => $actionType,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'old_ends_at' => $store['subscription_ends_at'],
            'new_ends_at' => $updateData['subscription_ends_at'] ?? $store['subscription_ends_at'],
            'performed_by' => 'admin', // You can get admin user ID here
            'notes' => $data['notes'] ?? "Ação executada via painel administrativo",
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        // Get updated store
        $updatedStore = $db->fetchOne(
            "SELECT s.*, u.name as user_name, u.email as user_email, p.name as plan_name
             FROM stores s
             LEFT JOIN users u ON s.user_id = u.id
             LEFT JOIN plans p ON s.plan_id = p.id
             WHERE s.id = :id",
            ['id' => $storeId]
        );
        
        Response::success([
            'store' => $updatedStore,
            'message' => "Status alterado de {$oldStatus} para {$newStatus}"
        ]);
        break;
        
    case 'GET':
        // Get subscription logs for a store
        if (isset($_GET['store_id'])) {
            $logs = $db->fetchAll(
                "SELECT * FROM subscription_logs 
                 WHERE store_id = :store_id 
                 ORDER BY created_at DESC 
                 LIMIT 50",
                ['store_id' => $_GET['store_id']]
            );
            
            Response::success(['logs' => $logs]);
        }
        break;
        
    default:
        Response::error('Método não permitido', 405);
}





