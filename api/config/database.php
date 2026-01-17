<?php
/**
 * Database Configuration
 * Configure your database connection here
 * MySQL Configuration for phpMyAdmin (XAMPP) / Hostinger
 * 
 * Auto-detects environment: localhost (development) vs Hostinger (production)
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

// Detect if running on localhost or production (Hostinger)
function isLocalhost() {
    // Check HTTP_HOST first (most reliable)
    $hostname = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
    
    // Also check SERVER_ADDR for additional detection
    $serverAddr = $_SERVER['SERVER_ADDR'] ?? '';
    
    // If HTTP_HOST contains a domain (not localhost), it's production
    if ($hostname !== 'localhost' && 
        $hostname !== '127.0.0.1' && 
        strpos($hostname, '192.168.') !== 0 &&
        strpos($hostname, 'localhost') === false &&
        strpos($hostname, '.') !== false) {
        return false; // Production (Hostinger)
    }
    
    // If SERVER_ADDR is localhost IP, it's development
    if ($serverAddr === '127.0.0.1' || $serverAddr === '::1') {
        return true; // Development
    }
    
    // Default: if hostname is localhost or similar, it's development
    return (
        $hostname === 'localhost' || 
        $hostname === '127.0.0.1' || 
        strpos($hostname, '192.168.') === 0 ||
        strpos($hostname, 'localhost') !== false
    );
}

// Default credentials based on environment
$isLocal = isLocalhost();

// Production (Hostinger) defaults
$defaultHost = $isLocal ? 'localhost' : 'localhost'; // Hostinger uses localhost for DB
$defaultPort = '3306';
$defaultDatabase = $isLocal ? 'estocx' : 'u193499788_estocx';
$defaultUsername = $isLocal ? 'root' : 'u193499788_estocx';
$defaultPassword = $isLocal ? '' : 'Estocx1522023!';

// Get values from .env or use defaults
$dbHost = getEnvVar('DB_HOST', $defaultHost);
$dbPort = getEnvVar('DB_PORT', $defaultPort);
$dbName = getEnvVar('DB_NAME', $defaultDatabase);
$dbUser = getEnvVar('DB_USER', $defaultUsername);
$dbPass = getEnvVar('DB_PASSWORD', $defaultPassword);

// If in production and using old credentials, override with new ones
if (!$isLocal) {
    // Check if using old credentials and override
    $oldCredentials = [
        'u507824066_estox',
        'u507824066_estox_user',
        'Estox7204.'
    ];
    
    if (in_array($dbName, $oldCredentials) || 
        in_array($dbUser, $oldCredentials) || 
        in_array($dbPass, $oldCredentials) ||
        strpos($dbUser, 'u507824066') !== false) {
        // Force new credentials
        $dbName = 'u193499788_estocx';
        $dbUser = 'u193499788_estocx';
        $dbPass = 'Estocx1522023!';
    }
}

return [
    'host' => $dbHost,
    'port' => $dbPort,
    'database' => $dbName,
    'username' => $dbUser,
    'password' => $dbPass,
    'charset' => 'utf8mb4',
];



