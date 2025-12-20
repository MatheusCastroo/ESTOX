// Vehicle Detail Landing Page JavaScript
// REQ-FR-LP-VEICULO-001: Landing Page de Detalhes do Veículo

let currentImageIndex = 0;
let images = [];
let vehicleData = null;
let storeData = null;
let whatsappUrl = '#';

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const storeSlug = urlParams.get('store_slug') || urlParams.get('slug') || null;
    const vehicleId = urlParams.get('vehicle_id') || urlParams.get('id') || null;
    
    if (!storeSlug) {
        showError('Parâmetro store_slug é obrigatório na URL.');
        return;
    }
    
    if (!vehicleId) {
        showError('Parâmetro vehicle_id é obrigatório na URL.');
        return;
    }
    
    loadVehicleDetail(storeSlug, vehicleId);
    
    // Mostrar/esconder botão sticky baseado no scroll
    window.addEventListener('scroll', function() {
        const ctaMobile = document.getElementById('ctaButtonMobile');
        if (window.innerWidth <= 768) {
            if (window.scrollY > 200) {
                ctaMobile.style.display = 'block';
            } else {
                ctaMobile.style.display = 'none';
            }
        }
    });
});

async function loadVehicleDetail(storeSlug, vehicleId) {
    try {
        const response = await fetch(`${API_URL}/vehicles?public=true&store_slug=${storeSlug}&vehicle_id=${vehicleId}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.vehicle && data.data.store) {
            vehicleData = data.data.vehicle;
            storeData = data.data.store;
            displayVehicleDetail();
        } else {
            showError('Veículo não encontrado ou não está mais disponível.');
        }
    } catch (error) {
        console.error('Error loading vehicle:', error);
        showError('Erro ao carregar veículo. Por favor, tente novamente.');
    }
}

function showError(message) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.innerHTML = `
        <div class="text-center py-5">
                    <i class="bi bi-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
                    <h2 class="h4 fw-bold mt-4 mb-2">Erro</h2>
                    <p class="text-muted mb-4">${message}</p>
                    <a href="loja.html?store_slug=${new URLSearchParams(window.location.search).get('store_slug') || ''}" class="btn btn-primary">
                        <i class="bi bi-arrow-left me-2"></i>Voltar ao catálogo
                    </a>
        </div>
    `;
}

function displayVehicleDetail() {
    // Parse JSON fields
    if (vehicleData.images) {
        if (typeof vehicleData.images === 'string') {
            try {
                images = JSON.parse(vehicleData.images || '[]');
            } catch (e) {
                images = [];
            }
        } else if (Array.isArray(vehicleData.images)) {
            images = vehicleData.images;
        }
    }
    
    // Se não houver imagens, usar placeholder
    if (images.length === 0) {
        images = ['data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27800%27 height=%27500%27%3E%3Crect fill=%27%23f5f5f5%27 width=%27800%27 height=%27500%27/%3E%3Ctext fill=%27%23999%27 font-family=%27sans-serif%27 font-size=%2724%27 dy=%2710.5%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ESem imagem disponível%3C/text%3E%3C/svg%3E'];
    }
    
    // Setup WhatsApp URL
    setupWhatsApp();
    
    // Display header
    displayHeader();
    
    // Display gallery
    displayGallery();
    
    // Display main info
    displayMainInfo();
    
    // Display basic info
    displayBasicInfo();
    
    // Display equipment
    displayEquipment();
    
    // Display specs accordion
    displaySpecsAccordion();
    
    // Show content
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
}

function setupWhatsApp() {
    if (storeData.whatsapp) {
        let phone = storeData.whatsapp.replace(/\D/g, '');
        if (!phone.startsWith('55')) {
            phone = '55' + phone;
        }
        
        const vehicleName = `${vehicleData.brand} ${vehicleData.model} ${vehicleData.year}`;
        const vehiclePrice = formatPrice(vehicleData.price);
        const vehiclePageUrl = window.location.href;
        
        const message = encodeURIComponent(
            `Olá ${storeData.name}! Tenho interesse no veículo:\n\n` +
            `${vehicleName}\n` +
            `Preço: ${vehiclePrice}\n` +
            `Link: ${vehiclePageUrl}\n\n` +
            `Poderia me dar mais informações?`
        );
        
        whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    }
}

function openWhatsApp() {
    if (whatsappUrl !== '#') {
        window.open(whatsappUrl, '_blank');
    } else {
        alert('WhatsApp não configurado para esta loja.');
    }
}

function displayHeader() {
    // Store logo
    const storeLogo = document.getElementById('storeLogo');
    if (storeData.logo_url) {
        storeLogo.src = storeData.logo_url;
        storeLogo.alt = storeData.name;
        storeLogo.classList.remove('d-none');
        storeLogo.onerror = function() {
            this.classList.add('d-none');
        };
    }
    
    // Store name
    document.getElementById('storeName').textContent = storeData.name || 'Loja';
    
    // Store location
    const locationParts = [];
    if (storeData.city) locationParts.push(storeData.city);
    if (storeData.state) locationParts.push(storeData.state);
    document.getElementById('storeLocation').textContent = locationParts.join(', ') || '';
    
    // Back to catalog link
    const urlParams = new URLSearchParams(window.location.search);
    const storeSlug = urlParams.get('store_slug') || urlParams.get('slug') || '';
    document.getElementById('backToCatalog').href = `loja.html?store_slug=${storeSlug}`;
}

function displayGallery() {
    currentImageIndex = 0;
    updateMainImage();
    updateThumbnails();
    updateImageCounter();
}

function changeImage(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = images.length - 1;
    } else if (currentImageIndex >= images.length) {
        currentImageIndex = 0;
    }
    
    updateMainImage();
    updateThumbnails();
    updateImageCounter();
}

function updateMainImage() {
    const mainImage = document.getElementById('mainImage');
    mainImage.src = images[currentImageIndex];
    mainImage.alt = `${vehicleData.brand} ${vehicleData.model} - Foto ${currentImageIndex + 1}`;
    
    // Show/hide navigation buttons
    document.getElementById('prevImage').style.display = images.length > 1 ? 'flex' : 'none';
    document.getElementById('nextImage').style.display = images.length > 1 ? 'flex' : 'none';
}

function updateThumbnails() {
    const container = document.getElementById('thumbnailContainer');
    container.innerHTML = images.map((img, index) => `
        <img src="${img}" 
             alt="Miniatura ${index + 1}" 
             class="thumbnail ${index === currentImageIndex ? 'active' : ''}"
             onclick="selectImage(${index})"
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%2760%27%3E%3Crect fill=%27%23ddd%27 width=%2780%27 height=%2760%27/%3E%3C/svg%3E'">
    `).join('');
}

function selectImage(index) {
    currentImageIndex = index;
    updateMainImage();
    updateThumbnails();
    updateImageCounter();
}

function updateImageCounter() {
    document.getElementById('imageCounter').textContent = `${currentImageIndex + 1}/${images.length}`;
}

function displayMainInfo() {
    // Vehicle title
    const title = `${vehicleData.brand} ${vehicleData.model} ${vehicleData.year}`;
    document.getElementById('vehicleTitle').textContent = title;
    
    // Vehicle subtitle (mileage)
    document.getElementById('vehicleSubtitle').textContent = `${formatMileage(vehicleData.mileage)} km`;
    
    // Store city/state
    const locationParts = [];
    if (storeData.city) locationParts.push(storeData.city);
    if (storeData.state) locationParts.push(storeData.state);
    document.getElementById('storeCityState').textContent = locationParts.join(', ') || 'Não informado';
    
    // Price
    document.getElementById('vehiclePrice').textContent = formatPrice(vehicleData.price);
}

function displayBasicInfo() {
    // City
    document.getElementById('infoCity').textContent = storeData.city || '-';
    
    // Store
    document.getElementById('infoStore').textContent = storeData.name || '-';
    
    // Code (vehicle ID)
    document.getElementById('infoCode').textContent = vehicleData.id.substring(0, 8).toUpperCase() || '-';
    
    // Body Type
    document.getElementById('infoBodyType').textContent = vehicleData.body_type || '-';
    
    // Location (not in database, show "-")
    document.getElementById('infoLocation').textContent = '-';
    
    // Plate (not in database, show "-")
    document.getElementById('infoPlate').textContent = '-';
}

function displayEquipment() {
    let features = [];
    if (vehicleData.features) {
        if (typeof vehicleData.features === 'string') {
            try {
                features = JSON.parse(vehicleData.features || '[]');
            } catch (e) {
                features = [];
            }
        } else if (Array.isArray(vehicleData.features)) {
            features = vehicleData.features;
        }
    }
    
    if (features.length === 0) {
        document.getElementById('equipmentSection').style.display = 'none';
        return;
    }
    
    document.getElementById('equipmentSection').style.display = 'block';
    
    // Equipment icons mapping
    const equipmentIcons = {
        'ar condicionado': 'bi-snow',
        'ar-condicionado': 'bi-snow',
        'direção elétrica': 'bi-steering-wheel',
        'direção hidráulica': 'bi-steering-wheel',
        'freios abs': 'bi-shield-check',
        'airbag': 'bi-shield',
        'airbags': 'bi-shield',
        'câmbio automático': 'bi-gear',
        'câmbio manual': 'bi-gear',
        'multimídia': 'bi-display',
        'som': 'bi-music-note',
        'teto solar': 'bi-sun',
        'couro': 'bi-circle',
        'alarme': 'bi-bell',
        'travas elétricas': 'bi-lock',
        'vidros elétricos': 'bi-window',
        'piloto automático': 'bi-speedometer',
        'sensor': 'bi-radar',
        'câmera': 'bi-camera',
        'reversa': 'bi-arrow-counterclockwise'
    };
    
    const equipmentGrid = document.getElementById('equipmentGrid');
    equipmentGrid.innerHTML = features.map(feature => {
        const featureLower = feature.toLowerCase();
        let icon = 'bi-check-circle';
        
        // Find matching icon
        for (const [key, value] of Object.entries(equipmentIcons)) {
            if (featureLower.includes(key)) {
                icon = value;
                break;
            }
        }
        
        return `
            <div class="equipment-card">
                <i class="bi ${icon}"></i>
                <p class="mb-0 fw-semibold">${feature}</p>
            </div>
        `;
    }).join('');
}

function displaySpecsAccordion() {
    const accordion = document.getElementById('specsAccordion');
    const specs = buildSpecsObject();
    
    const accordionItems = [];
    
    // Geral
    if (specs.geral.length > 0) {
        accordionItems.push(createAccordionItem('geral', 'Geral', 'bi-info-circle', specs.geral));
    }
    
    // Exterior
    if (specs.exterior.length > 0) {
        accordionItems.push(createAccordionItem('exterior', 'Exterior', 'bi-car-front', specs.exterior));
    }
    
    // Equipamentos e Conforto
    if (specs.equipamentos.length > 0) {
        accordionItems.push(createAccordionItem('equipamentos', 'Equipamentos e Conforto', 'bi-star', specs.equipamentos));
    }
    
    // Segurança
    if (specs.seguranca.length > 0) {
        accordionItems.push(createAccordionItem('seguranca', 'Segurança', 'bi-shield-check', specs.seguranca));
    }
    
    // Interior
    if (specs.interior.length > 0) {
        accordionItems.push(createAccordionItem('interior', 'Interior', 'bi-door-open', specs.interior));
    }
    
    // Multimídia
    if (specs.multimidia.length > 0) {
        accordionItems.push(createAccordionItem('multimidia', 'Multimídia', 'bi-display', specs.multimidia));
    }
    
    accordion.innerHTML = accordionItems.join('');
}

function buildSpecsObject() {
    const specs = {
        geral: [],
        exterior: [],
        equipamentos: [],
        seguranca: [],
        interior: [],
        multimidia: []
    };
    
    // Geral
    if (vehicleData.brand) specs.geral.push(`Marca: ${vehicleData.brand}`);
    if (vehicleData.model) specs.geral.push(`Modelo: ${vehicleData.model}`);
    if (vehicleData.year) specs.geral.push(`Ano: ${vehicleData.year}`);
    if (vehicleData.mileage) specs.geral.push(`Quilometragem: ${formatMileage(vehicleData.mileage)} km`);
    if (vehicleData.fuel) specs.geral.push(`Combustível: ${vehicleData.fuel}`);
    if (vehicleData.transmission) specs.geral.push(`Câmbio: ${vehicleData.transmission}`);
    if (vehicleData.color) specs.geral.push(`Cor: ${vehicleData.color}`);
    if (vehicleData.body_type) specs.geral.push(`Tipo: ${vehicleData.body_type}`);
    
    // Parse features
    let features = [];
    if (vehicleData.features) {
        if (typeof vehicleData.features === 'string') {
            try {
                features = JSON.parse(vehicleData.features || '[]');
            } catch (e) {
                features = [];
            }
        } else if (Array.isArray(vehicleData.features)) {
            features = vehicleData.features;
        }
    }
    
    // Categorize features
    features.forEach(feature => {
        const featureLower = feature.toLowerCase();
        
        // Segurança
        if (featureLower.includes('abs') || featureLower.includes('airbag') || 
            featureLower.includes('segurança') || featureLower.includes('alarme') ||
            featureLower.includes('sensor') || featureLower.includes('câmera')) {
            specs.seguranca.push(feature);
        }
        // Exterior
        else if (featureLower.includes('teto') || featureLower.includes('farol') ||
                 featureLower.includes('roda') || featureLower.includes('pneu') ||
                 featureLower.includes('retrovisor') || featureLower.includes('para-choque')) {
            specs.exterior.push(feature);
        }
        // Interior
        else if (featureLower.includes('couro') || featureLower.includes('banco') ||
                 featureLower.includes('volante') || featureLower.includes('painel') ||
                 featureLower.includes('console')) {
            specs.interior.push(feature);
        }
        // Multimídia
        else if (featureLower.includes('som') || featureLower.includes('multimídia') ||
                 featureLower.includes('display') || featureLower.includes('bluetooth') ||
                 featureLower.includes('usb') || featureLower.includes('cd') ||
                 featureLower.includes('radio') || featureLower.includes('navegação')) {
            specs.multimidia.push(feature);
        }
        // Equipamentos e Conforto
        else {
            specs.equipamentos.push(feature);
        }
    });
    
    return specs;
}

function createAccordionItem(id, title, icon, items) {
    const itemId = `spec-${id}`;
    return `
        <div class="accordion-item">
            <h2 class="accordion-header" id="heading-${itemId}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                        data-bs-target="#collapse-${itemId}" aria-expanded="false" aria-controls="collapse-${itemId}">
                    <i class="bi ${icon} me-2"></i>${title}
                </button>
            </h2>
            <div id="collapse-${itemId}" class="accordion-collapse collapse" 
                 aria-labelledby="heading-${itemId}" data-bs-parent="#specsAccordion">
                <div class="accordion-body">
                    <ul class="spec-list">
                        ${items.map(item => `
                            <li>
                                <i class="bi bi-check-circle"></i>
                                <span>${item}</span>
                            </li>
                        `).join('')}
                    </ul>
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

function formatMileage(mileage) {
    return new Intl.NumberFormat('pt-BR').format(mileage);
}
