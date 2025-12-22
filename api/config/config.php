<?php
/**
 * Application Configuration
 */

return [
    'app_name' => 'ESTOX API',
    'app_version' => '1.0.0',
    'timezone' => 'America/Sao_Paulo',
    'jwt_secret' => getenv('JWT_SECRET') ?: 'your-secret-key-change-this-in-production',
    'jwt_expiration' => 86400, // 24 hours in seconds
    'cors_origins' => getenv('CORS_ORIGINS') ? array_map('trim', explode(',', getenv('CORS_ORIGINS'))) : [
        'http://localhost:8080', 
        'http://localhost:3000',
        'https://nerdparadise.com.br',
        'https://www.nerdparadise.com.br'
    ],
];
