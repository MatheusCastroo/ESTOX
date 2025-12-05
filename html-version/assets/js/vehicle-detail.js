// Vehicle Detail JavaScript (Public)

const API_URL = 'http://localhost/ESTOX/api';

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    // REQ-FR-020: Usar store_slug (com fallback para slug por compatibilidade)
    const storeSlug = urlParams.get('store_slug') || urlParams.get('slug') || null;
    const vehicleId = urlParams.get('vehicle_id') || urlParams.get('id');
    
    if (!storeSlug) {
        showError('Parâmetro store_slug é obrigatório na URL.');
        return;
    }
    
    if (!vehicleId) {
        showError('Parâmetro vehicle_id é obrigatório na URL.');
        return;
    }
    
    loadVehicleDetail(storeSlug, vehicleId);
});

async function loadVehicleDetail(storeSlug, vehicleId) {
    const content = document.getElementById('vehicleContent');
    
    try {
        const response = await fetch(`${API_URL}/vehicles?public=true&store_slug=${storeSlug}&vehicle_id=${vehicleId}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.vehicle && data.data.store) {
            displayVehicleDetail(data.data.vehicle, data.data.store, storeSlug);
        } else {
            showError('Veículo não encontrado ou não está mais disponível.');
        }
    } catch (error) {
        console.error('Error loading vehicle:', error);
        showError('Erro ao carregar veículo. Por favor, tente novamente.');
    }
}

function showError(message) {
    const content = document.getElementById('vehicleContent');
    content.innerHTML = `
        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-body p-5 text-center">
                    <i class="bi bi-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
                    <h2 class="h4 fw-bold mt-4 mb-2">Erro</h2>
                    <p class="text-muted mb-4">${message}</p>
                    <a href="catalogo.html?store_slug=${new URLSearchParams(window.location.search).get('store_slug') || ''}" class="btn btn-primary">
                        <i class="bi bi-arrow-left me-2"></i>Voltar ao catálogo
                    </a>
                </div>
            </div>
        </div>
    `;
}

function displayVehicleDetail(vehicle, store, storeSlug) {
    const content = document.getElementById('vehicleContent');
    
    // Parse JSON fields if they are strings
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
    
    // REQ-FR-020: Status (disponível / vendido)
    const statusInfo = {
        'available': { text: 'Disponível', class: 'bg-success' },
        'sold': { text: 'Vendido', class: 'bg-danger' },
        'reserved': { text: 'Reservado', class: 'bg-warning' }
    };
    const status = statusInfo[vehicle.status] || statusInfo['available'];
    
    // REQ-FR-020: Botão WhatsApp - https://wa.me/55{telefone}
    let whatsappUrl = '#';
    if (store.whatsapp) {
        let phone = store.whatsapp.replace(/\D/g, '');
        if (!phone.startsWith('55')) {
            phone = '55' + phone;
        }
        const whatsappMessage = encodeURIComponent(
            `Olá ${store.name}! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year} anunciado por ${formatPrice(vehicle.price)}. Poderia me dar mais informações?`
        );
        whatsappUrl = `https://wa.me/${phone}?text=${whatsappMessage}`;
    }
    
    // REQ-FR-020: Fotos (primeira imagem ou placeholder)
    const mainImage = images.length > 0 ? images[0] : '../public/placeholder.jpg';
    
    content.innerHTML = `
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm mb-4">
                <div class="position-relative">
                    <img src="${mainImage}" 
                         alt="${vehicle.brand} ${vehicle.model}" 
                         class="card-img-top" 
                         style="height: 400px; object-fit: cover;"
                         onerror="this.src='../public/placeholder.jpg'">
                </div>
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <p class="text-primary fw-medium mb-1">${vehicle.brand}</p>
                            <h1 class="h3 fw-bold mb-0">${vehicle.model}</h1>
                        </div>
                        <span class="badge ${status.class}">${status.text}</span>
                    </div>
                    
                    <h2 class="text-primary fw-bold mb-4">${formatPrice(vehicle.price)}</h2>
                    
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
                                <p class="fw-bold mb-0">${vehicle.mileage.toLocaleString('pt-BR')} km</p>
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
                    
                    ${vehicle.description ? `
                        <div class="mb-4">
                            <h5 class="fw-bold mb-2">Descrição</h5>
                            <p class="text-muted">${vehicle.description}</p>
                        </div>
                    ` : ''}
                    
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
                    
                    ${images.length > 1 ? `
                        <div class="mb-4">
                            <h5 class="fw-bold mb-3">Galeria de Fotos</h5>
                            <div class="row g-2">
                                ${images.slice(0, 6).map((img, idx) => `
                                    <div class="col-4 col-md-3">
                                        <img src="${img}" alt="${vehicle.brand} ${vehicle.model} - Foto ${idx + 1}" 
                                             class="img-fluid rounded cursor-pointer" 
                                             style="height: 100px; object-fit: cover;"
                                             onclick="document.querySelector('.card-img-top').src = this.src">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
        
        <div class="col-lg-4">
            <div class="card border-0 shadow-sm sticky-top" style="top: 20px;">
                <div class="card-header bg-white">
                    <h5 class="fw-bold mb-0">Fale com a Loja</h5>
                </div>
                <div class="card-body">
                    <h6 class="fw-bold mb-1">${store.name}</h6>
                    <p class="text-muted small mb-3">
                        <i class="bi bi-geo-alt me-1"></i>
                        ${store.address || ''}${store.city ? `, ${store.city}` : ''}${store.state ? ` - ${store.state}` : ''}
                    </p>
                    
                    ${store.whatsapp ? `
                        <a href="${whatsappUrl}" target="_blank" class="btn btn-success w-100 mb-2">
                            <i class="bi bi-whatsapp me-2"></i>Chamar no WhatsApp
                        </a>
                    ` : ''}
                    
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
                    
                    <a href="catalogo.html?store_slug=${storeSlug}" class="btn btn-link w-100 text-decoration-none">
                        <i class="bi bi-arrow-left me-1"></i>Ver todos os veículos
                    </a>
                </div>
            </div>
        </div>
    `;
}

function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}



