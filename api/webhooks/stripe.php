<?php
/**
 * Stripe Webhook Handler
 * Receives and processes payment notifications from Stripe
 * REQ-PLN-STRIPE-ASSINATURAS: Section 7.2
 */

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Stripe.php';
require_once __DIR__ . '/../classes/EmailService.php';

header('Content-Type: application/json');

$db = Database::getInstance();
$stripe = new Stripe();
$emailService = new EmailService();

// Get webhook payload
$payload = file_get_contents('php://input');
$data = json_decode($payload, true);

// Get signature from header
$signature = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

// Validate webhook signature (Security - Section 13)
if (!$stripe->validateWebhook($payload, $signature)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

// Log webhook received
error_log("Stripe Webhook received: " . $data['type'] ?? 'unknown');

// Get event type
$eventType = $data['type'] ?? null;
$eventData = $data['data']['object'] ?? null;

if (!$eventType || !$eventData) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid event data']);
    exit;
}

// Process events (Section 7.2)
try {
    switch ($eventType) {
        case 'checkout.session.completed':
            handleCheckoutCompleted($db, $stripe, $emailService, $eventData);
            break;
            
        case 'customer.subscription.created':
            handleSubscriptionCreated($db, $stripe, $eventData);
            break;
            
        case 'customer.subscription.updated':
            handleSubscriptionUpdated($db, $stripe, $eventData);
            break;
            
        case 'invoice.paid':
            handleInvoicePaid($db, $stripe, $emailService, $eventData);
            break;
            
        case 'payment_intent.succeeded':
            handlePaymentSucceeded($db, $stripe, $emailService, $eventData);
            break;
            
        case 'payment_intent.payment_failed':
        case 'invoice.payment_failed':
            handlePaymentFailed($db, $emailService, $eventData);
            break;
            
        case 'charge.refunded':
            handleChargeRefunded($db, $emailService, $eventData);
            break;
            
        default:
            // Unknown event type - log but don't fail
            error_log("Unhandled Stripe event type: {$eventType}");
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Event logged but not processed']);
            exit;
    }
    
    // Return success
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Webhook processed']);
    
} catch (Exception $e) {
    error_log('Stripe webhook error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Webhook processing failed', 'message' => $e->getMessage()]);
}

/**
 * Handle checkout.session.completed event
 * RB03: Ativação via webhook
 */
function handleCheckoutCompleted($db, $stripe, $emailService, $sessionData) {
    $sessionId = $sessionData['id'] ?? null;
    $paymentStatus = $sessionData['payment_status'] ?? null;
    $metadata = $sessionData['metadata'] ?? [];
    
    if (!$sessionId) {
        throw new Exception('Session ID not found');
    }
    
    // Get transaction from database
    $transaction = $db->fetchOne(
        "SELECT * FROM payment_transactions WHERE order_id = :session_id AND gateway = 'stripe'",
        ['session_id' => $sessionId]
    );
    
    if (!$transaction) {
        // Transaction not found - might be first time we see this session
        // Try to get store from metadata
        $storeId = $metadata['store_id'] ?? null;
        if (!$storeId) {
            throw new Exception('Transaction and store_id not found');
        }
        
        // Create transaction record
        $transactionId = $db->generateUuid();
        $db->insert('payment_transactions', [
            'id' => $transactionId,
            'store_id' => $storeId,
            'order_id' => $sessionId,
            'gateway' => 'stripe',
            'amount' => ($sessionData['amount_total'] ?? 0) / 100, // Convert from cents
            'status' => $paymentStatus === 'paid' ? 'approved' : 'waiting_payment',
            'customer_email' => $sessionData['customer_email'] ?? null,
            'metadata' => json_encode($metadata),
            'payload_json' => json_encode($sessionData),
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        
        $transaction = $db->fetchOne(
            "SELECT * FROM payment_transactions WHERE id = :id",
            ['id' => $transactionId]
        );
    }
    
    // Update transaction
    $db->update('payment_transactions', [
        'status' => $paymentStatus === 'paid' ? 'approved' : 'waiting_payment',
        'payload_json' => json_encode($sessionData),
        'updated_at' => date('Y-m-d H:i:s')
    ], 'id = :id', ['id' => $transaction['id']]);
    
    // Only activate if payment is paid
    if ($paymentStatus === 'paid') {
        activateSubscription($db, $emailService, $transaction['store_id'], $metadata, $sessionId);
    }
}

/**
 * Handle payment_intent.succeeded event
 */
function handlePaymentSucceeded($db, $stripe, $emailService, $paymentIntentData) {
    $paymentIntentId = $paymentIntentData['id'] ?? null;
    $metadata = $paymentIntentData['metadata'] ?? [];
    
    if (!$paymentIntentId) {
        throw new Exception('Payment Intent ID not found');
    }
    
    // Try to find transaction by payment_intent or metadata
    $transaction = $db->fetchOne(
        "SELECT * FROM payment_transactions 
         WHERE (transaction_id = :payment_intent_id OR JSON_EXTRACT(metadata, '$.payment_intent_id') = :payment_intent_id)
         AND gateway = 'stripe' 
         ORDER BY created_at DESC LIMIT 1",
        ['payment_intent_id' => $paymentIntentId]
    );
    
    if (!$transaction) {
        // Try to get store from metadata
        $storeId = $metadata['store_id'] ?? null;
        if (!$storeId) {
            // Payment succeeded but we don't have a transaction - log and exit
            error_log("Payment succeeded for unknown payment intent: {$paymentIntentId}");
            return;
        }
        
        // This shouldn't happen, but create transaction if needed
        $transactionId = $db->generateUuid();
        $db->insert('payment_transactions', [
            'id' => $transactionId,
            'store_id' => $storeId,
            'transaction_id' => $paymentIntentId,
            'gateway' => 'stripe',
            'amount' => ($paymentIntentData['amount'] ?? 0) / 100,
            'status' => 'approved',
            'metadata' => json_encode($metadata),
            'payload_json' => json_encode($paymentIntentData),
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        
        $transaction = $db->fetchOne(
            "SELECT * FROM payment_transactions WHERE id = :id",
            ['id' => $transactionId]
        );
    }
    
    // Update transaction
    $db->update('payment_transactions', [
        'status' => 'approved',
        'payload_json' => json_encode($paymentIntentData),
        'updated_at' => date('Y-m-d H:i:s')
    ], 'id = :id', ['id' => $transaction['id']]);
    
    // Activate subscription
    activateSubscription($db, $emailService, $transaction['store_id'], $metadata, $paymentIntentId);
}

/**
 * Handle payment failed events
 */
function handlePaymentFailed($db, $emailService, $eventData) {
    $paymentIntentId = $eventData['id'] ?? null;
    $metadata = $eventData['metadata'] ?? [];
    
    if (!$paymentIntentId) {
        return;
    }
    
    // Find transaction
    $transaction = $db->fetchOne(
        "SELECT * FROM payment_transactions 
         WHERE (transaction_id = :payment_intent_id OR JSON_EXTRACT(metadata, '$.payment_intent_id') = :payment_intent_id)
         AND gateway = 'stripe' 
         ORDER BY created_at DESC LIMIT 1",
        ['payment_intent_id' => $paymentIntentId]
    );
    
    if (!$transaction) {
        return;
    }
    
    // Update transaction
    $db->update('payment_transactions', [
        'status' => 'refused',
        'payload_json' => json_encode($eventData),
        'updated_at' => date('Y-m-d H:i:s')
    ], 'id = :id', ['id' => $transaction['id']]);
    
    // RB05: Set status to pending
    $store = $db->fetchOne(
        "SELECT * FROM stores WHERE id = :id",
        ['id' => $transaction['store_id']]
    );
    
    if ($store && in_array($store['subscription_status'], ['active', 'trial'])) {
        $oldStatus = $store['subscription_status'];
        
        $db->update('stores', [
            'subscription_status' => 'pending',
            'updated_at' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $store['id']]);
        
        // Log subscription change
        $db->insert('subscription_logs', [
            'id' => $db->generateUuid(),
            'store_id' => $store['id'],
            'action' => 'payment_failed',
            'old_status' => $oldStatus,
            'new_status' => 'pending',
            'old_ends_at' => $store['subscription_ends_at'],
            'new_ends_at' => $store['subscription_ends_at'],
            'performed_by' => 'system',
            'notes' => "Pagamento falhou no Stripe. Payment Intent ID: {$paymentIntentId}",
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        // Send failure email
        $emailService->sendPaymentFailed($store, $eventData);
    }
}

/**
 * Handle charge.refunded event
 */
function handleChargeRefunded($db, $emailService, $chargeData) {
    $chargeId = $chargeData['id'] ?? null;
    $paymentIntentId = $chargeData['payment_intent'] ?? null;
    
    if (!$paymentIntentId) {
        return;
    }
    
    // Find transaction
    $transaction = $db->fetchOne(
        "SELECT * FROM payment_transactions 
         WHERE (transaction_id = :payment_intent_id OR JSON_EXTRACT(metadata, '$.payment_intent_id') = :payment_intent_id)
         AND gateway = 'stripe' 
         ORDER BY created_at DESC LIMIT 1",
        ['payment_intent_id' => $paymentIntentId]
    );
    
    if (!$transaction) {
        return;
    }
    
    // Update transaction
    $db->update('payment_transactions', [
        'status' => 'refunded',
        'payload_json' => json_encode($chargeData),
        'updated_at' => date('Y-m-d H:i:s')
    ], 'id = :id', ['id' => $transaction['id']]);
    
    // Set status to pending or suspended
    $store = $db->fetchOne(
        "SELECT * FROM stores WHERE id = :id",
        ['id' => $transaction['store_id']]
    );
    
    if ($store && $store['subscription_status'] === 'active') {
        $oldStatus = $store['subscription_status'];
        
        $db->update('stores', [
            'subscription_status' => 'pending',
            'updated_at' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $store['id']]);
        
        // Log subscription change
        $db->insert('subscription_logs', [
            'id' => $db->generateUuid(),
            'store_id' => $store['id'],
            'action' => 'refunded',
            'old_status' => $oldStatus,
            'new_status' => 'pending',
            'old_ends_at' => $store['subscription_ends_at'],
            'new_ends_at' => $store['subscription_ends_at'],
            'performed_by' => 'system',
            'notes' => "Reembolso processado no Stripe. Charge ID: {$chargeId}",
            'created_at' => date('Y-m-d H:i:s')
        ]);
    }
}

/**
 * Activate subscription (RB03)
 * Called when payment is confirmed
 */
function activateSubscription($db, $emailService, $storeId, $metadata, $transactionReference) {
    // Get store
    $store = $db->fetchOne(
        "SELECT * FROM stores WHERE id = :id",
        ['id' => $storeId]
    );
    
    if (!$store) {
        throw new Exception("Store not found: {$storeId}");
    }
    
    // REQ-ADM-PAINEL-ASSINATURAS-COM-AUTH: Edge Case Crítico
    // Não sobrescrever status cancelado/suspenso por admin
    // Se loja foi cancelada ou suspensa manualmente por admin, apenas registrar transação
    if (in_array($store['subscription_status'], ['canceled', 'suspended'])) {
        // Verificar se foi cancelado/suspenso por admin (não por sistema)
        $lastAdminAction = $db->fetchOne(
            "SELECT * FROM subscription_logs 
             WHERE store_id = :store_id 
             AND action IN ('canceled', 'suspended')
             AND performed_by != 'system'
             AND performed_by != 'webhook'
             ORDER BY created_at DESC 
             LIMIT 1",
            ['store_id' => $storeId]
        );
        
        if ($lastAdminAction) {
            // Status foi definido por admin - apenas registrar transação, não alterar status
            error_log("Stripe webhook: Store {$storeId} has status '{$store['subscription_status']}' set by admin. Transaction recorded but status not changed. Transaction: {$transactionReference}");
            
            // Log da tentativa de reativação automática
            $db->insert('subscription_logs', [
                'id' => $db->generateUuid(),
                'store_id' => $storeId,
                'action' => 'webhook_ignored',
                'old_status' => $store['subscription_status'],
                'new_status' => $store['subscription_status'],
                'old_ends_at' => $store['subscription_ends_at'],
                'new_ends_at' => $store['subscription_ends_at'],
                'performed_by' => 'system',
                'notes' => "Webhook do Stripe ignorado: Status '{$store['subscription_status']}' definido por admin. Transaction: {$transactionReference}",
                'created_at' => date('Y-m-d H:i:s')
            ]);
            
            // Retornar sem ativar assinatura
            return;
        }
    }
    
    // Get plan
    $planId = $metadata['plan_id'] ?? $store['plan_id'];
    if (!$planId) {
        throw new Exception("Plan ID not found in metadata or store");
    }
    
    $plan = $db->fetchOne(
        "SELECT * FROM plans WHERE id = :id",
        ['id' => $planId]
    );
    
    if (!$plan) {
        throw new Exception("Plan not found: {$planId}");
    }
    
    $durationDays = (int)($metadata['duration_days'] ?? $plan['duration_days'] ?? 30);
    
    // RB04: Calculate new subscription end date
    $currentEndsAt = $store['subscription_ends_at'] ? strtotime($store['subscription_ends_at']) : null;
    $now = time();
    
    if ($currentEndsAt && $currentEndsAt > $now && $store['subscription_status'] === 'active') {
        // If subscription still valid, add days to current end date
        $newEndsAt = date('Y-m-d H:i:s', $currentEndsAt + ($durationDays * 24 * 60 * 60));
    } else {
        // If expired or not active, count from now
        $newEndsAt = date('Y-m-d H:i:s', $now + ($durationDays * 24 * 60 * 60));
    }
    
    $oldStatus = $store['subscription_status'];
    $oldEndsAt = $store['subscription_ends_at'];
    
    // RB03: Update store
    $db->update('stores', [
        'subscription_status' => 'active',
        'subscription_ends_at' => $newEndsAt,
        'plan_id' => $planId,
        'updated_at' => date('Y-m-d H:i:s')
    ], 'id = :id', ['id' => $store['id']]);
    
    // RB03: Create log
    $db->insert('subscription_logs', [
        'id' => $db->generateUuid(),
        'store_id' => $store['id'],
        'action' => 'renewed',
        'old_status' => $oldStatus,
        'new_status' => 'active',
        'old_ends_at' => $oldEndsAt,
        'new_ends_at' => $newEndsAt,
        'performed_by' => 'system',
        'notes' => "Pagamento aprovado via Stripe. Plano: {$plan['name']}. Transaction: {$transactionReference}",
        'created_at' => date('Y-m-d H:i:s')
    ]);
    
    // RB03: Send success email
    $emailService->sendPaymentSuccess($store, [
        'plan_name' => $plan['name'],
        'transaction_reference' => $transactionReference
    ]);
}

/**
 * Handle customer.subscription.created event
 * Creates stripe_subscriptions record when subscription is created
 */
function handleSubscriptionCreated($db, $stripe, $subscriptionData) {
    $subscriptionId = $subscriptionData['id'] ?? null;
    $metadata = $subscriptionData['metadata'] ?? [];
    $storeId = $metadata['store_id'] ?? null;
    
    if (!$subscriptionId || !$storeId) {
        error_log("Subscription created event missing subscription_id or store_id");
        return;
    }
    
    // Check if already exists
    $existing = $db->fetchOne(
        "SELECT * FROM stripe_subscriptions WHERE subscription_id = :subscription_id",
        ['subscription_id' => $subscriptionId]
    );
    
    if ($existing) {
        // Already exists, skip
        return;
    }
    
    // Get plan
    $planSlug = $metadata['plan_slug'] ?? null;
    $planId = $metadata['plan_id'] ?? null;
    
    if (!$planSlug || !$planId) {
        // Try to get from store
        $store = $db->fetchOne(
            "SELECT plan_id FROM stores WHERE id = :id",
            ['id' => $storeId]
        );
        
        if ($store && $store['plan_id']) {
            $plan = $db->fetchOne(
                "SELECT * FROM plans WHERE id = :id",
                ['id' => $store['plan_id']]
            );
            
            if ($plan) {
                $planId = $plan['id'];
                $planSlug = $plan['slug'];
            }
        }
    }
    
    if (!$planId || !$planSlug) {
        error_log("Subscription created event: Could not find plan for store {$storeId}");
        return;
    }
    
    // Get plan loyalty months
    $plan = $db->fetchOne(
        "SELECT loyalty_months FROM plans WHERE id = :id",
        ['id' => $planId]
    );
    
    $loyaltyMonths = $plan ? (int)($plan['loyalty_months'] ?? 0) : 0;
    
    // Calculate initial cancellation release date
    // Will be recalculated more accurately when invoices are paid
    $dataInicio = date('Y-m-d H:i:s', $subscriptionData['created'] ?? time());
    $dataLiberacao = null;
    $loyaltyStatus = 'locked';
    
    if ($loyaltyMonths > 0) {
        $dataLiberacao = date('Y-m-d H:i:s', strtotime($dataInicio . " +{$loyaltyMonths} months"));
    } else {
        // No loyalty - can cancel immediately
        $dataLiberacao = date('Y-m-d H:i:s');
        $loyaltyStatus = 'completed';
    }
    
    // Create stripe_subscriptions record
    $db->insert('stripe_subscriptions', [
        'id' => $db->generateUuid(),
        'store_id' => $storeId,
        'subscription_id' => $subscriptionId,
        'plan_id' => $planId,
        'plan_slug' => $planSlug,
        'data_inicio' => $dataInicio,
        'meses_pagos' => 0, // Will be updated when first invoice is paid
        'data_liberacao_cancelamento' => $dataLiberacao,
        'loyalty_status' => $loyaltyStatus,
        'status' => $subscriptionData['status'] ?? 'active',
        'cancel_at_period_end' => $subscriptionData['cancel_at_period_end'] ?? false,
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ]);
    
    error_log("Stripe subscription created: {$subscriptionId} for store {$storeId}");
}

/**
 * Handle customer.subscription.updated event
 * Updates stripe_subscriptions record when subscription changes
 */
function handleSubscriptionUpdated($db, $stripe, $subscriptionData) {
    $subscriptionId = $subscriptionData['id'] ?? null;
    
    if (!$subscriptionId) {
        return;
    }
    
    // Find existing subscription
    $stripeSubscription = $db->fetchOne(
        "SELECT * FROM stripe_subscriptions WHERE subscription_id = :subscription_id",
        ['subscription_id' => $subscriptionId]
    );
    
    if (!$stripeSubscription) {
        // If not found, try to create it
        handleSubscriptionCreated($db, $stripe, $subscriptionData);
        return;
    }
    
    // CRITICAL: Check for unauthorized cancellation (before loyalty period)
    $plan = $db->fetchOne(
        "SELECT loyalty_months FROM plans WHERE id = :id",
        ['id' => $stripeSubscription['plan_id']]
    );
    
    $loyaltyMonths = $plan ? (int)($plan['loyalty_months'] ?? 0) : 0;
    $mesesPagos = (int)$stripeSubscription['meses_pagos'];
    
    // Detect unauthorized cancellation
    if ($subscriptionData['status'] === 'canceled' && 
        $loyaltyMonths > 0 && 
        $mesesPagos < $loyaltyMonths &&
        !$stripeSubscription['cancel_at_period_end']) {
        
        // Cancelamento indevido detectado - não foi feito via nosso endpoint
        // Log alert for admin
        error_log("⚠️ UNAUTHORIZED CANCELLATION DETECTED: Subscription {$subscriptionId} canceled before loyalty period completed. Store: {$stripeSubscription['store_id']}, Months paid: {$mesesPagos}, Required: {$loyaltyMonths}");
        
        // Log in subscription_logs
        $db->insert('subscription_logs', [
            'id' => $db->generateUuid(),
            'store_id' => $stripeSubscription['store_id'],
            'action' => 'unauthorized_cancellation',
            'old_status' => $stripeSubscription['status'],
            'new_status' => 'canceled',
            'old_ends_at' => null,
            'new_ends_at' => null,
            'performed_by' => 'system',
            'notes' => "⚠️ CANCELAMENTO INDEVIDO DETECTADO: Assinatura cancelada antes do período de fidelidade. Meses pagos: {$mesesPagos}, Fidelidade requerida: {$loyaltyMonths}. Possível cancelamento via Stripe Dashboard ou API direta.",
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        // TODO: Send alert email to admin
        // $emailService->sendAdminAlert(...);
    }
    
    // Update status and cancel_at_period_end
    $updateData = [
        'status' => $subscriptionData['status'] ?? $stripeSubscription['status'],
        'cancel_at_period_end' => $subscriptionData['cancel_at_period_end'] ?? false,
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    // If subscription was canceled and period ended, update store status
    if ($subscriptionData['status'] === 'canceled' && 
        $subscriptionData['cancel_at_period_end'] === true &&
        isset($subscriptionData['canceled_at'])) {
        
        $store = $db->fetchOne(
            "SELECT * FROM stores WHERE id = :id",
            ['id' => $stripeSubscription['store_id']]
        );
        
        if ($store && $store['subscription_status'] === 'active') {
            $db->update('stores', [
                'subscription_status' => 'canceled',
                'updated_at' => date('Y-m-d H:i:s')
            ], 'id = :id', ['id' => $store['id']]);
            
            // Log cancellation
            $db->insert('subscription_logs', [
                'id' => $db->generateUuid(),
                'store_id' => $store['id'],
                'action' => 'canceled',
                'old_status' => 'active',
                'new_status' => 'canceled',
                'old_ends_at' => $store['subscription_ends_at'],
                'new_ends_at' => $store['subscription_ends_at'],
                'performed_by' => 'system',
                'notes' => "Assinatura cancelada no Stripe ao final do período. Subscription ID: {$subscriptionId}",
                'created_at' => date('Y-m-d H:i:s')
            ]);
        }
    }
    
    $db->update('stripe_subscriptions', $updateData, 
        'subscription_id = :subscription_id', 
        ['subscription_id' => $subscriptionId]
    );
}

/**
 * Handle invoice.paid event
 * Updates meses_pagos when invoice is paid
 * CRITICAL: Prevents duplicate processing using stripe_invoices table
 */
function handleInvoicePaid($db, $stripe, $emailService, $invoiceData) {
    $invoiceId = $invoiceData['id'] ?? null;
    $subscriptionId = $invoiceData['subscription'] ?? null;
    
    if (!$invoiceId || !$subscriptionId) {
        // Not a subscription invoice or missing ID
        return;
    }
    
    // CRITICAL: Check if invoice was already processed
    $existingInvoice = $db->fetchOne(
        "SELECT * FROM stripe_invoices WHERE invoice_id = :invoice_id",
        ['invoice_id' => $invoiceId]
    );
    
    if ($existingInvoice) {
        // Invoice already processed - skip to prevent duplicate counting
        error_log("Invoice {$invoiceId} already processed. Skipping duplicate webhook.");
        return;
    }
    
    // Find subscription
    $stripeSubscription = $db->fetchOne(
        "SELECT * FROM stripe_subscriptions WHERE subscription_id = :subscription_id",
        ['subscription_id' => $subscriptionId]
    );
    
    if (!$stripeSubscription) {
        error_log("Invoice paid for unknown subscription: {$subscriptionId}");
        return;
    }
    
    // Get plan to check loyalty
    $plan = $db->fetchOne(
        "SELECT loyalty_months FROM plans WHERE id = :id",
        ['id' => $stripeSubscription['plan_id']]
    );
    
    $loyaltyMonths = $plan ? (int)($plan['loyalty_months'] ?? 0) : 0;
    
    // Increment meses_pagos
    $newMesesPagos = $stripeSubscription['meses_pagos'] + 1;
    
    // Calculate cancellation release date based on paid invoices
    // More accurate than data_inicio + loyalty_months
    $dataLiberacao = null;
    $loyaltyStatus = 'locked';
    
    if ($loyaltyMonths > 0) {
        if ($newMesesPagos >= $loyaltyMonths) {
            // Fidelidade cumprida - liberação imediata
            $dataLiberacao = date('Y-m-d H:i:s');
            $loyaltyStatus = 'completed';
        } else {
            // Ainda em fidelidade - calcular baseado em quando o último mês necessário será pago
            // Usa a data do período atual da invoice como referência
            $periodEnd = isset($invoiceData['period_end']) 
                ? date('Y-m-d H:i:s', $invoiceData['period_end'])
                : date('Y-m-d H:i:s', strtotime('+1 month'));
            
            $monthsRemaining = $loyaltyMonths - $newMesesPagos;
            $dataLiberacao = date('Y-m-d H:i:s', strtotime($periodEnd . " +{$monthsRemaining} months"));
        }
    } else {
        // Sem fidelidade - pode cancelar imediatamente
        $dataLiberacao = date('Y-m-d H:i:s');
        $loyaltyStatus = 'completed';
    }
    
    // Update subscription
    $updateData = [
        'meses_pagos' => $newMesesPagos,
        'data_liberacao_cancelamento' => $dataLiberacao,
        'loyalty_status' => $loyaltyStatus,
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    $db->update('stripe_subscriptions', $updateData, 
        'id = :id', ['id' => $stripeSubscription['id']]
    );
    
    // Save invoice to prevent duplicate processing
    $paidAt = isset($invoiceData['status_transitions']['paid_at']) 
        ? date('Y-m-d H:i:s', $invoiceData['status_transitions']['paid_at'])
        : date('Y-m-d H:i:s');
    
    $periodStart = isset($invoiceData['period_start']) 
        ? date('Y-m-d H:i:s', $invoiceData['period_start'])
        : null;
    
    $periodEnd = isset($invoiceData['period_end']) 
        ? date('Y-m-d H:i:s', $invoiceData['period_end'])
        : null;
    
    $db->insert('stripe_invoices', [
        'id' => $db->generateUuid(),
        'invoice_id' => $invoiceId,
        'subscription_id' => $subscriptionId,
        'store_id' => $stripeSubscription['store_id'],
        'amount' => ($invoiceData['amount_paid'] ?? 0) / 100, // Convert from cents
        'status' => $invoiceData['status'] ?? 'paid',
        'paid_at' => $paidAt,
        'period_start' => $periodStart,
        'period_end' => $periodEnd,
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ]);
    
    // Get store and plan for email
    $store = $db->fetchOne(
        "SELECT s.*, p.name as plan_name 
         FROM stores s 
         LEFT JOIN plans p ON s.plan_id = p.id 
         WHERE s.id = :id",
        ['id' => $stripeSubscription['store_id']]
    );
    
    if ($store) {
        // Send payment success email
        $emailService->sendPaymentSuccess($store, [
            'plan_name' => $store['plan_name'] ?? 'Plano',
            'transaction_reference' => $invoiceId
        ]);
    }
    
    error_log("Invoice {$invoiceId} paid for subscription {$subscriptionId}. Total months paid: {$newMesesPagos}. Loyalty status: {$loyaltyStatus}");
}
