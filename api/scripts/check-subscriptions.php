<?php
/**
 * Subscription Check Script
 * Should be run via cron job daily
 * Checks for expiring subscriptions and sends reminder emails
 * 
 * Usage: php check-subscriptions.php
 * Cron: 0 9 * * * php /path/to/api/scripts/check-subscriptions.php
 */

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/EmailService.php';

$db = Database::getInstance();
$emailService = new EmailService();

echo "=== AutoStock Subscription Check ===\n";
echo "Started at: " . date('Y-m-d H:i:s') . "\n\n";

// Get all stores with active trial or active subscription
$stores = $db->fetchAll(
    "SELECT * FROM stores 
     WHERE subscription_status IN ('trial', 'active') 
     AND subscription_ends_at IS NOT NULL
     AND subscription_ends_at > NOW()
     ORDER BY subscription_ends_at ASC"
);

echo "Found " . count($stores) . " active subscriptions\n\n";

$emailsSent = 0;
$statusUpdated = 0;

foreach ($stores as $store) {
    $endsAt = strtotime($store['subscription_ends_at']);
    $now = time();
    $daysRemaining = floor(($endsAt - $now) / (60 * 60 * 24));
    
    echo "Store: {$store['name']} (ID: {$store['id']})\n";
    echo "  Status: {$store['subscription_status']}\n";
    echo "  Ends at: {$store['subscription_ends_at']}\n";
    echo "  Days remaining: {$daysRemaining}\n";
    
    // Check if we need to send reminder emails
    if (in_array($daysRemaining, [7, 10, 14])) {
        // Check if email was already sent for this day
        $emailSent = $db->fetchOne(
            "SELECT id FROM subscription_emails 
             WHERE store_id = :store_id 
             AND email_type = :email_type 
             AND DATE(sent_at) = CURDATE()",
            [
                'store_id' => $store['id'],
                'email_type' => "trial_reminder_{$daysRemaining}d"
            ]
        );
        
        if (!$emailSent) {
            echo "  → Sending {$daysRemaining}-day reminder email...\n";
            $emailService->sendTrialReminder($store, $daysRemaining);
            $emailsSent++;
        } else {
            echo "  → Email already sent today\n";
        }
    }
    
    // Check if subscription expired
    if ($endsAt < $now && $store['subscription_status'] === 'trial') {
        echo "  → Subscription expired! Updating to pending...\n";
        
        $db->update('stores', [
            'subscription_status' => 'pending',
            'updated_at' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $store['id']]);
        
        // Log the change
        $db->insert('subscription_logs', [
            'id' => $db->generateUuid(),
            'store_id' => $store['id'],
            'action' => 'expired',
            'old_status' => 'trial',
            'new_status' => 'pending',
            'old_ends_at' => $store['subscription_ends_at'],
            'new_ends_at' => $store['subscription_ends_at'],
            'performed_by' => 'system',
            'notes' => 'Período de teste expirado automaticamente',
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        $statusUpdated++;
    }
    
    echo "\n";
}

// Check for expired active subscriptions (should renew monthly)
$expiredActive = $db->fetchAll(
    "SELECT * FROM stores 
     WHERE subscription_status = 'active' 
     AND subscription_ends_at IS NOT NULL
     AND subscription_ends_at < NOW()"
);

foreach ($expiredActive as $store) {
    echo "Store: {$store['name']} - Active subscription expired\n";
    echo "  → Updating to pending...\n";
    
    $db->update('stores', [
        'subscription_status' => 'pending',
        'updated_at' => date('Y-m-d H:i:s')
    ], 'id = :id', ['id' => $store['id']]);
    
    // Log the change
    $db->insert('subscription_logs', [
        'id' => $db->generateUuid(),
        'store_id' => $store['id'],
        'action' => 'expired',
        'old_status' => 'active',
        'new_status' => 'pending',
        'old_ends_at' => $store['subscription_ends_at'],
        'new_ends_at' => $store['subscription_ends_at'],
        'performed_by' => 'system',
        'notes' => 'Assinatura ativa expirada - aguardando renovação',
        'created_at' => date('Y-m-d H:i:s')
    ]);
    
    $statusUpdated++;
}

echo "\n=== Summary ===\n";
echo "Emails sent: {$emailsSent}\n";
echo "Status updated: {$statusUpdated}\n";
echo "Finished at: " . date('Y-m-d H:i:s') . "\n";





