// Edit Vehicle JavaScript
// API_URL and buildApiUrl are defined in config.js
// Ensure buildApiUrl is available (fallback if config.js didn't load)
if (typeof window.buildApiUrl !== 'function') {
    window.buildApiUrl = function(endpoint) {
        const apiBase = (window.API_URL || 'http://localhost/ESTOX/api/index.php').replace(/\/$/, '');
        const base = apiBase.endsWith('/index.php') ? apiBase : apiBase + '/index.php';
        return `${base}/${endpoint.replace(/^\//, '')}`;
    };
}

let features = [];
let images = [];
let vehicleId = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    // Get vehicle ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    vehicleId = urlParams.get('id');
    
    if (!vehicleId) {
        Toast.error('ID do veículo não fornecido');
        window.location.href = 'veiculos.html';
        return;
    }
    
    // Load vehicle data
    loadVehicle();
    
    // Image preview
    document.getElementById('imagesInput').addEventListener('change', handleImageUpload);
    
    // Form submission
    document.getElementById('editVehicleForm').addEventListener('submit', updateVehicle);
    
    // Add feature on Enter
    document.getElementById('newFeature').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addFeature();
        }
    });
});

function getAuthToken() {
    return localStorage.getItem('token');
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
    
    // Se é um caminho absoluto do servidor, adicionar origin
    if (url.startsWith('/')) {
        return window.location.origin + url;
    }
    
    // Caminho relativo - construir URL completa baseada na API
    // Se a imagem está na pasta de uploads da API
    if (url.includes('uploads') || url.includes('vehicles')) {
        // Tentar múltiplas formas de construir a URL base
        let apiBase = '';
        
        // Método 1: Remover /api/index.php ou /api
        if (API_URL) {
            apiBase = API_URL.replace('/api/index.php', '').replace('/api', '');
        }
        
        // Método 2: Se não funcionou, usar origin
        if (!apiBase || apiBase === API_URL) {
            apiBase = window.location.origin;
        }
        
        // Limpar barras duplas e construir URL
        const cleanUrl = url.replace(/^\.\//, '').replace(/^\//, '');
        const finalUrl = apiBase + '/' + cleanUrl;
        
        return finalUrl;
    }
    
    // Caso padrão: construir URL relativa ao diretório atual
    const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    const cleanUrl = url.replace(/^\.\//, '').replace(/^\//, '');
    return baseUrl + '/' + cleanUrl;
}

// Get placeholder image
function getPlaceholderImage() {
    return 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%23e2e8f0%27 width=%27100%27 height=%27100%27/%3E%3Ctext fill=%27%2394a3b8%27 font-family=%27sans-serif%27 font-size=%2712%27 dy=%2710.5%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ESem imagem%3C/text%3E%3C/svg%3E';
}

async function loadVehicle() {
    try {
        const url = window.buildApiUrl(`vehicles?id=${vehicleId}`);
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar veículo');
        }
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.vehicle) {
            populateForm(data.data.vehicle);
        } else {
            Toast.error('Veículo não encontrado');
            window.location.href = 'veiculos.html';
        }
    } catch (error) {
        console.error('Error loading vehicle:', error);
        Toast.error('Erro ao carregar veículo');
        window.location.href = 'veiculos.html';
    }
}

function populateForm(vehicle) {
    // Basic info
    document.getElementById('brand').value = vehicle.brand || '';
    document.getElementById('model').value = vehicle.model || '';
    document.getElementById('year').value = vehicle.year || '';
    document.getElementById('mileage').value = vehicle.mileage || '';
    document.getElementById('price').value = vehicle.price || '';
    document.getElementById('fuel').value = vehicle.fuel || '';
    document.getElementById('transmission').value = vehicle.transmission || '';
    document.getElementById('color').value = vehicle.color || '';
    document.getElementById('bodyType').value = vehicle.body_type || '';
    document.getElementById('description').value = vehicle.description || '';
    document.getElementById('status').value = vehicle.status || 'available';
    
    // Parse features
    if (vehicle.features) {
        if (typeof vehicle.features === 'string') {
            try {
                features = JSON.parse(vehicle.features);
            } catch (e) {
                features = [];
            }
        } else if (Array.isArray(vehicle.features)) {
            features = vehicle.features;
        } else {
            features = [];
        }
    } else {
        features = [];
    }
    updateFeaturesList();
    
    // Parse images
    if (vehicle.images) {
        if (typeof vehicle.images === 'string') {
            try {
                images = JSON.parse(vehicle.images);
            } catch (e) {
                images = [];
            }
        } else if (Array.isArray(vehicle.images)) {
            images = vehicle.images;
        } else {
            images = [];
        }
    } else {
        images = [];
    }
    
    // Normalizar todas as URLs das imagens
    images = images.map(img => {
        // Se já é data URI (base64), retornar como está
        if (img.startsWith('data:')) {
            return img;
        }
        // Normalizar URL
        return normalizeImageUrl(img);
    }).filter(img => img !== null);
    
    updateImagesPreview();
    
    // Hide loading, show form
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('editVehicleForm').style.display = 'block';
}

function addFeature() {
    const input = document.getElementById('newFeature');
    const feature = input.value.trim();
    
    if (feature && !features.includes(feature)) {
        features.push(feature);
        updateFeaturesList();
        input.value = '';
    }
}

function removeFeature(feature) {
    features = features.filter(f => f !== feature);
    updateFeaturesList();
}

function updateFeaturesList() {
    const container = document.getElementById('featuresList');
    container.innerHTML = features.map(feature => `
        <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
            ${feature}
            <button type="button" class="btn-close btn-close-sm ms-2" onclick="removeFeature('${feature}')"></button>
        </span>
    `).join('');
}

function handleImageUpload(e) {
    let files = Array.from(e.target.files || []);
    const preview = document.getElementById('imagesPreview');
    const maxImages = 10;
    
    if (!files || files.length === 0) {
        return;
    }
    
    // Limitar número de imagens
    if (images.length + files.length > maxImages) {
        Toast.error(`Máximo de ${maxImages} imagens permitidas`);
        files = files.slice(0, maxImages - images.length);
    }
    
    // Processar imagens uma de cada vez para evitar problemas em mobile
    let processedCount = 0;
    const totalFiles = files.length;
    
    files.forEach((file, fileIndex) => {
        if (!file.type.startsWith('image/')) {
            processedCount++;
            if (processedCount === totalFiles) {
                e.target.value = '';
            }
            return;
        }
        
        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            Toast.error(`Imagem ${file.name} muito grande. Máximo 5MB.`);
            processedCount++;
            if (processedCount === totalFiles) {
                e.target.value = '';
            }
            return;
        }
        
        // Mostrar placeholder enquanto carrega
        const tempId = 'temp-' + Date.now() + '-' + fileIndex;
        const tempDiv = document.createElement('div');
        tempDiv.id = tempId;
        tempDiv.className = 'col-6 col-md-4 col-lg-3';
        tempDiv.innerHTML = `
            <div class="position-relative mb-2">
                <div class="d-flex align-items-center justify-content-center rounded" style="height: 100px; background: #f0f0f0;">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </div>
            </div>
        `;
        preview.appendChild(tempDiv);
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const dataUrl = event.target.result;
                
                // Adicionar à lista de imagens
                images.push(dataUrl);
                
                // Remover placeholder temporário
                const tempElement = document.getElementById(tempId);
                if (tempElement) {
                    tempElement.remove();
                }
                
                // Atualizar preview completo para garantir ordem correta
                updateImagesPreview();
                
                processedCount++;
                if (processedCount === totalFiles) {
                    e.target.value = '';
                }
            } catch (error) {
                console.error('Erro ao processar imagem:', error);
                Toast.error(`Erro ao processar imagem ${file.name}`);
                
                // Remover placeholder temporário
                const tempElement = document.getElementById(tempId);
                if (tempElement) {
                    tempElement.remove();
                }
                
                processedCount++;
                if (processedCount === totalFiles) {
                    e.target.value = '';
                }
            }
        };
        
        reader.onerror = function() {
            console.error('Erro ao ler arquivo:', file.name);
            Toast.error(`Erro ao ler imagem ${file.name}`);
            
            // Remover placeholder temporário
            const tempElement = document.getElementById(tempId);
            if (tempElement) {
                tempElement.remove();
            }
            
            processedCount++;
            if (processedCount === totalFiles) {
                e.target.value = '';
            }
        };
        
        // Ler arquivo como data URL
        reader.readAsDataURL(file);
    });
    
    // Se não houver arquivos válidos, limpar input
    if (totalFiles === 0) {
        e.target.value = '';
    }
}

function removeImage(index) {
    images.splice(index, 1);
    updateImagesPreview();
}

function updateImagesPreview() {
    const preview = document.getElementById('imagesPreview');
    preview.innerHTML = '';
    
    if (images.length === 0) {
        preview.innerHTML = '<div class="col-12"><p class="text-muted small text-center">Nenhuma imagem selecionada</p></div>';
        return;
    }
    
    const placeholderUrl = getPlaceholderImage();
    
    images.forEach((img, index) => {
        const div = document.createElement('div');
        div.className = 'col-6 col-md-4 col-lg-3';
        
        // Escapar caracteres especiais no src para evitar problemas
        const escapedImg = img.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        
        div.innerHTML = `
            <div class="position-relative mb-2">
                <img src="${escapedImg}" 
                     class="img-fluid rounded vehicle-edit-image" 
                     style="height: 100px; object-fit: cover; width: 100%; display: block !important; visibility: visible !important; opacity: 1 !important; background: #f0f0f0;" 
                     loading="eager"
                     onerror="this.onerror=null; this.src='${placeholderUrl}'; this.style.display='block'; this.style.visibility='visible'; this.style.opacity='1';"
                     onload="this.style.display='block'; this.style.visibility='visible'; this.style.opacity='1'; this.style.background='transparent';">
                <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onclick="removeImage(${index})" style="min-width: 32px; min-height: 32px; padding: 0; z-index: 10;">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
        preview.appendChild(div);
    });
    
    // Adicionar tratamento de erro para todas as imagens após inserir no DOM
    setTimeout(() => {
        const imageElements = preview.querySelectorAll('img.vehicle-edit-image');
        imageElements.forEach((img, index) => {
            if (!img.hasAttribute('data-error-handled')) {
                img.setAttribute('data-error-handled', 'true');
                
                // Garantir que a imagem seja visível
                img.style.display = 'block';
                img.style.visibility = 'visible';
                img.style.opacity = '1';
                
                // Se for data URI, não tentar caminhos alternativos
                if (img.src.startsWith('data:')) {
                    // Apenas garantir que está visível
                    img.onload = function() {
                        this.style.display = 'block';
                        this.style.visibility = 'visible';
                        this.style.opacity = '1';
                        this.style.background = 'transparent';
                    };
                    img.onerror = function() {
                        // Se data URI falhar, usar placeholder
                        if (this.src !== placeholderUrl) {
                            this.src = placeholderUrl;
                            this.style.display = 'block';
                        }
                    };
                } else {
                    // Para URLs normais, tentar múltiplos caminhos se falhar
                    const originalSrc = img.src;
                    let attemptCount = 0;
                    const alternativePaths = [
                        originalSrc,
                        originalSrc.replace(/^\.\//, ''),
                        window.location.origin + '/' + originalSrc.replace(window.location.origin, '').replace(/^\//, ''),
                        originalSrc.startsWith('/') ? window.location.origin + originalSrc : originalSrc
                    ];
                    
                    img.addEventListener('error', function() {
                        attemptCount++;
                        if (attemptCount < alternativePaths.length) {
                            // Tentar próximo caminho
                            this.src = alternativePaths[attemptCount];
                        } else {
                            // Usar placeholder se todos falharem
                            if (this.src !== placeholderUrl) {
                                this.src = placeholderUrl;
                                this.style.display = 'block';
                            }
                        }
                    }, { once: false });
                }
                
                // Forçar verificação de carregamento
                if (img.complete && img.naturalHeight > 0) {
                    // Imagem já carregou
                    img.style.display = 'block';
                    img.style.visibility = 'visible';
                    img.style.opacity = '1';
                    img.style.background = 'transparent';
                } else {
                    // Aguardar carregamento
                    img.onload = function() {
                        this.style.display = 'block';
                        this.style.visibility = 'visible';
                        this.style.opacity = '1';
                        this.style.background = 'transparent';
                    };
                }
            }
        });
    }, 100);
}

async function updateVehicle(e) {
    e.preventDefault();
    
    // Get submit button and disable it
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';
    }
    
    try {
        // Validate required fields
        const brand = document.getElementById('brand').value;
        const model = document.getElementById('model').value;
        const year = document.getElementById('year').value;
        const mileage = document.getElementById('mileage').value;
        const price = document.getElementById('price').value;
        const bodyType = document.getElementById('bodyType').value;
        
        if (!brand || !model || !year || !mileage || !price || !bodyType) {
            Toast.error('Por favor, preencha todos os campos obrigatórios');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-save me-2"></i>Salvar Alterações';
            }
            return;
        }
        
        const vehicleData = {
            brand: brand,
            model: model,
            year: parseInt(year),
            mileage: parseInt(mileage),
            price: parseFloat(price),
            fuel: document.getElementById('fuel').value,
            transmission: document.getElementById('transmission').value,
            color: document.getElementById('color').value,
            body_type: document.getElementById('bodyType').value,
            description: document.getElementById('description').value,
            features: features,
            images: images,
            status: document.getElementById('status').value
        };
        
        console.log('Enviando dados do veículo:', vehicleData);
        
        const url = window.buildApiUrl(`vehicles?id=${vehicleId}`);
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(vehicleData)
        });
        
        console.log('Resposta da API:', response.status, response.statusText);
        
        // Check if response is OK before parsing JSON
        if (!response.ok) {
            let errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
            try {
                // Check content type before reading
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } else {
                    // If not JSON, read as text
                    const text = await response.text();
                    if (text) {
                        errorMessage = text;
                    }
                }
            } catch (e) {
                // If reading fails, use the default error message
                console.error('Erro ao ler resposta:', e);
            }
            Toast.error(errorMessage);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-save me-2"></i>Salvar Alterações';
            }
            return;
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (data.success) {
            Toast.success('Veículo atualizado com sucesso!');
            setTimeout(() => {
                window.location.href = 'veiculos.html';
            }, 1500);
        } else {
            const errorMsg = data.error || 'Erro ao atualizar veículo';
            Toast.error(errorMsg);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-save me-2"></i>Salvar Alterações';
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar veículo:', error);
        let errorMessage = 'Erro ao atualizar veículo. Tente novamente.';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message.includes('JSON')) {
            errorMessage = 'Erro ao processar resposta do servidor. Tente novamente.';
        } else {
            errorMessage = 'Erro ao atualizar veículo. Tente novamente.';
        }
        
        Toast.error(errorMessage);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-save me-2"></i>Salvar Alterações';
        }
    }
}

