// Dashboard JavaScript

const API_URL = 'http://localhost/ESTOX/api'; // Change to your API URL

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadDashboardStats();
    loadRecentVehicles();
    loadRecentLeads();
});

// Get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard?action=stats`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            document.getElementById('totalVehicles').textContent = data.data.total_vehicles || 0;
            document.getElementById('availableVehicles').textContent = data.data.available_vehicles || 0;
            document.getElementById('totalViews').textContent = data.data.total_views || 0;
            document.getElementById('totalLeads').textContent = data.data.total_leads || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load recent vehicles
async function loadRecentVehicles() {
    try {
        const response = await fetch(`${API_URL}/vehicles?limit=5`, {
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

// Load recent leads
async function loadRecentLeads() {
    try {
        const response = await fetch(`${API_URL}/leads?limit=4`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        const container = document.getElementById('recentLeads');
        
        if (data.success && data.data && data.data.leads) {
            if (data.data.leads.length === 0) {
                container.innerHTML = '<p class="text-muted text-center py-4">Nenhum lead ainda</p>';
                return;
            }
            
            container.innerHTML = data.data.leads.map(lead => `
                <div class="list-group-item border-0 px-0">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${lead.name}</h6>
                            <p class="text-muted small mb-0">${lead.phone || lead.email || 'Sem contato'}</p>
                        </div>
                        <span class="badge bg-${getLeadStatusColor(lead.status)}">${lead.status}</span>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-muted text-center py-4">Erro ao carregar leads</p>';
        }
    } catch (error) {
        console.error('Error loading leads:', error);
        document.getElementById('recentLeads').innerHTML = '<p class="text-muted text-center py-4">Erro ao carregar leads</p>';
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

function getLeadStatusColor(status) {
    const colors = {
        'new': 'primary',
        'contacted': 'info',
        'negotiating': 'warning',
        'converted': 'success',
        'lost': 'danger'
    };
    return colors[status] || 'secondary';
}



