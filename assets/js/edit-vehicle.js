// Edit Vehicle JavaScript
// API_URL is defined in config.js

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

async function loadVehicle() {
    try {
        const response = await fetch(`${API_URL}/vehicles?id=${vehicleId}`, {
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
        
        const response = await fetch(`${API_URL}/vehicles?id=${vehicleId}`, {
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
            errorMessage = 'Erro de conexão. Verifique se a API está acessível em: ' + API_URL;
        } else if (error.message.includes('JSON')) {
            errorMessage = 'Erro ao processar resposta do servidor.';
        } else {
            errorMessage = 'Erro: ' + error.message;
        }
        
        Toast.error(errorMessage);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-save me-2"></i>Salvar Alterações';
        }
    }
}

