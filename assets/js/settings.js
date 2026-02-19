// Settings JavaScript
// API_URL is defined in config.js

let logoFile = null;
let logoUrl = null;
let aboutImageFile = null;
let aboutImageUrl = null;

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
    
    // About image upload handler
    setupAboutImageUpload();
});

function getAuthToken() {
    return localStorage.getItem('token');
}

// Use window.buildApiUrl from config.js (fallback if not available)
if (typeof window.buildApiUrl !== 'function') {
    window.buildApiUrl = function(endpoint) {
        const apiBase = (window.API_URL || API_URL || 'http://localhost/ESTOX/api/index.php').replace(/\/$/, '');
        const base = apiBase.endsWith('/index.php') ? apiBase : apiBase + '/index.php';
        return `${base}/${endpoint.replace(/^\//, '')}`;
    };
}

function updateCatalogLink(slug) {
    const catalogLink = document.getElementById('viewCatalogLink');
    if (catalogLink && slug) {
        catalogLink.href = `loja.html?store_slug=${encodeURIComponent(slug)}`;
    }
}

async function loadStoreSettings() {
    try {
        const response = await fetch(window.buildApiUrl('stores'), {
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
            
            // Load about image if exists (from API)
            if (store.about_image && store.about_image.trim() !== '') {
                aboutImageUrl = store.about_image;
                localStorage.setItem('store_about_image', aboutImageUrl);
                console.log('About image loaded from API');
            }
            
            // Always try to load from localStorage after a short delay
            // This ensures the preview is shown even if API doesn't have the field
            setTimeout(() => {
                const savedImage = localStorage.getItem('store_about_image');
                if (savedImage && savedImage.trim() !== '') {
                    aboutImageUrl = savedImage;
                    console.log('About image loaded from localStorage, showing preview');
                    showAboutImagePreview(savedImage);
                } else {
                    console.log('No about image found, showing placeholder');
                    showAboutImagePreview(null);
                }
            }, 500);
            
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
        const response = await fetch(window.buildApiUrl('notifications'), {
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
        
        // Handle about image - NÃO enviar para API por enquanto
        // A imagem fica apenas no localStorage para uso na loja.html
        // Se a API não suportar o campo, não causará erro
        // Comentado para evitar erros na API:
        /*
        if (aboutImageFile) {
            try {
                const base64AboutImage = await fileToBase64(aboutImageFile);
                if (base64AboutImage && base64AboutImage.length < 7000000) {
                    storeData.about_image = base64AboutImage;
                }
            } catch (error) {
                console.error('Error converting about image to base64:', error);
            }
        } else if (aboutImageUrl && aboutImageUrl.trim() !== '') {
            if (aboutImageUrl.startsWith('data:')) {
                if (aboutImageUrl.length < 7000000) {
                    storeData.about_image = aboutImageUrl;
                }
            } else if (aboutImageUrl.startsWith('http://') || aboutImageUrl.startsWith('https://')) {
                storeData.about_image = aboutImageUrl;
            }
        }
        */
        
        console.log('Salvando configurações da loja...');
        console.log('Store data keys:', Object.keys(storeData));
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/26790cf9-263c-4d19-9e85-a571eedf06cf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assets/js/settings.js:saveSettings:beforeStoreRequest',message:'Enviando requisição PUT /stores',data:{dataKeys:Object.keys(storeData),hasLogoUrl:!!storeData.logo_url,logoUrlLength:storeData.logo_url?storeData.logo_url.length:0},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        // Save store settings
        let storeResponse;
        try {
            storeResponse = await fetch(window.buildApiUrl('stores'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(storeData)
            });
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/26790cf9-263c-4d19-9e85-a571eedf06cf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assets/js/settings.js:saveSettings:afterStoreRequest',message:'Resposta recebida de PUT /stores',data:{status:storeResponse.status,statusText:storeResponse.statusText,ok:storeResponse.ok},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
        } catch (networkError) {
            // Network error (no internet, CORS, server down, etc.)
            console.error('Network error:', networkError);
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/26790cf9-263c-4d19-9e85-a571eedf06cf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assets/js/settings.js:saveSettings:storeNetworkError',message:'Erro de rede na requisição PUT /stores',data:{error:networkError.message},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            
            throw new Error('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
        }
        
        console.log('Resposta da loja:', storeResponse.status, storeResponse.statusText);
        
        if (!storeResponse.ok) {
            let errorMessage = `Erro HTTP ${storeResponse.status}: ${storeResponse.statusText}`;
            try {
                const errorData = await storeResponse.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (parseError) {
                // Se não conseguir parsear, usar mensagem padrão
            }
            throw new Error(errorMessage);
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/26790cf9-263c-4d19-9e85-a571eedf06cf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assets/js/settings.js:saveSettings:beforeNotificationRequest',message:'Enviando requisição PUT /notifications',data:{},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        // Save notification settings
        const notificationResponse = await fetch(window.buildApiUrl('notifications'), {
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
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/26790cf9-263c-4d19-9e85-a571eedf06cf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assets/js/settings.js:saveSettings:afterNotificationRequest',message:'Resposta recebida de PUT /notifications',data:{status:notificationResponse.status,statusText:notificationResponse.statusText,ok:notificationResponse.ok},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        console.log('Resposta das notificações:', notificationResponse.status, notificationResponse.statusText);
        
        if (!notificationResponse.ok) {
            const errorData = await notificationResponse.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(errorData.error || `Erro HTTP ${notificationResponse.status}: ${notificationResponse.statusText}`);
        }
        
        // Both requests succeeded
        const storeResponseData = await storeResponse.json();
        const notificationData = await notificationResponse.json();
        
        if (storeResponseData.success && notificationData.success) {
            // Update catalog link with new slug
            const slug = document.getElementById('slug').value;
            updateCatalogLink(slug);
            alert('Configurações salvas com sucesso!');
        } else {
            const errorMsg = storeResponseData.error || notificationData.error || 'Erro ao salvar configurações';
            alert(errorMsg);
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        const errorMsg = error.message || 'Erro ao salvar configurações. Verifique sua conexão e tente novamente.';
        alert(errorMsg);
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

/* ============================================
   ABOUT IMAGE UPLOAD FUNCTIONALITY
   ============================================ */

// Setup about image upload handlers
function setupAboutImageUpload() {
    // Wait a bit to ensure DOM is fully ready
    setTimeout(() => {
        const uploadBtn = document.getElementById('uploadAboutImageBtn');
        const input = document.getElementById('aboutImageInput');
        const removeBtn = document.getElementById('removeAboutImageBtn');
        
        if (!uploadBtn || !input || !removeBtn) {
            console.warn('About image upload elements not found, retrying...');
            // Retry after a longer delay
            setTimeout(setupAboutImageUpload, 500);
            return;
        }
        
        console.log('About image upload elements found, setting up...');
        
        // Load saved image first
        loadAboutImage();
        
        // Upload button click
        uploadBtn.addEventListener('click', function() {
            input.click();
        });
        
        // File input change
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleAboutImageUpload(file, this);
            }
        });
        
        // Remove button click
        removeBtn.addEventListener('click', function() {
            removeAboutImage();
        });
    }, 100);
}

// Load about image from localStorage
function loadAboutImage() {
    const savedImage = localStorage.getItem('store_about_image');
    console.log('Loading about image from localStorage:', savedImage ? 'Found' : 'Not found');
    
    if (savedImage && savedImage.trim() !== '') {
        aboutImageUrl = savedImage;
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            console.log('Showing about image preview');
            showAboutImagePreview(savedImage);
        }, 200);
    } else {
        console.log('No saved image, showing placeholder');
        setTimeout(() => {
            showAboutImagePreview(null);
        }, 200);
    }
}

// Handle about image upload
async function handleAboutImageUpload(file, inputElement) {
    hideAboutImageError();
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showAboutImageError('Formato inválido. Use apenas JPEG, PNG ou WebP.');
        inputElement.value = '';
        return;
    }
    
    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
        showAboutImageError('Arquivo muito grande. Tamanho máximo: 5MB.');
        inputElement.value = '';
        return;
    }
    
    // Read file as base64
    aboutImageFile = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        aboutImageUrl = e.target.result;
        showAboutImagePreview(aboutImageUrl);
        // Save to localStorage
        localStorage.setItem('store_about_image', aboutImageUrl);
        hideAboutImageError();
    };
    reader.onerror = function() {
        showAboutImageError('Erro ao ler arquivo de imagem.');
        inputElement.value = '';
    };
    reader.readAsDataURL(file);
}

// Show about image preview
function showAboutImagePreview(url) {
    const preview = document.getElementById('aboutImagePreview');
    const previewImg = document.getElementById('aboutImagePreviewImg');
    const placeholder = preview?.querySelector('.placeholder-text');
    const removeBtn = document.getElementById('removeAboutImageBtn');
    
    if (!preview || !previewImg) {
        console.warn('About image preview elements not found');
        return;
    }
    
    if (url && url.trim() !== '') {
        // Set up error handler
        previewImg.onerror = function() {
            console.error('Error loading about image preview');
            previewImg.src = '';
            previewImg.classList.remove('show');
            preview.classList.remove('has-image');
            if (placeholder) {
                placeholder.classList.remove('hidden');
            }
            if (removeBtn) {
                removeBtn.style.display = 'none';
            }
        };
        
        // Set up load handler
        previewImg.onload = function() {
            previewImg.classList.add('show');
            preview.classList.add('has-image');
            if (placeholder) {
                placeholder.classList.add('hidden');
            }
            if (removeBtn) {
                removeBtn.style.display = 'block';
            }
        };
        
        // Set the source (this will trigger onload or onerror)
        previewImg.src = url;
    } else {
        previewImg.src = '';
        previewImg.classList.remove('show');
        preview.classList.remove('has-image');
        previewImg.onerror = null;
        previewImg.onload = null;
        
        if (placeholder) {
            placeholder.classList.remove('hidden');
        }
        
        if (removeBtn) {
            removeBtn.style.display = 'none';
        }
    }
}

// Remove about image
function removeAboutImage() {
    aboutImageFile = null;
    aboutImageUrl = null;
    document.getElementById('aboutImageInput').value = '';
    showAboutImagePreview(null);
    localStorage.removeItem('store_about_image');
    hideAboutImageError();
}

// Show about image error
function showAboutImageError(message) {
    const errorDiv = document.getElementById('aboutImageError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('d-none');
    }
}

// Hide about image error
function hideAboutImageError() {
    const errorDiv = document.getElementById('aboutImageError');
    if (errorDiv) {
        errorDiv.classList.add('d-none');
        errorDiv.textContent = '';
    }
}



