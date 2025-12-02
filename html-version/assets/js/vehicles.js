// Vehicles JavaScript

const API_URL = 'http://localhost/api';

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadVehicles();
    
    // Filter events
    document.getElementById('searchInput').addEventListener('input', debounce(loadVehicles, 500));
    document.getElementById('statusFilter').addEventListener('change', loadVehicles);
});

function getAuthToken() {
    return localStorage.getItem('token');
}

async function loadVehicles() {
    const tbody = document.getElementById('vehiclesTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></td></tr>';
    
    try {
        const search = document.getElementById('searchInput').value;
        const status = document.getElementById('statusFilter').value;
        
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status !== 'all') params.append('status', status);
        
        const response = await fetch(`${API_URL}/vehicles?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.vehicles) {
            displayVehicles(data.data.vehicles);
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">Nenhum veículo encontrado</td></tr>';
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-danger">Erro ao carregar veículos</td></tr>';
    }
}

function displayVehicles(vehicles) {
    const tbody = document.getElementById('vehiclesTableBody');
    
    if (vehicles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">Nenhum veículo encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = vehicles.map(vehicle => {
        const statusColors = {
            'available': 'success',
            'reserved': 'warning',
            'sold': 'secondary'
        };
        
        const statusLabels = {
            'available': 'Disponível',
            'reserved': 'Reservado',
            'sold': 'Vendido'
        };
        
        const image = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : 'assets/images/placeholder.jpg';
        
        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <img src="${image}" alt="${vehicle.model}" class="rounded" style="width: 64px; height: 48px; object-fit: cover;">
                        <div>
                            <p class="fw-medium mb-0">${vehicle.model}</p>
                            <p class="text-muted small mb-0">${vehicle.brand}</p>
                        </div>
                    </div>
                </td>
                <td>${vehicle.year}</td>
                <td>${vehicle.mileage.toLocaleString('pt-BR')} km</td>
                <td class="fw-semibold text-primary">${formatPrice(vehicle.price)}</td>
                <td>
                    <span class="badge bg-${statusColors[vehicle.status]}">${statusLabels[vehicle.status]}</span>
                </td>
                <td class="text-end">
                    <div class="btn-group">
                        <a href="veiculo-editar.html?id=${vehicle.id}" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-pencil"></i>
                        </a>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteVehicle('${vehicle.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function deleteVehicle(id) {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;
    
    try {
        const response = await fetch(`${API_URL}/vehicles?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadVehicles();
        } else {
            alert(data.error || 'Erro ao excluir veículo');
        }
    } catch (error) {
        alert('Erro ao excluir veículo');
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}



