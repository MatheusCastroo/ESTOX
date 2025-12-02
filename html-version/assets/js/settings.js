// Settings JavaScript

const API_URL = 'http://localhost/api';

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadStoreSettings();
    loadNotificationSettings();
    
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);
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

async function saveSettings(e) {
    e.preventDefault();
    
    try {
        // Save store settings
        const storeResponse = await fetch(`${API_URL}/stores`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                name: document.getElementById('storeName').value,
                slug: document.getElementById('slug').value,
                description: document.getElementById('description').value,
                phone: document.getElementById('phone').value,
                whatsapp: document.getElementById('whatsapp').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value
            })
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
            alert('Configurações salvas com sucesso!');
        } else {
            alert('Erro ao salvar configurações');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Erro ao salvar configurações');
    }
}



