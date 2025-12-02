// New Vehicle JavaScript

const API_URL = 'http://localhost/api';

let features = [];
let images = [];

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    // Populate years
    const yearSelect = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 30; i++) {
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
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
                const div = document.createElement('div');
                div.className = 'col-6';
                div.innerHTML = `
                    <div class="position-relative">
                        <img src="${e.target.result}" class="img-fluid rounded" style="height: 100px; object-fit: cover; width: 100%;">
                        <button type="button" class="btn-close position-absolute top-0 end-0 m-1 bg-white" onclick="removeImage('${e.target.result}')"></button>
                    </div>
                `;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        }
    });
}

function removeImage(imageSrc) {
    images = images.filter(img => img !== imageSrc);
    const preview = document.getElementById('imagesPreview');
    preview.innerHTML = '';
    images.forEach(img => {
        const div = document.createElement('div');
        div.className = 'col-6';
        div.innerHTML = `
            <div class="position-relative">
                <img src="${img}" class="img-fluid rounded" style="height: 100px; object-fit: cover; width: 100%;">
                <button type="button" class="btn-close position-absolute top-0 end-0 m-1 bg-white" onclick="removeImage('${img}')"></button>
            </div>
        `;
        preview.appendChild(div);
    });
}

async function saveVehicle(e) {
    e.preventDefault();
    
    try {
        const response = await fetch(`${API_URL}/vehicles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                brand: document.getElementById('brand').value,
                model: document.getElementById('model').value,
                year: parseInt(document.getElementById('year').value),
                mileage: parseInt(document.getElementById('mileage').value),
                price: parseFloat(document.getElementById('price').value),
                fuel: document.getElementById('fuel').value,
                transmission: document.getElementById('transmission').value,
                color: document.getElementById('color').value,
                description: document.getElementById('description').value,
                features: features,
                images: images,
                status: document.getElementById('status').value
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = 'veiculos.html';
        } else {
            alert(data.error || 'Erro ao criar veículo');
        }
    } catch (error) {
        console.error('Error saving vehicle:', error);
        alert('Erro ao criar veículo');
    }
}



