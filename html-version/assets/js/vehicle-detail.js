// Vehicle Detail JavaScript (Public)

const API_URL = 'http://localhost/api';

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const storeSlug = urlParams.get('slug') || 'demo';
    const vehicleId = urlParams.get('id');
    
    if (vehicleId) {
        loadVehicleDetail(storeSlug, vehicleId);
    }
});

async function loadVehicleDetail(storeSlug, vehicleId) {
    const content = document.getElementById('vehicleContent');
    
    try {
        const response = await fetch(`${API_URL}/vehicles?public=true&store_slug=${storeSlug}&vehicle_id=${vehicleId}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.vehicle && data.data.store) {
            displayVehicleDetail(data.data.vehicle, data.data.store);
        } else {
            content.innerHTML = '<div class="col-12 text-center py-5"><p class="text-danger">Veículo não encontrado</p></div>';
        }
    } catch (error) {
        console.error('Error loading vehicle:', error);
        content.innerHTML = '<div class="col-12 text-center py-5"><p class="text-danger">Erro ao carregar veículo</p></div>';
    }
}

function displayVehicleDetail(vehicle, store) {
    const content = document.getElementById('vehicleContent');
    
    const whatsappMessage = encodeURIComponent(
        `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year} anunciado por ${formatPrice(vehicle.price)}. Poderia me dar mais informações?`
    );
    const whatsappUrl = `https://wa.me/${store.whatsapp?.replace(/\D/g, '')}?text=${whatsappMessage}`;
    
    const mainImage = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : 'assets/images/placeholder.jpg';
    
    content.innerHTML = `
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm mb-4">
                <div class="position-relative">
                    <img src="${mainImage}" alt="${vehicle.brand} ${vehicle.model}" class="card-img-top" style="height: 400px; object-fit: cover;">
                </div>
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <p class="text-primary fw-medium mb-1">${vehicle.brand}</p>
                            <h1 class="h3 fw-bold mb-0">${vehicle.model}</h1>
                        </div>
                        <span class="badge bg-success">Disponível</span>
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
                    
                    ${vehicle.features && vehicle.features.length > 0 ? `
                        <div>
                            <h5 class="fw-bold mb-3">Opcionais</h5>
                            <div class="d-flex flex-wrap gap-2">
                                ${vehicle.features.map(feature => `
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
                    
                    <a href="${whatsappUrl}" target="_blank" class="btn btn-success w-100 mb-2">
                        <i class="bi bi-whatsapp me-2"></i>Chamar no WhatsApp
                    </a>
                    
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
                    
                    <a href="catalogo.html?slug=${store.slug}" class="btn btn-link w-100 text-decoration-none">
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



