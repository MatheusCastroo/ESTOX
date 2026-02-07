// Global Configuration
// This file should be included first in all HTML pages

// Auto-detect environment (Production on Hostinger vs Development on localhost)
(function() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const origin = window.location.origin;
    
    // Check if running on Hostinger or production domain
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
        // Production (Hostinger) - detecta automaticamente o domínio
        // Usa index.php para não depender de rewrite do .htaccess (Hostinger às vezes ignora)
        window.API_URL = origin + '/api/index.php';
    } else {
        // Development (Localhost)
        // Mantém compatibilidade local sem depender de rewrite
        window.API_URL = 'http://localhost/ESTOCX/api/index.php';
    }
})();

// Make it available globally
const API_URL = window.API_URL;

// Log for debugging (remove in production if desired)
console.log('API_URL configurada:', API_URL);

// #region agent log
try {
    fetch('http://127.0.0.1:7242/ingest/26790cf9-263c-4d19-9e85-a571eedf06cf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'config.js:26',message:'CONFIG LOADED',data:{apiUrl:API_URL,width:window.innerWidth,isMobile:window.innerWidth<=768},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(e=>console.error('Log error:',e));
} catch(e) { console.error('Log setup error:',e); }
// #endregion