<?php
/**
 * Load environment variables from .env file
 * Simple .env file loader
 */

function loadEnv($path) {
    if (!file_exists($path)) {
        return false;
    }
    
    if (!is_readable($path)) {
        error_log("Warning: .env file exists but is not readable: $path");
        return false;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $loaded = false;
    
    foreach ($lines as $lineNum => $line) {
        $line = trim($line);
        
        // Skip empty lines and comments
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        
        // Parse KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            if (preg_match('/^"(.*)"$/', $value, $matches)) {
                $value = $matches[1];
            } elseif (preg_match("/^'(.*)'$/", $value, $matches)) {
                $value = $matches[1];
            }
            
            // Always set in $_ENV (more reliable than putenv)
            $_ENV[$key] = $value;
            
            // Also try putenv (for getenv compatibility)
            if (!getenv($key)) {
                putenv("$key=$value");
            }
            
            $loaded = true;
        }
    }
    
    return $loaded;
}

// Try multiple possible locations for .env file
$envPaths = [
    __DIR__ . '/../.env',           // api/.env
    __DIR__ . '/../../.env',        // root/.env
    dirname(__DIR__) . '/.env',     // Alternative path
];

$envLoaded = false;
foreach ($envPaths as $envPath) {
    if (loadEnv($envPath)) {
        $envLoaded = true;
        // Don't break, try to load from all locations (last one wins)
    }
}

// If no .env found, log warning (only in development)
if (!$envLoaded && (getenv('APP_ENV') !== 'production')) {
    error_log("Warning: No .env file found. Tried: " . implode(', ', $envPaths));
}



