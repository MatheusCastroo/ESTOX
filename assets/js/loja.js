// Loja JavaScript - REQ-FR-021
// Landing Page Pública da Revenda (Catálogo Completo de Veículos)
// API_URL is defined in config.js

// Ensure buildApiUrl is available (fallback if config.js didn't load)
if (typeof window.buildApiUrl !== 'function') {
    window.buildApiUrl = function(endpoint) {
        const apiBase = (window.API_URL || 'http://localhost/ESTOX/api/index.php').replace(/\/$/, '');
        const base = apiBase.endsWith('/index.php') ? apiBase : apiBase + '/index.php';
        return `${base}/${endpoint.replace(/^\//, '')}`;
    };
}

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
    
    // Load about image from localStorage immediately
    loadAboutImage();
    
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
    document.getElementById('colorFilter').addEventListener('input', debounce(filterVehicles, 300));
    document.getElementById('bodyTypeFilter').addEventListener('change', filterVehicles);
    
    // REQ-FR-LP-001 4.4: Ordenação de resultados
    document.getElementById('sortSelect').addEventListener('change', function() {
        filterVehicles();
    });
    
    // Smooth scroll for anchor links (only internal links, not external links like WhatsApp)
    // IMPORTANTE: Usar event delegation para evitar problemas com links atualizados dinamicamente
    // Links externos (como WhatsApp) não devem ser processados aqui
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        // Verificar se é realmente uma âncora válida (começa com # e não é apenas #)
        // Ignorar links externos (http, https, wa.me, etc)
        if (href && href.startsWith('#') && href !== '#' && 
            !href.includes('http') && !href.includes('https') && 
            !href.includes('wa.me') && !href.includes('mailto:') && !href.includes('tel:')) {
            e.preventDefault();
            try {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            } catch (error) {
                // Se houver erro ao fazer querySelector, deixar o comportamento padrão
                console.warn('Erro ao fazer smooth scroll:', error);
            }
        }
        // Se não for uma âncora válida, deixar o comportamento padrão (não fazer preventDefault)
    });
});

// Load store information
async function loadStoreInfo() {
    try {
        // Try public endpoint first
        const response = await fetch(window.buildApiUrl(`stores?public=true&slug=${storeSlug}`));
        const data = await response.json();
        
        if (data.success && data.data && data.data.store) {
            storeData = data.data.store;
            displayStoreInfo(storeData);
        } else {
            // Try alternative endpoint (from vehicles)
            const altResponse = await fetch(window.buildApiUrl(`vehicles?public=true&store_slug=${storeSlug}`));
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
            const altResponse = await fetch(window.buildApiUrl(`vehicles?public=true&store_slug=${storeSlug}`));
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
    console.log('Setup WhatsApp - Store data:', store);
    
    // Verificar se whatsapp existe e não está vazio
    let whatsappNumber = null;
    if (store.whatsapp) {
        whatsappNumber = store.whatsapp.toString().trim();
    }
    
    // Verificar também no campo phone se whatsapp não estiver disponível
    if ((!whatsappNumber || whatsappNumber === '' || whatsappNumber === 'null' || whatsappNumber === 'undefined') && store.phone) {
        whatsappNumber = store.phone.toString().trim();
        console.log('Usando número de telefone como WhatsApp:', whatsappNumber);
    }
    
    if (!whatsappNumber || whatsappNumber === '' || whatsappNumber === 'null' || whatsappNumber === 'undefined') {
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
        console.warn('WhatsApp não configurado para a loja. Store:', store);
        return;
    }
    
    // NÃO codificar aqui - getWhatsAppUrl já faz a codificação
    const message = `Olá ${store.name}! Gostaria de mais informações sobre os veículos.`;
    const whatsappUrl = getWhatsAppUrl(whatsappNumber, message);
    
    console.log('Configurando WhatsApp:', {
        whatsappNumber: whatsappNumber,
        whatsappUrl: whatsappUrl,
        storeName: store.name
    });
    
    // Hero button
    const heroBtn = document.getElementById('heroWhatsAppBtn');
    if (heroBtn) {
        heroBtn.href = whatsappUrl;
        heroBtn.style.display = 'inline-block';
        console.log('Botão WhatsApp do hero configurado:', heroBtn.href);
    }
    
    // Footer button
    const footerBtn = document.getElementById('footerWhatsAppBtn');
    if (footerBtn) {
        footerBtn.href = whatsappUrl;
        footerBtn.classList.remove('d-none');
        console.log('Botão WhatsApp do footer configurado:', footerBtn.href);
    }
    
    // Header button - REQ-FR-021
    const headerBtn = document.getElementById('headerWhatsAppBtn');
    if (headerBtn) {
        headerBtn.href = whatsappUrl;
        headerBtn.classList.remove('d-none');
        // Garantir que o botão está visível
        headerBtn.style.display = 'inline-block';
        console.log('✅ Botão WhatsApp do header configurado:', {
            href: headerBtn.href,
            whatsappNumber: whatsappNumber,
            whatsappUrl: whatsappUrl,
            element: headerBtn
        });
        
        // Verificar se o href foi realmente definido
        setTimeout(() => {
            if (headerBtn.href === '#' || headerBtn.href.includes('#')) {
                console.error('❌ ERRO: Link do WhatsApp não foi configurado corretamente!', {
                    currentHref: headerBtn.href,
                    expectedUrl: whatsappUrl,
                    whatsappNumber: whatsappNumber
                });
            } else {
                console.log('✅ Link do WhatsApp verificado e funcionando:', headerBtn.href);
            }
        }, 100);
    } else {
        console.error('❌ Botão WhatsApp do header não encontrado!');
    }
}

// Get WhatsApp URL
// REGRA: Manter mensagem sempre em formato legível, codificar apenas na URL
function getWhatsAppUrl(phone, message = '') {
    if (!phone) {
        console.error('Número de WhatsApp não fornecido');
        return '#';
    }
    
    // Remove non-numeric characters
    let cleanPhone = phone.toString().replace(/\D/g, '');
    
    // Validar se tem pelo menos 10 dígitos (número válido)
    if (cleanPhone.length < 10) {
        console.error('Número de WhatsApp inválido:', phone);
        return '#';
    }
    
    // Add country code if not present (Brasil = 55)
    if (!cleanPhone.startsWith('55')) {
        cleanPhone = '55' + cleanPhone;
    }
    
    // IMPORTANTE: A mensagem deve sempre chegar em formato legível (não codificada)
    // Se por algum motivo estiver codificada, decodificar primeiro
    let cleanMessage = message;
    
    if (message && typeof message === 'string') {
        // Verificar se a mensagem está codificada (contém padrão de URL encoding)
        if (message.includes('%') && /%[0-9A-Fa-f]{2}/.test(message)) {
            try {
                // Decodificar uma vez
                cleanMessage = decodeURIComponent(message);
                // Se ainda contém padrão de encoding, pode estar duplamente codificada
                if (cleanMessage.includes('%') && /%[0-9A-Fa-f]{2}/.test(cleanMessage)) {
                    cleanMessage = decodeURIComponent(cleanMessage);
                }
            } catch (e) {
                // Se falhar, usar a mensagem original
                console.warn('Erro ao decodificar mensagem, usando original:', e);
                cleanMessage = message;
            }
        }
    }
    
    // Codificar a mensagem APENAS UMA VEZ para a URL
    // O WhatsApp decodifica automaticamente quando recebe
    const encodedMessage = cleanMessage ? encodeURIComponent(cleanMessage) : '';
    const url = `https://wa.me/${cleanPhone}${encodedMessage ? '?text=' + encodedMessage : ''}`;
    
    // Log para debug (mensagem legível para verificação)
    console.log('WhatsApp URL gerada:', {
        mensagemOriginal: message,
        mensagemLimpa: cleanMessage,
        url: url
    });
    
    return url;
}

// Load all vehicles - REQ-FR-021: Only available vehicles
async function loadAllVehicles() {
    try {
        // REQ-FR-021: API now filters by available by default, but we'll also filter on frontend
        const response = await fetch(window.buildApiUrl(`vehicles?public=true&store_slug=${storeSlug}&status=available`));
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
            
            // Load about image
            loadAboutImage();
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
    const hasImage = mainImage && mainImage !== null;
    
    return `
        <div class="col-md-6 col-lg-4">
            <div class="vehicle-card-modern" onclick="window.location.href='veiculo-detalhe.html?store_slug=${storeSlug}&vehicle_id=${vehicle.id}'">
                <div class="vehicle-card-image ${!hasImage ? 'no-image' : ''}">
                    ${hasImage ? `<img src="${mainImage}" 
                         alt="${vehicle.brand} ${vehicle.model}"
                         loading="lazy"
                         crossorigin="anonymous"
                         style="width: 100%; height: 100%; object-fit: cover; display: block; opacity: 0; transition: opacity 0.3s;"
                         onerror="console.error('Erro ao carregar imagem:', this.src); this.style.display='none'; this.parentElement.classList.add('no-image'); this.onerror=null;"
                         onload="this.style.opacity='1'; this.parentElement.classList.remove('no-image');">` : ''}
                    ${isFeatured ? '<span class="vehicle-card-badge">Novidade</span>' : ''}
                    <button class="vehicle-card-favorite" onclick="event.stopPropagation(); toggleFavorite('${vehicle.id}')" title="Adicionar aos favoritos">
                        <i class="bi bi-heart"></i>
                    </button>
                </div>
                <div class="vehicle-card-body">
                    <h3 class="vehicle-card-title">${vehicle.brand} ${vehicle.model}</h3>
                    <div class="vehicle-card-info">
                        <span class="vehicle-card-info-item"><i class="bi bi-calendar"></i>${vehicle.year}</span>
                        <span class="vehicle-card-info-item"><i class="bi bi-speedometer2"></i>${formatNumber(vehicle.mileage)} km</span>
                        ${vehicle.transmission ? `<span class="vehicle-card-info-item"><i class="bi bi-gear"></i>${vehicle.transmission}</span>` : ''}
                    </div>
                    <div class="vehicle-card-price">${formatPrice(vehicle.price)}</div>
                    ${storeCityState ? `<div class="vehicle-card-location"><i class="bi bi-geo-alt"></i>${storeCityState}</div>` : ''}
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

// Normalize image URL - convert relative to absolute if needed
function normalizeImageUrl(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }
    
    // Se já é uma URL absoluta (http/https) ou data URI, retornar como está
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    
    // Se começa com //, adicionar protocolo
    if (url.startsWith('//')) {
        return window.location.protocol + url;
    }
    
    // Se é um caminho relativo, converter para absoluto
    if (url.startsWith('/')) {
        // Caminho absoluto do servidor
        return window.location.origin + url;
    }
    
    // Caminho relativo - construir URL completa
    const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    return baseUrl + '/' + url.replace(/^\.\//, '');
}

// Get vehicle image
function getVehicleImage(vehicle) {
    if (!vehicle.images) {
        return null; // Retorna null para usar placeholder elegante
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
    
    if (images.length === 0) {
        return null;
    }
    
    // Normalizar a primeira imagem
    const firstImage = images[0];
    return normalizeImageUrl(firstImage);
}

// Filter vehicles - REQ-FR-LP-001: Filtros completos e ordenação
function filterVehicles() {
    const searchInputEl = document.getElementById('searchInput');
    const search = searchInputEl ? searchInputEl.value.toLowerCase() : '';
    
    // Ler valores dos filtros desktop ou mobile (prioridade para desktop se ambos existirem)
    const brandFilterEl = document.getElementById('brandFilter');
    const brandFilterMobileEl = document.getElementById('brandFilterMobile');
    const brand = brandFilterEl ? brandFilterEl.value : (brandFilterMobileEl ? brandFilterMobileEl.value : '');
    
    const modelFilterEl = document.getElementById('modelFilter');
    const modelFilterMobileEl = document.getElementById('modelFilterMobile');
    const model = modelFilterEl ? modelFilterEl.value : (modelFilterMobileEl ? modelFilterMobileEl.value : '');
    
    const minYearEl = document.getElementById('minYear');
    const minYearMobileEl = document.getElementById('minYearMobile');
    const minYear = parseInt((minYearEl ? minYearEl.value : (minYearMobileEl ? minYearMobileEl.value : '')) || '0') || 0;
    
    const maxYearEl = document.getElementById('maxYear');
    const maxYearMobileEl = document.getElementById('maxYearMobile');
    const maxYear = parseInt((maxYearEl ? maxYearEl.value : (maxYearMobileEl ? maxYearMobileEl.value : '')) || '9999') || 9999;
    
    const minPriceEl = document.getElementById('minPrice');
    const minPriceMobileEl = document.getElementById('minPriceMobile');
    const minPrice = parseFloat((minPriceEl ? minPriceEl.value : (minPriceMobileEl ? minPriceMobileEl.value : '')) || '0') || 0;
    
    const maxPriceEl = document.getElementById('maxPrice');
    const maxPriceMobileEl = document.getElementById('maxPriceMobile');
    const maxPrice = parseFloat((maxPriceEl ? maxPriceEl.value : (maxPriceMobileEl ? maxPriceMobileEl.value : '')) || 'Infinity') || Infinity;
    
    const maxMileageEl = document.getElementById('maxMileage');
    const maxMileageMobileEl = document.getElementById('maxMileageMobile');
    const maxMileage = parseInt((maxMileageEl ? maxMileageEl.value : (maxMileageMobileEl ? maxMileageMobileEl.value : '')) || 'Infinity') || Infinity;
    
    const transmissionFilterEl = document.getElementById('transmissionFilter');
    const transmissionFilterMobileEl = document.getElementById('transmissionFilterMobile');
    const transmission = transmissionFilterEl ? transmissionFilterEl.value : (transmissionFilterMobileEl ? transmissionFilterMobileEl.value : '');
    
    const colorFilterEl = document.getElementById('colorFilter');
    const colorFilterMobileEl = document.getElementById('colorFilterMobile');
    const color = colorFilterEl ? colorFilterEl.value : (colorFilterMobileEl ? colorFilterMobileEl.value : '');
    
    const bodyTypeFilterEl = document.getElementById('bodyTypeFilter');
    const bodyTypeFilterMobileEl = document.getElementById('bodyTypeFilterMobile');
    const bodyType = bodyTypeFilterEl ? bodyTypeFilterEl.value : (bodyTypeFilterMobileEl ? bodyTypeFilterMobileEl.value : '');
    
    const sortSelectEl = document.getElementById('sortSelect');
    const sortBy = sortSelectEl ? sortSelectEl.value : 'relevance';
    
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
        const matchesColor = !color || (vehicle.color && vehicle.color.toLowerCase().includes(color.toLowerCase()));
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
    const brandFilterMobile = document.getElementById('brandFilterMobile');
    const currentBrand = brandFilter ? brandFilter.value : '';
    
    const optionsHtml = '<option value="">Todas as marcas</option>' + 
        brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
    
    if (brandFilter) {
        brandFilter.innerHTML = optionsHtml;
        if (currentBrand && brands.includes(currentBrand)) {
            brandFilter.value = currentBrand;
        }
    }
    
    // Sincronizar com mobile
    if (brandFilterMobile) {
        brandFilterMobile.innerHTML = optionsHtml;
        if (currentBrand && brands.includes(currentBrand)) {
            brandFilterMobile.value = currentBrand;
        }
    }
    
    // Atualizar modelos baseado na marca selecionada
    updateModelFilter(vehicles, brandFilter ? brandFilter.value : '');
}

// Update model filter based on selected brand - REQ-FR-LP-001
function updateModelFilter(vehicles, selectedBrand) {
    const modelFilter = document.getElementById('modelFilter');
    const modelFilterMobile = document.getElementById('modelFilterMobile');
    const currentModel = modelFilter ? modelFilter.value : '';
    
    let models = vehicles;
    if (selectedBrand) {
        models = vehicles.filter(v => v.brand === selectedBrand);
    }
    
    const uniqueModels = [...new Set(models.map(v => v.model))].sort();
    
    const optionsHtml = '<option value="">Todos os modelos</option>' + 
        uniqueModels.map(model => `<option value="${model}">${model}</option>`).join('');
    
    if (modelFilter) {
        modelFilter.innerHTML = optionsHtml;
        if (currentModel && uniqueModels.includes(currentModel)) {
            modelFilter.value = currentModel;
        }
    }
    
    // Sincronizar com mobile
    if (modelFilterMobile) {
        modelFilterMobile.innerHTML = optionsHtml;
        if (currentModel && uniqueModels.includes(currentModel)) {
            modelFilterMobile.value = currentModel;
        }
    }
    
    // Listener para atualizar modelos quando marca mudar (desktop e mobile)
    const brandFilter = document.getElementById('brandFilter');
    const brandFilterMobile = document.getElementById('brandFilterMobile');
    
    if (brandFilter && !brandFilter.hasAttribute('data-listener-added')) {
        brandFilter.setAttribute('data-listener-added', 'true');
        brandFilter.addEventListener('change', function() {
            updateModelFilter(allVehicles, this.value);
            // Sincronizar com mobile
            if (brandFilterMobile) {
                brandFilterMobile.value = this.value;
            }
        });
    }
    
    if (brandFilterMobile && !brandFilterMobile.hasAttribute('data-listener-added')) {
        brandFilterMobile.setAttribute('data-listener-added', 'true');
        brandFilterMobile.addEventListener('change', function() {
            updateModelFilter(allVehicles, this.value);
            // Sincronizar com desktop
            if (brandFilter) {
                brandFilter.value = this.value;
            }
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

// Load about image from localStorage or API
function loadAboutImage() {
    const aboutImageElement = document.querySelector('.about-image img');
    if (!aboutImageElement) return;
    
    // First try to get from localStorage
    const savedImage = localStorage.getItem('store_about_image');
    if (savedImage && savedImage.trim() !== '') {
        aboutImageElement.src = savedImage;
        return;
    }
    
    // If not in localStorage, try to get from API (if store has about_image field)
    // This would be loaded from storeData if available
    // For now, keep the placeholder or default image
}
