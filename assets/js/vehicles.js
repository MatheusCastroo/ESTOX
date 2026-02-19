// Vehicles JavaScript
// API_URL and buildApiUrl are defined in config.js
// Ensure buildApiUrl is available (fallback if config.js didn't load)
if (typeof window.buildApiUrl !== 'function') {
    // Fallback: define buildApiUrl if config.js didn't load
    window.buildApiUrl = function(endpoint) {
        const apiBase = (window.API_URL || 'http://localhost/ESTOX/api/index.php').replace(/\/$/, '');
        const base = apiBase.endsWith('/index.php') ? apiBase : apiBase + '/index.php';
        return `${base}/${endpoint.replace(/^\//, '')}`;
    };
}

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadVehicles();
    
    // Filter events
    document.getElementById('searchInput').addEventListener('input', debounce(loadVehicles, 500));
    document.getElementById('statusFilter').addEventListener('change', loadVehicles);
});

function getAuthToken() {
    return localStorage.getItem('token');
}

// Normalize image URL - convert relative to absolute if needed
function normalizeImageUrl(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }
    
    // Se já é uma URL absoluta (http/https) ou data URI, retornar como está
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    
    // Se começa com //, adicionar protocolo
    if (url.startsWith('//')) {
        return window.location.protocol + url;
    }
    
    // Se é um caminho absoluto do servidor, adicionar origin
    if (url.startsWith('/')) {
        return window.location.origin + url;
    }
    
    // Caminho relativo - construir URL completa baseada na API
    // Se a imagem está na pasta de uploads da API
    if (url.includes('uploads') || url.includes('vehicles')) {
        // Tentar múltiplas formas de construir a URL base
        let apiBase = '';
        
        // Método 1: Remover /api/index.php ou /api
        if (API_URL) {
            apiBase = API_URL.replace('/api/index.php', '').replace('/api', '');
        }
        
        // Método 2: Se não funcionou, usar origin
        if (!apiBase || apiBase === API_URL) {
            apiBase = window.location.origin;
        }
        
        // Limpar barras duplas e construir URL
        const cleanUrl = url.replace(/^\.\//, '').replace(/^\//, '');
        const finalUrl = apiBase + '/' + cleanUrl;
        
        return finalUrl;
    }
    
    // Caso padrão: construir URL relativa ao diretório atual
    const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    const cleanUrl = url.replace(/^\.\//, '').replace(/^\//, '');
    return baseUrl + '/' + cleanUrl;
}

// Get placeholder image
function getPlaceholderImage() {
    return 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2764%27 height=%2748%27%3E%3Crect fill=%27%23e2e8f0%27 width=%2764%27 height=%2748%27/%3E%3Ctext fill=%27%2394a3b8%27 font-family=%27sans-serif%27 font-size=%2710%27 dy=%2710.5%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ESem imagem%3C/text%3E%3C/svg%3E';
}

async function loadVehicles() {
    const tbody = document.getElementById('vehiclesTableBody');
    if (!tbody) {
        console.error('vehiclesTableBody not found');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></td></tr>';
    
    try {
        const search = document.getElementById('searchInput')?.value || '';
        const status = document.getElementById('statusFilter')?.value || 'all';
        
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status !== 'all') params.append('status', status);
        
        const token = getAuthToken();
        if (!token) {
            console.error('No auth token found');
            window.location.href = 'login.html';
            return;
        }
        
        // #region agent log
        const url = window.buildApiUrl(`vehicles?${params.toString()}`);
        console.log('🔍 DEBUG vehicles.js - URL construída:', url);
        console.log('🔍 DEBUG vehicles.js - API_URL:', window.API_URL);
        console.log('🔍 DEBUG vehicles.js - buildApiUrl disponível:', typeof window.buildApiUrl);
        fetch('http://127.0.0.1:7242/ingest/26790cf9-263c-4d19-9e85-a571eedf06cf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vehicles.js:107',message:'URL construída para carregar veículos',data:{url:url,apiUrl:window.API_URL,params:params.toString(),hasToken:!!token},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        // #region agent log
        console.log('🔍 DEBUG vehicles.js - Resposta recebida:', response.status, response.statusText, response.url);
        fetch('http://127.0.0.1:7242/ingest/26790cf9-263c-4d19-9e85-a571eedf06cf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vehicles.js:116',message:'Resposta da requisição de veículos',data:{status:response.status,statusText:response.statusText,ok:response.ok,url:response.url},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        if (!response.ok) {
            // #region agent log
            const errorText = await response.text().catch(() => '');
            fetch('http://127.0.0.1:7242/ingest/26790cf9-263c-4d19-9e85-a571eedf06cf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vehicles.js:120',message:'Erro na resposta HTTP','data':{status:response.status,statusText:response.statusText,url:response.url,errorText:errorText.substring(0,200)},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/26790cf9-263c-4d19-9e85-a571eedf06cf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vehicles.js:125',message:'Dados recebidos','data':{success:data.success,vehicleCount:data.data?.vehicles?.length||0,hasData:!!data.data},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        if (data.success && data.data && data.data.vehicles) {
            displayVehicles(data.data.vehicles);
            
            // Forçar conversão para cards no mobile após carregar dados
            if (window.innerWidth <= 768) {
                // Múltiplas tentativas para garantir conversão
                [100, 300, 500, 1000].forEach(delay => {
                    setTimeout(() => {
                        const table = document.getElementById('vehiclesTable');
                        if (!table) return;
                        
                        // Verificar se já não foi convertido
                        const existingCards = table.parentElement.querySelector('.table-mobile-cards');
                        if (existingCards) return;
                        
                        // Verificar se há dados válidos
                        const tbody = table.querySelector('tbody');
                        if (!tbody) return;
                        
                        const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => {
                            return !row.querySelector('.spinner-border') && 
                                   !row.querySelector('.text-danger') && 
                                   row.textContent.trim() !== '' &&
                                   row.cells.length > 1;
                        });
                        
                        if (rows.length > 0 && typeof window.convertTableToCards === 'function') {
                            window.convertTableToCards(table);
                        }
                    }, delay);
                });
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">Nenhum veículo encontrado</td></tr>';
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
        console.error('API_URL:', API_URL);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-danger">
            <p class="mb-2">Erro ao carregar veículos</p>
            <small class="text-muted">${error.message || 'Erro de conexão'}</small>
        </td></tr>`;
    }
}

function displayVehicles(vehicles) {
    const tbody = document.getElementById('vehiclesTableBody');
    if (!tbody) {
        console.error('vehiclesTableBody not found');
        return;
    }
    
    if (vehicles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">Nenhum veículo encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = vehicles.map(vehicle => {
        const statusColors = {
            'available': 'success',
            'reserved': 'warning',
            'sold': 'secondary'
        };
        
        const statusLabels = {
            'available': 'Disponível',
            'reserved': 'Reservado',
            'sold': 'Vendido'
        };
        
        // Parse images if it's a JSON string
        let images = [];
        if (vehicle.images) {
            if (typeof vehicle.images === 'string') {
                try {
                    images = JSON.parse(vehicle.images);
                } catch (e) {
                    console.error('Error parsing images JSON:', e);
                    images = [];
                }
            } else if (Array.isArray(vehicle.images)) {
                images = vehicle.images;
            }
        }
        
        // Normalizar todas as URLs das imagens
        images = images.map(img => normalizeImageUrl(img)).filter(img => img !== null);
        
        // Get first image or use placeholder
        const imageUrl = images.length > 0 ? images[0] : getPlaceholderImage();
        const placeholderUrl = getPlaceholderImage();
        
        return `
            <tr>
                <td data-label="Veículo">
                    <div class="d-flex align-items-center gap-3">
                        <img src="${imageUrl}" 
                             alt="${vehicle.model}" 
                             class="rounded vehicle-thumbnail" 
                             style="width: 64px; height: 48px; object-fit: cover; flex-shrink: 0; display: block;" 
                             loading="eager"
                             onerror="this.onerror=null; this.src='${placeholderUrl}'; this.style.display='block';"
                             onload="this.style.display='block';">
                        <div style="min-width: 0; flex: 1;">
                            <p class="fw-medium mb-0">${vehicle.model || 'N/A'}</p>
                            <p class="text-muted small mb-0">${vehicle.brand || 'N/A'}</p>
                        </div>
                    </div>
                </td>
                <td data-label="Ano">${vehicle.year}</td>
                <td data-label="Quilometragem">${vehicle.mileage.toLocaleString('pt-BR')} km</td>
                <td data-label="Preço" class="fw-semibold text-primary">${formatPrice(vehicle.price)}</td>
                <td data-label="Status">
                    <span class="badge bg-${statusColors[vehicle.status]}">${statusLabels[vehicle.status]}</span>
                </td>
                <td data-label="Ações" class="text-end">
                    <div class="btn-group">
                        <a href="veiculo-editar.html?id=${vehicle.id}" class="btn btn-sm btn-outline-primary" style="min-width: 44px; min-height: 44px;">
                            <i class="bi bi-pencil"></i>
                        </a>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteVehicle('${vehicle.id}')" style="min-width: 44px; min-height: 44px;">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Após inserir HTML, garantir que imagens tenham tratamento de erro
    setTimeout(() => {
        const images = tbody.querySelectorAll('img.vehicle-thumbnail');
        const placeholderUrl = getPlaceholderImage();
        images.forEach(img => {
            // Adicionar tratamento de erro se não tiver
            if (!img.hasAttribute('data-error-handled')) {
                img.setAttribute('data-error-handled', 'true');
                
                // Garantir que a imagem seja visível
                img.style.display = 'block';
                img.style.visibility = 'visible';
                img.style.opacity = '1';
                
                // Tentar múltiplos caminhos se a imagem falhar
                const originalSrc = img.src;
                let attemptCount = 0;
                const alternativePaths = [
                    originalSrc,
                    originalSrc.replace(/^\.\//, ''),
                    window.location.origin + '/' + originalSrc.replace(window.location.origin, '').replace(/^\//, ''),
                    originalSrc.startsWith('/') ? window.location.origin + originalSrc : originalSrc
                ];
                
                img.addEventListener('error', function() {
                    attemptCount++;
                    if (attemptCount < alternativePaths.length) {
                        // Tentar próximo caminho
                        this.src = alternativePaths[attemptCount];
                    } else {
                        // Usar placeholder se todos falharem
                        if (this.src !== placeholderUrl) {
                            this.src = placeholderUrl;
                            this.style.display = 'block';
                        }
                    }
                }, { once: false });
                
                // Forçar reload se não carregou após 1 segundo
                setTimeout(() => {
                    if (!img.complete || img.naturalHeight === 0) {
                        if (img.src !== placeholderUrl && attemptCount === 0) {
                            attemptCount++;
                            img.src = alternativePaths[1] || placeholderUrl;
                        }
                    }
                }, 1000);
            }
        });
    }, 50);
}

async function deleteVehicle(id) {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;
    
    try {
        const url = window.buildApiUrl(`vehicles?id=${id}`);
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            Toast.success('Veículo excluído com sucesso!');
            loadVehicles();
        } else {
            Toast.error(data.error || 'Erro ao excluir veículo');
        }
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        Toast.error('Erro ao excluir veículo. Tente novamente.');
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}



