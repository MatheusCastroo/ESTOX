<?php

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

// Check if this is a public endpoint (create lead from catalog)
$isPublic = isset($_GET['public']) && $_GET['public'] === 'true';

if ($isPublic && $method === 'POST') {
    // Public endpoint to create lead
    $data = Middleware::getJsonInput();
    
    if (!isset($data['store_slug'])) {
        Response::error('store_slug é obrigatório', 400);
    }
    
    // Get store by slug
    $store = $db->fetchOne(
        "SELECT id FROM stores WHERE slug = :slug AND is_active = true",
        ['slug' => $data['store_slug']]
    );
    
    if (!$store) {
        Response::error('Loja não encontrada', 404);
    }
    
    $leadData = [
        'id' => $db->generateUuid(),
        'store_id' => $store['id'],
        'vehicle_id' => $data['vehicle_id'] ?? null,
        'name' => $data['name'] ?? '',
        'phone' => $data['phone'] ?? null,
        'email' => $data['email'] ?? null,
        'message' => $data['message'] ?? null,
        'source' => $data['source'] ?? 'form',
        'status' => 'new',
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    $lead = $db->insert('leads', $leadData);
    
    Response::success(['lead' => $lead], 'Lead criado com sucesso');
} else {
    // Protected endpoints (require auth)
    $userId = Middleware::requireAuth();
    
    // Get user's store
    $userStore = $db->fetchOne(
        "SELECT id FROM stores WHERE user_id = :user_id",
        ['user_id' => $userId]
    );
    
    if (!$userStore) {
        Response::error('Loja não encontrada', 404);
    }
    
    $storeId = $userStore['id'];
    $leadId = $_GET['id'] ?? null;
    
    switch ($method) {
        case 'GET':
            if (isset($_GET['stats'])) {
                // Get lead statistics
                $thirtyDaysAgo = date('Y-m-d H:i:s', strtotime('-30 days'));
                
                $total = $db->fetchOne(
                    "SELECT COUNT(*) as count FROM leads WHERE store_id = :store_id AND created_at >= :date",
                    ['store_id' => $storeId, 'date' => $thirtyDaysAgo]
                )['count'] ?? 0;
                
                $newLeads = $db->fetchOne(
                    "SELECT COUNT(*) as count FROM leads WHERE store_id = :store_id AND status = 'new' AND created_at >= :date",
                    ['store_id' => $storeId, 'date' => $thirtyDaysAgo]
                )['count'] ?? 0;
                
                $converted = $db->fetchOne(
                    "SELECT COUNT(*) as count FROM leads WHERE store_id = :store_id AND status = 'converted' AND created_at >= :date",
                    ['store_id' => $storeId, 'date' => $thirtyDaysAgo]
                )['count'] ?? 0;
                
                $conversionRate = $total > 0 ? round(($converted / $total) * 100) : 0;
                
                Response::success([
                    'total' => (int)$total,
                    'new' => (int)$newLeads,
                    'converted' => (int)$converted,
                    'conversion_rate' => $conversionRate
                ]);
            } else {
                // Get all leads with filters
                $filters = $_GET;
                $query = "SELECT l.*, 
                         json_build_object('id', v.id, 'brand', v.brand, 'model', v.model, 'year', v.year, 'images', v.images) as vehicle
                         FROM leads l
                         LEFT JOIN vehicles v ON l.vehicle_id = v.id
                         WHERE l.store_id = :store_id";
                $params = ['store_id' => $storeId];
                
                if (isset($filters['status']) && $filters['status'] !== 'all') {
                    $query .= " AND l.status = :status";
                    $params['status'] = $filters['status'];
                }
                
                if (isset($filters['search'])) {
                    $query .= " AND (l.name ILIKE :search OR l.email ILIKE :search OR l.phone ILIKE :search)";
                    $params['search'] = '%' . $filters['search'] . '%';
                }
                
                if (isset($filters['vehicle_id'])) {
                    $query .= " AND l.vehicle_id = :vehicle_id";
                    $params['vehicle_id'] = $filters['vehicle_id'];
                }
                
                $query .= " ORDER BY l.created_at DESC";
                
                if (isset($filters['limit'])) {
                    $limit = (int)$filters['limit'];
                    $query .= " LIMIT $limit";
                }
                
                $leads = $db->fetchAll($query, $params);
                
                // Parse vehicle JSON
                foreach ($leads as &$lead) {
                    if (isset($lead['vehicle']) && $lead['vehicle']) {
                        $lead['vehicle'] = json_decode($lead['vehicle'], true);
                    } else {
                        $lead['vehicle'] = null;
                    }
                }
                
                Response::success(['leads' => $leads]);
            }
            break;
            
        case 'PUT':
            if (!$leadId) {
                Response::error('ID do lead é obrigatório', 400);
            }
            
            $data = Middleware::getJsonInput();
            
            if (!isset($data['status'])) {
                Response::error('Status é obrigatório', 400);
            }
            
            // Verify lead belongs to user's store
            $lead = $db->fetchOne(
                "SELECT id FROM leads WHERE id = :id AND store_id = :store_id",
                ['id' => $leadId, 'store_id' => $storeId]
            );
            
            if (!$lead) {
                Response::error('Lead não encontrado', 404);
            }
            
            $updatedLead = $db->update('leads', 
                ['status' => $data['status'], 'updated_at' => date('Y-m-d H:i:s')],
                'id = :id',
                ['id' => $leadId]
            );
            
            Response::success(['lead' => $updatedLead], 'Status do lead atualizado com sucesso');
            break;
            
        case 'DELETE':
            if (!$leadId) {
                Response::error('ID do lead é obrigatório', 400);
            }
            
            // Verify lead belongs to user's store
            $lead = $db->fetchOne(
                "SELECT id FROM leads WHERE id = :id AND store_id = :store_id",
                ['id' => $leadId, 'store_id' => $storeId]
            );
            
            if (!$lead) {
                Response::error('Lead não encontrado', 404);
            }
            
            $db->delete('leads', 'id = :id', ['id' => $leadId]);
            
            Response::success(null, 'Lead excluído com sucesso');
            break;
            
        default:
            Response::error('Método não permitido', 405);
    }
}
