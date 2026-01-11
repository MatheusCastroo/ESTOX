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
