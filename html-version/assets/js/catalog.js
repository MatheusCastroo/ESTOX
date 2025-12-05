// Catalog JavaScript - REQ-FR-020
// Landing Page Pública para Catálogo de Veículos

const API_URL = 'http://localhost/ESTOX/api'; // Change to your API URL

// Get store slug from URL parameter (REQ-FR-020: store_slug)
const urlParams = new URLSearchParams(window.location.search);
const storeSlug = urlParams.get('store_slug') || urlParams.get('slug') || null;

document.addEventListener('DOMContentLoaded', function() {
    if (!storeSlug) {
        showError('Parâmetro store_slug é obrigatório na URL. Exemplo: catalogo.html?store_slug=nome-da-loja');
        return;
    }
    
    loadStoreInfo();
    loadVehicles();
    
    // Filter events
    document.getElementById('searchInput').addEventListener('input', debounce(loadVehicles, 500));
    document.getElementById('brandFilter').addEventListener('change', loadVehicles);
    document.getElementById('minYear').addEventListener('input', debounce(loadVehicles, 500));
    document.getElementById('maxYear').addEventListener('input', debounce(loadVehicles, 500));
    document.getElementById('maxPrice').addEventListener('input', debounce(loadVehicles, 500));
});

// Load store information (REQ-FR-020: Exibir informações da loja)
async function loadStoreInfo() {
    try {
        const response = await fetch(`${API_URL}/vehicles?public=true&store_slug=${storeSlug}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.store) {
            const store = data.data.store;
            displayStoreInfo(store);
        } else {
            // REQ-FR-020: Mensagem quando loja não encontrada
            showStoreNotFound();
        }
    } catch (error) {
        console.error('Error loading store info:', error);
        showStoreNotFound();
    }
}

// Display store information (REQ-FR-020: nome, telefone, endereço, logotipo)
function displayStoreInfo(store) {
    // REQ-FR-020: Nome da loja
    document.getElementById('storeName').textContent = store.name || 'Nome da Loja';
    
    // REQ-FR-020: Logotipo quando houver
    const storeLogo = document.getElementById('storeLogo');
    if (store.logo_url) {
        storeLogo.src = store.logo_url;
        storeLogo.alt = store.name;
        storeLogo.classList.remove('d-none');
        storeLogo.onerror = function() {
            this.classList.add('d-none');
        };
    }
    
    // REQ-FR-020: Descrição
    const descriptionEl = document.getElementById('storeDescription');
    if (store.description) {
        descriptionEl.textContent = store.description;
    } else {
        descriptionEl.textContent = 'Catálogo de veículos';
    }
    
    // REQ-FR-020: Telefone
    const storePhone = document.getElementById('storePhone');
    const storePhoneNumber = document.getElementById('storePhoneNumber');
    if (store.phone) {
        storePhoneNumber.textContent = store.phone;
        storePhone.classList.remove('d-none');
    }
    
    // REQ-FR-020: Endereço
    const storeAddress = document.getElementById('storeAddress');
    const storeAddressText = document.getElementById('storeAddressText');
    const addressParts = [];
    if (store.address) addressParts.push(store.address);
    if (store.city) addressParts.push(store.city);
    if (store.state) addressParts.push(store.state);
    
    if (addressParts.length > 0) {
        storeAddressText.textContent = addressParts.join(', ');
        storeAddress.classList.remove('d-none');
    }
    
    // REQ-FR-020: Botão WhatsApp - https://wa.me/55{telefone}
    const whatsappBtn = document.getElementById('whatsappBtn');
    if (store.whatsapp) {
        // Remove caracteres não numéricos
        let phone = store.whatsapp.replace(/\D/g, '');
        // Adiciona código do país se não tiver
        if (!phone.startsWith('55')) {
            phone = '55' + phone;
        }
        
        const message = encodeURIComponent(`Olá ${store.name}! Gostaria de mais informações sobre os veículos.`);
        whatsappBtn.href = `https://wa.me/${phone}?text=${message}`;
        whatsappBtn.classList.remove('d-none');
    } else {
        whatsappBtn.classList.add('d-none');
    }
    
    // Update page title
    document.title = `${store.name} - Catálogo de Veículos`;
}

// Show store not found error (REQ-FR-020: Mensagem clara quando loja não encontrada)
function showStoreNotFound() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="row min-vh-100 align-items-center justify-content-center">
            <div class="col-md-6 text-center">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-5">
                        <i class="bi bi-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
                        <h2 class="h4 fw-bold mt-4 mb-2">Loja não encontrada</h2>
                        <p class="text-muted mb-4">
                            A loja solicitada não foi encontrada ou não está mais disponível.
                        </p>
                        <a href="index.html" class="btn btn-primary">
                            <i class="bi bi-house me-2"></i>Voltar ao site
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show error message
function showError(message) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="row min-vh-100 align-items-center justify-content-center">
            <div class="col-md-6 text-center">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-5">
                        <i class="bi bi-exclamation-circle text-danger" style="font-size: 4rem;"></i>
                        <h2 class="h4 fw-bold mt-4 mb-2">Erro</h2>
                        <p class="text-muted mb-4">${message}</p>
                        <a href="index.html" class="btn btn-primary">
                            <i class="bi bi-house me-2"></i>Voltar ao site
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load vehicles (REQ-FR-020: GET /api/vehicles?public=true&store_slug={slug})
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
            if (data.data.vehicles.length === 0) {
                // REQ-FR-020: Mensagem quando não há veículos
                showNoVehicles();
            } else {
                displayVehicles(data.data.vehicles);
                updateBrandFilter(data.data.vehicles);
            }
        } else {
            showNoVehicles();
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Erro ao carregar veículos. Por favor, tente novamente.
                </div>
            </div>
        `;
    }
}

// Show no vehicles message (REQ-FR-020: Nenhum veículo cadastrado ainda)
function showNoVehicles() {
    const grid = document.getElementById('vehiclesGrid');
    grid.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="bi bi-inbox text-muted" style="font-size: 4rem;"></i>
            <h3 class="h5 fw-bold mt-3 mb-2">Nenhum veículo cadastrado ainda</h3>
            <p class="text-muted">Esta loja ainda não possui veículos disponíveis em seu catálogo.</p>
        </div>
    `;
}

// Display vehicles (REQ-FR-020: Exibir todas informações do veículo)
function displayVehicles(vehicles) {
    const grid = document.getElementById('vehiclesGrid');
    
    if (vehicles.length === 0) {
        showNoVehicles();
        return;
    }
    
    grid.innerHTML = vehicles.map(vehicle => {
        // REQ-FR-020: Todas informações do veículo
        const mainImage = vehicle.images && vehicle.images.length > 0 
            ? (Array.isArray(vehicle.images) ? vehicle.images[0] : JSON.parse(vehicle.images)[0])
            : '../public/placeholder.jpg';
        
        // REQ-FR-020: Status (disponível / vendido)
        const statusBadge = vehicle.status === 'available' 
            ? '<span class="badge bg-success position-absolute top-0 end-0 m-2">Disponível</span>'
            : vehicle.status === 'sold'
            ? '<span class="badge bg-danger position-absolute top-0 end-0 m-2">Vendido</span>'
            : '<span class="badge bg-warning position-absolute top-0 end-0 m-2">Reservado</span>';
        
        // Parse features if it's a JSON string
        const features = typeof vehicle.features === 'string' 
            ? JSON.parse(vehicle.features || '[]')
            : (vehicle.features || []);
        
        return `
        <div class="col-md-6 col-lg-4">
            <div class="card vehicle-card h-100 border-0 shadow-sm">
                <div class="position-relative">
                    <img src="${mainImage}" 
                         class="card-img-top" 
                         alt="${vehicle.brand} ${vehicle.model}"
                         style="height: 200px; object-fit: cover;"
                         onerror="this.src='../public/placeholder.jpg'">
                    ${statusBadge}
                </div>
                <div class="card-body d-flex flex-column">
                    <!-- REQ-FR-020: Título, Marca, Modelo -->
                    <h5 class="card-title fw-bold mb-2">${vehicle.brand} ${vehicle.model}</h5>
                    
                    <!-- REQ-FR-020: Ano, Quilometragem -->
                    <p class="text-muted small mb-2">
                        <i class="bi bi-calendar me-1"></i>${vehicle.year}
                        <span class="ms-2"><i class="bi bi-speedometer2 me-1"></i>${formatNumber(vehicle.mileage)} km</span>
                    </p>
                    
                    <!-- REQ-FR-020: Combustível, Câmbio -->
                    <p class="text-muted small mb-3">
                        ${vehicle.fuel ? `<i class="bi bi-fuel-pump me-1"></i>${vehicle.fuel}` : ''}
                        ${vehicle.transmission ? `<span class="ms-2"><i class="bi bi-gear me-1"></i>${vehicle.transmission}</span>` : ''}
                        ${!vehicle.fuel && !vehicle.transmission ? 'N/A' : ''}
                    </p>
                    
                    <!-- REQ-FR-020: Preço -->
                    <h4 class="text-primary fw-bold mb-3">${formatPrice(vehicle.price)}</h4>
                    
                    <!-- REQ-FR-020: Descrição (truncada) -->
                    ${vehicle.description ? `
                        <p class="text-muted small mb-3" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${vehicle.description}
                        </p>
                    ` : ''}
                    
                    <div class="mt-auto">
                        <a href="veiculo-detalhe.html?store_slug=${storeSlug}&vehicle_id=${vehicle.id}" 
                           class="btn btn-primary w-100">
                            <i class="bi bi-eye me-2"></i>Ver Detalhes
                        </a>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
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

// Format price (REQ-FR-020: Formato brasileiro)
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

// Format number
function formatNumber(number) {
    return new Intl.NumberFormat('pt-BR').format(number);
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
