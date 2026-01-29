// REQ-ADM-FRONT-PAINEL-ASSINATURAS: Admin Panel JavaScript
// Painel Administrativo de Assinaturas

// API_URL is defined in config.js (loaded before this file)
// Usar window.API_URL para evitar erro de redeclaração
function getApiUrl() {
    return window.API_URL || 'http://localhost/ESTOCX/api/index.php';
}

// Global state
let currentPage = 1;
let currentFilters = {};
let plansList = [];
let storesData = [];

// REQ-ADM-FRONT-PAINEL-ASSINATURAS: Controle de Acesso (Obrigatório)
// Validar token e role admin ANTES de renderizar qualquer conteúdo
async function validateAdminAccess() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.warn('Token não encontrado. Redirecionando para login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        const apiUrl = getApiUrl();
        
        console.log('Validando acesso admin...', { 
            API_URL: apiUrl, 
            token: token ? token.substring(0, 20) + '...' : 'TOKEN NÃO ENCONTRADO' 
        });
        
        // Verificar se token existe
        if (!token || token.trim() === '') {
            console.error('Token não encontrado ou vazio');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return false;
        }
        
        const response = await fetch(`${apiUrl}/auth`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Resposta da API:', { status: response.status, ok: response.ok });
        
        if (!response.ok) {
            if (response.status === 401) {
                console.warn('Token inválido ou expirado. Redirecionando para login...');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return false;
            }
            
            // Tentar ler a resposta de erro
            let errorText = '';
            try {
                const errorData = await response.json();
                errorText = errorData.error || `HTTP error! status: ${response.status}`;
            } catch (e) {
                errorText = `HTTP error! status: ${response.status}`;
            }
            
            console.error('Erro na resposta:', errorText);
            throw new Error(errorText);
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (!data.success || !data.data || !data.data.user) {
            console.warn('Resposta inválida da API:', data);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('Erro: Resposta inválida da API. Por favor, faça login novamente.');
            window.location.href = 'login.html';
            return false;
        }
        
        const user = data.data.user;
        console.log('Dados do usuário:', { id: user.id, email: user.email, role: user.role });
        
        // REQ-ADM-FRONT-PAINEL-ASSINATURAS: Validar role = admin
        // Tratar caso onde role pode ser null, undefined ou string vazia
        const userRole = (user.role || '').toLowerCase().trim();
        
        if (userRole !== 'admin') {
            console.warn('Acesso negado. Usuário não é admin.', { role: userRole, user });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('Acesso negado. Apenas administradores podem acessar este painel.\n\nSeu perfil: ' + (userRole || 'sem role definido'));
            window.location.href = 'login.html';
            return false;
        }
        
        // Exibir nome do admin
        const adminUserNameEl = document.getElementById('adminUserName');
        if (adminUserNameEl) {
            adminUserNameEl.textContent = user.name || user.email;
        }
        
        console.log('Acesso validado com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao validar acesso:', error);
        console.error('Detalhes do erro:', {
            message: error.message,
            stack: error.stack,
            API_URL: getApiUrl()
        });
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Mostrar mensagem mais informativa
        const errorMsg = error.message || 'Erro ao validar acesso';
        alert(`Erro ao validar acesso administrativo:\n\n${errorMsg}\n\nVerifique o console para mais detalhes.`);
        
        // Não redirecionar automaticamente em caso de erro de rede, apenas mostrar mensagem
        if (error.message && error.message.includes('Failed to fetch')) {
            console.error('Erro de conexão com a API. Verifique se a API está acessível em:', getApiUrl());
            return false;
        }
        
        window.location.href = 'login.html';
        return false;
    }
}

// Obter token de autenticação
function getAuthToken() {
    return localStorage.getItem('token');
}

// Carregar planos para o filtro
async function loadPlans() {
    try {
        const response = await fetch(`${getApiUrl()}/plans`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.plans) {
            plansList = data.data.plans;
            const planFilter = document.getElementById('planFilter');
            
            if (planFilter) {
                planFilter.innerHTML = '<option value="">Todos os planos</option>';
                plansList.forEach(plan => {
                    const option = document.createElement('option');
                    option.value = plan.slug;
                    option.textContent = plan.name;
                    planFilter.appendChild(option);
                });
            }
            
            // Carregar planos no modal de alterar plano
            const newPlanId = document.getElementById('newPlanId');
            if (newPlanId) {
                newPlanId.innerHTML = '<option value="">Selecione um plano...</option>';
                plansList.forEach(plan => {
                    const option = document.createElement('option');
                    option.value = plan.id;
                    option.textContent = `${plan.name} - R$ ${formatPrice(plan.price)}`;
                    newPlanId.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Erro ao carregar planos:', error);
    }
}

// REQ-ADM-FRONT-PAINEL-ASSINATURAS: Carregar lista de assinaturas
async function loadStores() {
    const tableBody = document.getElementById('storesTableBody');
    const storesCount = document.getElementById('storesCount');
    
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></td></tr>';
    }
    
    try {
        // Coletar filtros
        const status = document.getElementById('statusFilter')?.value || '';
        const plan = document.getElementById('planFilter')?.value || '';
        const search = document.getElementById('searchInput')?.value || '';
        const expired = document.getElementById('expiredFilter')?.checked ? 'true' : '';
        const expiring = document.getElementById('expiringFilter')?.checked ? 'true' : '';
        const trial = document.getElementById('trialFilter')?.checked ? 'true' : '';
        
        // Construir query params
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (plan) params.append('plan', plan);
        if (search) params.append('search', search);
        if (expired) params.append('expired', expired);
        if (expiring) params.append('expiring', expiring);
        if (trial) params.append('trial', trial);
        params.append('page', currentPage);
        params.append('limit', '50');
        
        const token = getAuthToken();
        const url = `${getApiUrl()}/admin/subscriptions?${params.toString()}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            if (response.status === 403) {
                alert('Acesso negado. Apenas administradores podem acessar este painel.');
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.stores) {
            storesData = data.data.stores;
            displayStores(storesData);
            updatePagination(data.data.pagination);
            
            if (storesCount) {
                const total = data.data.pagination?.total || 0;
                storesCount.textContent = `${total} registro${total !== 1 ? 's' : ''}`;
            }
        } else {
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="9" class="text-center py-5 text-muted">Nenhuma loja encontrada</td></tr>';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar lojas:', error);
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center py-5"><div class="alert alert-danger" role="alert"><i class="bi bi-exclamation-triangle me-2"></i>Não foi possível carregar as assinaturas. Tente novamente.</div></td></tr>';
        }
    }
}

// REQ-ADM-FRONT-PAINEL-ASSINATURAS: Exibir lojas na tabela
function displayStores(stores) {
    const tableBody = document.getElementById('storesTableBody');
    
    if (!tableBody) return;
    
    if (stores.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center py-5 text-muted">Nenhuma loja encontrada</td></tr>';
        return;
    }
    
    tableBody.innerHTML = stores.map(store => {
        const statusClass = getStatusClass(store.subscription_status);
        const statusText = getStatusText(store.subscription_status);
        const expiresAt = store.subscription_ends_at ? formatDate(store.subscription_ends_at) : '-';
        const planName = getPlanDisplayName(store.plan_name, store.plan_slug);
        const planBadgeClass = getPlanBadgeClass(store.plan_slug);
        
        // Verificar se está próximo do vencimento (≤7 dias)
        let expiresAtClass = '';
        if (store.subscription_ends_at) {
            const expiresDate = new Date(store.subscription_ends_at);
            const now = new Date();
            const daysUntilExpiry = Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= 7 && daysUntilExpiry > 0 && store.subscription_status === 'active') {
                expiresAtClass = 'text-warning fw-bold';
            } else if (daysUntilExpiry <= 0 && store.subscription_status !== 'canceled') {
                expiresAtClass = 'text-danger fw-bold';
            }
        }
        
        // Usar effective_vehicle_limit se disponível (prioriza custom_vehicle_limit), senão usa plan_vehicle_limit
        const vehicleLimit = store.effective_vehicle_limit !== undefined && store.effective_vehicle_limit !== null 
            ? store.effective_vehicle_limit 
            : (store.plan_vehicle_limit !== null ? store.plan_vehicle_limit : '-');
        const vehicleCount = store.vehicle_count || 0;
        const vehicleDisplay = vehicleLimit === -1 
            ? `<span class="badge bg-success">${vehicleCount} (ilimitado)</span>` 
            : `${vehicleCount} / ${vehicleLimit}`;
        const lastPayment = store.last_payment ? formatDateTime(store.last_payment) : '<span class="text-muted">-</span>';
        const gateway = store.last_gateway || '<span class="text-muted">-</span>';
        
        return `
            <tr>
                <td>
                    <strong>${escapeHtml(store.name || '-')}</strong><br>
                    <small class="text-muted">${escapeHtml(store.slug || '-')}</small>
                </td>
                <td>${escapeHtml(store.user_email || '-')}</td>
                <td>
                    <span class="plan-badge ${planBadgeClass}">${escapeHtml(planName)}</span>
                </td>
                <td>
                    <span class="badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <small class="${expiresAtClass}">${expiresAt}</small>
                </td>
                <td><small>${vehicleDisplay}</small></td>
                <td><small>${lastPayment}</small></td>
                <td><small>${gateway}</small></td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary action-btn" 
                                onclick="showStoreDetails('${store.id}')" 
                                data-bs-toggle="tooltip" 
                                data-bs-placement="top" 
                                title="Ver detalhes completos da loja">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button type="button" class="btn btn-outline-success action-btn" 
                                onclick="showActionModal('${store.id}', 'renew')" 
                                data-bs-toggle="tooltip" 
                                data-bs-placement="top" 
                                title="Renovar assinatura">
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-secondary dropdown-toggle action-btn" 
                                    data-bs-toggle="dropdown" 
                                    data-bs-placement="top" 
                                    title="Mais ações administrativas">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="event.preventDefault(); showActionModal('${store.id}', 'suspend');">
                                    <i class="bi bi-pause-circle me-2"></i>Suspender
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="event.preventDefault(); showActionModal('${store.id}', 'reactivate');">
                                    <i class="bi bi-play-circle me-2"></i>Reativar
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="event.preventDefault(); showActionModal('${store.id}', 'change_plan');">
                                    <i class="bi bi-arrow-repeat me-2"></i>Alterar Plano
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="event.preventDefault(); showActionModal('${store.id}', 'set_vehicle_limit');">
                                    <i class="bi bi-car-front me-2"></i>Limitar Veículos
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="event.preventDefault(); showActionModal('${store.id}', 'cancel');">
                                    <i class="bi bi-x-circle me-2"></i>Cancelar
                                </a></li>
                            </ul>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Inicializar tooltips do Bootstrap após renderizar a tabela
    const tooltipTriggerList = [].slice.call(tableBody.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// REQ-ADM-FRONT-PAINEL-ASSINATURAS: Atualizar paginação
function updatePagination(pagination) {
    const paginationEl = document.getElementById('pagination');
    if (!paginationEl || !pagination) return;
    
    const current = pagination.page || 1;
    const total = pagination.pages || 1;
    
    if (total <= 1) {
        paginationEl.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Botão anterior
    html += `<li class="page-item ${current === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="event.preventDefault(); changePage(${current - 1});">Anterior</a>
    </li>`;
    
    // Páginas
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 2 && i <= current + 2)) {
            html += `<li class="page-item ${i === current ? 'active' : ''}">
                <a class="page-link" href="#" onclick="event.preventDefault(); changePage(${i});">${i}</a>
            </li>`;
        } else if (i === current - 3 || i === current + 3) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Botão próximo
    html += `<li class="page-item ${current === total ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="event.preventDefault(); changePage(${current + 1});">Próximo</a>
    </li>`;
    
    paginationEl.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    loadStores();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// REQ-ADM-FRONT-PAINEL-ASSINATURAS: Resetar filtros
function resetFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('planFilter').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('expiredFilter').checked = false;
    document.getElementById('expiringFilter').checked = false;
    document.getElementById('trialFilter').checked = false;
    currentPage = 1;
    loadStores();
}

// REQ-ADM-FRONT-PAINEL-ASSINATURAS: Mostrar detalhes da loja
async function showStoreDetails(storeId) {
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    const content = document.getElementById('storeDetailsContent');
    
    content.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
    modal.show();
    
    try {
        const token = getAuthToken();
        const response = await fetch(`${getApiUrl()}/admin/subscriptions?store_id=${storeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const store = data.data.store;
            const transactions = data.data.transactions || [];
            const logs = data.data.logs || [];
            
            renderStoreDetails(store, transactions, logs);
        } else {
            content.innerHTML = '<div class="alert alert-danger">Erro ao carregar detalhes da loja.</div>';
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        content.innerHTML = '<div class="alert alert-danger">Erro ao carregar detalhes da loja. Tente novamente.</div>';
    }
}

// Renderizar detalhes da loja
function renderStoreDetails(store, transactions, logs) {
    const content = document.getElementById('storeDetailsContent');
    const statusClass = getStatusClass(store.subscription_status);
    const statusText = getStatusText(store.subscription_status);
    
    let html = `
        <div class="row mb-4">
            <div class="col-md-6">
                <h5>Informações da Loja</h5>
                <table class="table table-sm">
                    <tr><th width="150">Nome:</th><td>${escapeHtml(store.name || '-')}</td></tr>
                    <tr><th>Slug:</th><td>${escapeHtml(store.slug || '-')}</td></tr>
                    <tr><th>Email:</th><td>${escapeHtml(store.user_email || '-')}</td></tr>
                    <tr><th>Responsável:</th><td>${escapeHtml(store.user_name || '-')}</td></tr>
                    <tr><th>Plano:</th><td>${escapeHtml(store.plan_name || '-')}</td></tr>
                    <tr><th>Status:</th><td><span class="badge ${statusClass}">${statusText}</span></td></tr>
                    <tr><th>Expiração:</th><td>${store.subscription_ends_at ? formatDateTime(store.subscription_ends_at) : '-'}</td></tr>
                </table>
            </div>
            <div class="col-md-6">
                <h5>Estatísticas</h5>
                <table class="table table-sm">
                    <tr><th width="150">Veículos:</th><td>${store.vehicle_count || 0} / ${store.plan_vehicle_limit === -1 ? 'Ilimitado' : (store.plan_vehicle_limit || '-')}</td></tr>
                    <tr><th>Total Transações:</th><td>${transactions.length}</td></tr>
                    <tr><th>Total Logs:</th><td>${logs.length}</td></tr>
                </table>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <h5>Histórico Financeiro</h5>
                <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                    <table class="table table-sm table-striped">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Valor</th>
                                <th>Status</th>
                                <th>Gateway</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    if (transactions.length === 0) {
        html += '<tr><td colspan="4" class="text-center text-muted">Nenhuma transação encontrada</td></tr>';
    } else {
        transactions.forEach(tx => {
            html += `
                <tr>
                    <td>${formatDateTime(tx.created_at)}</td>
                    <td>R$ ${formatPrice(tx.amount)}</td>
                    <td><span class="badge bg-${getTransactionStatusClass(tx.status)}">${tx.status}</span></td>
                    <td>${escapeHtml(tx.gateway || '-')}</td>
                </tr>
            `;
        });
    }
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-md-6">
                <h5>Histórico de Logs</h5>
                <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                    <table class="table table-sm table-striped">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Ação</th>
                                <th>Status</th>
                                <th>Por</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    if (logs.length === 0) {
        html += '<tr><td colspan="4" class="text-center text-muted">Nenhum log encontrado</td></tr>';
    } else {
        logs.forEach(log => {
            html += `
                <tr>
                    <td>${formatDateTime(log.created_at)}</td>
                    <td>${escapeHtml(log.action || '-')}</td>
                    <td>${escapeHtml(log.old_status || '-')} → ${escapeHtml(log.new_status || '-')}</td>
                    <td>${escapeHtml(log.performed_by || '-')}</td>
                </tr>
            `;
        });
    }
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

// REQ-ADM-FRONT-PAINEL-ASSINATURAS: Mostrar modal de ação administrativa
function showActionModal(storeId, action) {
    const modal = new bootstrap.Modal(document.getElementById('actionModal'));
    const title = document.getElementById('actionModalTitle');
    const actionStoreId = document.getElementById('actionStoreId');
    const actionType = document.getElementById('actionType');
    const actionChangePlan = document.getElementById('actionChangePlan');
    const actionVehicleLimit = document.getElementById('actionVehicleLimit');
    const actionWarning = document.getElementById('actionWarning');
    const actionWarningText = document.getElementById('actionWarningText');
    const actionNotes = document.getElementById('actionNotes');
    const actionError = document.getElementById('actionError');
    
    // Reset form
    actionStoreId.value = storeId;
    actionType.value = action;
    actionNotes.value = '';
    actionError.classList.add('d-none');
    actionError.textContent = '';
    
    // Mostrar/ocultar campos específicos
    if (action === 'change_plan') {
        actionChangePlan.style.display = 'block';
        if (actionVehicleLimit) actionVehicleLimit.style.display = 'none';
        document.getElementById('newPlanId').required = true;
        if (document.getElementById('vehicleLimit')) {
            document.getElementById('vehicleLimit').required = false;
            document.getElementById('vehicleLimit').value = '';
        }
    } else if (action === 'set_vehicle_limit') {
        actionChangePlan.style.display = 'none';
        if (actionVehicleLimit) actionVehicleLimit.style.display = 'block';
        document.getElementById('newPlanId').required = false;
        if (document.getElementById('vehicleLimit')) {
            document.getElementById('vehicleLimit').required = true;
        }
        document.getElementById('newPlanId').value = '';
    } else {
        actionChangePlan.style.display = 'none';
        if (actionVehicleLimit) actionVehicleLimit.style.display = 'none';
        document.getElementById('newPlanId').required = false;
        document.getElementById('newPlanId').value = '';
        if (document.getElementById('vehicleLimit')) {
            document.getElementById('vehicleLimit').required = false;
            document.getElementById('vehicleLimit').value = '';
        }
    }
    
    // Definir título e avisos
    const actionLabels = {
        'renew': 'Renovar Assinatura',
        'suspend': 'Suspender Assinatura',
        'reactivate': 'Reativar Assinatura',
        'cancel': 'Cancelar Assinatura',
        'change_plan': 'Alterar Plano',
        'set_vehicle_limit': 'Definir Limite de Veículos'
    };
    
    title.textContent = actionLabels[action] || 'Ação Administrativa';
    
    // Avisos
    if (action === 'cancel') {
        actionWarning.style.display = 'block';
        actionWarningText.textContent = 'ATENÇÃO: Esta ação é irreversível. A loja perderá acesso aos recursos pagos.';
    } else {
        actionWarning.style.display = 'none';
    }
    
    modal.show();
}

// REQ-ADM-FRONT-PAINEL-ASSINATURAS: Executar ação administrativa
async function executeAction() {
    const actionStoreId = document.getElementById('actionStoreId').value;
    const actionType = document.getElementById('actionType').value;
    const actionNotes = document.getElementById('actionNotes').value;
    const newPlanId = document.getElementById('newPlanId').value;
    const confirmBtn = document.getElementById('confirmActionBtn');
    const actionSpinner = document.getElementById('actionSpinner');
    const actionError = document.getElementById('actionError');
    
    // Validação
    if (actionType === 'change_plan' && !newPlanId) {
        actionError.textContent = 'Por favor, selecione um plano.';
        actionError.classList.remove('d-none');
        return;
    }
    
    if (actionType === 'set_vehicle_limit') {
        const vehicleLimitInput = document.getElementById('vehicleLimit');
        if (vehicleLimitInput) {
            const limit = parseInt(vehicleLimitInput.value);
            if (isNaN(limit) || (limit < -1)) {
                actionError.textContent = 'Por favor, informe um limite válido (-1 para ilimitado ou um número positivo).';
                actionError.classList.remove('d-none');
                return;
            }
        }
    }
    
    // Confirmar ação crítica
    if (actionType === 'cancel') {
        if (!confirm('Tem certeza que deseja CANCELAR esta assinatura? Esta ação é irreversível.')) {
            return;
        }
    }
    
    // Preparar payload
    const payload = {
        store_id: actionStoreId,
        action: actionType,
        notes: actionNotes || undefined
    };
    
    if (actionType === 'change_plan') {
        payload.plan_id = newPlanId;
    }
    
    if (actionType === 'set_vehicle_limit') {
        const vehicleLimitInput = document.getElementById('vehicleLimit');
        if (vehicleLimitInput) {
            payload.vehicle_limit = parseInt(vehicleLimitInput.value);
        }
    }
    
    // Desabilitar botão e mostrar spinner
    confirmBtn.disabled = true;
    actionSpinner.classList.remove('d-none');
    actionError.classList.add('d-none');
    
    try {
        const token = getAuthToken();
        const response = await fetch(`${getApiUrl()}/admin/subscriptions`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            if (response.status === 403) {
                actionError.textContent = 'Acesso negado. Apenas administradores podem executar esta ação.';
                actionError.classList.remove('d-none');
                return;
            }
            
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('actionModal'));
            modal.hide();
            
            // Recarregar lista
            loadStores();
            
            // Mensagem de sucesso
            alert('Ação executada com sucesso!');
        } else {
            throw new Error(data.error || 'Erro ao executar ação');
        }
    } catch (error) {
        console.error('Erro ao executar ação:', error);
        actionError.textContent = error.message || 'Erro ao executar ação. Tente novamente.';
        actionError.classList.remove('d-none');
    } finally {
        confirmBtn.disabled = false;
        actionSpinner.classList.add('d-none');
    }
}

// Funções auxiliares
function getStatusClass(status) {
    // Usar classes Bootstrap para badges
    const classes = {
        'active': 'bg-success text-white',
        'pending': 'bg-warning text-dark',
        'suspended': 'bg-danger text-white',
        'canceled': 'bg-secondary text-white',
        'trial': 'bg-info text-white'
    };
    return classes[status] || 'bg-secondary text-white';
}

function getStatusText(status) {
    const texts = {
        'active': 'Ativo',
        'pending': 'Pendente',
        'suspended': 'Suspenso',
        'canceled': 'Cancelado',
        'trial': 'Trial'
    };
    return texts[status] || status;
}

function getPlanBadgeClass(planSlug) {
    if (!planSlug) return 'plan-gratuito';
    const slug = planSlug.toLowerCase();
    if (slug.includes('gratuito')) return 'plan-gratuito';
    if (slug.includes('mensal')) return 'plan-mensal';
    if (slug.includes('trimestral')) return 'plan-trimestral';
    if (slug.includes('anual')) return 'plan-anual';
    return 'plan-gratuito';
}

function getPlanDisplayName(planName, planSlug) {
    if (!planName || planName === '-') return 'Não definido';
    // Simplificar nomes para exibição
    const name = planName.toLowerCase();
    if (name.includes('mensal')) return 'Mensal';
    if (name.includes('trimestral')) return 'Trimestral';
    if (name.includes('anual')) return 'Anual';
    if (name.includes('gratuito')) return 'Gratuito';
    return planName;
}

function getTransactionStatusClass(status) {
    const classes = {
        'approved': 'success',
        'refused': 'danger',
        'canceled': 'secondary',
        'waiting_payment': 'warning',
        'expired': 'dark',
        'refunded': 'info'
    };
    return classes[status] || 'secondary';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
}

function formatPrice(price) {
    if (price === null || price === undefined) return '0,00';
    return parseFloat(price).toFixed(2).replace('.', ',');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// REQ-ADM-FRONT-PAINEL-ASSINATURAS: Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Bootstrap do Painel Admin
// - Valida acesso ANTES de renderizar
// - Evita tela travada em "Validando..." quando há erro de rede/rota
document.addEventListener('DOMContentLoaded', async () => {
    const loadingEl = document.getElementById('loadingAccess');
    const mainEl = document.getElementById('mainContent');

    function showAccessError(message) {
        if (mainEl) mainEl.style.display = 'none';
        if (!loadingEl) return;

        loadingEl.style.display = 'block';
        loadingEl.innerHTML = `
            <div class="alert alert-danger d-inline-block text-start" role="alert" style="max-width: 720px;">
                <div class="fw-bold mb-2">Não foi possível validar o acesso administrativo.</div>
                <div class="small mb-2">${escapeHtml(message || 'Erro desconhecido')}</div>
                <div class="small text-muted mb-3">
                    API usada: <code>${escapeHtml(getApiUrl())}</code><br>
                    Teste no navegador: <code>/api/index.php/auth</code> (deve retornar 401/403/200 — mas não 404 puro)
                </div>
                <div class="d-flex gap-2">
                    <a class="btn btn-sm btn-primary" href="login.html">Ir para Login</a>
                    <button class="btn btn-sm btn-outline-secondary" type="button" onclick="location.reload()">Recarregar</button>
                </div>
            </div>
        `;
    }

    try {
        const ok = await validateAdminAccess();
        if (!ok) {
            // validateAdminAccess pode redirecionar; se não redirecionou, mostramos erro pra não ficar infinito
            showAccessError('Validação falhou (token ausente/inválido, acesso negado ou erro de rede).');
            return;
        }

        if (loadingEl) loadingEl.style.display = 'none';
        if (mainEl) mainEl.style.display = 'block';

        // Carregar dados iniciais do painel
        await loadPlans();
        await loadStores();
        
        // Inicializar tooltips globais
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    } catch (e) {
        console.error('Erro no bootstrap do painel admin:', e);
        showAccessError(e?.message || 'Erro no bootstrap do painel admin');
    }
});
