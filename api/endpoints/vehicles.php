<?php

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

// Check if this is a public endpoint (no auth required)
$isPublic = isset($_GET['public']) && $_GET['public'] === 'true';
$storeSlug = $_GET['store_slug'] ?? null;

if ($isPublic && $storeSlug) {
    // Public catalog endpoints
    $store = $db->fetchOne(
        "SELECT id, name, slug, logo_url, phone, whatsapp, email, address, city, state, description 
         FROM stores WHERE slug = :slug AND is_active = true",
        ['slug' => $storeSlug]
    );
    
    if (!$store) {
        Response::error('Loja não encontrada', 404);
    }
    
    $vehicleId = $_GET['vehicle_id'] ?? null;
    
    if ($method === 'GET' && $vehicleId) {
        // Get single vehicle for public catalog
        $vehicle = $db->fetchOne(
            "SELECT * FROM vehicles WHERE id = :id AND store_id = :store_id AND status = 'available'",
            ['id' => $vehicleId, 'store_id' => $store['id']]
        );
        
        if (!$vehicle) {
            Response::error('Veículo não encontrado', 404);
        }
        
        // Record the view
        $db->insert('vehicle_views', [
            'id' => $db->generateUuid(),
            'vehicle_id' => $vehicleId,
            'store_id' => $store['id'],
            'viewed_at' => date('Y-m-d H:i:s'),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
        
        // Increment view count
        $db->update('vehicles', 
            ['views' => ($vehicle['views'] ?? 0) + 1],
            'id = :id',
            ['id' => $vehicleId]
        );
        
        Response::success(['store' => $store, 'vehicle' => $vehicle]);
    } 
    elseif ($method === 'GET') {
        // Get vehicles for public catalog with filters
        $filters = $_GET;
        $query = "SELECT * FROM vehicles WHERE store_id = :store_id AND status = 'available'";
        $params = ['store_id' => $store['id']];
        
        if (isset($filters['brand'])) {
            $query .= " AND brand = :brand";
            $params['brand'] = $filters['brand'];
        }
        if (isset($filters['min_price'])) {
            $query .= " AND price >= :min_price";
            $params['min_price'] = $filters['min_price'];
        }
        if (isset($filters['max_price'])) {
            $query .= " AND price <= :max_price";
            $params['max_price'] = $filters['max_price'];
        }
        if (isset($filters['min_year'])) {
            $query .= " AND year >= :min_year";
            $params['min_year'] = $filters['min_year'];
        }
        if (isset($filters['max_year'])) {
            $query .= " AND year <= :max_year";
            $params['max_year'] = $filters['max_year'];
        }
        if (isset($filters['transmission'])) {
            $query .= " AND transmission = :transmission";
            $params['transmission'] = $filters['transmission'];
        }
        if (isset($filters['search'])) {
            $query .= " AND (LOWER(brand) LIKE LOWER(:search) OR LOWER(model) LIKE LOWER(:search))";
            $params['search'] = '%' . $filters['search'] . '%';
        }
        
        $query .= " ORDER BY created_at DESC";
        
        $vehicles = $db->fetchAll($query, $params);
        
        Response::success(['store' => $store, 'vehicles' => $vehicles]);
    }
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
    $vehicleId = $_GET['id'] ?? null;
    
    switch ($method) {
        case 'GET':
            if ($vehicleId) {
                // Get single vehicle
                $vehicle = $db->fetchOne(
                    "SELECT * FROM vehicles WHERE id = :id AND store_id = :store_id",
                    ['id' => $vehicleId, 'store_id' => $storeId]
                );
                
                if (!$vehicle) {
                    Response::error('Veículo não encontrado', 404);
                }
                
                Response::success(['vehicle' => $vehicle]);
            } else {
                // Get all vehicles with filters
                $filters = $_GET;
                $query = "SELECT * FROM vehicles WHERE store_id = :store_id";
                $params = ['store_id' => $storeId];
                
                if (isset($filters['status']) && $filters['status'] !== 'all') {
                    $query .= " AND status = :status";
                    $params['status'] = $filters['status'];
                }
                
                if (isset($filters['search'])) {
                    $query .= " AND (LOWER(brand) LIKE LOWER(:search) OR LOWER(model) LIKE LOWER(:search))";
                    $params['search'] = '%' . $filters['search'] . '%';
                }
                
                $query .= " ORDER BY created_at DESC";
                
                if (isset($filters['limit'])) {
                    $limit = (int)$filters['limit'];
                    $query .= " LIMIT $limit";
                }
                
                $vehicles = $db->fetchAll($query, $params);
                
                Response::success(['vehicles' => $vehicles]);
            }
            break;
            
        case 'POST':
            $data = Middleware::getJsonInput();
            
            $vehicleData = [
                'id' => $db->generateUuid(),
                'store_id' => $storeId,
                'brand' => $data['brand'] ?? '',
                'model' => $data['model'] ?? '',
                'year' => $data['year'] ?? 0,
                'mileage' => $data['mileage'] ?? 0,
                'price' => $data['price'] ?? 0,
                'fuel' => $data['fuel'] ?? null,
                'transmission' => $data['transmission'] ?? null,
                'color' => $data['color'] ?? null,
                'description' => $data['description'] ?? null,
                'features' => json_encode($data['features'] ?? []),
                'images' => json_encode($data['images'] ?? []),
                'status' => $data['status'] ?? 'available',
                'views' => 0,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $vehicle = $db->insert('vehicles', $vehicleData);
            $vehicle['features'] = json_decode($vehicle['features'], true);
            $vehicle['images'] = json_decode($vehicle['images'], true);
            
            Response::success(['vehicle' => $vehicle], 'Veículo criado com sucesso');
            break;
            
        case 'PUT':
            if (!$vehicleId) {
                Response::error('ID do veículo é obrigatório', 400);
            }
            
            $data = Middleware::getJsonInput();
            
            // Verify vehicle belongs to user's store
            $vehicle = $db->fetchOne(
                "SELECT id FROM vehicles WHERE id = :id AND store_id = :store_id",
                ['id' => $vehicleId, 'store_id' => $storeId]
            );
            
            if (!$vehicle) {
                Response::error('Veículo não encontrado', 404);
            }
            
            $updateData = [];
            $allowedFields = ['brand', 'model', 'year', 'mileage', 'price', 'fuel', 'transmission', 'color', 'description', 'status'];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateData[$field] = $data[$field];
                }
            }
            
            if (isset($data['features'])) {
                $updateData['features'] = json_encode($data['features']);
            }
            
            if (isset($data['images'])) {
                $updateData['images'] = json_encode($data['images']);
            }
            
            if (empty($updateData)) {
                Response::error('Nenhum campo para atualizar', 400);
            }
            
            $updateData['updated_at'] = date('Y-m-d H:i:s');
            
            $updatedVehicle = $db->update('vehicles', $updateData, 'id = :id', ['id' => $vehicleId]);
            $updatedVehicle['features'] = json_decode($updatedVehicle['features'], true);
            $updatedVehicle['images'] = json_decode($updatedVehicle['images'], true);
            
            Response::success(['vehicle' => $updatedVehicle], 'Veículo atualizado com sucesso');
            break;
            
        case 'DELETE':
            if (!$vehicleId) {
                Response::error('ID do veículo é obrigatório', 400);
            }
            
            // Verify vehicle belongs to user's store
            $vehicle = $db->fetchOne(
                "SELECT id FROM vehicles WHERE id = :id AND store_id = :store_id",
                ['id' => $vehicleId, 'store_id' => $storeId]
            );
            
            if (!$vehicle) {
                Response::error('Veículo não encontrado', 404);
            }
            
            $db->delete('vehicles', 'id = :id', ['id' => $vehicleId]);
            
            Response::success(null, 'Veículo excluído com sucesso');
            break;
            
        default:
            Response::error('Método não permitido', 405);
    }
}
