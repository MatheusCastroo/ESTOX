// Reports JavaScript

const API_URL = 'http://localhost/ESTOX/api';

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadDashboardStats();
    loadTopVehicles();
    loadMonthlyStats();
});

function getAuthToken() {
    return localStorage.getItem('token');
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard?action=stats`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            document.getElementById('totalViews').textContent = data.data.total_views || 0;
            document.getElementById('totalLeads').textContent = data.data.total_leads || 0;
            document.getElementById('conversionRate').textContent = (data.data.conversion_rate || 0) + '%';
            
            const viewsChange = data.data.views_change || 0;
            const leadsChange = data.data.leads_change || 0;
            
            document.getElementById('viewsChange').textContent = 
                (viewsChange >= 0 ? '+' : '') + viewsChange + '% vs mês anterior';
            document.getElementById('leadsChange').textContent = 
                (leadsChange >= 0 ? '+' : '') + leadsChange + '% vs mês anterior';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadTopVehicles() {
    try {
        const response = await fetch(`${API_URL}/dashboard?action=top-vehicles&limit=5`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        const container = document.getElementById('topVehicles');
        
        if (data.success && data.data && data.data.vehicles) {
            if (data.data.vehicles.length === 0) {
                container.innerHTML = '<p class="text-muted text-center py-4">Nenhum dado disponível</p>';
                return;
            }
            
            const maxViews = Math.max(...data.data.vehicles.map(v => v.views || 0));
            
            container.innerHTML = data.data.vehicles.map((vehicle, index) => {
                const percentage = maxViews > 0 ? (vehicle.views / maxViews) * 100 : 0;
                return `
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px;">
                            ${index + 1}
                        </div>
                        <div class="flex-grow-1">
                            <p class="fw-medium mb-0">${vehicle.brand} ${vehicle.model}</p>
                            <small class="text-muted">
                                <i class="bi bi-eye me-1"></i>${vehicle.views || 0} views
                                <i class="bi bi-people ms-2 me-1"></i>${vehicle.leads || 0} leads
                            </small>
                        </div>
                        <div class="bg-primary bg-opacity-10 rounded" style="width: 100px; height: 8px;">
                            <div class="bg-primary h-100 rounded" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading top vehicles:', error);
    }
}

async function loadMonthlyStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard?action=monthly-stats&months=3`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        const container = document.getElementById('monthlyStats');
        
        if (data.success && data.data && data.data.stats) {
            if (data.data.stats.length === 0) {
                container.innerHTML = '<p class="text-muted text-center py-4">Nenhum dado disponível</p>';
                return;
            }
            
            const maxViews = Math.max(...data.data.stats.map(s => s.views || 0));
            const maxLeads = Math.max(...data.data.stats.map(s => s.leads || 0));
            
            container.innerHTML = data.data.stats.map(stat => {
                const viewsPercentage = maxViews > 0 ? (stat.views / maxViews) * 100 : 0;
                const leadsPercentage = maxLeads > 0 ? (stat.leads / maxLeads) * 100 : 0;
                
                return `
                    <div class="mb-4">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="fw-medium">${stat.month} ${stat.year}</span>
                            <span class="text-muted small">${stat.views} views / ${stat.leads} leads</span>
                        </div>
                        <div class="d-flex gap-2">
                            <div class="flex-grow-1 bg-primary bg-opacity-10 rounded" style="height: 12px;">
                                <div class="bg-primary h-100 rounded" style="width: ${viewsPercentage}%"></div>
                            </div>
                            <div class="bg-success bg-opacity-10 rounded" style="width: 80px; height: 12px;">
                                <div class="bg-success h-100 rounded" style="width: ${leadsPercentage}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            container.innerHTML += `
                <div class="d-flex gap-4 mt-4 small">
                    <div class="d-flex align-items-center gap-2">
                        <div class="bg-primary rounded" style="width: 12px; height: 12px;"></div>
                        <span class="text-muted">Visualizações</span>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <div class="bg-success rounded" style="width: 12px; height: 12px;"></div>
                        <span class="text-muted">Leads</span>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading monthly stats:', error);
    }
}



