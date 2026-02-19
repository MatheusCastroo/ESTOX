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
        "SELECT id, name, slug, logo_url, phone, whatsapp, email, address, city, state, description, 
                subscription_status, subscription_ends_at
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
    
    $vehicleId = $_GET['vehicle_id'] ?? null;
    
    if ($method === 'GET' && $vehicleId) {
        // Get single vehicle for public catalog (all statuses to show sold badge)
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
        
        Response::success(['store' => $store, 'vehicle' => $vehicle]);
    } 
    elseif ($method === 'GET') {
        // Get vehicles for public catalog with filters
        // REQ-FR-021: Only show available vehicles by default
        $filters = $_GET;
        $query = "SELECT * FROM vehicles WHERE store_id = :store_id";
        $params = ['store_id' => $store['id']];
        
        // REQ-FR-021: Filter by status - default to 'available' only
        if (isset($filters['status'])) {
            if ($filters['status'] === 'all') {
                // Show all statuses if explicitly requested
            } else {
                $query .= " AND status = :status";
                $params['status'] = $filters['status'];
            }
        } else {
            // Default: only show available vehicles
            $query .= " AND status = 'available'";
        }
        
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
        // REQ-FR-021: Add mileage filter support
        if (isset($filters['max_mileage'])) {
            $query .= " AND mileage <= :max_mileage";
            $params['max_mileage'] = $filters['max_mileage'];
        }
        if (isset($filters['transmission'])) {
            $query .= " AND transmission = :transmission";
            $params['transmission'] = $filters['transmission'];
        }
        // Only filter by body_type if it's not empty
        if (isset($filters['body_type']) && !empty($filters['body_type'])) {
            $query .= " AND body_type = :body_type";
            $params['body_type'] = $filters['body_type'];
        }
        if (isset($filters['search'])) {
            $query .= " AND (LOWER(brand) LIKE LOWER(:search) OR LOWER(model) LIKE LOWER(:search))";
            $params['search'] = '%' . $filters['search'] . '%';
        }
        
        $query .= " ORDER BY created_at DESC";
        
        try {
            $vehicles = $db->fetchAll($query, $params);
            Response::success(['store' => $store, 'vehicles' => $vehicles]);
        } catch (Exception $e) {
            error_log('Erro ao buscar veículos: ' . $e->getMessage());
            // Se o erro for relacionado ao campo body_type não existir, remover o filtro e tentar novamente
            if (strpos($e->getMessage(), 'body_type') !== false && isset($filters['body_type']) && !empty($filters['body_type'])) {
                // Reconstruir a query sem o filtro body_type
                $retryQuery = "SELECT * FROM vehicles WHERE store_id = :store_id";
                $retryParams = ['store_id' => $store['id']];
                
                // Reaplicar todos os filtros exceto body_type
                if (isset($filters['status']) && $filters['status'] !== 'all') {
                    $retryQuery .= " AND status = :status";
                    $retryParams['status'] = $filters['status'];
                } else {
                    $retryQuery .= " AND status = 'available'";
                }
                
                if (isset($filters['brand'])) {
                    $retryQuery .= " AND brand = :brand";
                    $retryParams['brand'] = $filters['brand'];
                }
                if (isset($filters['min_price'])) {
                    $retryQuery .= " AND price >= :min_price";
                    $retryParams['min_price'] = $filters['min_price'];
                }
                if (isset($filters['max_price'])) {
                    $retryQuery .= " AND price <= :max_price";
                    $retryParams['max_price'] = $filters['max_price'];
                }
                if (isset($filters['min_year'])) {
                    $retryQuery .= " AND year >= :min_year";
                    $retryParams['min_year'] = $filters['min_year'];
                }
                if (isset($filters['max_year'])) {
                    $retryQuery .= " AND year <= :max_year";
                    $retryParams['max_year'] = $filters['max_year'];
                }
                if (isset($filters['max_mileage'])) {
                    $retryQuery .= " AND mileage <= :max_mileage";
                    $retryParams['max_mileage'] = $filters['max_mileage'];
                }
                if (isset($filters['transmission'])) {
                    $retryQuery .= " AND transmission = :transmission";
                    $retryParams['transmission'] = $filters['transmission'];
                }
                if (isset($filters['search'])) {
                    $retryQuery .= " AND (LOWER(brand) LIKE LOWER(:search) OR LOWER(model) LIKE LOWER(:search))";
                    $retryParams['search'] = '%' . $filters['search'] . '%';
                }
                
                $retryQuery .= " ORDER BY created_at DESC";
                
                try {
                    $vehicles = $db->fetchAll($retryQuery, $retryParams);
                    Response::success(['store' => $store, 'vehicles' => $vehicles]);
                } catch (Exception $e2) {
                    Response::error('Erro ao buscar veículos: ' . $e2->getMessage(), 500);
                }
            } else {
                Response::error('Erro ao buscar veículos: ' . $e->getMessage(), 500);
            }
        }
    }
} else {
    // REQ-FR-031: Protected endpoints (require auth)
    // These endpoints validate user-store relationship for data isolation
    $userId = Middleware::requireAuth();
    
    // REQ-FR-031: Get user's store_id to ensure data isolation
    // Users can only access data from their own store
    $storeId = Middleware::getUserStoreId($db, $userId);
    $vehicleId = $_GET['id'] ?? null;
    
    switch ($method) {
        case 'GET':
        // #region agent log
        $logData = [
            'location' => 'api/endpoints/vehicles.php:227',
            'message' => 'Handler GET autenticado iniciado',
            'data' => [
                'method' => $method,
                'queryString' => $_SERVER['QUERY_STRING'] ?? '',
                'getParams' => $_GET,
                'hasAuth' => isset($_SERVER['HTTP_AUTHORIZATION'])
            ],
            'timestamp' => time() * 1000,
            'runId' => 'run1',
            'hypothesisId' => 'B'
        ];
        file_put_contents(__DIR__ . '/../../.cursor/debug.log', json_encode($logData) . "\n", FILE_APPEND);
        // #endregion
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
            try {
                $data = Middleware::getJsonInput();
                
                // REQ-PLN-STRIPE-ASSINATURAS: Section 9 - Controle de Limites
                // Check subscription status and vehicle limit before creating vehicle
                $store = $db->fetchOne(
                    "SELECT s.*, p.vehicle_limit, p.slug as plan_slug, p.price as plan_price
                     FROM stores s 
                     LEFT JOIN plans p ON s.plan_id = p.id 
                     WHERE s.id = :store_id",
                    ['store_id' => $storeId]
                );
                
                if (!$store) {
                    Response::error('Loja não encontrada', 404);
                }
                
                // Check if subscription is active or trial (trial allows free plan to work)
                $allowedStatuses = ['active', 'trial'];
                if (!in_array($store['subscription_status'], $allowedStatuses)) {
                    Response::error('Você precisa de uma assinatura ativa para cadastrar veículos. Renove seu plano para continuar.', 403);
                }
                
                // Identificar o plano pelo slug primeiro (mais confiável)
                $planSlug = isset($store['plan_slug']) ? trim($store['plan_slug']) : null;
                $planPrice = isset($store['plan_price']) ? (float)$store['plan_price'] : null;
                
                // Determinar o limite de veículos baseado no plano
                $vehicleLimit = null;
                
                // PRIORIDADE 1: Se o slug do plano for 'gratuito', limite é sempre 5
                if ($planSlug === 'gratuito') {
                    $vehicleLimit = 5;
                }
                // PRIORIDADE 2: Se o preço do plano for 0 (grátis), limite é 5
                elseif ($planPrice !== null && $planPrice == 0.0) {
                    $vehicleLimit = 5;
                }
                // PRIORIDADE 3: Se status é 'trial' e não tem plano associado, limite é 5
                elseif ($store['subscription_status'] === 'trial' && ($planSlug === null || $planSlug === '')) {
                    $vehicleLimit = 5;
                }
                // PRIORIDADE 4: Usar o limite do banco de dados se estiver definido
                elseif (isset($store['vehicle_limit']) && $store['vehicle_limit'] !== null && (int)$store['vehicle_limit'] > 0) {
                    $vehicleLimit = (int)$store['vehicle_limit'];
                }
                // PRIORIDADE 5: Se status é 'active' e não tem limite definido, usar 50 (planos pagos)
                elseif ($store['subscription_status'] === 'active') {
                    $vehicleLimit = 50;
                }
                // FALLBACK: Se nada se aplicar, usar 5 como padrão seguro
                else {
                    $vehicleLimit = 5;
                }
                
                // Log para debug (pode remover em produção)
                error_log("Vehicle limit check - Store ID: {$storeId}, Plan Slug: {$planSlug}, Plan Price: {$planPrice}, Status: {$store['subscription_status']}, Vehicle Limit: {$vehicleLimit}");
                
                // Sempre validar o limite (exceto se for -1 que significa ilimitado)
                if ($vehicleLimit !== -1 && $vehicleLimit > 0) {
                    // Get current vehicle count (todos os veículos, independente do status)
                    $vehicleCount = $db->fetchOne(
                        "SELECT COUNT(*) as count FROM vehicles WHERE store_id = :store_id",
                        ['store_id' => $storeId]
                    );
                    $currentCount = (int)($vehicleCount['count'] ?? 0);
                    
                    // Log para debug
                    error_log("Vehicle count check - Store ID: {$storeId}, Current: {$currentCount}, Limit: {$vehicleLimit}");
                    
                    // Validar se já atingiu o limite
                    if ($currentCount >= $vehicleLimit) {
                        // Mensagens específicas conforme requisito
                        if ($planSlug === 'gratuito' || ($planPrice !== null && $planPrice == 0.0)) {
                            // Plano Gratuito
                            Response::error("Você atingiu o limite de 5 veículos do plano gratuito. Faça upgrade do seu plano para cadastrar mais veículos.", 403);
                        } else {
                            // Planos Pagos
                            Response::error("Você atingiu o limite de veículos permitido pelo seu plano.", 403);
                        }
                    }
                }
                
                // Validate required fields
                if (empty($data['brand'])) {
                    Response::error('Marca é obrigatória', 400);
                }
                if (empty($data['model'])) {
                    Response::error('Modelo é obrigatório', 400);
                }
                if (empty($data['year']) || $data['year'] < 1900 || $data['year'] > 2100) {
                    Response::error('Ano inválido', 400);
                }
                if (empty($data['mileage']) || $data['mileage'] < 0) {
                    Response::error('Quilometragem inválida', 400);
                }
                if (empty($data['price']) || $data['price'] < 0) {
                    Response::error('Preço inválido', 400);
                }
                if (empty($data['body_type'])) {
                    Response::error('Tipo de carro é obrigatório', 400);
                }
                
                $vehicleData = [
                    'id' => $db->generateUuid(),
                    'store_id' => $storeId,
                    'brand' => trim($data['brand']),
                    'model' => trim($data['model']),
                    'year' => (int)$data['year'],
                    'mileage' => (int)$data['mileage'],
                    'price' => (float)$data['price'],
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
                
                // Add body_type (validated as required above)
                $vehicleData['body_type'] = trim($data['body_type']);
                
                // Try to insert - if it fails due to body_type column not existing, retry without it
                try {
                    $vehicle = $db->insert('vehicles', $vehicleData);
                } catch (Exception $e) {
                    // If error is about body_type column not found, retry without it
                    if (strpos($e->getMessage(), 'body_type') !== false && array_key_exists('body_type', $vehicleData)) {
                        error_log('Warning: body_type column does not exist, creating vehicle without it');
                        unset($vehicleData['body_type']);
                        $vehicle = $db->insert('vehicles', $vehicleData);
                    } else {
                        // Re-throw if it's a different error
                        throw $e;
                    }
                }
                $vehicle['features'] = json_decode($vehicle['features'], true);
                $vehicle['images'] = json_decode($vehicle['images'], true);
                
                Response::success(['vehicle' => $vehicle], 'Veículo criado com sucesso');
            } catch (Exception $e) {
                error_log('Erro ao criar veículo: ' . $e->getMessage());
                Response::error('Erro ao criar veículo: ' . $e->getMessage(), 500);
            }
            break;
            
        case 'PUT':
            if (!$vehicleId) {
                Response::error('ID do veículo é obrigatório', 400);
            }
            
            $data = Middleware::getJsonInput();
            
            // REQ-FR-031: Verify vehicle belongs to user's store (security validation)
            Middleware::validateResourceOwnership($db, $storeId, 'vehicles', $vehicleId);
            
            // Validate required fields if they are being updated
            if (array_key_exists('body_type', $data) && empty(trim($data['body_type'] ?? ''))) {
                Response::error('Tipo de carro é obrigatório', 400);
            }
            
            $updateData = [];
            $allowedFields = ['brand', 'model', 'year', 'mileage', 'price', 'fuel', 'transmission', 'color', 'description', 'status', 'body_type'];
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $data)) {
                    // For body_type, trim the value (already validated as required above)
                    if ($field === 'body_type') {
                        $updateData[$field] = trim($data[$field]);
                    } else {
                        $updateData[$field] = $data[$field];
                    }
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
            
            // Try to update - if it fails due to body_type column not existing, retry without it
            try {
                $updatedVehicle = $db->update('vehicles', $updateData, 'id = :id', ['id' => $vehicleId]);
            } catch (Exception $e) {
                // If error is about body_type column not found, retry without it
                if (strpos($e->getMessage(), 'body_type') !== false && isset($updateData['body_type'])) {
                    error_log('Warning: body_type column does not exist, updating vehicle without it');
                    unset($updateData['body_type']);
                    $updatedVehicle = $db->update('vehicles', $updateData, 'id = :id', ['id' => $vehicleId]);
                } else {
                    // Re-throw if it's a different error
                    throw $e;
                }
            }
            
            $updatedVehicle['features'] = json_decode($updatedVehicle['features'], true);
            $updatedVehicle['images'] = json_decode($updatedVehicle['images'], true);
            
            Response::success(['vehicle' => $updatedVehicle], 'Veículo atualizado com sucesso');
            break;
            
        case 'DELETE':
            if (!$vehicleId) {
                Response::error('ID do veículo é obrigatório', 400);
            }
            
            // REQ-FR-031: Verify vehicle belongs to user's store (security validation)
            Middleware::validateResourceOwnership($db, $storeId, 'vehicles', $vehicleId);
            
            $db->delete('vehicles', 'id = :id', ['id' => $vehicleId]);
            
            Response::success(null, 'Veículo excluído com sucesso');
            break;
            
        default:
            Response::error('Método não permitido', 405);
    }
}
