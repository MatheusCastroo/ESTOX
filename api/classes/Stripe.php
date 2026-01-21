<?php
/**
 * Stripe Integration Class
 * Handles payment processing, checkout creation, and webhook validation
 */

class Stripe {
    private $secretKey;
    private $publishableKey;
    private $webhookSecret;
    private $baseUrl;
    
    public function __construct() {
        $this->secretKey = getenv('STRIPE_SECRET_KEY') ?: '';
        $this->publishableKey = getenv('STRIPE_PUBLISHABLE_KEY') ?: '';
        $this->webhookSecret = getenv('STRIPE_WEBHOOK_SECRET') ?: '';
        $this->baseUrl = 'https://api.stripe.com/v1';
        
        if (empty($this->secretKey)) {
            throw new Exception('STRIPE_SECRET_KEY não configurado');
        }
    }
    
    /**
     * Create a Checkout Session
     * 
     * @param array $data Payment data
     * @return array Stripe checkout session
     */
    public function createCheckoutSession($data) {
        $payload = [
            'mode' => 'payment', // One-time payment (not subscription)
            'success_url' => $data['success_url'],
            'cancel_url' => $data['cancel_url'],
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => 'brl',
                        'product_data' => [
                            'name' => $data['product_name'],
                            'description' => $data['product_description'] ?? ''
                        ],
                        'unit_amount' => (int)($data['amount'] * 100) // Convert to cents
                    ],
                    'quantity' => 1
                ]
            ],
            'metadata' => $data['metadata'] ?? [],
            'customer_email' => $data['customer_email'] ?? null,
            'client_reference_id' => $data['client_reference_id'] ?? null
        ];
        
        // Add customer email if provided
        if (isset($data['customer_email'])) {
            $payload['customer_email'] = $data['customer_email'];
        }
        
        return $this->makeRequest('POST', '/checkout/sessions', $payload);
    }
    
    /**
     * Get Checkout Session by ID
     * 
     * @param string $sessionId Checkout session ID
     * @return array Session data
     */
    public function getCheckoutSession($sessionId) {
        return $this->makeRequest('GET', "/checkout/sessions/{$sessionId}");
    }
    
    /**
     * Get Payment Intent by ID
     * 
     * @param string $paymentIntentId Payment Intent ID
     * @return array Payment Intent data
     */
    public function getPaymentIntent($paymentIntentId) {
        return $this->makeRequest('GET', "/payment_intents/{$paymentIntentId}");
    }
    
    /**
     * Validate webhook signature
     * 
     * @param string $payload Raw request body
     * @param string $signature Stripe signature from header
     * @return bool True if valid
     */
    public function validateWebhook($payload, $signature) {
        if (empty($this->webhookSecret) || empty($signature)) {
            return false;
        }
        
        try {
            // Extract timestamp and signatures from header
            $elements = explode(',', $signature);
            $timestamp = null;
            $signatures = [];
            
            foreach ($elements as $element) {
                $parts = explode('=', $element, 2);
                if (count($parts) === 2) {
                    if ($parts[0] === 't') {
                        $timestamp = $parts[1];
                    } elseif ($parts[0] === 'v1') {
                        $signatures[] = $parts[1];
                    }
                }
            }
            
            // Check timestamp (should be recent)
            if ($timestamp && abs(time() - (int)$timestamp) > 300) { // 5 minutes tolerance
                return false;
            }
            
            // Compute expected signature
            $signedPayload = $timestamp . '.' . $payload;
            $expectedSignature = hash_hmac('sha256', $signedPayload, $this->webhookSecret);
            
            // Compare signatures
            foreach ($signatures as $signature) {
                if (hash_equals($expectedSignature, $signature)) {
                    return true;
                }
            }
            
            return false;
        } catch (Exception $e) {
            error_log('Stripe webhook validation error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Make HTTP request to Stripe API
     * 
     * @param string $method HTTP method
     * @param string $endpoint API endpoint
     * @param array $data Request data
     * @return array Response data
     * @throws Exception
     */
    private function makeRequest($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        // Handle GET requests with query parameters
        if ($method === 'GET' && $data && strpos($endpoint, '?') === false) {
            $url .= '?' . http_build_query($data);
            $data = null;
        }
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded',
            'Authorization: Bearer ' . $this->secretKey
        ]);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            // Stripe API uses form-encoded data
            if ($data) {
                $postData = $this->buildFormData($data);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            }
        } elseif ($method === 'GET') {
            curl_setopt($ch, CURLOPT_HTTPGET, true);
        } elseif ($method === 'DELETE') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new Exception("Stripe API Error: " . $error);
        }
        
        $responseData = json_decode($response, true);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            return $responseData;
        }
        
        $errorMessage = isset($responseData['error']['message']) 
            ? $responseData['error']['message'] 
            : 'Unknown error';
        
        throw new Exception("Stripe API Error (HTTP {$httpCode}): " . $errorMessage);
    }
    
    
    /**
     * Build form-encoded data for Stripe API
     * Stripe API uses application/x-www-form-urlencoded format
     * 
     * @param array $data Data array
     * @return string Form-encoded string
     */
    private function buildFormData($data) {
        if (!$data) {
            return '';
        }
        
        $formData = [];
        
        foreach ($data as $key => $value) {
            if ($value === null) {
                continue;
            }
            
            if (is_array($value)) {
                // Handle nested arrays
                if (isset($value[0]) && is_array($value[0])) {
                    // Array of arrays (e.g., line_items)
                    foreach ($value as $index => $item) {
                        foreach ($item as $itemKey => $itemValue) {
                            if (is_array($itemValue)) {
                                foreach ($itemValue as $nestedKey => $nestedValue) {
                                    if (is_array($nestedValue)) {
                                        foreach ($nestedValue as $deepKey => $deepValue) {
                                            $formData["{$key}[{$index}][{$itemKey}][{$nestedKey}][{$deepKey}]"] = $deepValue;
                                        }
                                    } else {
                                        $formData["{$key}[{$index}][{$itemKey}][{$nestedKey}]"] = $nestedValue;
                                    }
                                }
                            } else {
                                $formData["{$key}[{$index}][{$itemKey}]"] = $itemValue;
                            }
                        }
                    }
                } else {
                    // Associative array (e.g., metadata)
                    foreach ($value as $metaKey => $metaValue) {
                        $formData["{$key}[{$metaKey}]"] = $metaValue;
                    }
                }
            } else {
                $formData[$key] = $value;
            }
        }
        
        return http_build_query($formData);
    }
    
    /**
     * Create a Subscription Checkout Session
     * Creates a recurring monthly subscription
     * 
     * @param array $data Subscription data
     * @return array Stripe checkout session
     */
    public function createSubscriptionCheckoutSession($data) {
        $payload = [
            'mode' => 'subscription', // Recurring subscription
            'success_url' => $data['success_url'],
            'cancel_url' => $data['cancel_url'],
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => 'brl',
                        'product_data' => [
                            'name' => $data['product_name'],
                            'description' => $data['product_description'] ?? ''
                        ],
                        'recurring' => [
                            'interval' => 'month', // Monthly billing
                            'interval_count' => 1
                        ],
                        'unit_amount' => (int)($data['amount'] * 100) // Convert to cents
                    ],
                    'quantity' => 1
                ]
            ],
            'metadata' => $data['metadata'] ?? [],
            'customer_email' => $data['customer_email'] ?? null,
            'client_reference_id' => $data['client_reference_id'] ?? null,
            'subscription_data' => [
                'metadata' => $data['metadata'] ?? []
            ]
        ];
        
        // Add customer email if provided
        if (isset($data['customer_email'])) {
            $payload['customer_email'] = $data['customer_email'];
        }
        
        return $this->makeRequest('POST', '/checkout/sessions', $payload);
    }
    
    /**
     * Get Subscription by ID
     * 
     * @param string $subscriptionId Stripe subscription ID
     * @return array Subscription data
     */
    public function getSubscription($subscriptionId) {
        return $this->makeRequest('GET', "/subscriptions/{$subscriptionId}");
    }
    
    /**
     * Cancel Subscription at Period End
     * Sets cancel_at_period_end = true so customer keeps access until period ends
     * 
     * @param string $subscriptionId Stripe subscription ID
     * @return array Updated subscription data
     */
    public function cancelSubscriptionAtPeriodEnd($subscriptionId) {
        $payload = [
            'cancel_at_period_end' => true
        ];
        
        return $this->makeRequest('POST', "/subscriptions/{$subscriptionId}", $payload);
    }
    
    /**
     * Resume Subscription (undo cancellation)
     * 
     * @param string $subscriptionId Stripe subscription ID
     * @return array Updated subscription data
     */
    public function resumeSubscription($subscriptionId) {
        $payload = [
            'cancel_at_period_end' => false
        ];
        
        return $this->makeRequest('POST', "/subscriptions/{$subscriptionId}", $payload);
    }
    
    /**
     * List Paid Invoices for a Subscription
     * 
     * @param string $subscriptionId Stripe subscription ID
     * @return array List of paid invoices
     */
    public function listPaidInvoices($subscriptionId) {
        $payload = [
            'subscription' => $subscriptionId,
            'status' => 'paid',
            'limit' => 100
        ];
        
        return $this->makeRequest('GET', '/invoices', $payload);
    }
    
    /**
     * Count Paid Invoices for a Subscription
     * 
     * @param string $subscriptionId Stripe subscription ID
     * @return int Number of paid invoices
     */
    public function countPaidInvoices($subscriptionId) {
        try {
            $invoices = $this->listPaidInvoices($subscriptionId);
            return isset($invoices['data']) ? count($invoices['data']) : 0;
        } catch (Exception $e) {
            error_log('Error counting paid invoices: ' . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get publishable key (for frontend)
     * 
     * @return string Publishable key
     */
    public function getPublishableKey() {
        return $this->publishableKey;
    }
}
