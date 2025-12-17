<?php
/**
 * Store Router - Handles /{store_slug} routing
 * This file should be placed in the root directory
 * Configure your web server to use this as the index file for store routes
 */

// Get the requested path
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

// Remove query string
$requestUri = strtok($requestUri, '?');

// Remove base path
$basePath = dirname($scriptName);
if ($basePath !== '/' && $basePath !== '\\') {
    if (strpos($requestUri, $basePath) === 0) {
        $requestUri = substr($requestUri, strlen($basePath));
    }
}

// Remove leading slash
$requestUri = ltrim($requestUri, '/');

// Split path into segments
$pathSegments = explode('/', $requestUri);

// Get store_slug (first segment)
$storeSlug = $pathSegments[0] ?? null;

// Get vehicle_id if second segment is 'veiculo'
$vehicleId = null;
if (isset($pathSegments[1]) && $pathSegments[1] === 'veiculo' && isset($pathSegments[2])) {
    $vehicleId = $pathSegments[2];
}

// Validate store_slug format (alphanumeric and hyphens only)
if ($storeSlug && preg_match('/^[a-z0-9-]+$/', $storeSlug)) {
    // Route to landing page
    if ($vehicleId) {
        // Vehicle detail page
        $_GET['store_slug'] = $storeSlug;
        $_GET['vehicle_id'] = $vehicleId;
        require __DIR__ . '/html-version/veiculo-detalhe.html';
    } else {
        // Store landing page
        $_GET['store_slug'] = $storeSlug;
        require __DIR__ . '/html-version/loja.html';
    }
} else {
    // Invalid slug or root - redirect to main site
    header('Location: /ESTOX/html-version/index.html');
    exit;
}

