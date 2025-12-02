// Catalog JavaScript

const API_URL = 'http://localhost/api'; // Change to your API URL

// Get store slug from URL (you can pass it as query parameter)
const urlParams = new URLSearchParams(window.location.search);
const storeSlug = urlParams.get('slug') || 'demo'; // Default to 'demo' for testing

document.addEventListener('DOMContentLoaded', function() {
    loadStoreInfo();
    loadVehicles();
    
    // Filter events
    document.getElementById('searchInput').addEventListener('input', debounce(loadVehicles, 500));
    document.getElementById('brandFilter').addEventListener('change', loadVehicles);
    document.getElementById('minYear').addEventListener('input', debounce(loadVehicles, 500));
    document.getElementById('maxYear').addEventListener('input', debounce(loadVehicles, 500));
    document.getElementById('maxPrice').addEventListener('input', debounce(loadVehicles, 500));
});

// Load store information
async function loadStoreInfo() {
    try {
        const response = await fetch(`${API_URL}/vehicles?public=true&store_slug=${storeSlug}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.store) {
            const store = data.data.store;
            document.getElementById('storeName').textContent = store.name;
            document.getElementById('storeDescription').textContent = store.description || 'Catálogo de veículos';
            
            if (store.whatsapp) {
                const whatsappBtn = document.getElementById('whatsappBtn');
                whatsappBtn.href = `https://wa.me/${store.whatsapp.replace(/\D/g, '')}`;
                whatsappBtn.style.display = 'inline-block';
            }
        }
    } catch (error) {
        console.error('Error loading store info:', error);
    }
}

// Load vehicles
async function loadVehicles() {
    const grid = document.getElementById('vehiclesGrid');
    grid.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
    
    try {
        const filters = {
            public: 'true',
            store_slug: storeSlug
        };
        
        const search = document.getElementById('searchInput').value;
        if (search) filters.search = search;
        
        const brand = document.getElementById('brandFilter').value;
        if (brand) filters.brand = brand;
        
        const minYear = document.getElementById('minYear').value;
        if (minYear) filters.min_year = minYear;
        
        const maxYear = document.getElementById('maxYear').value;
        if (maxYear) filters.max_year = maxYear;
        
        const maxPrice = document.getElementById('maxPrice').value;
        if (maxPrice) filters.max_price = maxPrice;
        
        const queryString = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/vehicles?${queryString}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.vehicles) {
            displayVehicles(data.data.vehicles);
            updateBrandFilter(data.data.vehicles);
        } else {
            grid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">Nenhum veículo encontrado</p></div>';
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
        grid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-danger">Erro ao carregar veículos</p></div>';
    }
}

// Display vehicles
function displayVehicles(vehicles) {
    const grid = document.getElementById('vehiclesGrid');
    
    if (vehicles.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">Nenhum veículo encontrado</p></div>';
        return;
    }
    
    grid.innerHTML = vehicles.map(vehicle => `
        <div class="col-md-6 col-lg-4">
            <div class="card vehicle-card h-100 border-0 shadow-sm">
                <div class="position-relative">
                    <img src="${vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : 'assets/images/placeholder.jpg'}" 
                         class="card-img-top" 
                         alt="${vehicle.brand} ${vehicle.model}"
                         style="height: 200px; object-fit: cover;">
                    <span class="badge bg-success position-absolute top-0 end-0 m-2">Disponível</span>
                </div>
                <div class="card-body">
                    <h5 class="card-title fw-bold">${vehicle.brand} ${vehicle.model}</h5>
                    <p class="text-muted small mb-2">${vehicle.year} • ${vehicle.mileage.toLocaleString('pt-BR')} km</p>
                    <p class="text-muted small mb-3">${vehicle.fuel || 'N/A'} • ${vehicle.transmission || 'N/A'}</p>
                    <h4 class="text-primary fw-bold mb-3">${formatPrice(vehicle.price)}</h4>
                    <a href="veiculo-detalhe.html?slug=${storeSlug}&id=${vehicle.id}" class="btn btn-primary w-100">
                        Ver Detalhes
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Update brand filter options
function updateBrandFilter(vehicles) {
    const brands = [...new Set(vehicles.map(v => v.brand))].sort();
    const brandFilter = document.getElementById('brandFilter');
    const currentValue = brandFilter.value;
    
    brandFilter.innerHTML = '<option value="">Todas as marcas</option>' + 
        brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
    
    if (currentValue) {
        brandFilter.value = currentValue;
    }
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

// Debounce function
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



