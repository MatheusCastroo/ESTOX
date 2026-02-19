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
    // #region agent log
    $logPath = __DIR__ . '/../../.cursor/debug.log';
    $logData = [
        'location' => 'api/endpoints/stores.php:getUserStore',
        'message' => 'Buscando loja do usuário',
        'data' => [
            'userId' => $userId,
            'userIdType' => gettype($userId)
        ],
        'timestamp' => time() * 1000,
        'runId' => 'run1',
        'hypothesisId' => 'G'
    ];
    @file_put_contents($logPath, json_encode($logData) . "\n", FILE_APPEND);
    // #endregion
    
    $store = $db->fetchOne(
        "SELECT * FROM stores WHERE user_id = :user_id",
        ['user_id' => $userId]
    );
    
    // #region agent log
    $logData2 = [
        'location' => 'api/endpoints/stores.php:getUserStore',
        'message' => 'Resultado da busca de loja',
        'data' => [
            'hasStore' => !empty($store),
            'storeId' => $store['id'] ?? null,
            'storeName' => $store['name'] ?? null
        ],
        'timestamp' => time() * 1000,
        'runId' => 'run1',
        'hypothesisId' => 'G'
    ];
    @file_put_contents($logPath, json_encode($logData2) . "\n", FILE_APPEND);
    // #endregion
    
    if (!$store) {
        Response::error('Loja não encontrada. Por favor, configure sua loja primeiro.', 404);
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
        // REGRA DE NEGÓCIO: Vincular plano correto baseado em plan_slug ou origem do cadastro
        $planId = null;
        $planSlug = null;
        
        // Prioridade 1: Se plan_slug foi especificado, usar ele
        if (isset($data['plan_slug']) && !empty($data['plan_slug'])) {
            $planSlug = trim($data['plan_slug']);
            $plan = $db->fetchOne(
                "SELECT id FROM plans WHERE slug = :slug AND is_active = true",
                ['slug' => $planSlug]
            );
            if ($plan) {
                $planId = $plan['id'];
            } else {
                // Plano especificado não encontrado - logar erro mas continuar com gratuito
                error_log("Plano especificado não encontrado: {$planSlug}. Atribuindo plano gratuito.");
            }
        }
        
        // Prioridade 2: Se não foi especificado um plano, atribuir o plano gratuito automaticamente
        // Isso cobre casos de:
        // - Cadastro direto pelo plano gratuito
        // - Início do uso pelo fluxo de trial gratuito
        if ($planId === null) {
            $freePlan = $db->fetchOne(
                "SELECT id FROM plans WHERE slug = 'gratuito' AND is_active = true",
                []
            );
            if ($freePlan) {
                $planId = $freePlan['id'];
                $planSlug = 'gratuito';
            } else {
                // Plano gratuito não encontrado - erro crítico
                error_log("ERRO CRÍTICO: Plano gratuito não encontrado no banco de dados!");
                Response::error('Erro ao configurar plano inicial. Entre em contato com o suporte.', 500);
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
        // #region agent log
        $logPath = __DIR__ . '/../../.cursor/debug.log';
        $logData = [
            'location' => 'api/endpoints/stores.php:PUT:entry',
            'message' => 'Iniciando PUT /stores',
            'data' => [
                'userId' => $userId,
                'hasInput' => !empty(file_get_contents('php://input'))
            ],
            'timestamp' => time() * 1000,
            'runId' => 'run1',
            'hypothesisId' => 'A'
        ];
        @file_put_contents($logPath, json_encode($logData) . "\n", FILE_APPEND);
        // #endregion
        
        try {
            $data = Middleware::getJsonInput();
            
            // #region agent log
            $logData2 = [
                'location' => 'api/endpoints/stores.php:PUT:afterGetJson',
                'message' => 'JSON parseado com sucesso',
                'data' => [
                    'dataKeys' => array_keys($data ?? []),
                    'hasLogoUrl' => isset($data['logo_url']),
                    'logoUrlLength' => isset($data['logo_url']) ? strlen($data['logo_url']) : 0
                ],
                'timestamp' => time() * 1000,
                'runId' => 'run1',
                'hypothesisId' => 'B'
            ];
            @file_put_contents($logPath, json_encode($logData2) . "\n", FILE_APPEND);
            // #endregion
        } catch (Exception $e) {
            // #region agent log
            $logDataErr = [
                'location' => 'api/endpoints/stores.php:PUT:jsonError',
                'message' => 'Erro ao parsear JSON',
                'data' => [
                    'error' => $e->getMessage(),
                    'errorType' => get_class($e)
                ],
                'timestamp' => time() * 1000,
                'runId' => 'run1',
                'hypothesisId' => 'B'
            ];
            @file_put_contents($logPath, json_encode($logDataErr) . "\n", FILE_APPEND);
            // #endregion
            throw $e;
        }
        
        // Check if store exists, if not, create it first
        $store = $db->fetchOne(
            "SELECT * FROM stores WHERE user_id = :user_id",
            ['user_id' => $userId]
        );
        
        // If store doesn't exist, create it first
        if (!$store) {
            // Get free plan
            $freePlan = $db->fetchOne(
                "SELECT id FROM plans WHERE slug = 'gratuito' AND is_active = true",
                []
            );
            
            if (!$freePlan) {
                Response::error('Erro ao configurar plano inicial. Entre em contato com o suporte.', 500);
            }
            
            // Generate slug from name or email
            $slug = $data['slug'] ?? '';
            if (empty($slug)) {
                $slugBase = !empty($data['name']) ? $data['name'] : explode('@', $data['email'] ?? 'user')[0];
                $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $slugBase));
                $slug = trim($slug, '-');
                
                // Ensure slug is unique
                $originalSlug = $slug;
                $counter = 1;
                while ($db->fetchOne("SELECT id FROM stores WHERE slug = :slug", ['slug' => $slug])) {
                    $slug = $originalSlug . '-' . $counter;
                    $counter++;
                }
            } else {
                // Check if slug is available
                $slugCheck = $db->fetchOne(
                    "SELECT id FROM stores WHERE slug = :slug",
                    ['slug' => $slug]
                );
                
                if ($slugCheck) {
                    Response::error('Este slug já está em uso. Escolha outro.', 400);
                }
            }
            
            // Create store
            $storeData = [
                'id' => $db->generateUuid(),
                'user_id' => $userId,
                'plan_id' => $freePlan['id'],
                'name' => $data['name'] ?? 'Minha Loja',
                'slug' => $slug,
                'phone' => $data['phone'] ?? '',
                'whatsapp' => $data['whatsapp'] ?? '',
                'email' => $data['email'] ?? '',
                'address' => $data['address'] ?? '',
                'city' => $data['city'] ?? '',
                'state' => $data['state'] ?? '',
                'description' => $data['description'] ?? '',
                'logo_url' => $data['logo_url'] ?? null,
                'subscription_status' => 'trial',
                'subscription_ends_at' => date('Y-m-d H:i:s', strtotime('+30 days')),
                'is_active' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $store = $db->insert('stores', $storeData);
            
            // Create default notification settings if they don't exist
            $existingSettings = $db->fetchOne(
                "SELECT id FROM notification_settings WHERE store_id = :store_id",
                ['store_id' => $store['id']]
            );
            
            if (!$existingSettings) {
                $db->insert('notification_settings', [
                    'id' => $db->generateUuid(),
                    'store_id' => $store['id'],
                    'new_lead_email' => true,
                    'weekly_report' => true,
                    'platform_updates' => false,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
            }
            
            // #region agent log
            $logPathStore = __DIR__ . '/../../.cursor/debug.log';
            $logData3 = [
                'location' => 'api/endpoints/stores.php:PUT:storeCreated',
                'message' => 'Loja criada automaticamente',
                'data' => [
                    'storeId' => $store['id'] ?? null,
                    'storeName' => $store['name'] ?? null
                ],
                'timestamp' => time() * 1000,
                'runId' => 'run1',
                'hypothesisId' => 'H'
            ];
            @file_put_contents($logPathStore, json_encode($logData3) . "\n", FILE_APPEND);
            // #endregion
        }
        
        // #region agent log
        $logData2 = [
            'location' => 'api/endpoints/stores.php:PUT:storeFound',
            'message' => 'Loja obtida',
            'data' => [
                'hasStore' => !empty($store),
                'storeId' => $store['id'] ?? null
            ],
            'timestamp' => time() * 1000,
            'runId' => 'run1',
            'hypothesisId' => 'E'
        ];
        @file_put_contents($logPath, json_encode($logData2) . "\n", FILE_APPEND);
        // #endregion
        
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
        
        // #region agent log
        $logData3 = [
            'location' => 'api/endpoints/stores.php:PUT:beforeUpdate',
            'message' => 'Preparando dados para update',
            'data' => [
                'updateFields' => array_keys($updateData),
                'hasLogoUrl' => isset($updateData['logo_url']),
                'logoUrlLength' => isset($updateData['logo_url']) ? strlen($updateData['logo_url']) : 0,
                'storeId' => $store['id'] ?? null
            ],
            'timestamp' => time() * 1000,
            'runId' => 'run1',
            'hypothesisId' => 'C'
        ];
        @file_put_contents($logPath, json_encode($logData3) . "\n", FILE_APPEND);
        // #endregion
        
        if (empty($updateData)) {
            Response::error('Nenhum campo para atualizar', 400);
        }
        
        $updateData['updated_at'] = date('Y-m-d H:i:s');
        
        // #region agent log
        $logData4 = [
            'location' => 'api/endpoints/stores.php:PUT:beforeDbUpdate',
            'message' => 'Chamando db->update()',
            'data' => [
                'table' => 'stores',
                'updateFieldsCount' => count($updateData),
                'storeId' => $store['id'] ?? null
            ],
            'timestamp' => time() * 1000,
            'runId' => 'run1',
            'hypothesisId' => 'A'
        ];
        @file_put_contents($logPath, json_encode($logData4) . "\n", FILE_APPEND);
        // #endregion
        
        try {
            $updatedStore = $db->update('stores', $updateData, 'id = :id', ['id' => $store['id']]);
            
            // #region agent log
            $logData5 = [
                'location' => 'api/endpoints/stores.php:PUT:afterDbUpdate',
                'message' => 'db->update() executado com sucesso',
                'data' => [
                    'hasResult' => !empty($updatedStore),
                    'storeId' => $updatedStore['id'] ?? null
                ],
                'timestamp' => time() * 1000,
                'runId' => 'run1',
                'hypothesisId' => 'A'
            ];
            @file_put_contents($logPath, json_encode($logData5) . "\n", FILE_APPEND);
            // #endregion
        } catch (Exception $e) {
            // #region agent log
            $logDataErr2 = [
                'location' => 'api/endpoints/stores.php:PUT:dbUpdateError',
                'message' => 'Erro no db->update()',
                'data' => [
                    'error' => $e->getMessage(),
                    'errorType' => get_class($e),
                    'errorCode' => method_exists($e, 'getCode') ? $e->getCode() : null
                ],
                'timestamp' => time() * 1000,
                'runId' => 'run1',
                'hypothesisId' => 'A'
            ];
            @file_put_contents($logPath, json_encode($logDataErr2) . "\n", FILE_APPEND);
            // #endregion
            throw $e;
        }
        
        Response::success(['store' => $updatedStore], 'Loja atualizada com sucesso');
        break;
        
    default:
        Response::error('Método não permitido', 405);
}
