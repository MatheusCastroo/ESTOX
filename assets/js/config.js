// Global Configuration
// This file should be included first in all HTML pages

// Auto-detect environment (Production on Hostinger vs Development on localhost)
(function() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const origin = window.location.origin;
    
    // Check if running on Hostinger or production domain
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
        // Production (Hostinger) - detecta automaticamente o domÃ­nio
        // Usa index.php para nÃ£o depender de rewrite do .htaccess (Hostinger Ã s vezes ignora)
        window.API_URL = origin + '/api/index.php';
    } else {
        // Development (Localhost)
        // Mantém compatibilidade local sem depender de rewrite
        window.API_URL = 'http://localhost/ESTOX/api/index.php';
    }
})();

// Make it available globally
const API_URL = window.API_URL;

// Log for debugging (remove in production if desired)
console.log('API_URL configurada:', API_URL);

/**
 * Build API URL correctly
 * Ensures the URL is in the format: http://localhost/ESTOX/api/index.php/endpoint
 * This function should be used for all API calls to ensure correct URL construction
 */
function buildApiUrl(endpoint) {
    let apiBase = API_URL;
    
    // Remove trailing slash if present
    apiBase = apiBase.replace(/\/$/, '');
    
    // Ensure it ends with /index.php
    if (!apiBase.endsWith('/index.php')) {
        // If it ends with /api, add /index.php
        if (apiBase.endsWith('/api')) {
            apiBase = apiBase + '/index.php';
        } else {
            // Otherwise, assume we need to add /index.php
            apiBase = apiBase + '/index.php';
        }
    }
    
    // Add endpoint (remove leading slash if present)
    endpoint = endpoint.replace(/^\//, '');
    return `${apiBase}/${endpoint}`;
}

// Make buildApiUrl available globally
window.buildApiUrl = buildApiUrl;