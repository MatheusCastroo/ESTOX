// Loja JavaScript - REQ-FR-LP-001
// Landing Page Pública do Cliente – Vitrine de Veículos

// Get store slug from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const storeSlug = urlParams.get('store_slug') || urlParams.get('slug') || null;

let storeData = null;
let allVehicles = [];
let filteredVehicles = [];
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

document.addEventListener('DOMContentLoaded', function() {
    if (!storeSlug) {
        showError('Parâmetro store_slug é obrigatório na URL. Exemplo: loja.html?store_slug=nome-da-loja');
        return;
    }
    
    loadStoreInfo();
    loadAllVehicles();
    
    // Search event
    document.getElementById('searchInput').addEventListener('input', debounce(filterVehicles, 500));
    
    // Filter events
    document.getElementById('minPrice').addEventListener('input', debounce(filterVehicles, 500));
    document.getElementById('maxPrice').addEventListener('input', debounce(filterVehicles, 500));
    document.getElementById('modelFilter').addEventListener('input', debounce(filterVehicles, 500));
    document.getElementById('minYear').addEventListener('input', debounce(filterVehicles, 500));
    document.getElementById('maxYear').addEventListener('input', debounce(filterVehicles, 500));
    document.getElementById('maxMileage').addEventListener('input', debounce(filterVehicles, 500));
    document.getElementById('colorFilter').addEventListener('input', debounce(filterVehicles, 500));
    
    // Transmission checkboxes
    document.querySelectorAll('#transmissionFilters input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', filterVehicles);
    });
    
    // Brand checkboxes (will be added dynamically)
    
    // Sort event
    document.getElementById('sortSelect').addEventListener('change', function() {
        sortVehicles(this.value);
        displayVehicles();
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
        const response = await fetch(`${API_URL}/public?store_slug=${storeSlug}&action=store`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.store) {
            storeData = data.data.store;
            displayStoreInfo(storeData);
        } else {
            showStoreNotFound();
        }
    } catch (error) {
        console.error('Error loading store info:', error);
        showStoreNotFound();
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
    const storeName = document.getElementById('storeName');
    if (storeName) storeName.textContent = store.name || 'Loja';
    
    const storeLogo = document.getElementById('storeLogo');
    if (store.logo_url && store.logo_url.trim() !== '') {
        // Validate logo before displaying
        const img = new Image();
        img.onload = function() {
            storeLogo.src = store.logo_url;
            storeLogo.alt = store.name;
            storeLogo.classList.remove('d-none');
        };
        img.onerror = function() {
            // Logo failed to load - hide it
            console.warn('Logo da loja não pôde ser carregada:', store.logo_url);
            storeLogo.classList.add('d-none');
        };
        img.src = store.logo_url;
    } else {
        storeLogo.classList.add('d-none');
    }
    
    // WhatsApp button
    setupWhatsAppButton(store);
    
    // Update page title
    document.title = `${store.name} - Vitrine de Veículos`;
}

// Setup WhatsApp button
function setupWhatsAppButton(store) {
    if (!store.whatsapp) {
        // Hide buttons if no WhatsApp
        const whatsappBtn = document.getElementById('whatsappHeaderBtn');
        const whatsappFloatBtn = document.getElementById('whatsappFloatBtn');
        if (whatsappBtn) whatsappBtn.classList.add('d-none');
        if (whatsappFloatBtn) whatsappFloatBtn.classList.add('d-none');
        return;
    }
    
    let phone = store.whatsapp.replace(/\D/g, '');
    if (!phone.startsWith('55')) {
        phone = '55' + phone;
    }
    
    // Default message for general contact
    const defaultMessage = encodeURIComponent(`Olá ${store.name}! 👋\n\nGostaria de mais informações sobre os veículos.`);
    const defaultWhatsappUrl = `https://wa.me/${phone}?text=${defaultMessage}`;
    
    // Setup header WhatsApp button
    const whatsappBtn = document.getElementById('whatsappHeaderBtn');
    if (whatsappBtn) {
        whatsappBtn.href = defaultWhatsappUrl;
        whatsappBtn.classList.remove('d-none');
    }
    
    // Setup floating WhatsApp button
    const whatsappFloatBtn = document.getElementById('whatsappFloatBtn');
    if (whatsappFloatBtn) {
        whatsappFloatBtn.href = defaultWhatsappUrl;
        whatsappFloatBtn.classList.remove('d-none');
        
        // Add click handler to ensure it works
        whatsappFloatBtn.onclick = function(e) {
            e.preventDefault();
            window.open(defaultWhatsappUrl, '_blank', 'noopener,noreferrer');
        };
    }
}

// Generate WhatsApp message for specific vehicle
function getVehicleWhatsAppMessage(brand, model, year) {
    const message = `Olá! 👋

Tenho interesse no veículo ${brand} ${model} ${year} anunciado no site.

Poderia me passar mais informações, por favor?

Obrigado!`;
    return encodeURIComponent(message);
}

// Open WhatsApp for specific vehicle
function openVehicleWhatsApp(vehicleId, brand, model, year) {
    if (!storeData || !storeData.whatsapp) {
        alert('WhatsApp da loja não está configurado.');
        return;
    }
    
    let phone = storeData.whatsapp.replace(/\D/g, '');
    if (!phone.startsWith('55')) {
        phone = '55' + phone;
    }
    
    const message = getVehicleWhatsAppMessage(brand, model, year);
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

// Load all vehicles
async function loadAllVehicles() {
    try {
        const response = await fetch(`${API_URL}/public?store_slug=${storeSlug}&action=vehicles`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.vehicles) {
            allVehicles = data.data.vehicles.filter(v => v.status === 'available');
            
            // JSON fields are already parsed by the API
            filteredVehicles = [...allVehicles];
            
            // Update brand filters
            updateBrandFilters();
            
            // Display vehicles
            sortVehicles('relevance');
            displayVehicles();
        } else {
            showNoVehicles();
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
        showNoVehicles();
    }
}

// Update brand filters
function updateBrandFilters() {
    const brands = [...new Set(allVehicles.map(v => v.brand))].sort();
    const brandFilters = document.getElementById('brandFilters');
    
    brandFilters.innerHTML = brands.map(brand => `
        <div class="filter-checkbox">
            <input type="checkbox" id="brand-${brand}" value="${brand}" onchange="filterVehicles()">
            <label for="brand-${brand}">${brand}</label>
        </div>
    `).join('');
}

// Filter vehicles
function filterVehicles() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    const modelFilter = document.getElementById('modelFilter').value.toLowerCase();
    const minYear = parseInt(document.getElementById('minYear').value) || 0;
    const maxYear = parseInt(document.getElementById('maxYear').value) || 9999;
    const maxMileage = parseInt(document.getElementById('maxMileage').value) || Infinity;
    const colorFilter = document.getElementById('colorFilter').value.toLowerCase();
    
    // Get selected brands
    const selectedBrands = Array.from(document.querySelectorAll('#brandFilters input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    // Get selected transmissions
    const selectedTransmissions = Array.from(document.querySelectorAll('#transmissionFilters input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    filteredVehicles = allVehicles.filter(vehicle => {
        // Search filter
        if (search) {
            const searchText = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`.toLowerCase();
            if (!searchText.includes(search)) return false;
        }
        
        // Price filter
        if (vehicle.price < minPrice || vehicle.price > maxPrice) return false;
        
        // Brand filter
        if (selectedBrands.length > 0 && !selectedBrands.includes(vehicle.brand)) return false;
        
        // Model filter
        if (modelFilter && !vehicle.model.toLowerCase().includes(modelFilter)) return false;
        
        // Year filter
        if (vehicle.year < minYear || vehicle.year > maxYear) return false;
        
        // Mileage filter
        if (vehicle.mileage > maxMileage) return false;
        
        // Transmission filter
        if (selectedTransmissions.length > 0 && (!vehicle.transmission || !selectedTransmissions.includes(vehicle.transmission))) return false;
        
        // Color filter
        if (colorFilter && (!vehicle.color || !vehicle.color.toLowerCase().includes(colorFilter))) return false;
        
        return true;
    });
    
    sortVehicles(document.getElementById('sortSelect').value);
    displayVehicles();
}

// Sort vehicles
function sortVehicles(sortBy) {
    switch(sortBy) {
        case 'price_asc':
            filteredVehicles.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            filteredVehicles.sort((a, b) => b.price - a.price);
            break;
        case 'year_desc':
            filteredVehicles.sort((a, b) => b.year - a.year);
            break;
        case 'year_asc':
            filteredVehicles.sort((a, b) => a.year - b.year);
            break;
        case 'relevance':
        default:
            // Keep original order (most recent first)
            break;
    }
}

// Display vehicles
function displayVehicles() {
    const grid = document.getElementById('vehiclesGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    // Update results count
    const count = filteredVehicles.length;
    resultsCount.textContent = `${count} ${count === 1 ? 'veículo disponível' : 'veículos disponíveis'}`;
    
    if (filteredVehicles.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-search empty-state-icon"></i>
                <h3 class="h5 fw-bold mt-3 mb-2">Nenhum veículo encontrado</h3>
                <p class="text-muted">Tente ajustar os filtros para ver mais resultados.</p>
                <button class="btn btn-primary mt-3" onclick="clearFilters()">Limpar Filtros</button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredVehicles.map(vehicle => createVehicleCard(vehicle)).join('');
}

// Create vehicle card
function createVehicleCard(vehicle) {
    const mainImage = getVehicleImage(vehicle);
    const isFavorite = favorites.includes(vehicle.id);
    
    // Determine tags
    const tags = [];
    // You can add logic here to determine if vehicle is new or below FIPE
    // For now, we'll just show example tags
    // if (isNewVehicle(vehicle)) tags.push('<span class="vehicle-tag new">Novidade</span>');
    // if (isBelowFIPE(vehicle)) tags.push('<span class="vehicle-tag fipe">Abaixo da FIPE</span>');
    
    return `
        <div class="vehicle-card" onclick="window.location.href='veiculo-detalhe.html?store_slug=${storeSlug}&vehicle_id=${vehicle.id}'">
            <div class="vehicle-image-container">
                <img src="${mainImage}" 
                     alt="${vehicle.brand} ${vehicle.model}"
                     class="vehicle-image"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27320%27 height=%27220%27%3E%3Crect fill=%27%23f5f5f5%27 width=%27320%27 height=%27220%27/%3E%3Ctext fill=%27%23999%27 font-family=%27sans-serif%27 font-size=%2714%27 dy=%2710.5%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ESem imagem%3C/text%3E%3C/svg%3E'">
                ${tags.join('')}
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                        onclick="event.stopPropagation(); toggleFavorite('${vehicle.id}')"
                        title="${isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                    <i class="bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}"></i>
                </button>
            </div>
            <div class="vehicle-card-body">
                <h3 class="vehicle-name">${vehicle.brand} ${vehicle.model}</h3>
                <div class="vehicle-info">
                    <span class="vehicle-info-item">
                        <i class="bi bi-calendar"></i>
                        ${vehicle.year}
                    </span>
                    <span class="vehicle-info-item">
                        <i class="bi bi-speedometer2"></i>
                        ${formatMileage(vehicle.mileage)} km
                    </span>
                    ${vehicle.transmission ? `
                        <span class="vehicle-info-item">
                            <i class="bi bi-gear"></i>
                            ${vehicle.transmission}
                        </span>
                    ` : ''}
                </div>
                <div class="vehicle-price">${formatPrice(vehicle.price)}</div>
                <div class="vehicle-location">
                    <i class="bi bi-geo-alt"></i>
                    ${storeData ? (storeData.city || '') + (storeData.state ? ` - ${storeData.state}` : '') : ''}
                </div>
                <button class="btn btn-success w-100 mt-3" onclick="event.stopPropagation(); openVehicleWhatsApp('${vehicle.id}', '${vehicle.brand}', '${vehicle.model}', ${vehicle.year})">
                    <i class="bi bi-whatsapp me-2"></i>Tenho Interesse
                </button>
            </div>
        </div>
    `;
}

// Get vehicle image
function getVehicleImage(vehicle) {
    if (!vehicle.images || vehicle.images.length === 0) {
        return 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27320%27 height=%27220%27%3E%3Crect fill=%27%23f5f5f5%27 width=%27320%27 height=%27220%27/%3E%3Ctext fill=%27%23999%27 font-family=%27sans-serif%27 font-size=%2714%27 dy=%2710.5%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ESem imagem%3C/text%3E%3C/svg%3E';
    }
    
    return Array.isArray(vehicle.images) ? vehicle.images[0] : vehicle.images;
}

// Toggle favorite
function toggleFavorite(vehicleId) {
    const index = favorites.indexOf(vehicleId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(vehicleId);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayVehicles();
}

// Clear filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('modelFilter').value = '';
    document.getElementById('minYear').value = '';
    document.getElementById('maxYear').value = '';
    document.getElementById('maxMileage').value = '';
    document.getElementById('colorFilter').value = '';
    
    document.querySelectorAll('#brandFilters input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('#transmissionFilters input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    filterVehicles();
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
            <div class="empty-state">
                <i class="bi bi-inbox empty-state-icon"></i>
                <h3 class="h5 fw-bold mt-3 mb-2">Nenhum veículo disponível no momento.</h3>
                <p class="text-muted">Esta loja ainda não possui veículos disponíveis em seu catálogo.</p>
            </div>
        `;
    }
    
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = '0 veículos disponíveis';
    }
}

// Format functions
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

function formatMileage(mileage) {
    return new Intl.NumberFormat('pt-BR').format(mileage);
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
