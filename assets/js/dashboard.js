// Dashboard JavaScript
// API_URL and buildApiUrl are defined in config.js
// Ensure buildApiUrl is available (fallback if config.js didn't load)
if (typeof window.buildApiUrl !== 'function') {
    window.buildApiUrl = function(endpoint) {
        const apiBase = (window.API_URL || 'http://localhost/ESTOX/api/index.php').replace(/\/$/, '');
        const base = apiBase.endsWith('/index.php') ? apiBase : apiBase + '/index.php';
        return `${base}/${endpoint.replace(/^\//, '')}`;
    };
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadDashboardStats();
    loadRecentVehicles();
});

// Get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch(window.buildApiUrl('dashboard?action=stats'), {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            document.getElementById('totalVehicles').textContent = data.data.total_vehicles || 0;
            document.getElementById('availableVehicles').textContent = data.data.available_vehicles || 0;
            document.getElementById('totalViews').textContent = data.data.total_views || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load recent vehicles
async function loadRecentVehicles() {
    try {
        const url = window.buildApiUrl('vehicles?limit=5');
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        const container = document.getElementById('recentVehicles');
        
        if (data.success && data.data && data.data.vehicles) {
            if (data.data.vehicles.length === 0) {
                container.innerHTML = '<p class="text-muted text-center py-4">Nenhum veículo cadastrado ainda</p>';
                return;
            }
            
            container.innerHTML = data.data.vehicles.map(vehicle => `
                <div class="list-group-item border-0 px-0">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${vehicle.brand} ${vehicle.model}</h6>
                            <p class="text-muted small mb-0">${vehicle.year} • ${formatPrice(vehicle.price)}</p>
                        </div>
                        <span class="badge bg-${getStatusColor(vehicle.status)}">${vehicle.status}</span>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-muted text-center py-4">Erro ao carregar veículos</p>';
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
        document.getElementById('recentVehicles').innerHTML = '<p class="text-muted text-center py-4">Erro ao carregar veículos</p>';
    }
}

// Helper functions
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

function getStatusColor(status) {
    const colors = {
        'available': 'success',
        'reserved': 'warning',
        'sold': 'secondary'
    };
    return colors[status] || 'secondary';
}




