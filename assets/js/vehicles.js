// Vehicles JavaScript
// API_URL is defined in config.js

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
        
        // Parse images if it's a JSON string
        let images = [];
        if (vehicle.images) {
            if (typeof vehicle.images === 'string') {
                try {
                    images = JSON.parse(vehicle.images);
                } catch (e) {
                    console.error('Error parsing images JSON:', e);
                    images = [];
                }
            } else if (Array.isArray(vehicle.images)) {
                images = vehicle.images;
            }
        }
        
        // Get first image or use placeholder
        const image = images.length > 0 ? images[0] : 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2764%27 height=%2748%27%3E%3Crect fill=%27%23ddd%27 width=%2764%27 height=%2748%27/%3E%3Ctext fill=%27%23999%27 font-family=%27sans-serif%27 font-size=%2710%27 dy=%2710.5%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ESem imagem%3C/text%3E%3C/svg%3E';
        
        return `
            <tr>
                <td data-label="Veículo">
                    <div class="d-flex align-items-center gap-3">
                        <img src="${image}" alt="${vehicle.model}" class="rounded" style="width: 64px; height: 48px; object-fit: cover;" loading="lazy">
                        <div>
                            <p class="fw-medium mb-0">${vehicle.model}</p>
                            <p class="text-muted small mb-0">${vehicle.brand}</p>
                        </div>
                    </div>
                </td>
                <td data-label="Ano">${vehicle.year}</td>
                <td data-label="Quilometragem">${vehicle.mileage.toLocaleString('pt-BR')} km</td>
                <td data-label="Preço" class="fw-semibold text-primary">${formatPrice(vehicle.price)}</td>
                <td data-label="Status">
                    <span class="badge bg-${statusColors[vehicle.status]}">${statusLabels[vehicle.status]}</span>
                </td>
                <td data-label="Ações" class="text-end">
                    <div class="btn-group">
                        <a href="veiculo-editar.html?id=${vehicle.id}" class="btn btn-sm btn-outline-primary" style="min-width: 44px; min-height: 44px;">
                            <i class="bi bi-pencil"></i>
                        </a>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteVehicle('${vehicle.id}')" style="min-width: 44px; min-height: 44px;">
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
            Toast.success('Veículo excluído com sucesso!');
            loadVehicles();
        } else {
            Toast.error(data.error || 'Erro ao excluir veículo');
        }
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        Toast.error('Erro ao excluir veículo. Tente novamente.');
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



