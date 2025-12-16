// Veículo JavaScript - REQ-FR-031
// Página Individual do Veículo

// Get parameters from URL
const urlParams = new URLSearchParams(window.location.search);
const storeSlug = urlParams.get('store_slug') || urlParams.get('slug') || null;
const vehicleId = urlParams.get('vehicle_id') || urlParams.get('id') || null;

let storeData = null;
let vehicleData = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!storeSlug) {
        showError('Parâmetro store_slug é obrigatório na URL.');
        return;
    }
    
    if (!vehicleId) {
        showError('Parâmetro vehicle_id é obrigatório na URL.');
        return;
    }
    
    loadVehicleDetail();
});

// Load vehicle detail
async function loadVehicleDetail() {
    const content = document.getElementById('vehicleContent');
    
    try {
        const response = await fetch(`${API_URL}/vehicles?public=true&store_slug=${storeSlug}&vehicle_id=${vehicleId}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.vehicle && data.data.store) {
            storeData = data.data.store;
            vehicleData = data.data.vehicle;
            
            displayVehicleDetail(vehicleData, storeData);
            setupHeader(storeData);
        } else {
            showError('Veículo não encontrado ou não está mais disponível.');
        }
    } catch (error) {
        console.error('Error loading vehicle:', error);
        showError('Erro ao carregar veículo. Por favor, tente novamente.');
    }
}

// Setup header
function setupHeader(store) {
    const storeNameHeader = document.getElementById('storeNameHeader');
    if (storeNameHeader) {
        storeNameHeader.textContent = store.name || 'Loja';
    }
    
    const backLink = document.getElementById('backLink');
    if (backLink) {
        backLink.href = `loja.html?store_slug=${storeSlug}`;
    }
    
    const catalogLink = document.getElementById('catalogLink');
    if (catalogLink) {
        catalogLink.href = `loja.html?store_slug=${storeSlug}#veiculos`;
    }
}

// Display vehicle detail
function displayVehicleDetail(vehicle, store) {
    const content = document.getElementById('vehicleContent');
    
    // Parse JSON fields
    let images = [];
    if (vehicle.images) {
        if (typeof vehicle.images === 'string') {
            try {
                images = JSON.parse(vehicle.images || '[]');
            } catch (e) {
                images = [];
            }
        } else if (Array.isArray(vehicle.images)) {
            images = vehicle.images;
        }
    }
    
    let features = [];
    if (vehicle.features) {
        if (typeof vehicle.features === 'string') {
            try {
                features = JSON.parse(vehicle.features || '[]');
            } catch (e) {
                features = [];
            }
        } else if (Array.isArray(vehicle.features)) {
            features = vehicle.features;
        }
    }
    
    // Status
    const statusInfo = {
        'available': { text: 'Disponível', class: 'bg-success' },
        'sold': { text: 'Vendido', class: 'bg-danger' },
        'reserved': { text: 'Reservado', class: 'bg-warning' }
    };
    const status = statusInfo[vehicle.status] || statusInfo['available'];
    const isSold = vehicle.status === 'sold';
    
    // WhatsApp message - REQ-FR-031: Mensagem automática
    const vehicleName = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
    const whatsappMessage = `Olá! Tenho interesse no veículo ${vehicleName}.`;
    let whatsappUrl = '#';
    
    if (store.whatsapp) {
        whatsappUrl = getWhatsAppUrl(store.whatsapp, whatsappMessage);
        
        // Show float button
        const floatBtn = document.getElementById('whatsappFloat');
        if (floatBtn) {
            floatBtn.href = whatsappUrl;
            floatBtn.classList.remove('d-none');
        }
    } else {
        // Hide float button if no WhatsApp
        const floatBtn = document.getElementById('whatsappFloat');
        if (floatBtn) {
            floatBtn.classList.add('d-none');
        }
    }
    
    // Main image
    const mainImage = images.length > 0 ? images[0] : getPlaceholderImage();
    
    // Update page title
    document.title = `${vehicleName} - ${store.name}`;
    
    content.innerHTML = `
        <div class="col-lg-8">
            <!-- Image Gallery -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="position-relative">
                    <img id="mainVehicleImage" 
                         src="${mainImage}" 
                         alt="${vehicleName}" 
                         class="main-image rounded-top"
                         onerror="this.src='${getPlaceholderImage()}'">
                    ${isSold ? '<div class="sold-badge">VENDIDO</div>' : ''}
                </div>
                ${images.length > 1 ? `
                    <div class="card-body">
                        <h6 class="fw-bold mb-3">Galeria de Fotos</h6>
                        <div class="row g-2" id="imageGallery">
                            ${images.map((img, idx) => `
                                <div class="col-3 col-md-2">
                                    <img src="${img}" 
                                         alt="${vehicleName} - Foto ${idx + 1}" 
                                         class="img-fluid rounded gallery-thumb" 
                                         style="height: 80px; object-fit: cover; cursor: pointer;"
                                         onclick="document.getElementById('mainVehicleImage').src = this.src"
                                         onerror="this.src='${getPlaceholderImage()}'">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <!-- Vehicle Info -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <p class="text-primary fw-medium mb-1">${vehicle.brand}</p>
                            <h1 class="h3 fw-bold mb-0">${vehicle.model}</h1>
                        </div>
                        <span class="badge ${status.class}">${status.text}</span>
                    </div>
                    
                    <h2 class="text-primary fw-bold mb-4">${formatPrice(vehicle.price)}</h2>
                    
                    <!-- Specifications -->
                    <div class="row g-3 mb-4">
                        <div class="col-6 col-md-4">
                            <div class="bg-light rounded p-3 text-center">
                                <i class="bi bi-calendar text-primary fs-4 mb-2"></i>
                                <p class="small text-muted mb-0">Ano</p>
                                <p class="fw-bold mb-0">${vehicle.year}</p>
                            </div>
                        </div>
                        <div class="col-6 col-md-4">
                            <div class="bg-light rounded p-3 text-center">
                                <i class="bi bi-speedometer2 text-primary fs-4 mb-2"></i>
                                <p class="small text-muted mb-0">Quilometragem</p>
                                <p class="fw-bold mb-0">${formatNumber(vehicle.mileage)} km</p>
                            </div>
                        </div>
                        <div class="col-6 col-md-4">
                            <div class="bg-light rounded p-3 text-center">
                                <i class="bi bi-fuel-pump text-primary fs-4 mb-2"></i>
                                <p class="small text-muted mb-0">Combustível</p>
                                <p class="fw-bold mb-0">${vehicle.fuel || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="col-6 col-md-4">
                            <div class="bg-light rounded p-3 text-center">
                                <i class="bi bi-gear text-primary fs-4 mb-2"></i>
                                <p class="small text-muted mb-0">Câmbio</p>
                                <p class="fw-bold mb-0">${vehicle.transmission || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="col-6 col-md-4">
                            <div class="bg-light rounded p-3 text-center">
                                <i class="bi bi-palette text-primary fs-4 mb-2"></i>
                                <p class="small text-muted mb-0">Cor</p>
                                <p class="fw-bold mb-0">${vehicle.color || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Description -->
                    ${vehicle.description ? `
                        <div class="mb-4">
                            <h5 class="fw-bold mb-2">Descrição</h5>
                            <p class="text-muted">${vehicle.description}</p>
                        </div>
                    ` : ''}
                    
                    <!-- Features -->
                    ${features && features.length > 0 ? `
                        <div class="mb-4">
                            <h5 class="fw-bold mb-3">Opcionais</h5>
                            <div class="d-flex flex-wrap gap-2">
                                ${features.map(feature => `
                                    <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                                        <i class="bi bi-check-circle me-1"></i>${feature}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
        
        <!-- Sidebar -->
        <div class="col-lg-4">
            <div class="card border-0 shadow-sm sticky-top" style="top: 20px;">
                <div class="card-header bg-white">
                    <h5 class="fw-bold mb-0">Fale com a Loja</h5>
                </div>
                <div class="card-body">
                    <h6 class="fw-bold mb-1">${store.name}</h6>
                    <p class="text-muted small mb-3">
                        <i class="bi bi-geo-alt me-1"></i>
                        ${getStoreAddress(store)}
                    </p>
                    
                    ${store.whatsapp ? `
                        <a href="${whatsappUrl}" target="_blank" class="btn btn-success w-100 mb-2">
                            <i class="bi bi-whatsapp me-2"></i>Chamar no WhatsApp
                        </a>
                    ` : `
                        <div class="alert alert-warning mb-2">
                            <small>Contato via WhatsApp não configurado</small>
                        </div>
                    `}
                    
                    ${store.phone ? `
                        <a href="tel:${store.phone}" class="btn btn-outline-primary w-100 mb-2">
                            <i class="bi bi-telephone me-2"></i>${store.phone}
                        </a>
                    ` : ''}
                    
                    ${store.email ? `
                        <a href="mailto:${store.email}" class="btn btn-outline-primary w-100 mb-2">
                            <i class="bi bi-envelope me-2"></i>Enviar E-mail
                        </a>
                    ` : ''}
                    
                    <a href="loja.html?store_slug=${storeSlug}#veiculos" class="btn btn-link w-100 text-decoration-none">
                        <i class="bi bi-arrow-left me-1"></i>Ver todos os veículos
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Get WhatsApp URL
function getWhatsAppUrl(phone, message = '') {
    // Remove non-numeric characters
    let cleanPhone = phone.replace(/\D/g, '');
    // Add country code if not present
    if (!cleanPhone.startsWith('55')) {
        cleanPhone = '55' + cleanPhone;
    }
    
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}${message ? '?text=' + encodedMessage : ''}`;
}

// Get store address
function getStoreAddress(store) {
    const addressParts = [];
    if (store.address) addressParts.push(store.address);
    if (store.city) addressParts.push(store.city);
    if (store.state) addressParts.push(store.state);
    return addressParts.length > 0 ? addressParts.join(', ') : 'Endereço não informado';
}

// Get placeholder image
function getPlaceholderImage() {
    return 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect fill=%27%23ddd%27 width=%27400%27 height=%27300%27/%3E%3Ctext fill=%27%23999%27 font-family=%27sans-serif%27 font-size=%2714%27 dy=%2710.5%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ESem imagem%3C/text%3E%3C/svg%3E';
}

// Show error
function showError(message) {
    const content = document.getElementById('vehicleContent');
    content.innerHTML = `
        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-body p-5 text-center">
                    <i class="bi bi-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
                    <h2 class="h4 fw-bold mt-4 mb-2">Erro</h2>
                    <p class="text-muted mb-4">${message}</p>
                    ${storeSlug ? `
                        <a href="loja.html?store_slug=${storeSlug}" class="btn btn-primary">
                            <i class="bi bi-arrow-left me-2"></i>Voltar ao catálogo
                        </a>
                    ` : `
                        <a href="index.html" class="btn btn-primary">
                            <i class="bi bi-house me-2"></i>Voltar ao site
                        </a>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Format functions
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

function formatNumber(number) {
    return new Intl.NumberFormat('pt-BR').format(number);
}



