<?php
/**
 * Subscriptions Endpoint
 * Handles subscription management, checkout creation, and status checks
 */

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';
require_once __DIR__ . '/../classes/EmailService.php';
require_once __DIR__ . '/../classes/Stripe.php';

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
            // Create Stripe checkout
            $data = Middleware::getJsonInput();
            
            // Get store
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
            
            // RB02: Loja canceled precisa de nova contratação (permitir checkout)
            // RB02: Validar se plano foi especificado
            $planSlug = $data['plan_slug'] ?? null;
            if (!$planSlug) {
                Response::error('plan_slug é obrigatório', 400);
            }
            
            // Get plan - RB02: Apenas planos ativos
            $plan = $db->fetchOne(
                "SELECT * FROM plans WHERE slug = :slug AND is_active = true",
                ['slug' => $planSlug]
            );
            
            if (!$plan) {
                Response::error('Plano não encontrado ou inativo', 404);
            }
            
            // Prepare Stripe checkout
            $stripe = new Stripe();
            $appUrl = getenv('APP_URL') ?: 'http://localhost';
            
            // Calculate new subscription end date (RB04 - Renovação)
            $currentEndsAt = $store['subscription_ends_at'] ? strtotime($store['subscription_ends_at']) : null;
            $now = time();
            $durationDays = (int)$plan['duration_days'];
            
            if ($currentEndsAt && $currentEndsAt > $now && $store['subscription_status'] === 'active') {
                // If subscription still valid, add days to current end date
                $newEndsAt = date('Y-m-d H:i:s', $currentEndsAt + ($durationDays * 24 * 60 * 60));
            } else {
                // If expired or not active, count from now
                $newEndsAt = date('Y-m-d H:i:s', $now + ($durationDays * 24 * 60 * 60));
            }
            
            $checkoutData = [
                'amount' => (float)$plan['price'],
                'product_name' => "Plano {$plan['name']} - ESTOCX",
                'product_description' => "Assinatura {$plan['name']} do ESTOCX - {$durationDays} dias",
                'success_url' => $appUrl . '/renovar-plano?status=success&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $appUrl . '/renovar-plano?status=canceled',
                'customer_email' => $store['user_email'] ?? $store['email'],
                'client_reference_id' => $store['id'],
                'metadata' => [
                    'store_id' => $store['id'],
                    'user_id' => $userId,
                    'plan_id' => $plan['id'],
                    'plan_slug' => $plan['slug'],
                    'duration_days' => $durationDays,
                    'plan_name' => $plan['name']
                ]
            ];
            
            try {
                $checkoutSession = $stripe->createCheckoutSession($checkoutData);
                
                // Save transaction to database
                $transactionId = $db->generateUuid();
                $db->insert('payment_transactions', [
                    'id' => $transactionId,
                    'store_id' => $store['id'],
                    'order_id' => $checkoutSession['id'], // Stripe session ID
                    'gateway' => 'stripe',
                    'amount' => $plan['price'],
                    'status' => 'waiting_payment',
                    'customer_name' => $store['user_name'] ?? $store['name'],
                    'customer_email' => $store['user_email'] ?? $store['email'],
                    'metadata' => json_encode($checkoutData['metadata']),
                    'payload_json' => json_encode($checkoutSession),
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
                    'performed_by' => $userId,
                    'notes' => "Checkout criado no Stripe. Plano: {$plan['name']}. Session ID: {$checkoutSession['id']}",
                    'created_at' => date('Y-m-d H:i:s')
                ]);
                
                // Update store plan_id if changed
                if ($store['plan_id'] !== $plan['id']) {
                    $db->update('stores', [
                        'plan_id' => $plan['id'],
                        'updated_at' => date('Y-m-d H:i:s')
                    ], 'id = :id', ['id' => $store['id']]);
                }
                
                // Return checkout URL
                Response::success([
                    'session_id' => $checkoutSession['id'],
                    'checkout_url' => $checkoutSession['url'],
                    'status' => 'waiting_payment',
                    'plan' => [
                        'id' => $plan['id'],
                        'name' => $plan['name'],
                        'slug' => $plan['slug'],
                        'price' => $plan['price'],
                        'duration_days' => $durationDays
                    ],
                    'message' => 'Checkout criado com sucesso'
                ]);
                
            } catch (Exception $e) {
                error_log('Erro ao criar checkout Stripe: ' . $e->getMessage());
                Response::error('Erro ao criar checkout: ' . $e->getMessage(), 500);
            }
        } else {
            Response::error('Ação não especificada', 400);
        }
        break;
        
    default:
        Response::error('Método não permitido', 405);
}



