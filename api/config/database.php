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
    $hostname = isset($_SERVER['HTTP_HOST']) ? strtolower($_SERVER['HTTP_HOST']) : '';
    if (empty($hostname)) {
        $hostname = isset($_SERVER['SERVER_NAME']) ? strtolower($_SERVER['SERVER_NAME']) : 'localhost';
    }
    
    // Also check SERVER_ADDR for additional detection
    $serverAddr = isset($_SERVER['SERVER_ADDR']) ? $_SERVER['SERVER_ADDR'] : '';
    
    // Check REMOTE_ADDR (client IP)
    $remoteAddr = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
    
    // If HTTP_HOST contains a domain (not localhost), it's production
    if (!empty($hostname) && 
        $hostname !== 'localhost' && 
        $hostname !== '127.0.0.1' && 
        strpos($hostname, '192.168.') !== 0 &&
        strpos($hostname, 'localhost') === false &&
        strpos($hostname, '.') !== false &&
        !strpos($hostname, '.local') &&
        !strpos($hostname, '.test')) {
        return false; // Production (Hostinger)
    }
    
    // If SERVER_ADDR is localhost IP, it's development
    if ($serverAddr === '127.0.0.1' || $serverAddr === '::1') {
        return true; // Development
    }
    
    // If REMOTE_ADDR is localhost, it's development
    if ($remoteAddr === '127.0.0.1' || $remoteAddr === '::1' || strpos($remoteAddr, '192.168.') === 0) {
        return true; // Development
    }
    
    // Default: if hostname is localhost or similar, it's development
    return (
        empty($hostname) ||
        $hostname === 'localhost' || 
        $hostname === '127.0.0.1' || 
        strpos($hostname, '192.168.') === 0 ||
        strpos($hostname, 'localhost') !== false ||
        strpos($hostname, '.local') !== false ||
        strpos($hostname, '.test') !== false
    );
}

// Default credentials based on environment
$isLocal = isLocalhost();

// Production (Hostinger) defaults
$defaultHost = $isLocal ? 'localhost' : 'localhost'; // Hostinger uses localhost for DB
$defaultPort = '3306';
$defaultDatabase = $isLocal ? 'estox' : 'u193499788_estocx';
$defaultUsername = $isLocal ? 'root' : 'u193499788_estocx';
$defaultPassword = $isLocal ? '' : 'Estocx1522023!';

// Get values from .env or use defaults
$dbHost = getEnvVar('DB_HOST', $defaultHost);
$dbPort = getEnvVar('DB_PORT', $defaultPort);
$dbName = getEnvVar('DB_NAME', $defaultDatabase);
$dbUser = getEnvVar('DB_USER', $defaultUsername);
$dbPass = getEnvVar('DB_PASSWORD', $defaultPassword);

// CRITICAL: Force localhost credentials if running on localhost
// This prevents production credentials from .env being used in development
if ($isLocal) {
    // Override with localhost credentials regardless of .env values
    // FORCE empty password for localhost
    $dbHost = 'localhost';
    $dbPort = '3306';
    $dbName = 'estox';
    $dbUser = 'root';
    $dbPass = ''; // SEMPRE vazio em localhost
    
    // Debug: Log para verificar (remover em produção)
    if (isset($_GET['__debug_db'])) {
        error_log("DB Config (Localhost): Host=$dbHost, User=$dbUser, DB=$dbName, Pass=" . (empty($dbPass) ? 'EMPTY' : 'SET'));
    }
} else {
    // PRODUÇÃO (Hostinger) - Credenciais corretas:
    // Database: u193499788_estocx
    // User: u193499788_estocx
    // Password: Estocx1522023!
    
    // Se detectar credenciais antigas, substituir pelas novas
    $oldCredentials = [
        'u507824066_estox',
        'u507824066_estocx',
        'u507824066_estox_user',
        'Estox7204.'
    ];
    
    $needsUpdate = false;
    if (in_array($dbName, $oldCredentials) || 
        in_array($dbUser, $oldCredentials) || 
        in_array($dbPass, $oldCredentials) ||
        strpos($dbUser, 'u507824066') !== false) {
        $needsUpdate = true;
    }
    
    // Se não tiver credenciais definidas ou usar antigas, usar as corretas da Hostinger
    if ($needsUpdate || empty($dbName) || empty($dbUser) || $dbName === 'estox') {
        $dbHost = 'localhost'; // Hostinger usa localhost para DB
        $dbPort = '3306';
        $dbName = 'u193499788_estocx';
        $dbUser = 'u193499788_estocx';
        $dbPass = 'Estocx1522023!';
    }
    
    // Debug: Log para verificar (remover em produção)
    if (isset($_GET['__debug_db'])) {
        error_log("DB Config (Production): Host=$dbHost, User=$dbUser, DB=$dbName, Pass=" . (empty($dbPass) ? 'EMPTY' : 'SET'));
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



