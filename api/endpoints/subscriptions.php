<?php
/**
 * Subscriptions Endpoint
 * Handles subscription management, checkout creation, and status checks
 */

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';
require_once __DIR__ . '/../classes/Appmax.php';
require_once __DIR__ . '/../classes/EmailService.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();
$userId = Middleware::requireAuth();

switch ($method) {
    case 'GET':
        // Get current subscription status
        $store = $db->fetchOne(
            "SELECT s.*, p.name as plan_name, p.price as plan_price 
             FROM stores s 
             LEFT JOIN plans p ON s.plan_id = p.id 
             WHERE s.user_id = :user_id",
            ['user_id' => $userId]
        );
        
        if (!$store) {
            Response::error('Loja não encontrada', 404);
        }
        
        // Check if subscription is expired
        $isExpired = $store['subscription_ends_at'] && 
                     strtotime($store['subscription_ends_at']) < time() &&
                     $store['subscription_status'] === 'trial';
        
        if ($isExpired && $store['subscription_status'] === 'trial') {
            // Auto-update to pending
            $db->update('stores', [
                'subscription_status' => 'pending',
                'updated_at' => date('Y-m-d H:i:s')
            ], 'id = :id', ['id' => $store['id']]);
            
            $store['subscription_status'] = 'pending';
        }
        
        Response::success(['subscription' => $store]);
        break;
        
    case 'POST':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'create_checkout') {
            // Create Appmax checkout
            $data = Middleware::getJsonInput();
            $store = $db->fetchOne(
                "SELECT s.*, u.email as user_email, u.name as user_name 
                 FROM stores s 
                 JOIN users u ON s.user_id = u.id 
                 WHERE s.user_id = :user_id",
                ['user_id' => $userId]
            );
            
            if (!$store) {
                Response::error('Loja não encontrada', 404);
            }
            
            // Get plan
            $plan = $db->fetchOne(
                "SELECT * FROM plans WHERE id = :id",
                ['id' => $store['plan_id']]
            );
            
            if (!$plan) {
                Response::error('Plano não encontrado', 404);
            }
            
            // Prepare Appmax order
            $appmax = new Appmax();
            $appUrl = getenv('APP_URL') ?: 'http://localhost';
            
            $orderData = [
                'product_id' => $plan['id'], // ou um product_id específico da Appmax
                'price' => (int)($plan['price'] * 100), // em centavos
                'customer' => [
                    'name' => $store['user_name'] ?? $store['name'],
                    'email' => $store['user_email'] ?? $store['email'],
                    'phone' => $store['whatsapp'] ?? $store['phone'] ?? '',
                    'document_number' => $data['document_number'] ?? ''
                ],
                'callback_url' => $appUrl . '/api/webhooks/appmax',
                'success_url' => $appUrl . '/renovar-plano?status=success',
                'cancel_url' => $appUrl . '/renovar-plano?status=canceled',
                'metadata' => [
                    'store_id' => $store['id'],
                    'user_id' => $userId,
                    'plan_id' => $plan['id'],
                    'plan_slug' => $plan['slug']
                ]
            ];
            
            try {
                $order = $appmax->createOrder($orderData);
                
                // Save order to database (payment_transactions)
                $db->insert('payment_transactions', [
                    'id' => $db->generateUuid(),
                    'store_id' => $store['id'],
                    'order_id' => $order['id'] ?? $order['order_id'] ?? '',
                    'gateway' => 'appmax',
                    'amount' => $plan['price'],
                    'status' => $order['status'] ?? 'waiting_payment',
                    'customer_name' => $orderData['customer']['name'],
                    'customer_email' => $orderData['customer']['email'],
                    'metadata' => json_encode($orderData['metadata']),
                    'payload_json' => json_encode($order),
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
                
                // Log subscription action
                $db->insert('subscription_logs', [
                    'id' => $db->generateUuid(),
                    'store_id' => $store['id'],
                    'action' => 'checkout_created',
                    'old_status' => $store['subscription_status'],
                    'new_status' => $store['subscription_status'],
                    'old_ends_at' => $store['subscription_ends_at'],
                    'new_ends_at' => $store['subscription_ends_at'],
                    'performed_by' => 'system',
                    'notes' => 'Pedido criado na Appmax. Order ID: ' . ($order['id'] ?? $order['order_id'] ?? 'N/A'),
                    'created_at' => date('Y-m-d H:i:s')
                ]);
                
                // Return checkout URL
                Response::success([
                    'order_id' => $order['id'] ?? $order['order_id'] ?? '',
                    'status' => $order['status'] ?? 'waiting_payment',
                    'checkout_url' => $order['checkout_url'] ?? $order['url'] ?? null,
                    'message' => 'Pedido criado com sucesso'
                ]);
                
            } catch (Exception $e) {
                Response::error('Erro ao criar pedido: ' . $e->getMessage(), 500);
            }
        } else {
            Response::error('Ação não especificada', 400);
        }
        break;
        
    default:
        Response::error('Método não permitido', 405);
}



