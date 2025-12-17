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
            
            // Slug is readonly only if it exists (immutable after creation)
            // If slug is empty/null, allow editing
            const slugInput = document.getElementById('slug');
            const slugHelpText = document.getElementById('slugHelpText');
            const slugWarning = document.getElementById('slugWarning');
            const viewCatalogBtn = document.getElementById('viewCatalogBtn');
            
            if (store.slug && store.slug.trim() !== '') {
                // Slug exists - make it readonly
                slugInput.readOnly = true;
                slugInput.style.backgroundColor = '#f8f9fa';
                slugInput.style.cursor = 'not-allowed';
                slugInput.style.borderColor = '#dee2e6';
                
                // Show view catalog button
                if (viewCatalogBtn) {
                    viewCatalogBtn.style.display = 'block';
                    viewCatalogBtn.setAttribute('data-slug', store.slug);
                }
                
                // Update help text
                if (slugHelpText) {
                    slugHelpText.innerHTML = '<i class="bi bi-lock me-1"></i>A URL não pode ser alterada após a criação da loja. <a href="#" onclick="viewPublicCatalog(); return false;" class="text-decoration-none">Clique aqui para ver seu catálogo público</a>';
                }
                
                // Hide warning
                if (slugWarning) {
                    slugWarning.classList.add('d-none');
                }
            } else {
                // Slug is missing - allow editing and show warning
                slugInput.readOnly = false;
                slugInput.style.backgroundColor = '#fff3cd';
                slugInput.style.borderColor = '#ffc107';
                slugInput.placeholder = 'minha-loja';
                
                // Hide view catalog button
                if (viewCatalogBtn) {
                    viewCatalogBtn.style.display = 'none';
                }
                
                // Update help text
                if (slugHelpText) {
                    slugHelpText.innerHTML = 'Esta será a URL do seu catálogo público. Exemplo: autostock.com.br/minha-loja';
                }
                
                // Show warning message
                if (slugWarning) {
                    slugWarning.classList.remove('d-none');
                }
            }
            
            // Load logo
            if (store.logo_url && store.logo_url.trim() !== '') {
                document.getElementById('logoUrl').value = store.logo_url;
                
                // Validate logo URL before displaying
                const img = new Image();
                img.onload = function() {
                    document.getElementById('logoPreview').src = store.logo_url;
                    document.getElementById('logoPreview').classList.remove('d-none');
                    document.getElementById('logoPlaceholder').style.display = 'none';
                    document.getElementById('removeLogoBtn').classList.remove('d-none');
                };
                img.onerror = function() {
                    // Logo URL is invalid or image failed to load
                    console.warn('Logo URL inválida ou imagem não encontrada:', store.logo_url);
                    document.getElementById('logoUrl').value = '';
                    document.getElementById('logoPreview').classList.add('d-none');
                    document.getElementById('logoPlaceholder').style.display = 'flex';
                    document.getElementById('removeLogoBtn').classList.add('d-none');
                    
                    // Show warning if logo was supposed to be there
                    if (store.logo_url) {
                        Toast.warning('A logo salva não pôde ser carregada. Por favor, faça upload de uma nova logo.');
                    }
                };
                img.src = store.logo_url;
            } else {
                document.getElementById('logoUrl').value = '';
                document.getElementById('logoPreview').classList.add('d-none');
                document.getElementById('logoPlaceholder').style.display = 'flex';
                document.getElementById('removeLogoBtn').classList.add('d-none');
            }
        } else {
            // Store not found or error
            Toast.error('Erro ao carregar configurações da loja. Por favor, recarregue a página.');
        }
    } catch (error) {
        console.error('Error loading store settings:', error);
        Toast.error('Erro ao carregar configurações. Verifique sua conexão e recarregue a página.');
    }
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        Toast.error('Por favor, selecione um arquivo de imagem válido (JPG, PNG ou GIF).');
        e.target.value = '';
        return;
    }
    
    // Validate specific image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        Toast.error('Formato de imagem não suportado. Use JPG, PNG, GIF ou WebP.');
        e.target.value = '';
        return;
    }
    
    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        Toast.error(`A imagem é muito grande (${fileSizeMB}MB). O tamanho máximo permitido é 2MB. Por favor, redimensione a imagem e tente novamente.`);
        e.target.value = '';
        return;
    }
    
    // Validate minimum size (at least 10KB to avoid corrupted files)
    if (file.size < 10 * 1024) {
        Toast.error('A imagem parece estar corrompida ou muito pequena. Por favor, selecione outra imagem.');
        e.target.value = '';
        return;
    }
    
    // Show loading state
    const preview = document.getElementById('logoPreview');
    const placeholder = document.getElementById('logoPlaceholder');
    placeholder.innerHTML = '<div class="text-center"><div class="spinner-border spinner-border-sm text-primary mb-2"></div><small>Carregando...</small></div>';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imageDataUrl = e.target.result;
            
            // Validate that it's actually a valid image by creating an Image object
            const img = new Image();
            img.onload = function() {
                // Image is valid
                document.getElementById('logoUrl').value = imageDataUrl;
                preview.src = imageDataUrl;
                preview.classList.remove('d-none');
                placeholder.style.display = 'none';
                document.getElementById('removeLogoBtn').classList.remove('d-none');
                
                Toast.success('Logo carregada com sucesso! Clique em "Salvar Configurações" para aplicar.');
            };
            img.onerror = function() {
                Toast.error('Erro ao carregar a imagem. O arquivo pode estar corrompido. Por favor, selecione outra imagem.');
                placeholder.innerHTML = '<div class="text-center"><i class="bi bi-image fs-1 d-block mb-2"></i><small>Sem logo</small></div>';
                e.target.value = '';
            };
            img.src = imageDataUrl;
        } catch (error) {
            console.error('Error processing image:', error);
            Toast.error('Erro ao processar a imagem. Por favor, tente novamente.');
            placeholder.innerHTML = '<div class="text-center"><i class="bi bi-image fs-1 d-block mb-2"></i><small>Sem logo</small></div>';
            e.target.value = '';
        }
    };
    
    reader.onerror = function() {
        Toast.error('Erro ao ler o arquivo. Por favor, tente novamente.');
        placeholder.innerHTML = '<div class="text-center"><i class="bi bi-image fs-1 d-block mb-2"></i><small>Sem logo</small></div>';
        e.target.value = '';
    };
    
    reader.readAsDataURL(file);
}

function removeLogo() {
    document.getElementById('logoUrl').value = '';
    document.getElementById('logoPreview').src = '';
    document.getElementById('logoPreview').classList.add('d-none');
    document.getElementById('logoPlaceholder').style.display = 'flex';
    document.getElementById('removeLogoBtn').classList.add('d-none');
}

function viewPublicCatalog() {
    const slugInput = document.getElementById('slug');
    const viewCatalogBtn = document.getElementById('viewCatalogBtn');
    
    // Get slug from input or button data attribute
    let slug = '';
    if (viewCatalogBtn && viewCatalogBtn.getAttribute('data-slug')) {
        slug = viewCatalogBtn.getAttribute('data-slug');
    } else if (slugInput && slugInput.value) {
        slug = slugInput.value.trim();
    }
    
    if (!slug) {
        Toast.warning('A URL do catálogo ainda não foi configurada. Salve as configurações primeiro para visualizar o catálogo.');
        return;
    }
    
    // Build the catalog URL correctly
    const currentUrl = window.location.href;
    const urlObj = new URL(currentUrl);
    
    // Get the base path - extract just the project root (e.g., /ESTOX)
    let pathname = urlObj.pathname;
    
    // Find the base path by looking for /ESTOX or the root
    // If pathname is /ESTOX/html-version/configuracoes.html, we want /ESTOX
    let basePath = '';
    
    // Split pathname and find ESTOX or use root
    const pathParts = pathname.split('/').filter(p => p);
    
    // Find ESTOX in the path
    const estoxIndex = pathParts.indexOf('ESTOX');
    if (estoxIndex !== -1) {
        // Build path up to and including ESTOX
        basePath = '/' + pathParts.slice(0, estoxIndex + 1).join('/');
    } else {
        // If ESTOX not found, use root
        basePath = pathname.split('/html-version')[0] || '/';
    }
    
    // Ensure basePath doesn't end with /
    basePath = basePath.replace(/\/$/, '');
    if (!basePath) {
        basePath = '/ESTOX'; // Default fallback
    }
    
    // Construct catalog URL - use query parameter method (most reliable)
    const catalogUrl = `${urlObj.origin}${basePath}/html-version/loja.html?store_slug=${slug}`;
    
    console.log('Abrindo catálogo público:', catalogUrl);
    
    // Open in new tab
    window.open(catalogUrl, '_blank', 'noopener,noreferrer');
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
        
        // Validate required fields
        const storeName = document.getElementById('storeName').value.trim();
        if (!storeName) {
            Toast.error('O nome da loja é obrigatório. Por favor, preencha este campo.');
            document.getElementById('storeName').focus();
            throw new Error('Nome da loja é obrigatório');
        }
        
        const slugInput = document.getElementById('slug');
        const slug = slugInput.value.trim();
        
        // Validate slug if it's editable (not readonly)
        if (!slugInput.readOnly) {
            if (!slug) {
                Toast.error('A URL do catálogo é obrigatória. Por favor, preencha este campo. Exemplo: minha-loja');
                slugInput.focus();
                throw new Error('URL do catálogo é obrigatória');
            }
            
            // Validate slug format (only lowercase letters, numbers, and hyphens)
            if (!/^[a-z0-9-]+$/.test(slug)) {
                Toast.error('A URL do catálogo deve conter apenas letras minúsculas, números e hífens. Exemplo: minha-loja');
                slugInput.focus();
                throw new Error('Formato de URL inválido');
            }
            
            if (slug.length < 3) {
                Toast.error('A URL do catálogo deve ter pelo menos 3 caracteres.');
                slugInput.focus();
                throw new Error('URL muito curta');
            }
            
            if (slug.length > 50) {
                Toast.error('A URL do catálogo deve ter no máximo 50 caracteres.');
                slugInput.focus();
                throw new Error('URL muito longa');
            }
        }
        
        // Validate WhatsApp format if provided
        const whatsapp = document.getElementById('whatsapp').value.trim();
        if (whatsapp) {
            const whatsappNumbers = whatsapp.replace(/\D/g, '');
            if (whatsappNumbers.length < 10 || whatsappNumbers.length > 15) {
                Toast.error('WhatsApp inválido. Digite um número válido com DDD. Exemplo: (44) 98861-1075');
                document.getElementById('whatsapp').focus();
                throw new Error('WhatsApp inválido');
            }
        }
        
        // Validate email format if provided
        const email = document.getElementById('email').value.trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Toast.error('E-mail inválido. Digite um e-mail válido. Exemplo: contato@loja.com.br');
            document.getElementById('email').focus();
            throw new Error('E-mail inválido');
        }
        
        // Prepare store data
        const storeData = {
            name: storeName,
            description: document.getElementById('description').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            whatsapp: whatsapp,
            email: email,
            address: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            state: document.getElementById('state').value.trim().toUpperCase()
        };
        
        // Add slug if editable
        if (!slugInput.readOnly && slug) {
            storeData.slug = slug;
        }
        
        // Add logo_url if set
        const logoUrl = document.getElementById('logoUrl').value.trim();
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
        
        const storeResponseData = await storeResponse.json();
        const notificationData = await notificationResponse.json();
        
        if (storeResponse.ok && notificationResponse.ok) {
            Toast.success('Configurações salvas com sucesso!');
            // Reload settings to show updated logo
            setTimeout(() => {
                loadStoreSettings();
            }, 500);
        } else {
            // Get detailed error message
            let errorMsg = 'Erro ao salvar configurações';
            
            if (!storeResponse.ok && storeResponseData.error) {
                errorMsg = storeResponseData.error;
                
                // Provide specific guidance based on error
                if (errorMsg.includes('slug')) {
                    errorMsg += ' Por favor, escolha uma URL diferente.';
                } else if (errorMsg.includes('obrigatório')) {
                    errorMsg += ' Verifique se todos os campos obrigatórios estão preenchidos.';
                }
            } else if (!notificationResponse.ok && notificationData.error) {
                errorMsg = notificationData.error;
            }
            
            Toast.error(errorMsg);
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        // Error message already shown in validation above
        if (!error.message || error.message.includes('obrigatório') || error.message.includes('inválido')) {
            // Validation error - message already shown
        } else {
            Toast.error('Erro ao salvar configurações. Verifique sua conexão e tente novamente.');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}



