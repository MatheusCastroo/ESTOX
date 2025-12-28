<?php
/**
 * Pagar.me Integration Class
 * Handles payment processing and webhook validation
 */

class Pagarme {
    private $apiKey;
    private $encryptionKey;
    private $baseUrl;
    
    public function __construct() {
        $this->apiKey = getenv('PAGARME_API_KEY') ?: '';
        $this->encryptionKey = getenv('PAGARME_ENCRYPTION_KEY') ?: '';
        $this->baseUrl = getenv('PAGARME_ENV') === 'production' 
            ? 'https://api.pagar.me/1' 
            : 'https://api.pagar.me/1'; // Sandbox usa mesma URL, muda a API key
    }
    
    /**
     * Create a transaction/checkout
     */
    public function createTransaction($data) {
        $payload = [
            'amount' => $data['amount'], // em centavos
            'payment_method' => $data['payment_method'] ?? 'credit_card',
            'customer' => [
                'name' => $data['customer']['name'],
                'email' => $data['customer']['email'],
                'document_number' => $data['customer']['document_number'] ?? '',
                'phone' => [
                    'ddd' => substr($data['customer']['phone'] ?? '', 0, 2),
                    'number' => substr($data['customer']['phone'] ?? '', 2)
                ]
            ],
            'items' => $data['items'] ?? [],
            'postback_url' => $data['postback_url'],
            'metadata' => $data['metadata'] ?? []
        ];
        
        // Adicionar dados do cartão se for crédito
        if ($data['payment_method'] === 'credit_card' && isset($data['card'])) {
            $payload['card_hash'] = $data['card']['hash'] ?? '';
            $payload['installments'] = $data['installments'] ?? 1;
        }
        
        return $this->makeRequest('POST', '/transactions', $payload);
    }
    
    /**
     * Get transaction by ID
     */
    public function getTransaction($transactionId) {
        return $this->makeRequest('GET', "/transactions/{$transactionId}");
    }
    
    /**
     * Validate webhook signature
     */
    public function validateWebhook($payload, $signature) {
        $expectedSignature = hash_hmac('sha256', json_encode($payload), $this->encryptionKey);
        return hash_equals($expectedSignature, $signature);
    }
    
    /**
     * Make HTTP request to Pagar.me API
     */
    private function makeRequest($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode($this->apiKey . ':')
        ]);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            return json_decode($response, true);
        }
        
        throw new Exception("Pagar.me API Error: " . $response);
    }
}



