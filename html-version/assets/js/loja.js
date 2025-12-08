// Loja JavaScript - REQ-FR-031
// Mini-Site Público para Lojas com Contato via WhatsApp

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
    
    // Filter events
    document.getElementById('searchInput').addEventListener('input', debounce(filterVehicles, 500));
    document.getElementById('brandFilter').addEventListener('change', filterVehicles);
    document.getElementById('minYear').addEventListener('input', debounce(filterVehicles, 500));
    document.getElementById('maxYear').addEventListener('input', debounce(filterVehicles, 500));
    document.getElementById('maxPrice').addEventListener('input', debounce(filterVehicles, 500));
    
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
    
    // Header
    const storeNameHeader = document.getElementById('storeNameHeader');
    if (storeNameHeader) storeNameHeader.textContent = store.name || 'Loja';
    
    const storeLogoHeader = document.getElementById('storeLogoHeader');
    if (store.logo_url) {
        storeLogoHeader.src = store.logo_url;
        storeLogoHeader.alt = store.name;
        storeLogoHeader.classList.remove('d-none');
        storeLogoHeader.onerror = function() {
            this.classList.add('d-none');
        };
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
    
    // Footer
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
    
    const footerCopyright = document.getElementById('footerCopyright');
    if (footerCopyright) footerCopyright.textContent = store.name;
    
    // Update page title
    document.title = `${store.name} - Mini-Site`;
    
    // Update contact link
    const contactLink = document.getElementById('contactLink');
    if (contactLink && store.whatsapp) {
        contactLink.href = getWhatsAppUrl(store.whatsapp, `Olá ${store.name}! Gostaria de mais informações.`);
    }
}

// Setup WhatsApp buttons
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
        const floatBtn = document.getElementById('whatsappFloat');
        if (floatBtn) {
            floatBtn.classList.add('d-none');
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
    
    // Float button
    const floatBtn = document.getElementById('whatsappFloat');
    if (floatBtn) {
        floatBtn.href = whatsappUrl;
        floatBtn.classList.remove('d-none');
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

// Load all vehicles
async function loadAllVehicles() {
    try {
        const response = await fetch(`${API_URL}/vehicles?public=true&store_slug=${storeSlug}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.vehicles) {
            allVehicles = data.data.vehicles;
            
            // Display featured vehicles (first 6 available vehicles)
            const featuredVehicles = allVehicles
                .filter(v => v.status === 'available')
                .slice(0, 6);
            displayFeaturedVehicles(featuredVehicles);
            
            // Display all vehicles
            displayAllVehicles(allVehicles);
            updateBrandFilter(allVehicles);
        } else {
            showNoVehicles();
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
        showNoVehicles();
    }
}

// Display featured vehicles
function displayFeaturedVehicles(vehicles) {
    const container = document.getElementById('featuredVehicles');
    
    if (vehicles.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">Nenhum veículo em destaque no momento.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = vehicles.map(vehicle => createVehicleCard(vehicle, true)).join('');
}

// Display all vehicles
function displayAllVehicles(vehicles) {
    const grid = document.getElementById('vehiclesGrid');
    
    if (vehicles.length === 0) {
        showNoVehicles();
        return;
    }
    
    grid.innerHTML = vehicles.map(vehicle => createVehicleCard(vehicle, false)).join('');
}

// Create vehicle card
function createVehicleCard(vehicle, isFeatured = false) {
    const mainImage = getVehicleImage(vehicle);
    const isSold = vehicle.status === 'sold';
    
    return `
        <div class="col-md-6 col-lg-4">
            <div class="card vehicle-card h-100 border-0 shadow-sm">
                <div class="position-relative">
                    <img src="${mainImage}" 
                         class="card-img-top" 
                         alt="${vehicle.brand} ${vehicle.model}"
                         style="height: 200px; object-fit: cover;"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27%3E%3Crect fill=%27%23ddd%27 width=%27200%27 height=%27200%27/%3E%3Ctext fill=%27%23999%27 font-family=%27sans-serif%27 font-size=%2714%27 dy=%2710.5%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ESem imagem%3C/text%3E%3C/svg%3E'">
                    ${isFeatured ? '<span class="featured-badge"><i class="bi bi-star-fill me-1"></i>Destaque</span>' : ''}
                    ${isSold ? '<div class="sold-badge">VENDIDO</div>' : ''}
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold mb-2">${vehicle.brand} ${vehicle.model}</h5>
                    <p class="text-muted small mb-2">
                        <i class="bi bi-calendar me-1"></i>${vehicle.year}
                        <span class="ms-2"><i class="bi bi-speedometer2 me-1"></i>${formatNumber(vehicle.mileage)} km</span>
                    </p>
                    <p class="text-muted small mb-3">
                        ${vehicle.fuel ? `<i class="bi bi-fuel-pump me-1"></i>${vehicle.fuel}` : ''}
                        ${vehicle.transmission ? `<span class="ms-2"><i class="bi bi-gear me-1"></i>${vehicle.transmission}</span>` : ''}
                    </p>
                    <h4 class="text-primary fw-bold mb-3">${formatPrice(vehicle.price)}</h4>
                    ${vehicle.description ? `
                        <p class="text-muted small mb-3" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${vehicle.description}
                        </p>
                    ` : ''}
                    <div class="mt-auto">
                        <a href="veiculo.html?store_slug=${storeSlug}&vehicle_id=${vehicle.id}" 
                           class="btn btn-primary w-100">
                            <i class="bi bi-eye me-2"></i>Ver Detalhes
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
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

// Filter vehicles
function filterVehicles() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const brand = document.getElementById('brandFilter').value;
    const minYear = parseInt(document.getElementById('minYear').value) || 0;
    const maxYear = parseInt(document.getElementById('maxYear').value) || 9999;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    
    const filtered = allVehicles.filter(vehicle => {
        const matchesSearch = !search || 
            vehicle.brand.toLowerCase().includes(search) ||
            vehicle.model.toLowerCase().includes(search) ||
            (vehicle.description && vehicle.description.toLowerCase().includes(search));
        
        const matchesBrand = !brand || vehicle.brand === brand;
        const matchesYear = vehicle.year >= minYear && vehicle.year <= maxYear;
        const matchesPrice = vehicle.price <= maxPrice;
        
        return matchesSearch && matchesBrand && matchesYear && matchesPrice;
    });
    
    displayAllVehicles(filtered);
}

// Update brand filter
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
    showError('Loja não encontrada ou não está mais disponível.');
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
                <h3 class="h5 fw-bold mt-3 mb-2">Nenhum veículo cadastrado ainda</h3>
                <p class="text-muted">Esta loja ainda não possui veículos disponíveis em seu catálogo.</p>
            </div>
        `;
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

