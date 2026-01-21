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
            "SELECT s.*, p.name as plan_name, p.price as plan_price, p.slug as plan_slug, p.loyalty_months 
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
        
        // Get Stripe subscription info if exists
        $stripeSubscription = $db->fetchOne(
            "SELECT * FROM stripe_subscriptions 
             WHERE store_id = :store_id 
             AND status = 'active' 
             ORDER BY created_at DESC 
             LIMIT 1",
            ['store_id' => $store['id']]
        );
        
        $subscriptionData = $store;
        
        // Add loyalty and cancellation info
        if ($stripeSubscription) {
            $loyaltyMonths = (int)($store['loyalty_months'] ?? 0);
            $mesesPagos = (int)$stripeSubscription['meses_pagos'];
            $canCancel = $loyaltyMonths === 0 || $mesesPagos >= $loyaltyMonths;
            
            $subscriptionData['stripe_subscription'] = [
                'subscription_id' => $stripeSubscription['subscription_id'],
                'months_paid' => $mesesPagos,
                'loyalty_months' => $loyaltyMonths,
                'loyalty_status' => $stripeSubscription['loyalty_status'] ?? 'locked',
                'can_cancel' => $canCancel,
                'cancel_at_period_end' => (bool)$stripeSubscription['cancel_at_period_end'],
                'cancellation_available_date' => $stripeSubscription['data_liberacao_cancelamento'],
                'cancellation_available_date_formatted' => $stripeSubscription['data_liberacao_cancelamento'] 
                    ? date('d/m/Y', strtotime($stripeSubscription['data_liberacao_cancelamento']))
                    : null
            ];
            
            if (!$canCancel) {
                $subscriptionData['stripe_subscription']['months_remaining'] = $loyaltyMonths - $mesesPagos;
            }
        } else {
            $subscriptionData['stripe_subscription'] = null;
        }
        
        Response::success(['subscription' => $subscriptionData]);
        break;
        
    case 'POST':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'cancel') {
            // Cancel subscription with loyalty validation
            handleCancelSubscription($db, $userId);
            break;
        }
        
        if ($action === 'cancellation-preview') {
            // Preview cancellation status (can cancel? when?)
            handleCancellationPreview($db, $userId);
            break;
        }
        
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
            // ALL plans now use subscription mode for consistency
            // This maintains:
            // - Unified billing logic
            // - MRR metrics
            // - Single subscription management
            // - Monthly cancellation available for plans without loyalty
            $loyaltyMonths = (int)($plan['loyalty_months'] ?? 0);
            $useSubscription = true; // Always use subscription mode
            
            if ($useSubscription) {
                // Calculate monthly price for recurring subscription
                // Trimestral: R$ 359,70 / 3 = R$ 119,90/mês
                // Anual: R$ 1.318,80 / 12 = R$ 109,90/mês
                $monthlyPrice = (float)$plan['price'];
                
                if ($planSlug === 'profissional-trimestral') {
                    $monthlyPrice = $monthlyPrice / 3; // R$ 119,90/mês
                } elseif ($planSlug === 'profissional-anual') {
                    $monthlyPrice = $monthlyPrice / 12; // R$ 109,90/mês
                }
                // Mensal já está correto: R$ 139,90/mês
                
                // Update checkout data with monthly price
                $checkoutData['amount'] = $monthlyPrice;
                $checkoutData['product_description'] = "Assinatura mensal {$plan['name']} do ESTOCX - R$ " . number_format($monthlyPrice, 2, ',', '.') . "/mês";
                
                // Create recurring subscription checkout
                $checkoutSession = $stripe->createSubscriptionCheckoutSession($checkoutData);
                    
                    // Note: stripe_subscriptions record will be created via webhook (customer.subscription.created)
                } else {
                    // Create one-time payment checkout (existing behavior)
                    $checkoutSession = $stripe->createCheckoutSession($checkoutData);
                }
                
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
        
    case 'DELETE':
        // Alternative route: DELETE /subscriptions/{id}
        // Extract subscription ID from path if available
        $pathInfo = $_SERVER['PATH_INFO'] ?? '';
        $pathParts = explode('/', trim($pathInfo, '/'));
        
        if (isset($pathParts[1]) && $pathParts[1] === 'cancel') {
            handleCancelSubscription($db, $userId);
            break;
        }
        
        Response::error('Rota não encontrada', 404);
        break;
        
    default:
        Response::error('Método não permitido', 405);
}

/**
 * Handle cancellation preview
 * Returns information about cancellation eligibility
 */
function handleCancellationPreview($db, $userId) {
    // Get store
    $store = $db->fetchOne(
        "SELECT s.*, p.name as plan_name, p.slug as plan_slug, p.loyalty_months 
         FROM stores s 
         LEFT JOIN plans p ON s.plan_id = p.id 
         WHERE s.user_id = :user_id",
        ['user_id' => $userId]
    );
    
    if (!$store) {
        Response::error('Loja não encontrada', 404);
    }
    
    // Get Stripe subscription record
    $stripeSubscription = $db->fetchOne(
        "SELECT * FROM stripe_subscriptions 
         WHERE store_id = :store_id 
         AND status = 'active' 
         ORDER BY created_at DESC 
         LIMIT 1",
        ['store_id' => $store['id']]
    );
    
    if (!$stripeSubscription) {
        Response::success([
            'can_cancel' => false,
            'reason' => 'Nenhuma assinatura Stripe encontrada',
            'has_subscription' => false
        ]);
        return;
    }
    
    $loyaltyMonths = (int)($store['loyalty_months'] ?? 0);
    $mesesPagos = (int)$stripeSubscription['meses_pagos'];
    $canCancel = $loyaltyMonths === 0 || $mesesPagos >= $loyaltyMonths;
    
    $response = [
        'can_cancel' => $canCancel,
        'has_subscription' => true,
        'subscription_id' => $stripeSubscription['subscription_id'],
        'plan_name' => $store['plan_name'],
        'plan_slug' => $store['plan_slug'],
        'loyalty_months' => $loyaltyMonths,
        'months_paid' => $mesesPagos,
        'loyalty_status' => $stripeSubscription['loyalty_status'] ?? 'locked',
        'cancel_at_period_end' => (bool)$stripeSubscription['cancel_at_period_end']
    ];
    
    if ($canCancel) {
        $response['message'] = 'Você pode cancelar sua assinatura a qualquer momento.';
        $response['cancellation_available_date'] = date('Y-m-d H:i:s');
        $response['cancellation_available_date_formatted'] = 'Agora';
    } else {
        $monthsRemaining = $loyaltyMonths - $mesesPagos;
        $dataLiberacao = $stripeSubscription['data_liberacao_cancelamento'] 
            ? strtotime($stripeSubscription['data_liberacao_cancelamento'])
            : strtotime($stripeSubscription['data_inicio'] . " +{$loyaltyMonths} months");
        
        $response['message'] = "Este plano possui fidelidade mínima de {$loyaltyMonths} meses. Você ainda precisa pagar {$monthsRemaining} mês(es) antes de poder cancelar.";
        $response['months_remaining'] = $monthsRemaining;
        $response['cancellation_available_date'] = date('Y-m-d', $dataLiberacao);
        $response['cancellation_available_date_formatted'] = date('d/m/Y', $dataLiberacao);
    }
    
    // Get last paid invoice info
    $lastInvoice = $db->fetchOne(
        "SELECT * FROM stripe_invoices 
         WHERE subscription_id = :subscription_id 
         AND status = 'paid' 
         ORDER BY paid_at DESC 
         LIMIT 1",
        ['subscription_id' => $stripeSubscription['subscription_id']]
    );
    
    if ($lastInvoice) {
        $response['last_invoice'] = [
            'invoice_id' => $lastInvoice['invoice_id'],
            'amount' => $lastInvoice['amount'],
            'paid_at' => $lastInvoice['paid_at'],
            'paid_at_formatted' => date('d/m/Y H:i', strtotime($lastInvoice['paid_at'])),
            'period_start' => $lastInvoice['period_start'],
            'period_end' => $lastInvoice['period_end']
        ];
    }
    
    Response::success($response);
}

/**
 * Handle subscription cancellation with loyalty validation
 */
function handleCancelSubscription($db, $userId) {
    $stripe = new Stripe();
    
    // Get store
    $store = $db->fetchOne(
        "SELECT s.*, p.name as plan_name, p.slug as plan_slug, p.loyalty_months 
         FROM stores s 
         LEFT JOIN plans p ON s.plan_id = p.id 
         WHERE s.user_id = :user_id",
        ['user_id' => $userId]
    );
    
    if (!$store) {
        Response::error('Loja não encontrada', 404);
    }
    
    // Get Stripe subscription record
    $stripeSubscription = $db->fetchOne(
        "SELECT * FROM stripe_subscriptions 
         WHERE store_id = :store_id 
         AND status = 'active' 
         ORDER BY created_at DESC 
         LIMIT 1",
        ['store_id' => $store['id']]
    );
    
    if (!$stripeSubscription) {
        Response::error('Assinatura Stripe não encontrada', 404);
    }
    
    $subscriptionId = $stripeSubscription['subscription_id'];
    $planSlug = $stripeSubscription['plan_slug'];
    $loyaltyMonths = (int)($store['loyalty_months'] ?? 0);
    $mesesPagos = (int)$stripeSubscription['meses_pagos'];
    
    // Validate loyalty period
    if ($loyaltyMonths > 0 && $mesesPagos < $loyaltyMonths) {
        // Use data_liberacao_cancelamento from database (calculated from invoices)
        $dataLiberacao = $stripeSubscription['data_liberacao_cancelamento'] 
            ? strtotime($stripeSubscription['data_liberacao_cancelamento'])
            : strtotime($stripeSubscription['data_inicio'] . " +{$loyaltyMonths} months");
        
        $dataLiberacaoFormatada = date('d/m/Y', $dataLiberacao);
        $monthsRemaining = $loyaltyMonths - $mesesPagos;
        
        // Log blocked cancellation attempt
        $db->insert('subscription_logs', [
            'id' => $db->generateUuid(),
            'store_id' => $store['id'],
            'action' => 'cancel_blocked',
            'old_status' => $store['subscription_status'],
            'new_status' => $store['subscription_status'],
            'old_ends_at' => $store['subscription_ends_at'],
            'new_ends_at' => $store['subscription_ends_at'],
            'performed_by' => $userId,
            'notes' => "Tentativa de cancelamento bloqueada por fidelidade. Meses pagos: {$mesesPagos}, Fidelidade requerida: {$loyaltyMonths}, Meses restantes: {$monthsRemaining}",
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        Response::error(
            "Este plano possui fidelidade mínima de {$loyaltyMonths} meses. O cancelamento estará disponível a partir de {$dataLiberacaoFormatada}.",
            403,
            [
                'loyalty_months' => $loyaltyMonths,
                'months_paid' => $mesesPagos,
                'months_required' => $loyaltyMonths,
                'months_remaining' => $monthsRemaining,
                'cancellation_available_date' => date('Y-m-d', $dataLiberacao),
                'cancellation_available_date_formatted' => $dataLiberacaoFormatada
            ]
        );
    }
    
    // Loyalty period fulfilled - proceed with cancellation
    try {
        // Cancel subscription at period end in Stripe
        $stripeSubscriptionData = $stripe->cancelSubscriptionAtPeriodEnd($subscriptionId);
        
        // Update local database
        $db->update('stripe_subscriptions', [
            'cancel_at_period_end' => true,
            'status' => 'active', // Still active until period ends
            'updated_at' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $stripeSubscription['id']]);
        
        // Log cancellation
        $db->insert('subscription_logs', [
            'id' => $db->generateUuid(),
            'store_id' => $store['id'],
            'action' => 'cancel_requested',
            'old_status' => $store['subscription_status'],
            'new_status' => $store['subscription_status'], // Status remains active until period ends
            'old_ends_at' => $store['subscription_ends_at'],
            'new_ends_at' => $store['subscription_ends_at'],
            'performed_by' => $userId,
            'notes' => "Cancelamento solicitado. Assinatura será cancelada ao final do período atual. Stripe Subscription ID: {$subscriptionId}",
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        // Get period end date from Stripe
        $periodEnd = isset($stripeSubscriptionData['current_period_end']) 
            ? date('Y-m-d H:i:s', $stripeSubscriptionData['current_period_end'])
            : $store['subscription_ends_at'];
        
        Response::success([
            'message' => 'Cancelamento solicitado com sucesso. Sua assinatura será cancelada ao final do período atual.',
            'subscription_id' => $subscriptionId,
            'cancel_at_period_end' => true,
            'current_period_end' => $periodEnd,
            'current_period_end_formatted' => date('d/m/Y H:i', strtotime($periodEnd))
        ]);
        
    } catch (Exception $e) {
        error_log('Erro ao cancelar assinatura Stripe: ' . $e->getMessage());
        Response::error('Erro ao cancelar assinatura: ' . $e->getMessage(), 500);
    }
}



