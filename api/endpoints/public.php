<?php

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

// Get store_slug from URL path or query parameter
$storeSlug = $_GET['store_slug'] ?? $_GET['slug'] ?? null;

if (!$storeSlug) {
    Response::error('store_slug é obrigatório', 400);
}

// Get store by slug
$store = $db->fetchOne(
    "SELECT id, name, slug, logo_url, phone, whatsapp, email, address, city, state, description, is_active 
     FROM stores WHERE slug = :slug AND is_active = true",
    ['slug' => $storeSlug]
);

if (!$store) {
    Response::error('Loja não encontrada', 404);
}

// Handle different request types
$action = $_GET['action'] ?? 'store';

switch ($action) {
    case 'store':
        // Return store information
        Response::success(['store' => $store]);
        break;
        
    case 'vehicles':
        // Return vehicles for this store
        $vehicleId = $_GET['vehicle_id'] ?? null;
        
        if ($vehicleId) {
            // Get single vehicle
            $vehicle = $db->fetchOne(
                "SELECT * FROM vehicles WHERE id = :id AND store_id = :store_id",
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
            
            // Decode JSON fields
            $vehicle['features'] = json_decode($vehicle['features'] ?? '[]', true);
            $vehicle['images'] = json_decode($vehicle['images'] ?? '[]', true);
            
            Response::success(['store' => $store, 'vehicle' => $vehicle]);
        } else {
            // Get all available vehicles with filters
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
            if (isset($filters['max_mileage'])) {
                $query .= " AND mileage <= :max_mileage";
                $params['max_mileage'] = $filters['max_mileage'];
            }
            if (isset($filters['transmission'])) {
                $query .= " AND transmission = :transmission";
                $params['transmission'] = $filters['transmission'];
            }
            if (isset($filters['fuel'])) {
                $query .= " AND fuel = :fuel";
                $params['fuel'] = $filters['fuel'];
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
            
            // Decode JSON fields for each vehicle
            foreach ($vehicles as &$vehicle) {
                $vehicle['features'] = json_decode($vehicle['features'] ?? '[]', true);
                $vehicle['images'] = json_decode($vehicle['images'] ?? '[]', true);
            }
            
            Response::success(['store' => $store, 'vehicles' => $vehicles]);
        }
        break;
        
    default:
        Response::error('Ação inválida', 400);
}

