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
            handleLogoUpload(file, this);
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
            if (store.logo_url && store.logo_url.trim() !== '') {
                logoUrl = store.logo_url;
                
                // Garantir que logo_url tenha prefixo data: se for base64
                let logoUrlToShow = store.logo_url.trim();
                if (!logoUrlToShow.startsWith('data:') && !logoUrlToShow.startsWith('http://') && !logoUrlToShow.startsWith('https://')) {
                    // Provavelmente base64 sem prefixo, adicionar
                    logoUrlToShow = `data:image/png;base64,${logoUrlToShow}`;
                    logoUrl = logoUrlToShow; // Atualizar também a variável global
                }
                
                // Check if base64 string might be truncated (common issue with TEXT fields)
                if (logoUrlToShow.startsWith('data:image/')) {
                    // Check if base64 data is complete (should end with = or == for padding)
                    const base64Part = logoUrlToShow.split(',')[1];
                    if (base64Part && base64Part.length > 0) {
                        // Base64 strings should have length multiple of 4, or end with padding
                        const padding = base64Part.length % 4;
                        if (padding !== 0 && !base64Part.endsWith('=') && !base64Part.endsWith('==') && !base64Part.endsWith('===')) {
                            console.warn('Base64 string may be truncated or incomplete');
                        }
                    }
                }
                
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    showLogoPreview(logoUrlToShow);
                }, 100);
            } else {
                // Ensure preview is hidden if no logo
                showLogoPreview(null);
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
    
    if (!preview || !previewImg || !removeBtn) {
        console.error('Logo preview elements not found');
        return;
    }
    
    if (url && url.trim() !== '') {
        // Clean up the URL - remove any whitespace
        const cleanUrl = url.trim();
        
        // Validate if it's a base64 data URL or a regular URL
        const isBase64 = cleanUrl.startsWith('data:image/');
        const isHttpUrl = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://');
        
        if (!isBase64 && !isHttpUrl) {
            console.warn('Logo URL format may be invalid:', cleanUrl.substring(0, 50) + '...');
            // Try to treat it as base64 anyway (might be missing data: prefix)
            if (cleanUrl.length > 100) {
                // Likely base64, add prefix if missing
                const fixedUrl = cleanUrl.includes('data:') ? cleanUrl : `data:image/png;base64,${cleanUrl}`;
                url = fixedUrl;
            }
        }
        
        // Clear previous error state
        previewImg.onerror = null;
        previewImg.onload = null;
        
        // Set up error handler
        previewImg.onerror = function() {
            console.error('Error loading logo image. URL length:', cleanUrl.length);
            console.error('Is Base64:', isBase64, 'Is HTTP URL:', isHttpUrl);
            
            hideLogoError();
            
            // Check if base64 might be truncated
            if (isBase64) {
                const base64Part = cleanUrl.split(',')[1];
                if (base64Part && base64Part.length > 0) {
                    // Try to fix incomplete base64 by adding padding
                    const paddingNeeded = (4 - (base64Part.length % 4)) % 4;
                    if (paddingNeeded > 0 && paddingNeeded < 4) {
                        const fixedUrl = cleanUrl + '='.repeat(paddingNeeded);
                        console.log('Attempting to fix base64 padding...');
                        previewImg.src = fixedUrl;
                        return; // Don't show error yet, try fixed version
                    }
                }
                
                // If base64 is very short, it's likely corrupted
                if (cleanUrl.length < 100) {
                    showLogoError('Erro ao carregar a imagem da logo. A imagem pode estar corrompida.');
                } else {
                    // Long base64 that failed - might be truncated in database
                    showLogoError('A imagem da logo pode estar incompleta. Tente fazer upload novamente.');
                }
            } else if (!isHttpUrl) {
                showLogoError('Formato de URL da logo inválido.');
            } else {
                // HTTP URL failed to load
                showLogoError('Erro ao carregar a imagem da logo. Verifique se a URL está acessível.');
            }
            
            preview.style.display = 'none';
            removeBtn.style.display = 'none';
        };
        
        // Set up load handler to ensure image is displayed
        previewImg.onload = function() {
            console.log('Logo image loaded successfully');
            previewImg.classList.add('logo-preview');
            preview.style.display = 'flex';
            removeBtn.style.display = 'block';
            hideLogoError();
        };
        
        // Set the image source (this will trigger onload or onerror)
        // Use a small timeout to ensure error handlers are set
        setTimeout(() => {
            previewImg.src = cleanUrl;
        }, 10);
    } else {
        preview.style.display = 'none';
        removeBtn.style.display = 'none';
        previewImg.src = '';
        previewImg.classList.remove('logo-preview');
        previewImg.onerror = null;
        previewImg.onload = null;
    }
}

function removeLogo() {
    logoFile = null;
    logoUrl = null;
    document.getElementById('logo').value = '';
    showLogoPreview(null);
    hideLogoError();
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

// Logo validation constants
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Validate logo file size
 */
function validateLogoSize(file) {
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: 'O arquivo é muito grande. Tamanho máximo: 2MB.'
        };
    }
    
    return { valid: true };
}

/**
 * Show logo error message
 */
function showLogoError(message) {
    const errorDiv = document.getElementById('logoError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('d-none');
    }
}

/**
 * Hide logo error message
 */
function hideLogoError() {
    const errorDiv = document.getElementById('logoError');
    if (errorDiv) {
        errorDiv.classList.add('d-none');
        errorDiv.textContent = '';
    }
}

/**
 * Handle logo upload with validation
 */
async function handleLogoUpload(file, inputElement) {
    hideLogoError();
    
    // Validate file size
    const sizeValidation = validateLogoSize(file);
    if (!sizeValidation.valid) {
        showLogoError(sizeValidation.error);
        inputElement.value = '';
        return;
    }
    
    // Use file as is (no resizing or dimension validation)
    logoFile = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        logoUrl = e.target.result;
        showLogoPreview(logoUrl);
        hideLogoError();
    };
    reader.onerror = function() {
        showLogoError('Erro ao ler arquivo de imagem');
        inputElement.value = '';
    };
    reader.readAsDataURL(file);
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}



