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
        previewImg.classList.add('logo-preview');
        preview.style.display = 'flex';
        removeBtn.style.display = 'block';
    } else {
        preview.style.display = 'none';
        removeBtn.style.display = 'none';
        previewImg.src = '';
        previewImg.classList.remove('logo-preview');
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

// Logo validation and processing constants
const LOGO_TARGET_WIDTH = 1000;
const LOGO_TARGET_HEIGHT = 300;
const LOGO_MIN_WIDTH = 500;
const LOGO_MIN_HEIGHT = 150;
const LOGO_TARGET_RATIO = LOGO_TARGET_WIDTH / LOGO_TARGET_HEIGHT; // ~3.33:1
const ALLOWED_FORMATS = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Validate logo file format
 */
function validateLogoFormat(file) {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidFormat = ALLOWED_FORMATS.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension);
    
    if (!isValidFormat) {
        return {
            valid: false,
            error: 'Formato de arquivo não permitido. Use SVG, PNG ou JPG.'
        };
    }
    
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: 'O arquivo é muito grande. Tamanho máximo: 2MB.'
        };
    }
    
    return { valid: true };
}

/**
 * Validate logo dimensions and ratio
 */
function validateLogoDimensions(width, height, isSvg = false) {
    // SVG files don't have fixed dimensions, skip dimension validation
    if (isSvg) {
        return { valid: true };
    }
    
    // Check minimum resolution
    if (width < LOGO_MIN_WIDTH || height < LOGO_MIN_HEIGHT) {
        return {
            valid: false,
            error: `A logo deve possuir boa qualidade. Recomendamos imagens com resolução mínima de ${LOGO_MIN_WIDTH} × ${LOGO_MIN_HEIGHT} px e proporção horizontal.`
        };
    }
    
    // Check if image is too vertical (proportion should be horizontal)
    const ratio = width / height;
    if (ratio < 1) {
        return {
            valid: false,
            error: 'A logo deve ter proporção horizontal (largura maior que altura).'
        };
    }
    
    return { valid: true };
}

/**
 * Resize image to target dimensions maintaining aspect ratio with transparent padding
 */
function resizeImageToStandard(image, originalWidth, originalHeight) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = LOGO_TARGET_WIDTH;
            canvas.height = LOGO_TARGET_HEIGHT;
            const ctx = canvas.getContext('2d');
            
            // Set transparent background
            ctx.clearRect(0, 0, LOGO_TARGET_WIDTH, LOGO_TARGET_HEIGHT);
            
            // Calculate scaling to fit within target dimensions while maintaining aspect ratio
            const scale = Math.min(
                LOGO_TARGET_WIDTH / originalWidth,
                LOGO_TARGET_HEIGHT / originalHeight
            );
            
            const scaledWidth = originalWidth * scale;
            const scaledHeight = originalHeight * scale;
            
            // Center the image
            const x = (LOGO_TARGET_WIDTH - scaledWidth) / 2;
            const y = (LOGO_TARGET_HEIGHT - scaledHeight) / 2;
            
            // Draw image with transparency preserved
            ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
            
            // Convert to base64
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Erro ao processar imagem'));
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Erro ao converter imagem'));
                reader.readAsDataURL(blob);
            }, 'image/png', 1.0); // PNG with lossless compression
        } catch (error) {
            reject(error);
        }
    });
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
 * Handle logo upload with validation and processing
 */
async function handleLogoUpload(file, inputElement) {
    hideLogoError();
    
    // Validate format
    const formatValidation = validateLogoFormat(file);
    if (!formatValidation.valid) {
        showLogoError(formatValidation.error);
        inputElement.value = '';
        return;
    }
    
    // Check if SVG
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    
    if (isSvg) {
        // For SVG, just validate format and use as is
        logoFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            logoUrl = e.target.result;
            showLogoPreview(logoUrl);
            hideLogoError();
        };
        reader.onerror = function() {
            showLogoError('Erro ao ler arquivo SVG');
            inputElement.value = '';
        };
        reader.readAsDataURL(file);
        return;
    }
    
    // For raster images (PNG, JPG), validate dimensions and resize
    const reader = new FileReader();
    reader.onload = async function(e) {
        const img = new Image();
        img.onload = async function() {
            // Validate dimensions
            const dimensionValidation = validateLogoDimensions(img.width, img.height, false);
            if (!dimensionValidation.valid) {
                showLogoError(dimensionValidation.error);
                inputElement.value = '';
                return;
            }
            
            try {
                // Resize to standard dimensions
                const resizedDataUrl = await resizeImageToStandard(img, img.width, img.height);
                
                // Convert resized data URL back to File/Blob for upload
                const response = await fetch(resizedDataUrl);
                const blob = await response.blob();
                logoFile = new File([blob], file.name, { type: 'image/png' });
                logoUrl = resizedDataUrl;
                showLogoPreview(resizedDataUrl);
                hideLogoError();
            } catch (error) {
                console.error('Error processing image:', error);
                showLogoError('Erro ao processar imagem. Tente novamente.');
                inputElement.value = '';
            }
        };
        img.onerror = function() {
            showLogoError('Erro ao carregar imagem. Verifique se o arquivo está corrompido.');
            inputElement.value = '';
        };
        img.src = e.target.result;
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



