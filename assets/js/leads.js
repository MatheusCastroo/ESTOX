// Leads JavaScript

// API_URL is defined in config.js

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadLeads();
    
    document.getElementById('searchInput').addEventListener('input', debounce(loadLeads, 500));
    document.getElementById('statusFilter').addEventListener('change', loadLeads);
});

function getAuthToken() {
    return localStorage.getItem('token');
}

async function loadLeads() {
    const container = document.getElementById('leadsList');
    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
    
    try {
        const search = document.getElementById('searchInput').value;
        const status = document.getElementById('statusFilter').value;
        
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status !== 'all') params.append('status', status);
        
        const response = await fetch(`${API_URL}/leads?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.leads) {
            displayLeads(data.data.leads);
        } else {
            container.innerHTML = '<p class="text-center text-muted py-5">Nenhum lead encontrado</p>';
        }
    } catch (error) {
        console.error('Error loading leads:', error);
        container.innerHTML = '<p class="text-center text-danger py-5">Erro ao carregar leads</p>';
    }
}

function displayLeads(leads) {
    const container = document.getElementById('leadsList');
    
    if (leads.length === 0) {
        container.innerHTML = '<p class="text-center text-muted py-5">Nenhum lead encontrado</p>';
        return;
    }
    
    const statusColors = {
        'new': 'primary',
        'contacted': 'info',
        'negotiating': 'warning',
        'converted': 'success',
        'lost': 'danger'
    };
    
    const statusLabels = {
        'new': 'Novo',
        'contacted': 'Contatado',
        'negotiating': 'Em Negociação',
        'converted': 'Convertido',
        'lost': 'Perdido'
    };
    
    container.innerHTML = leads.map(lead => {
        let vehicle = null;
        if (lead.vehicle) {
            try {
                vehicle = typeof lead.vehicle === 'string' ? JSON.parse(lead.vehicle) : lead.vehicle;
            } catch (e) {
                vehicle = null;
            }
        }
        const date = new Date(lead.created_at);
        const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        return `
            <div class="border-bottom pb-3 mb-3">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="fw-bold mb-1">${lead.name}</h6>
                        <p class="text-muted small mb-1">
                            ${lead.phone ? `<i class="bi bi-telephone me-1"></i>${lead.phone}` : ''}
                            ${lead.email ? `<i class="bi bi-envelope ms-2 me-1"></i>${lead.email}` : ''}
                        </p>
                        ${vehicle ? `<p class="text-muted small mb-1">Interesse: ${vehicle.brand} ${vehicle.model}</p>` : ''}
                        ${lead.message ? `<p class="text-muted small mb-0">${lead.message}</p>` : ''}
                    </div>
                    <div class="text-end">
                        <span class="badge bg-${statusColors[lead.status]} mb-2">${statusLabels[lead.status]}</span>
                        <p class="text-muted small mb-0">${formattedDate}</p>
                        <select class="form-select form-select-sm mt-2" onchange="updateLeadStatus('${lead.id}', this.value)">
                            <option value="new" ${lead.status === 'new' ? 'selected' : ''}>Novo</option>
                            <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contatado</option>
                            <option value="negotiating" ${lead.status === 'negotiating' ? 'selected' : ''}>Em Negociação</option>
                            <option value="converted" ${lead.status === 'converted' ? 'selected' : ''}>Convertido</option>
                            <option value="lost" ${lead.status === 'lost' ? 'selected' : ''}>Perdido</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function updateLeadStatus(leadId, status) {
    try {
        const response = await fetch(`${API_URL}/leads?id=${leadId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (data.success) {
            Toast.success('Status do lead atualizado com sucesso!');
            loadLeads();
        } else {
            Toast.error(data.error || 'Erro ao atualizar status');
        }
    } catch (error) {
        console.error('Error updating lead status:', error);
        Toast.error('Erro ao atualizar status. Tente novamente.');
    }
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
