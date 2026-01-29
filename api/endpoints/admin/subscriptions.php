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
$isDebug = (isset($_GET['__debug']) && $_GET['__debug'] === '1');

// REQ-ADM-PAINEL-ASSINATURAS-COM-AUTH: Validar role admin do token
$adminUserId = Middleware::requireAdmin();

switch ($method) {
    case 'GET':
        // REQ-ADM-PAINEL-ASSINATURAS-COM-AUTH: Section 6 - Tela de Detalhes da Loja
        if (isset($_GET['store_id'])) {
            $storeId = $_GET['store_id'];
            
            // Get store details
            $store = $db->fetchOne(
                "SELECT s.*, 
                        u.name as user_name, 
                        u.email as user_email,
                        p.id as plan_id,
                        p.name as plan_name,
                        p.slug as plan_slug,
                        p.price as plan_price,
                        p.vehicle_limit as plan_vehicle_limit,
                        p.duration_days as plan_duration_days,
                        (SELECT COUNT(*) FROM vehicles WHERE store_id = s.id) as vehicle_count
                 FROM stores s
                 LEFT JOIN users u ON s.user_id = u.id
                 LEFT JOIN plans p ON s.plan_id = p.id
                 WHERE s.id = :id",
                ['id' => $storeId]
            );
            
            if (!$store) {
                Response::error('Loja não encontrada', 404);
            }
            
            // Get transaction history (Section 6.2 - Financeiro)
            $transactions = $db->fetchAll(
                "SELECT * FROM payment_transactions 
                 WHERE store_id = :store_id 
                 ORDER BY created_at DESC 
                 LIMIT 50",
                ['store_id' => $storeId]
            );
            
            // Get subscription logs (Section 6.3 - Histórico)
            $logs = $db->fetchAll(
                "SELECT * FROM subscription_logs 
                 WHERE store_id = :store_id 
                 ORDER BY created_at DESC 
                 LIMIT 100",
                ['store_id' => $storeId]
            );
            
            Response::success([
                'store' => $store,
                'transactions' => $transactions,
                'logs' => $logs
            ]);
            break;
        }
        
        // REQ-ADM-PAINEL-ASSINATURAS-COM-AUTH: Section 5 - Listagem de Assinaturas
        // List all stores with subscription info
        $status = $_GET['status'] ?? null;
        $planSlug = $_GET['plan'] ?? null;
        $expired = $_GET['expired'] ?? null; // 'true' para vencidos
        $expiring = $_GET['expiring'] ?? null; // 'true' para próximos do vencimento (≤7 dias)
        $trial = $_GET['trial'] ?? null; // 'true' para trial
        $search = $_GET['search'] ?? null; // Busca por nome ou email
        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = ($page - 1) * $limit;
        
        $where = "1=1";
        $params = [];
        
        if ($status) {
            $where .= " AND s.subscription_status = :status";
            $params['status'] = $status;
        }
        
        if ($planSlug) {
            $where .= " AND p.slug = :plan_slug";
            $params['plan_slug'] = $planSlug;
        }
        
        if ($expired === 'true') {
            $where .= " AND s.subscription_ends_at < NOW() AND s.subscription_status IN ('trial', 'active')";
        }
        
        if ($expiring === 'true') {
            $where .= " AND s.subscription_ends_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY) AND s.subscription_status IN ('trial', 'active')";
        }
        
        if ($trial === 'true') {
            $where .= " AND s.subscription_status = 'trial'";
        }
        
        if ($search) {
            $where .= " AND (s.name LIKE :search OR u.email LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }
        
        // Get stores with ordering (Section 5.2)
        // Order: pending vencidos, trial próximos do vencimento, active, suspended, canceled
        $orderBy = "CASE 
            WHEN s.subscription_status = 'pending' AND s.subscription_ends_at < NOW() THEN 1
            WHEN s.subscription_status = 'trial' AND s.subscription_ends_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY) THEN 2
            WHEN s.subscription_status = 'active' THEN 3
            WHEN s.subscription_status = 'suspended' THEN 4
            WHEN s.subscription_status = 'canceled' THEN 5
            ELSE 6
        END, s.subscription_ends_at ASC";

        // Check if custom_vehicle_limit column exists (to avoid SQL errors)
        $hasCustomLimitColumn = false;
        try {
            $columnCheck = $db->fetchOne(
                "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'stores' 
                 AND COLUMN_NAME = 'custom_vehicle_limit'"
            );
            $hasCustomLimitColumn = ($columnCheck && $columnCheck['cnt'] > 0);
        } catch (Exception $e) {
            // If check fails, assume column doesn't exist
            $hasCustomLimitColumn = false;
        }

        // Build SELECT with or without custom_vehicle_limit column
        $effectiveLimitExpr = $hasCustomLimitColumn 
            ? "COALESCE(s.custom_vehicle_limit, p.vehicle_limit) as effective_vehicle_limit"
            : "p.vehicle_limit as effective_vehicle_limit";

        try {
            $stores = $db->fetchAll(
                "SELECT s.*, 
                        u.name as user_name, 
                        u.email as user_email,
                        p.name as plan_name,
                        p.slug as plan_slug,
                        p.price as plan_price,
                        p.vehicle_limit as plan_vehicle_limit,
                        {$effectiveLimitExpr},
                        (SELECT COUNT(*) FROM vehicles WHERE store_id = s.id) as vehicle_count,
                        (SELECT pt.created_at FROM payment_transactions pt WHERE pt.store_id = s.id ORDER BY pt.created_at DESC LIMIT 1) as last_payment,
                        (SELECT pt.gateway FROM payment_transactions pt WHERE pt.store_id = s.id ORDER BY pt.created_at DESC LIMIT 1) as last_gateway
                 FROM stores s
                 LEFT JOIN users u ON s.user_id = u.id
                 LEFT JOIN plans p ON s.plan_id = p.id
                 WHERE {$where}
                 ORDER BY {$orderBy}
                 LIMIT :limit OFFSET :offset",
                array_merge($params, ['limit' => $limit, 'offset' => $offset])
            );
            
            // Get total count
            $totalRow = $db->fetchOne(
                "SELECT COUNT(*) as total FROM stores s 
                 LEFT JOIN users u ON s.user_id = u.id
                 LEFT JOIN plans p ON s.plan_id = p.id
                 WHERE {$where}",
                $params
            );
            $total = $totalRow ? $totalRow['total'] : 0;
        } catch (Exception $e) {
            if ($isDebug) {
                Response::json([
                    'success' => false,
                    'error' => 'Falha ao consultar assinaturas (debug ativo).',
                    'debug' => [
                        'step' => 'list_subscriptions',
                        'exception_message' => $e->getMessage(),
                        'hint' => 'Se o erro for sobre "custom_vehicle_limit", rode a migration/adicione a coluna ou ajuste o endpoint para fallback quando a coluna não existir.'
                    ]
                ], 500);
            }
            Response::error('Erro interno do servidor', 500);
        }
        
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
        
        // REQ-ADM-PAINEL-ASSINATURAS-COM-AUTH: Section 7 - Ações Administrativas
        $updateData = [
            'updated_at' => date('Y-m-d H:i:s')
        ];
        $newEndsAt = null;
        $notes = null;
        
        switch ($action) {
            case 'renew':
                // Section 7.1: Renovar Assinatura (Manual)
                $newStatus = 'active';
                $actionType = 'renewed';
                
                // Get plan to use duration_days
                $plan = $db->fetchOne(
                    "SELECT duration_days FROM plans WHERE id = :plan_id",
                    ['plan_id' => $store['plan_id']]
                );
                
                if (!$plan) {
                    Response::error('Plano não encontrado', 404);
                }
                
                $durationDays = (int)$plan['duration_days'];
                
                // Calculate new end date (Section 8 - Cálculo de Expiração)
                $currentEndsAt = $store['subscription_ends_at'] ? strtotime($store['subscription_ends_at']) : null;
                $now = time();
                
                if ($currentEndsAt && $currentEndsAt > $now && $oldStatus === 'active') {
                    // If subscription still valid, add days to current end date
                    $newEndsAt = date('Y-m-d H:i:s', $currentEndsAt + ($durationDays * 24 * 60 * 60));
                } else {
                    // If expired or not active, count from now
                    $newEndsAt = date('Y-m-d H:i:s', $now + ($durationDays * 24 * 60 * 60));
                }
                break;
                
            case 'suspend':
                // Section 7.3: Suspender Assinatura
                $newStatus = 'suspended';
                $actionType = 'suspended';
                // Não altera datas
                break;
                
            case 'reactivate':
                // Section 7.4: Reativar Assinatura
                if (!in_array($oldStatus, ['pending', 'suspended'])) {
                    Response::error('Apenas contas pendentes ou suspensas podem ser reativadas', 400);
                }
                
                $newStatus = 'active';
                $actionType = 'reactivated';
                
                // Get plan to use duration_days
                $plan = $db->fetchOne(
                    "SELECT duration_days FROM plans WHERE id = :plan_id",
                    ['plan_id' => $store['plan_id']]
                );
                
                if (!$plan || !$store['plan_id']) {
                    Response::error('Loja não possui plano válido para reativação', 400);
                }
                
                $durationDays = (int)$plan['duration_days'];
                
                // Define nova data de expiração
                $newEndsAt = date('Y-m-d H:i:s', strtotime("+{$durationDays} days"));
                break;
                
            case 'cancel':
                // Section 7.2: Cancelar Assinatura
                $newStatus = 'canceled';
                $actionType = 'canceled';
                // Ação irreversível (exceto via nova contratação)
                break;
                
            case 'change_plan':
                // Section 7.5: Alterar Plano
                $newPlanId = $data['plan_id'] ?? null;
                if (!$newPlanId) {
                    Response::error('plan_id é obrigatório para alterar plano', 400);
                }
                
                // Get new plan
                $newPlan = $db->fetchOne(
                    "SELECT * FROM plans WHERE id = :id AND is_active = true",
                    ['id' => $newPlanId]
                );
                
                if (!$newPlan) {
                    Response::error('Plano não encontrado ou inativo', 404);
                }
                
                $actionType = 'plan_changed';
                
                // Log with old and new plan info
                $oldPlan = $db->fetchOne(
                    "SELECT name FROM plans WHERE id = :id",
                    ['id' => $store['plan_id']]
                );
                
                $notes = "Plano alterado de '{$oldPlan['name']}' para '{$newPlan['name']}'. " . ($data['notes'] ?? '');
                
                // Update plan_id
                $updateData['plan_id'] = $newPlanId;
                
                // Don't change status or dates
                $newStatus = $oldStatus;
                break;
                
            case 'set_vehicle_limit':
                // Nova ação: Definir limite de veículos personalizado
                $vehicleLimit = $data['vehicle_limit'] ?? null;
                
                if ($vehicleLimit === null) {
                    Response::error('vehicle_limit é obrigatório para definir limite de veículos', 400);
                }
                
                // Validar valor (-1 para ilimitado, ou número positivo)
                $vehicleLimit = (int)$vehicleLimit;
                if ($vehicleLimit < -1) {
                    Response::error('Limite de veículos inválido. Use -1 para ilimitado ou um número positivo.', 400);
                }
                
                $actionType = 'vehicle_limit_changed';
                
                // Verificar se a tabela stores tem coluna custom_vehicle_limit
                // Se não tiver, vamos usar uma abordagem alternativa (armazenar em notes ou criar coluna)
                // Por enquanto, vamos atualizar o plano para um plano customizado ou criar uma coluna
                try {
                    // Tentar adicionar coluna se não existir
                    $db->query("ALTER TABLE stores ADD COLUMN custom_vehicle_limit INT NULL COMMENT 'Limite customizado de veículos (sobrescreve o limite do plano)'");
                } catch (Exception $e) {
                    // Coluna já existe ou erro ao criar - continuar
                }
                
                // Atualizar limite customizado
                $updateData['custom_vehicle_limit'] = $vehicleLimit;
                
                $limitText = $vehicleLimit === -1 ? 'ilimitado' : $vehicleLimit;
                $notes = "Limite de veículos alterado para: {$limitText}. " . ($data['notes'] ?? '');
                
                // Não altera status ou datas
                $newStatus = $oldStatus;
                break;
                
            default:
                Response::error('Ação inválida. Use: renew, suspend, reactivate, cancel, change_plan ou set_vehicle_limit', 400);
        }
        
        // Add status to update data (except for change_plan which doesn't change status)
        if ($action !== 'change_plan') {
            $updateData['subscription_status'] = $newStatus;
        }
        
        // Add new end date if calculated
        if ($newEndsAt) {
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
            'performed_by' => $adminUserId, // REQ-ADM-PAINEL-ASSINATURAS-COM-AUTH: Log who performed action
            'notes' => $notes ?? ($data['notes'] ?? "Ação executada via painel administrativo"),
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
        
    default:
        Response::error('Método não permitido', 405);
}





