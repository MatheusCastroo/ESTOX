// Global Configuration
// This file should be included first in all HTML pages

// Auto-detect environment (Production on Hostinger vs Development on localhost)
(function() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Check if running on Hostinger or production domain
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
        // Production (Hostinger) - detecta automaticamente o domínio
        window.API_URL = protocol + '//' + hostname + '/api';
    } else {
        // Development (Localhost)
        window.API_URL = 'http://localhost/ESTOX/api';
    }
})();

// Make it available globally
const API_URL = window.API_URL;

// Log for debugging (remove in production if desired)
console.log('API_URL configurada:', API_URL);

