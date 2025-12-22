// Settings JavaScript
// API_URL is defined in config.js

let logoFile = null;
let logoUrl = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadStoreSettings();
    loadNotificationSettings();
    
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);
    
    // Update catalog link when slug changes
    document.getElementById('slug').addEventListener('input', function() {
        updateCatalogLink(this.value);
    });
    
    // Logo upload handler
    document.getElementById('logo').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('O arquivo é muito grande. Tamanho máximo: 2MB');
                this.value = '';
                return;
            }
            
            logoFile = file;
            const reader = new FileReader();
            reader.onload = function(e) {
                logoUrl = e.target.result;
                showLogoPreview(logoUrl);
            };
            reader.readAsDataURL(file);
        }
    });
});

function getAuthToken() {
    return localStorage.getItem('token');
}

function updateCatalogLink(slug) {
    const catalogLink = document.getElementById('viewCatalogLink');
    if (catalogLink && slug) {
        catalogLink.href = `loja.html?store_slug=${encodeURIComponent(slug)}`;
    }
}

async function loadStoreSettings() {
    try {
        const response = await fetch(`${API_URL}/stores`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.store) {
            const store = data.data.store;
            document.getElementById('storeName').value = store.name || '';
            document.getElementById('slug').value = store.slug || '';
            document.getElementById('description').value = store.description || '';
            document.getElementById('phone').value = store.phone || '';
            document.getElementById('whatsapp').value = store.whatsapp || '';
            document.getElementById('email').value = store.email || '';
            document.getElementById('address').value = store.address || '';
            document.getElementById('city').value = store.city || '';
            document.getElementById('state').value = store.state || '';
            
            // Load logo if exists
            if (store.logo_url) {
                logoUrl = store.logo_url;
                showLogoPreview(store.logo_url);
            }
            
            // Update catalog link
            updateCatalogLink(store.slug);
        }
    } catch (error) {
        console.error('Error loading store settings:', error);
    }
}

async function loadNotificationSettings() {
    try {
        const response = await fetch(`${API_URL}/notifications`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.settings) {
            const settings = data.data.settings;
            document.getElementById('newLeadEmail').checked = settings.new_lead_email || false;
            document.getElementById('weeklyReport').checked = settings.weekly_report || false;
            document.getElementById('platformUpdates').checked = settings.platform_updates || false;
        }
    } catch (error) {
        console.error('Error loading notification settings:', error);
    }
}

function showLogoPreview(url) {
    const preview = document.getElementById('logoPreview');
    const previewImg = document.getElementById('logoPreviewImg');
    const removeBtn = document.getElementById('removeLogoBtn');
    
    if (url) {
        previewImg.src = url;
        preview.style.display = 'flex';
        removeBtn.style.display = 'block';
    } else {
        preview.style.display = 'none';
        removeBtn.style.display = 'none';
    }
}

function removeLogo() {
    logoFile = null;
    logoUrl = null;
    document.getElementById('logo').value = '';
    showLogoPreview(null);
}

async function saveSettings(e) {
    e.preventDefault();
    
    try {
        // Prepare store data
        const storeData = {
            name: document.getElementById('storeName').value,
            slug: document.getElementById('slug').value,
            description: document.getElementById('description').value,
            phone: document.getElementById('phone').value,
            whatsapp: document.getElementById('whatsapp').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value
        };
        
        // If logo was selected, upload it first or use the existing URL
        if (logoFile) {
            // Convert to base64 for now (could be changed to multipart/form-data if API supports it)
            const base64Logo = await fileToBase64(logoFile);
            storeData.logo_url = base64Logo;
        } else if (logoUrl && logoUrl.startsWith('http')) {
            // Keep existing logo URL if it's an external URL
            storeData.logo_url = logoUrl;
        } else if (!logoUrl) {
            // If logo was removed, send null
            storeData.logo_url = null;
        }
        
        // Save store settings
        const storeResponse = await fetch(`${API_URL}/stores`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(storeData)
        });
        
        // Save notification settings
        const notificationResponse = await fetch(`${API_URL}/notifications`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                new_lead_email: document.getElementById('newLeadEmail').checked,
                weekly_report: document.getElementById('weeklyReport').checked,
                platform_updates: document.getElementById('platformUpdates').checked
            })
        });
        
        if (storeResponse.ok && notificationResponse.ok) {
            // Update catalog link with new slug
            const slug = document.getElementById('slug').value;
            updateCatalogLink(slug);
            alert('Configurações salvas com sucesso!');
        } else {
            alert('Erro ao salvar configurações');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Erro ao salvar configurações');
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}



