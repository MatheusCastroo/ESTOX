// Settings JavaScript

const API_URL = 'http://localhost/ESTOX/api';

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadStoreSettings();
    loadNotificationSettings();
    
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);
    
    // Logo upload handler
    document.getElementById('logoUpload').addEventListener('change', handleLogoUpload);
});

function getAuthToken() {
    return localStorage.getItem('token');
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
            
            // Slug is readonly (immutable after creation)
            const slugInput = document.getElementById('slug');
            if (store.slug) {
                slugInput.readOnly = true;
                slugInput.style.backgroundColor = '#f8f9fa';
                slugInput.style.cursor = 'not-allowed';
            }
            
            // Load logo
            if (store.logo_url) {
                document.getElementById('logoUrl').value = store.logo_url;
                document.getElementById('logoPreview').src = store.logo_url;
                document.getElementById('logoPreview').classList.remove('d-none');
                document.getElementById('logoPlaceholder').style.display = 'none';
                document.getElementById('removeLogoBtn').classList.remove('d-none');
            } else {
                document.getElementById('logoPreview').classList.add('d-none');
                document.getElementById('logoPlaceholder').style.display = 'flex';
                document.getElementById('removeLogoBtn').classList.add('d-none');
            }
        }
    } catch (error) {
        console.error('Error loading store settings:', error);
    }
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        Toast.error('Por favor, selecione um arquivo de imagem válido.');
        e.target.value = '';
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        Toast.error('A imagem deve ter no máximo 2MB.');
        e.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageDataUrl = e.target.result;
        document.getElementById('logoUrl').value = imageDataUrl;
        document.getElementById('logoPreview').src = imageDataUrl;
        document.getElementById('logoPreview').classList.remove('d-none');
        document.getElementById('logoPlaceholder').style.display = 'none';
        document.getElementById('removeLogoBtn').classList.remove('d-none');
    };
    reader.readAsDataURL(file);
    
    // Clear input
    e.target.value = '';
}

function removeLogo() {
    document.getElementById('logoUrl').value = '';
    document.getElementById('logoPreview').src = '';
    document.getElementById('logoPreview').classList.add('d-none');
    document.getElementById('logoPlaceholder').style.display = 'flex';
    document.getElementById('removeLogoBtn').classList.add('d-none');
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

async function saveSettings(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';
        
        // Prepare store data
        const storeData = {
            name: document.getElementById('storeName').value,
            description: document.getElementById('description').value,
            phone: document.getElementById('phone').value,
            whatsapp: document.getElementById('whatsapp').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value
        };
        
        // Don't send slug if it's readonly (immutable after creation)
        const slugInput = document.getElementById('slug');
        if (!slugInput.readOnly) {
            storeData.slug = slugInput.value;
        }
        
        // Add logo_url if set
        const logoUrl = document.getElementById('logoUrl').value;
        if (logoUrl) {
            storeData.logo_url = logoUrl;
        } else {
            // If logo was removed, set to null
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
        
        const storeData = await storeResponse.json();
        const notificationData = await notificationResponse.json();
        
        if (storeResponse.ok && notificationResponse.ok) {
            Toast.success('Configurações salvas com sucesso!');
            // Reload settings to show updated logo
            setTimeout(() => {
                loadStoreSettings();
            }, 500);
        } else {
            const errorMsg = storeData.error || notificationData.error || 'Erro ao salvar configurações';
            Toast.error(errorMsg);
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        Toast.error('Erro ao salvar configurações. Tente novamente.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}



