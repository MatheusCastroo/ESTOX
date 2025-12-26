// Loja JavaScript - REQ-FR-021
// Landing Page Pública da Revenda (Catálogo Completo de Veículos)
// API_URL is defined in config.js

// Get store slug from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const storeSlug = urlParams.get('store_slug') || urlParams.get('slug') || null;

let storeData = null;
let allVehicles = [];

document.addEventListener('DOMContentLoaded', function() {
    if (!storeSlug) {
        showError('Parâmetro store_slug é obrigatório na URL. Exemplo: loja.html?store_slug=nome-da-loja');
        return;
    }
    
    loadStoreInfo();
    loadAllVehicles();
    
    // Filter events - REQ-FR-LP-001: Busca em tempo real e filtros
    document.getElementById('searchInput').addEventListener('input', debounce(filterVehicles, 300));
    document.getElementById('brandFilter').addEventListener('change', filterVehicles);
    document.getElementById('modelFilter').addEventListener('change', filterVehicles);
    document.getElementById('minYear').addEventListener('input', debounce(filterVehicles, 300));
    document.getElementById('maxYear').addEventListener('input', debounce(filterVehicles, 300));
    document.getElementById('minPrice').addEventListener('input', debounce(filterVehicles, 300));
    document.getElementById('maxPrice').addEventListener('input', debounce(filterVehicles, 300));
    document.getElementById('maxMileage').addEventListener('input', debounce(filterVehicles, 300));
    document.getElementById('transmissionFilter').addEventListener('change', filterVehicles);
    document.getElementById('colorFilter').addEventListener('change', filterVehicles);
    document.getElementById('bodyTypeFilter').addEventListener('change', filterVehicles);
    
    // REQ-FR-LP-001 4.4: Ordenação de resultados
    document.getElementById('sortSelect').addEventListener('change', function() {
        filterVehicles();
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Load store information
async function loadStoreInfo() {
    try {
        // Try public endpoint first
        const response = await fetch(`${API_URL}/stores?public=true&slug=${storeSlug}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.store) {
            storeData = data.data.store;
            displayStoreInfo(storeData);
        } else {
            // Try alternative endpoint (from vehicles)
            const altResponse = await fetch(`${API_URL}/vehicles?public=true&store_slug=${storeSlug}`);
            const altData = await altResponse.json();
            
            if (altData.success && altData.data && altData.data.store) {
                storeData = altData.data.store;
                displayStoreInfo(storeData);
            } else {
                showStoreNotFound();
            }
        }
    } catch (error) {
        console.error('Error loading store info:', error);
        // Try alternative endpoint (from vehicles)
        try {
            const altResponse = await fetch(`${API_URL}/vehicles?public=true&store_slug=${storeSlug}`);
            const altData = await altResponse.json();
            
            if (altData.success && altData.data && altData.data.store) {
                storeData = altData.data.store;
                displayStoreInfo(storeData);
            } else {
                showStoreNotFound();
            }
        } catch (altError) {
            showStoreNotFound();
        }
    }
}

// Display store information
function displayStoreInfo(store) {
    // Check if store is active
    if (store.is_active === false || store.is_active === 0) {
        showStoreUnavailable();
        return;
    }
    
    // Header - Logo (prioridade) ou Nome (fallback)
    const storeLogoHeader = document.getElementById('storeLogoHeader');
    const storeNameHeaderFallback = document.getElementById('storeNameHeaderFallback');
    
    if (store.logo_url && store.logo_url.trim() !== '') {
        // Garantir que logo_url tenha prefixo data: se for base64
        let logoUrl = store.logo_url.trim();
        if (!logoUrl.startsWith('data:') && !logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
            // Provavelmente base64 sem prefixo, adicionar
            logoUrl = `data:image/png;base64,${logoUrl}`;
        }
        
        storeLogoHeader.src = logoUrl;
        storeLogoHeader.alt = store.name || 'Logo da loja';
        storeLogoHeader.classList.remove('d-none');
        
        // Esconder fallback quando logo carregar
        if (storeNameHeaderFallback) {
            storeNameHeaderFallback.classList.add('d-none');
        }
        
        // Tratamento de erro - mostrar fallback se logo falhar
        storeLogoHeader.onerror = function() {
            this.classList.add('d-none');
            if (storeNameHeaderFallback) {
                storeNameHeaderFallback.textContent = store.name || 'Loja';
                storeNameHeaderFallback.classList.remove('d-none');
            }
        };
        
        // Quando logo carregar com sucesso, garantir que fallback está escondido
        storeLogoHeader.onload = function() {
            if (storeNameHeaderFallback) {
                storeNameHeaderFallback.classList.add('d-none');
            }
        };
    } else {
        // Sem logo - mostrar nome como fallback
        storeLogoHeader.classList.add('d-none');
        if (storeNameHeaderFallback) {
            storeNameHeaderFallback.textContent = store.name || 'Loja';
            storeNameHeaderFallback.classList.remove('d-none');
        }
    }
    
    // Hero Section
    const heroTitle = document.getElementById('heroTitle');
    if (heroTitle) heroTitle.textContent = `Bem-vindo à ${store.name}`;
    
    const heroDescription = document.getElementById('heroDescription');
    if (heroDescription) {
        heroDescription.textContent = store.description || 'Encontre o veículo perfeito para você';
    }
    
    // WhatsApp buttons
    setupWhatsAppButtons(store);
    
    // About Section
    const storeAbout = document.getElementById('storeAbout');
    if (storeAbout) {
        storeAbout.textContent = store.description || 'Somos uma loja especializada em veículos usados, oferecendo qualidade e confiança em cada negócio.';
    }
    
    // Store Info
    const addressParts = [];
    if (store.address) addressParts.push(store.address);
    if (store.city) addressParts.push(store.city);
    if (store.state) addressParts.push(store.state);
    
    const storeAddress = document.getElementById('storeAddress');
    if (storeAddress) {
        storeAddress.textContent = addressParts.length > 0 ? addressParts.join(', ') : 'Não informado';
    }
    
    const storePhone = document.getElementById('storePhone');
    if (storePhone) {
        storePhone.textContent = store.phone || 'Não informado';
    }
    
    const storeWhatsApp = document.getElementById('storeWhatsApp');
    if (storeWhatsApp) {
        if (store.whatsapp) {
            storeWhatsApp.textContent = store.whatsapp;
        } else {
            storeWhatsApp.textContent = 'Contato via WhatsApp não configurado';
        }
    }
    
    // Footer - REQ-FR-021
    const footerStoreName = document.getElementById('footerStoreName');
    if (footerStoreName) footerStoreName.textContent = store.name;
    
    const footerAddress = document.getElementById('footerAddress');
    if (footerAddress) {
        footerAddress.textContent = addressParts.length > 0 ? addressParts.join(', ') : 'Endereço não informado';
    }
    
    const footerPhone = document.getElementById('footerPhone');
    if (footerPhone) {
        footerPhone.textContent = store.phone || 'Telefone não informado';
    }
    
    // REQ-FR-021: Footer WhatsApp
    const footerWhatsApp = document.getElementById('footerWhatsApp');
    if (footerWhatsApp) {
        footerWhatsApp.textContent = store.whatsapp || 'WhatsApp não informado';
    }
    
    // REQ-FR-021: Footer city and state
    const footerCityState = document.getElementById('footerCityState');
    if (footerCityState) {
        const cityStateParts = [];
        if (store.city) cityStateParts.push(store.city);
        if (store.state) cityStateParts.push(store.state);
        footerCityState.textContent = cityStateParts.length > 0 ? cityStateParts.join(', ') : 'Cidade não informada';
    }
    
    const footerCopyright = document.getElementById('footerCopyright');
    if (footerCopyright) footerCopyright.textContent = store.name;
    
    // Update page title
    document.title = `${store.name} - Landing Page`;
    
    // Update contact link
    const contactLink = document.getElementById('contactLink');
    if (contactLink && store.whatsapp) {
        contactLink.href = getWhatsAppUrl(store.whatsapp, `Olá ${store.name}! Gostaria de mais informações.`);
    }
}

// Setup WhatsApp buttons - REQ-FR-021
function setupWhatsAppButtons(store) {
    if (!store.whatsapp) {
        // Hide WhatsApp buttons if not configured
        const heroBtn = document.getElementById('heroWhatsAppBtn');
        if (heroBtn) {
            heroBtn.style.display = 'none';
        }
        const footerBtn = document.getElementById('footerWhatsAppBtn');
        if (footerBtn) {
            footerBtn.style.display = 'none';
        }
        const headerBtn = document.getElementById('headerWhatsAppBtn');
        if (headerBtn) {
            headerBtn.classList.add('d-none');
        }
        return;
    }
    
    const message = encodeURIComponent(`Olá ${store.name}! Gostaria de mais informações sobre os veículos.`);
    const whatsappUrl = getWhatsAppUrl(store.whatsapp, message);
    
    // Hero button
    const heroBtn = document.getElementById('heroWhatsAppBtn');
    if (heroBtn) {
        heroBtn.href = whatsappUrl;
    }
    
    // Footer button
    const footerBtn = document.getElementById('footerWhatsAppBtn');
    if (footerBtn) {
        footerBtn.href = whatsappUrl;
    }
    
    // Header button - REQ-FR-021
    const headerBtn = document.getElementById('headerWhatsAppBtn');
    if (headerBtn) {
        headerBtn.href = whatsappUrl;
        headerBtn.classList.remove('d-none');
    }
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

// Load all vehicles - REQ-FR-021: Only available vehicles
async function loadAllVehicles() {
    try {
        // REQ-FR-021: API now filters by available by default, but we'll also filter on frontend
        const response = await fetch(`${API_URL}/vehicles?public=true&store_slug=${storeSlug}&status=available`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.vehicles) {
            // REQ-FR-021: Filter only available vehicles (double check)
            allVehicles = data.data.vehicles.filter(v => v.status === 'available');
            
            if (allVehicles.length === 0) {
                showNoVehicles();
                return;
            }
            
            // Display all vehicles - REQ-FR-LP-001
            displayAllVehicles(allVehicles);
            updateBrandFilter(allVehicles);
            
            // Atualizar contador inicial - REQ-FR-LP-001 4.4
            const resultsCount = document.getElementById('resultsCount');
            if (resultsCount) {
                resultsCount.textContent = `${allVehicles.length} ${allVehicles.length === 1 ? 'veículo disponível' : 'veículos disponíveis'}`;
            }
        } else {
            showNoVehicles();
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
        showNoVehicles();
    }
}

// Display all vehicles - REQ-FR-LP-001
function displayAllVehicles(vehicles) {
    const grid = document.getElementById('vehiclesGrid');
    
    if (vehicles.length === 0) {
        showNoVehicles();
        return;
    }
    
    // Limpar grid antes de inserir novos cards
    grid.innerHTML = '';
    
    // Criar cards - primeiros 3 podem ser destacados como "Novidade"
    vehicles.forEach((vehicle, index) => {
        const isFeatured = index < 3; // Primeiros 3 como destaque
        const cardHtml = createVehicleCard(vehicle, isFeatured);
        grid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// Create vehicle card - REQ-FR-LP-001 4.5: Design moderno com imagem grande, tags, favorito
function createVehicleCard(vehicle, isFeatured = false) {
    const mainImage = getVehicleImage(vehicle);
    const storeCityState = storeData ? `${storeData.city || ''}${storeData.city && storeData.state ? ', ' : ''}${storeData.state || ''}` : '';
    
    return `
        <div class="col-md-6 col-lg-4">
            <div class="vehicle-card-modern" onclick="window.location.href='veiculo-detalhe.html?store_slug=${storeSlug}&vehicle_id=${vehicle.id}'">
                <div class="vehicle-card-image">
                    <img src="${mainImage}" 
                         alt="${vehicle.brand} ${vehicle.model}"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27250%27%3E%3Crect fill=%27%23ddd%27 width=%27400%27 height=%27250%27/%3E%3Ctext fill=%27%23999%27 font-family=%27sans-serif%27 font-size=%2714%27 dy=%2710.5%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ESem imagem%3C/text%3E%3C/svg%3E'">
                    ${isFeatured ? '<span class="vehicle-card-badge">Novidade</span>' : ''}
                    <button class="vehicle-card-favorite" onclick="event.stopPropagation(); toggleFavorite('${vehicle.id}')" title="Adicionar aos favoritos">
                        <i class="bi bi-heart"></i>
                    </button>
                </div>
                <div class="vehicle-card-body">
                    <h3 class="vehicle-card-title">${vehicle.brand} ${vehicle.model}</h3>
                    <div class="vehicle-card-info">
                        <span><i class="bi bi-calendar me-1"></i>${vehicle.year}</span>
                        <span><i class="bi bi-speedometer2 me-1"></i>${formatNumber(vehicle.mileage)} km</span>
                        ${vehicle.transmission ? `<span><i class="bi bi-gear me-1"></i>${vehicle.transmission}</span>` : ''}
                    </div>
                    <div class="vehicle-card-price">${formatPrice(vehicle.price)}</div>
                    ${storeCityState ? `<div class="vehicle-card-location"><i class="bi bi-geo-alt me-1"></i>${storeCityState}</div>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Toggle favorite - REQ-FR-LP-001 4.5
function toggleFavorite(vehicleId) {
    const favoriteBtn = event.target.closest('.vehicle-card-favorite');
    if (favoriteBtn) {
        favoriteBtn.classList.toggle('active');
        const icon = favoriteBtn.querySelector('i');
        if (favoriteBtn.classList.contains('active')) {
            icon.classList.remove('bi-heart');
            icon.classList.add('bi-heart-fill');
        } else {
            icon.classList.remove('bi-heart-fill');
            icon.classList.add('bi-heart');
        }
    }
}

// Get vehicle image
function getVehicleImage(vehicle) {
    if (!vehicle.images) {
        return 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27%3E%3Crect fill=%27%23ddd%27 width=%27200%27 height=%27200%27/%3E%3Ctext fill=%27%23999%27 font-family=%27sans-serif%27 font-size=%2714%27 dy=%2710.5%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ESem imagem%3C/text%3E%3C/svg%3E';
    }
    
    let images = [];
    if (typeof vehicle.images === 'string') {
        try {
            images = JSON.parse(vehicle.images || '[]');
        } catch (e) {
            images = [];
        }
    } else if (Array.isArray(vehicle.images)) {
        images = vehicle.images;
    }
    
    return images.length > 0 ? images[0] : 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27%3E%3Crect fill=%27%23ddd%27 width=%27200%27 height=%27200%27/%3E%3Ctext fill=%27%23999%27 font-family=%27sans-serif%27 font-size=%2714%27 dy=%2710.5%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ESem imagem%3C/text%3E%3C/svg%3E';
}

// Filter vehicles - REQ-FR-LP-001: Filtros completos e ordenação
function filterVehicles() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const brand = document.getElementById('brandFilter').value;
    const model = document.getElementById('modelFilter').value;
    const minYear = parseInt(document.getElementById('minYear').value) || 0;
    const maxYear = parseInt(document.getElementById('maxYear').value) || 9999;
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    const maxMileage = parseInt(document.getElementById('maxMileage').value) || Infinity;
    const transmission = document.getElementById('transmissionFilter').value;
    const color = document.getElementById('colorFilter').value;
    const bodyType = document.getElementById('bodyTypeFilter').value;
    const sortBy = document.getElementById('sortSelect').value;
    
    let filtered = allVehicles.filter(vehicle => {
        // REQ-FR-LP-001: Only show available vehicles
        if (vehicle.status !== 'available') {
            return false;
        }
        
        const matchesSearch = !search || 
            vehicle.brand.toLowerCase().includes(search) ||
            vehicle.model.toLowerCase().includes(search) ||
            vehicle.year.toString().includes(search) ||
            (vehicle.description && vehicle.description.toLowerCase().includes(search));
        
        const matchesBrand = !brand || vehicle.brand === brand;
        const matchesModel = !model || vehicle.model.toLowerCase().includes(model.toLowerCase());
        const matchesYear = vehicle.year >= minYear && vehicle.year <= maxYear;
        const matchesPrice = vehicle.price >= minPrice && vehicle.price <= maxPrice;
        const matchesMileage = vehicle.mileage <= maxMileage;
        const matchesTransmission = !transmission || vehicle.transmission === transmission;
        const matchesColor = !color || (vehicle.color && vehicle.color.toLowerCase() === color.toLowerCase());
        const matchesBodyType = !bodyType || vehicle.body_type === bodyType;
        
        return matchesSearch && matchesBrand && matchesModel && matchesYear && 
               matchesPrice && matchesMileage && matchesTransmission && matchesColor && matchesBodyType;
    });
    
    // REQ-FR-LP-001 4.4: Ordenação
    switch(sortBy) {
        case 'price_low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price_high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'year_new':
            filtered.sort((a, b) => b.year - a.year);
            break;
        case 'relevance':
        default:
            // Ordenação por relevância (mais novos primeiro como padrão)
            filtered.sort((a, b) => b.year - a.year);
            break;
    }
    
    // Atualizar contador de resultados - REQ-FR-LP-001 4.4
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'veículo disponível' : 'veículos disponíveis'}`;
    }
    
    if (filtered.length === 0) {
        const grid = document.getElementById('vehiclesGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search text-muted" style="font-size: 4rem;"></i>
                    <h3 class="h5 fw-bold mt-3 mb-2">Nenhum veículo encontrado</h3>
                    <p class="text-muted">Tente ajustar os filtros para ver mais resultados.</p>
                </div>
            `;
        }
        if (resultsCount) {
            resultsCount.textContent = 'Nenhum veículo encontrado';
        }
    } else {
        displayAllVehicles(filtered);
    }
}

// Update brand and model filters - REQ-FR-LP-001
function updateBrandFilter(vehicles) {
    const brands = [...new Set(vehicles.map(v => v.brand))].sort();
    const brandFilter = document.getElementById('brandFilter');
    const currentBrand = brandFilter.value;
    
    brandFilter.innerHTML = '<option value="">Todas as marcas</option>' + 
        brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
    
    if (currentBrand) {
        brandFilter.value = currentBrand;
    }
    
    // Atualizar modelos baseado na marca selecionada
    updateModelFilter(vehicles, currentBrand);
}

// Update model filter based on selected brand - REQ-FR-LP-001
function updateModelFilter(vehicles, selectedBrand) {
    const modelFilter = document.getElementById('modelFilter');
    const currentModel = modelFilter.value;
    
    let models = vehicles;
    if (selectedBrand) {
        models = vehicles.filter(v => v.brand === selectedBrand);
    }
    
    const uniqueModels = [...new Set(models.map(v => v.model))].sort();
    
    modelFilter.innerHTML = '<option value="">Todos os modelos</option>' + 
        uniqueModels.map(model => `<option value="${model}">${model}</option>`).join('');
    
    if (currentModel) {
        modelFilter.value = currentModel;
    }
    
    // Listener para atualizar modelos quando marca mudar
    const brandFilter = document.getElementById('brandFilter');
    if (brandFilter && !brandFilter.hasAttribute('data-listener-added')) {
        brandFilter.setAttribute('data-listener-added', 'true');
        brandFilter.addEventListener('change', function() {
            updateModelFilter(vehicles, this.value);
        });
    }
}

// Show error messages
function showError(message) {
    document.body.innerHTML = `
        <div class="container min-vh-100 d-flex align-items-center justify-content-center">
            <div class="card border-0 shadow-sm" style="max-width: 500px;">
                <div class="card-body p-5 text-center">
                    <i class="bi bi-exclamation-circle text-danger" style="font-size: 4rem;"></i>
                    <h2 class="h4 fw-bold mt-4 mb-2">Erro</h2>
                    <p class="text-muted mb-4">${message}</p>
                    <a href="index.html" class="btn btn-primary">
                        <i class="bi bi-house me-2"></i>Voltar ao site
                    </a>
                </div>
            </div>
        </div>
    `;
}

function showStoreNotFound() {
    showError('Revenda não encontrada.');
}

function showStoreUnavailable() {
    showError('Loja indisponível no momento.');
}

function showNoVehicles() {
    const grid = document.getElementById('vehiclesGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-inbox text-muted" style="font-size: 4rem;"></i>
                <h3 class="h5 fw-bold mt-3 mb-2">Nenhum veículo disponível no momento.</h3>
                <p class="text-muted">Esta loja ainda não possui veículos disponíveis em seu catálogo.</p>
            </div>
        `;
    }
    
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = 'Nenhum veículo disponível';
    }
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
