<?php
/**
 * Database Configuration
 * Configure your database connection here
 * MySQL Configuration for phpMyAdmin (XAMPP) / Hostinger
 */

// Helper function to get env variable with multiple fallbacks
function getEnvVar($key, $default = '') {
    // Try getenv() first
    $value = getenv($key);
    if ($value !== false && $value !== '') {
        return $value;
    }
    
    // Try $_ENV superglobal
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return $_ENV[$key];
    }
    
    // Try $_SERVER (some servers populate this)
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return $_SERVER[$key];
    }
    
    return $default;
}

return [
    'host' => getEnvVar('DB_HOST', 'localhost'),
    'port' => getEnvVar('DB_PORT', '3306'),
    'database' => getEnvVar('DB_NAME', 'estox'),
    'username' => getEnvVar('DB_USER', 'root'),
    'password' => getEnvVar('DB_PASSWORD', ''),
    'charset' => 'utf8mb4',
];



