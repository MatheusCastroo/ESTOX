<?php
/**
 * Appmax Webhook Handler
 * Receives and processes payment notifications from Appmax
 */

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Appmax.php';
require_once __DIR__ . '/../classes/EmailService.php';

header('Content-Type: application/json');

$db = Database::getInstance();
$appmax = new Appmax();
$emailService = new EmailService();

// Get webhook payload
$payload = file_get_contents('php://input');
$data = json_decode($payload, true);

// Get signature from header
$signature = $_SERVER['HTTP_X_APPMAX_SIGNATURE'] ?? '';

// Validate webhook (optional but recommended)
// if (!$appmax->validateWebhook($data, $signature)) {
//     http_response_code(401);
//     echo json_encode(['error' => 'Invalid signature']);
//     exit;
// }

// Log webhook received
error_log("Appmax Webhook received: " . json_encode($data));

// Get order ID
$orderId = $data['order_id'] ?? $data['id'] ?? null;

if (!$orderId) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID not found']);
    exit;
}

// Get transaction from database
$transaction = $db->fetchOne(
    "SELECT * FROM payment_transactions WHERE order_id = :order_id AND gateway = 'appmax'",
    ['order_id' => $orderId]
);

if (!$transaction) {
    // Transaction not found in our database
    http_response_code(404);
    echo json_encode(['error' => 'Transaction not found']);
    exit;
}

// Get order status from Appmax
$status = $data['status'] ?? $data['order_status'] ?? $transaction['status'];

// Update transaction record
$db->update('payment_transactions', [
    'status' => $status,
    'payload_json' => json_encode($data),
    'updated_at' => date('Y-m-d H:i:s')
], 'order_id = :order_id', ['order_id' => $orderId]);

// Get store
$store = $db->fetchOne(
    "SELECT * FROM stores WHERE id = :id",
    ['id' => $transaction['store_id']]
);

if (!$store) {
    http_response_code(404);
    echo json_encode(['error' => 'Store not found']);
    exit;
}

// Process based on status
$oldStatus = $store['subscription_status'];
$newStatus = null;
$newEndsAt = null;

switch ($status) {
    case 'approved':
        // Payment successful - activate subscription
        $newStatus = 'active';
        $newEndsAt = date('Y-m-d H:i:s', strtotime('+30 days')); // 30 days subscription
        
        // Update store
        $db->update('stores', [
            'subscription_status' => $newStatus,
            'subscription_ends_at' => $newEndsAt,
            'updated_at' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $store['id']]);
        
        // Log subscription change
        $db->insert('subscription_logs', [
            'id' => $db->generateUuid(),
            'store_id' => $store['id'],
            'action' => 'renewed',
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'old_ends_at' => $store['subscription_ends_at'],
            'new_ends_at' => $newEndsAt,
            'performed_by' => 'system',
            'notes' => 'Pagamento aprovado via Appmax. Order ID: ' . $orderId,
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        // Send success email
        $emailService->sendPaymentSuccess($store, $data);
        
        break;
        
    case 'refused':
    case 'canceled':
    case 'expired':
    case 'refunded':
        // Payment failed - set to pending
        $newStatus = 'pending';
        
        // Update store only if it was active/trial
        if (in_array($oldStatus, ['active', 'trial'])) {
            $db->update('stores', [
                'subscription_status' => $newStatus,
                'updated_at' => date('Y-m-d H:i:s')
            ], 'id = :id', ['id' => $store['id']]);
            
            // Log subscription change
            $db->insert('subscription_logs', [
                'id' => $db->generateUuid(),
                'store_id' => $store['id'],
                'action' => 'payment_failed',
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'old_ends_at' => $store['subscription_ends_at'],
                'new_ends_at' => $store['subscription_ends_at'],
                'performed_by' => 'system',
                'notes' => "Pagamento {$status} via Appmax. Order ID: {$orderId}",
                'created_at' => date('Y-m-d H:i:s')
            ]);
            
            // Send failure email
            $emailService->sendPaymentFailed($store, $data);
        }
        
        break;
        
    case 'waiting_payment':
        // Payment is being processed - no status change yet
        // Just log it
        $db->insert('subscription_logs', [
            'id' => $db->generateUuid(),
            'store_id' => $store['id'],
            'action' => 'payment_processing',
            'old_status' => $oldStatus,
            'new_status' => $oldStatus,
            'old_ends_at' => $store['subscription_ends_at'],
            'new_ends_at' => $store['subscription_ends_at'],
            'performed_by' => 'system',
            'notes' => 'Pagamento aguardando confirmação. Order ID: ' . $orderId,
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        break;
}

// Return success
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Webhook processed',
    'order_id' => $orderId,
    'status' => $status
]);



