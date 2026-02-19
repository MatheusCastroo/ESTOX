// New Vehicle JavaScript
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

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    // Image preview
    document.getElementById('imagesInput').addEventListener('change', handleImageUpload);
    
    // Form submission
    document.getElementById('newVehicleForm').addEventListener('submit', saveVehicle);
    
    // Add feature on Enter
    document.getElementById('newFeature').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addFeature();
        }
    });
    
    // Verificar limite de veículos ao carregar a página
    checkVehicleLimit();
});

function getAuthToken() {
    return localStorage.getItem('token');
}

// Verificar limite de veículos antes de permitir cadastro
async function checkVehicleLimit() {
    try {
        const response = await fetch(window.buildApiUrl('dashboard?action=stats'), {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                const totalVehicles = data.data.total_vehicles || 0;
                const planVehicleLimit = data.data.plan_vehicle_limit;
                
                // Se o limite for -1, significa ilimitado
                if (planVehicleLimit !== null && planVehicleLimit !== -1 && planVehicleLimit !== undefined) {
                    const limit = parseInt(planVehicleLimit);
                    if (totalVehicles >= limit) {
                        // Desabilitar formulário e mostrar mensagem
                        const form = document.getElementById('newVehicleForm');
                        const submitBtn = form.querySelector('button[type="submit"]');
                        
                        if (submitBtn) {
                            submitBtn.disabled = true;
                            submitBtn.innerHTML = '<i class="bi bi-lock me-2"></i>Limite Atingido';
                        }
                        
                        // Mostrar alerta
                        const isFreePlan = limit === 5;
                        const message = isFreePlan 
                            ? 'Você atingiu o limite de 5 veículos do plano gratuito. Faça upgrade do seu plano para cadastrar mais veículos.'
                            : 'Você atingiu o limite de veículos permitido pelo seu plano.';
                        
                        // Adicionar alerta no topo do formulário
                        const alertDiv = document.createElement('div');
                        alertDiv.className = 'alert alert-warning alert-dismissible fade show';
                        alertDiv.innerHTML = `
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            <strong>Atenção:</strong> ${message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        `;
                        form.insertBefore(alertDiv, form.firstChild);
                    }
                }
            }
        }
    } catch (error) {
        console.warn('Não foi possível verificar o limite de veículos:', error);
        // Não bloquear o formulário se houver erro na verificação
    }
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
    const files = Array.from(e.target.files);
    const preview = document.getElementById('imagesPreview');
    const maxImages = 10;
    
    // Limitar número de imagens
    if (images.length + files.length > maxImages) {
        Toast.error(`Máximo de ${maxImages} imagens permitidas`);
        const allowedFiles = files.slice(0, maxImages - images.length);
        files = allowedFiles;
    }
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            // Validar tamanho (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Toast.error(`Imagem ${file.name} muito grande. Máximo 5MB.`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                images.push(e.target.result);
                updateImagesPreview();
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Clear input
    e.target.value = '';
}

function updateImagesPreview() {
    const preview = document.getElementById('imagesPreview');
    preview.innerHTML = '';
    
    if (images.length === 0) {
        preview.innerHTML = '<div class="col-12"><p class="text-muted small text-center">Nenhuma imagem selecionada</p></div>';
        return;
    }
    
    images.forEach((img, index) => {
        const div = document.createElement('div');
        div.className = 'col-6 col-md-4 col-lg-3';
        div.innerHTML = `
            <div class="position-relative mb-2">
                <img src="${img}" class="img-fluid rounded" style="height: 100px; object-fit: cover; width: 100%;" loading="lazy">
                <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onclick="removeImage(${index})" style="min-width: 32px; min-height: 32px; padding: 0;">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
        preview.appendChild(div);
    });
}

function removeImage(index) {
    images.splice(index, 1);
    const preview = document.getElementById('imagesPreview');
    preview.innerHTML = '';
    images.forEach((img, idx) => {
        const div = document.createElement('div');
        div.className = 'col-6';
        div.innerHTML = `
            <div class="position-relative">
                <img src="${img}" class="img-fluid rounded" style="height: 100px; object-fit: cover; width: 100%;">
                <button type="button" class="btn-close position-absolute top-0 end-0 m-1 bg-white" onclick="removeImage(${idx})"></button>
            </div>
        `;
        preview.appendChild(div);
    });
}

async function saveVehicle(e) {
    e.preventDefault();
    
    // Verificar limite antes de enviar (validação no frontend)
    const limitCheck = await checkVehicleLimitBeforeSubmit();
    if (!limitCheck.allowed) {
        Toast.error(limitCheck.message);
        return;
    }
    
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
                submitBtn.innerHTML = '<i class="bi bi-save me-2"></i>Salvar Veículo';
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
        
        const url = window.buildApiUrl('vehicles');
        const response = await fetch(url, {
            method: 'POST',
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
                submitBtn.innerHTML = '<i class="bi bi-save me-2"></i>Salvar Veículo';
            }
            return;
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (data.success) {
            Toast.success('Veículo salvo com sucesso!');
            setTimeout(() => {
                window.location.href = 'veiculos.html';
            }, 1500);
        } else {
            const errorMsg = data.error || 'Erro ao criar veículo';
            Toast.error(errorMsg);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-save me-2"></i>Salvar Veículo';
            }
        }
    } catch (error) {
        console.error('Erro ao salvar veículo:', error);
        let errorMessage = 'Erro ao criar veículo. Tente novamente.';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message.includes('JSON')) {
            errorMessage = 'Erro ao processar resposta do servidor. Tente novamente.';
        } else {
            errorMessage = 'Erro ao salvar veículo. Tente novamente.';
        }
        
        Toast.error(errorMessage);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-save me-2"></i>Salvar Veículo';
        }
    }
}

// Verificar limite de veículos antes de submeter o formulário
async function checkVehicleLimitBeforeSubmit() {
    try {
        const response = await fetch(window.buildApiUrl('dashboard?action=stats'), {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                const totalVehicles = data.data.total_vehicles || 0;
                const planVehicleLimit = data.data.plan_vehicle_limit;
                
                // Se o limite for -1, significa ilimitado
                if (planVehicleLimit !== null && planVehicleLimit !== -1 && planVehicleLimit !== undefined) {
                    const limit = parseInt(planVehicleLimit);
                    if (totalVehicles >= limit) {
                        const isFreePlan = limit === 5;
                        const message = isFreePlan 
                            ? 'Você atingiu o limite de 5 veículos do plano gratuito. Faça upgrade do seu plano para cadastrar mais veículos.'
                            : 'Você atingiu o limite de veículos permitido pelo seu plano.';
                        
                        return { allowed: false, message: message };
                    }
                }
            }
        }
    } catch (error) {
        console.warn('Não foi possível verificar o limite de veículos:', error);
        // Se houver erro, permitir tentar (o backend vai validar)
    }
    
    return { allowed: true };
}



