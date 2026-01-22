<?php

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();
$userId = Middleware::requireAuth();

// REQ-FR-031: Get user's store_id to ensure data isolation
// Dashboard only shows data from the authenticated user's store
$storeId = Middleware::getUserStoreId($db, $userId);
$action = $_GET['action'] ?? 'stats';

switch ($method) {
    case 'GET':
        if ($action === 'stats') {
            // Get store and plan information for vehicle limit
            $store = $db->fetchOne(
                "SELECT s.*, p.vehicle_limit, p.slug as plan_slug, p.price as plan_price
                 FROM stores s 
                 LEFT JOIN plans p ON s.plan_id = p.id 
                 WHERE s.id = :store_id",
                ['store_id' => $storeId]
            );
            
            // Determinar o limite de veículos baseado no plano (mesma lógica do vehicles.php)
            $planSlug = isset($store['plan_slug']) ? trim($store['plan_slug']) : null;
            $planPrice = isset($store['plan_price']) ? (float)$store['plan_price'] : null;
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
            
            // Get dashboard statistics
            $totalVehicles = $db->fetchOne(
                "SELECT COUNT(*) as count FROM vehicles WHERE store_id = :store_id",
                ['store_id' => $storeId]
            )['count'] ?? 0;
            
            $availableVehicles = $db->fetchOne(
                "SELECT COUNT(*) as count FROM vehicles WHERE store_id = :store_id AND status = 'available'",
                ['store_id' => $storeId]
            )['count'] ?? 0;
            
            $thirtyDaysAgo = date('Y-m-d H:i:s', strtotime('-30 days'));
            $sixtyDaysAgo = date('Y-m-d H:i:s', strtotime('-60 days'));
            
            $totalViews = $db->fetchOne(
                "SELECT COUNT(*) as count FROM vehicle_views WHERE store_id = :store_id AND viewed_at >= :date",
                ['store_id' => $storeId, 'date' => $thirtyDaysAgo]
            )['count'] ?? 0;
            
            $previousViews = $db->fetchOne(
                "SELECT COUNT(*) as count FROM vehicle_views WHERE store_id = :store_id AND viewed_at >= :date1 AND viewed_at < :date2",
                ['store_id' => $storeId, 'date1' => $sixtyDaysAgo, 'date2' => $thirtyDaysAgo]
            )['count'] ?? 0;
            
            $totalLeads = $db->fetchOne(
                "SELECT COUNT(*) as count FROM leads WHERE store_id = :store_id AND created_at >= :date",
                ['store_id' => $storeId, 'date' => $thirtyDaysAgo]
            )['count'] ?? 0;
            
            $previousLeads = $db->fetchOne(
                "SELECT COUNT(*) as count FROM leads WHERE store_id = :store_id AND created_at >= :date1 AND created_at < :date2",
                ['store_id' => $storeId, 'date1' => $sixtyDaysAgo, 'date2' => $thirtyDaysAgo]
            )['count'] ?? 0;
            
            $conversionRate = $totalViews > 0 ? round((($totalLeads / $totalViews) * 100) * 10) / 10 : 0;
            
            $viewsChange = $previousViews > 0 ? round((($totalViews - $previousViews) / $previousViews) * 100) : 0;
            $leadsChange = $previousLeads > 0 ? round((($totalLeads - $previousLeads) / $previousLeads) * 100) : 0;
            
            Response::success([
                'total_vehicles' => (int)$totalVehicles,
                'available_vehicles' => (int)$availableVehicles,
                'total_views' => (int)$totalViews,
                'total_leads' => (int)$totalLeads,
                'conversion_rate' => $conversionRate,
                'views_change' => $viewsChange,
                'leads_change' => $leadsChange,
                'plan_vehicle_limit' => $vehicleLimit === -1 ? -1 : (int)$vehicleLimit, // -1 significa ilimitado
                'is_free_plan' => ($planSlug === 'gratuito' || ($planPrice !== null && $planPrice == 0.0))
            ]);
        }
        elseif ($action === 'top-vehicles') {
            $limit = (int)($_GET['limit'] ?? 5);
            
            $vehicles = $db->fetchAll(
                "SELECT id, brand, model, views, images FROM vehicles 
                 WHERE store_id = :store_id 
                 ORDER BY views DESC 
                 LIMIT $limit",
                ['store_id' => $storeId]
            );
            
            // Get leads count for each vehicle
            foreach ($vehicles as &$vehicle) {
                $leadsCount = $db->fetchOne(
                    "SELECT COUNT(*) as count FROM leads WHERE vehicle_id = :vehicle_id",
                    ['vehicle_id' => $vehicle['id']]
                )['count'] ?? 0;
                
                $vehicle['leads'] = (int)$leadsCount;
                $vehicle['images'] = json_decode($vehicle['images'], true);
            }
            
            Response::success(['vehicles' => $vehicles]);
        }
        elseif ($action === 'monthly-stats') {
            $months = (int)($_GET['months'] ?? 3);
            $stats = [];
            $now = new DateTime();
            
            for ($i = 0; $i < $months; $i++) {
                $monthStart = clone $now;
                $monthStart->modify("-$i months");
                $monthStart->modify('first day of this month');
                $monthStart->setTime(0, 0, 0);
                
                $monthEnd = clone $monthStart;
                $monthEnd->modify('last day of this month');
                $monthEnd->setTime(23, 59, 59);
                
                $views = $db->fetchOne(
                    "SELECT COUNT(*) as count FROM vehicle_views 
                     WHERE store_id = :store_id AND viewed_at >= :start AND viewed_at <= :end",
                    [
                        'store_id' => $storeId,
                        'start' => $monthStart->format('Y-m-d H:i:s'),
                        'end' => $monthEnd->format('Y-m-d H:i:s')
                    ]
                )['count'] ?? 0;
                
                $leads = $db->fetchOne(
                    "SELECT COUNT(*) as count FROM leads 
                     WHERE store_id = :store_id AND created_at >= :start AND created_at <= :end",
                    [
                        'store_id' => $storeId,
                        'start' => $monthStart->format('Y-m-d H:i:s'),
                        'end' => $monthEnd->format('Y-m-d H:i:s')
                    ]
                )['count'] ?? 0;
                
                $monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                
                array_unshift($stats, [
                    'month' => $monthNames[$monthStart->format('n') - 1],
                    'year' => (int)$monthStart->format('Y'),
                    'views' => (int)$views,
                    'leads' => (int)$leads
                ]);
            }
            
            Response::success(['stats' => $stats]);
        }
        else {
            Response::error('Ação inválida', 400);
        }
        break;
        
    default:
        Response::error('Método não permitido', 405);
}
