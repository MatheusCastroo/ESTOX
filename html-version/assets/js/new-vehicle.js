// New Vehicle JavaScript
// API_URL is defined in config.js

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
});

function getAuthToken() {
    return localStorage.getItem('token');
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
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
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
    images.forEach((img, index) => {
        const div = document.createElement('div');
        div.className = 'col-6';
        div.innerHTML = `
            <div class="position-relative">
                <img src="${img}" class="img-fluid rounded" style="height: 100px; object-fit: cover; width: 100%;">
                <button type="button" class="btn-close position-absolute top-0 end-0 m-1 bg-white" onclick="removeImage(${index})"></button>
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
        
        if (!brand || !model || !year || !mileage || !price) {
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
            description: document.getElementById('description').value,
            features: features,
            images: images,
            status: document.getElementById('status').value
        };
        
        console.log('Enviando dados do veículo:', vehicleData);
        
        const response = await fetch(`${API_URL}/vehicles`, {
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
            errorMessage = 'Erro de conexão. Verifique se a API está acessível em: ' + API_URL;
        } else if (error.message.includes('JSON')) {
            errorMessage = 'Erro ao processar resposta do servidor.';
        } else {
            errorMessage = 'Erro: ' + error.message;
        }
        
        Toast.error(errorMessage);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-save me-2"></i>Salvar Veículo';
        }
    }
}



