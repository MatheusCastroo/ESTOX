<?php
/**
 * Appmax Integration Class
 * Handles payment processing and webhook validation
 */

class Appmax {
    private $apiKey;
    private $storeId;
    private $webhookSecret;
    private $baseUrl;
    
    public function __construct() {
        $this->apiKey = getenv('APPMAX_API_KEY') ?: '';
        $this->storeId = getenv('APPMAX_STORE_ID') ?: '';
        $this->webhookSecret = getenv('APPMAX_WEBHOOK_SECRET') ?: '';
        $env = getenv('APPMAX_ENV') ?: 'sandbox';
        $this->baseUrl = $env === 'production' 
            ? 'https://api.appmax.com.br/v1' 
            : 'https://sandbox.appmax.com.br/v1';
    }
    
    /**
     * Create an order/checkout
     */
    public function createOrder($data) {
        $payload = [
            'product_id' => $data['product_id'],
            'price' => $data['price'], // em centavos
            'customer' => [
                'name' => $data['customer']['name'],
                'email' => $data['customer']['email'],
                'phone' => $data['customer']['phone'] ?? '',
                'document_number' => $data['customer']['document_number'] ?? ''
            ],
            'callback_url' => $data['callback_url'],
            'success_url' => $data['success_url'],
            'cancel_url' => $data['cancel_url'],
            'metadata' => $data['metadata'] ?? []
        ];
        
        return $this->makeRequest('POST', '/orders', $payload);
    }
    
    /**
     * Get order by ID
     */
    public function getOrder($orderId) {
        return $this->makeRequest('GET', "/orders/{$orderId}");
    }
    
    /**
     * Validate webhook signature
     */
    public function validateWebhook($payload, $signature) {
        $expectedSignature = hash_hmac('sha256', json_encode($payload), $this->webhookSecret);
        return hash_equals($expectedSignature, $signature);
    }
    
    /**
     * Make HTTP request to Appmax API
     */
    private function makeRequest($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->apiKey,
            'X-Store-Id: ' . $this->storeId
        ]);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new Exception("Appmax API Error: " . $error);
        }
        
        if ($httpCode >= 200 && $httpCode < 300) {
            return json_decode($response, true);
        }
        
        throw new Exception("Appmax API Error (HTTP {$httpCode}): " . $response);
    }
}



