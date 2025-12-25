# 📋 Documentação Front-End - Área do Cliente (Pós-Login)

## 📖 Visão Geral

Esta documentação descreve a interface e funcionalidades front-end da área restrita do sistema AutoStock, acessível após o login do cliente. Esta área permite que os usuários gerenciem seu estoque de veículos, acompanhem leads, visualizem relatórios e configurem suas lojas.

---

## 🔐 Sistema de Autenticação (Front-End)

### 1.1 Verificação de Autenticação

**Arquivo:** `assets/js/auth.js`

Todas as páginas da área do cliente verificam autenticação ao carregar:

```javascript
// assets/js/auth.js
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
```

**Uso nas páginas:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return; // Redireciona para login se não autenticado
    
    // ... resto do código da página
});
```

### 1.2 Obtenção do Token de Autenticação

Função auxiliar usada em todas as requisições:

```javascript
function getAuthToken() {
    return localStorage.getItem('token');
}
```

**Uso em requisições:**
```javascript
const response = await fetch(`${API_URL}/endpoint`, {
    headers: {
        'Authorization': `Bearer ${getAuthToken()}`
    }
});
```

### 1.3 Logout

**Função:** `logout()` em `assets/js/auth.js`

```javascript
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
```

**Chamada no HTML:**
```html
<a href="#" onclick="logout()">
    <i class="bi bi-box-arrow-right me-1"></i>Sair
</a>
```

---

## 🎛️ Estrutura da Interface

### 2.1 Layout Principal

Todas as páginas da área do cliente seguem o mesmo layout padrão:

```
┌─────────────────────────────────────────┐
│          Navbar (Topo fixo)             │
│  [Logo AutoStock]           [Sair]      │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │      Conteúdo Principal      │
│          │                              │
│ • Dashboard                              │
│ • Veículos                               │
│ • Novo Veículo                           │
│ • Leads                                  │
│ • Relatórios                             │
│ • Configurações                          │
│          │                              │
└──────────┴──────────────────────────────┘
```

**Componentes Comuns:**

**Navbar (`<nav class="navbar">`):**
- Fixa no topo da página
- Contém logo AutoStock (ícone + texto)
- Botão "Sair" no canto direito
- Bootstrap navbar com collapse em mobile

**Sidebar (`<nav class="sidebar">`):**
- Menu lateral fixo
- Links de navegação com ícones Bootstrap Icons
- Classe `active` indica página atual
- Responsivo: colapsa em telas pequenas

**Main Content (`<main>`):**
- Área de conteúdo principal
- Varia conforme a página acessada
- Padding e espaçamento consistentes

### 2.2 Estrutura HTML Padrão

Todas as páginas seguem esta estrutura:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <!-- Meta tags, Bootstrap CSS, Bootstrap Icons, Custom CSS -->
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <!-- Logo e botão Sair -->
    </nav>

    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <nav class="col-md-3 col-lg-2 sidebar p-3">
                <!-- Menu de navegação -->
            </nav>

            <!-- Main Content -->
            <main class="col-md-9 col-lg-10 ms-sm-auto px-md-4 py-4">
                <!-- Conteúdo específico da página -->
            </main>
        </div>
    </div>

    <!-- Scripts: Bootstrap JS, config.js, auth.js, [script da página] -->
</body>
</html>
```

### 2.3 Páginas Disponíveis

1. **dashboard.html** - Visão geral do sistema
2. **veiculos.html** - Listagem de veículos
3. **veiculos-novo.html** - Cadastro de novo veículo
4. **leads.html** - Gerenciamento de leads
5. **relatorios.html** - Relatórios e estatísticas
6. **configuracoes.html** - Configurações da loja

### 2.4 Navegação (Sidebar)

**HTML do Menu:**
```html
<nav class="col-md-3 col-lg-2 sidebar p-3">
    <ul class="nav flex-column">
        <li class="nav-item">
            <a class="nav-link active" href="dashboard.html">
                <i class="bi bi-speedometer2 me-2"></i>Dashboard
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="veiculos.html">
                <i class="bi bi-car-front me-2"></i>Veículos
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="veiculos-novo.html">
                <i class="bi bi-plus-circle me-2"></i>Novo Veículo
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="leads.html">
                <i class="bi bi-people me-2"></i>Leads
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="relatorios.html">
                <i class="bi bi-bar-chart me-2"></i>Relatórios
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="configuracoes.html">
                <i class="bi bi-gear me-2"></i>Configurações
            </a>
        </li>
    </ul>
</nav>
```

**Ícones Utilizados:**
- Dashboard: `bi-speedometer2`
- Veículos: `bi-car-front`
- Novo Veículo: `bi-plus-circle`
- Leads: `bi-people`
- Relatórios: `bi-bar-chart`
- Configurações: `bi-gear`

---

## 📊 Dashboard

**Arquivo:** `dashboard.html`  
**Script:** `assets/js/dashboard.js`

### 3.1 Estrutura HTML

O dashboard possui três seções principais:

#### 3.1.1 Cards de Estatísticas

Quatro cards exibindo métricas principais:

```html
<div class="row g-4 mb-4">
    <!-- Card 1: Total de Veículos -->
    <div class="col-md-6 col-lg-3">
        <div class="card stats-card border-0 shadow-sm">
            <div class="card-body">
                <p class="text-muted small mb-1">Total de Veículos</p>
                <h3 class="fw-bold mb-0" id="totalVehicles">0</h3>
            </div>
        </div>
    </div>
    
    <!-- Card 2: Veículos Disponíveis -->
    <div class="col-md-6 col-lg-3">
        <div class="card stats-card border-0 shadow-sm">
            <div class="card-body">
                <p class="text-muted small mb-1">Veículos Disponíveis</p>
                <h3 class="fw-bold mb-0" id="availableVehicles">0</h3>
            </div>
        </div>
    </div>
    
    <!-- Card 3: Visualizações (30d) -->
    <div class="col-md-6 col-lg-3">
        <div class="card stats-card border-0 shadow-sm">
            <div class="card-body">
                <p class="text-muted small mb-1">Visualizações (30d)</p>
                <h3 class="fw-bold mb-0" id="totalViews">0</h3>
            </div>
        </div>
    </div>
    
    <!-- Card 4: Leads (30d) -->
    <div class="col-md-6 col-lg-3">
        <div class="card stats-card border-0 shadow-sm">
            <div class="card-body">
                <p class="text-muted small mb-1">Leads (30d)</p>
                <h3 class="fw-bold mb-0" id="totalLeads">0</h3>
            </div>
        </div>
    </div>
</div>
```

**IDs dos elementos:**
- `#totalVehicles` - Total de veículos cadastrados
- `#availableVehicles` - Veículos com status 'available'
- `#totalViews` - Visualizações nos últimos 30 dias
- `#totalLeads` - Leads recebidos nos últimos 30 dias

#### 3.1.2 Seção de Veículos Recentes

```html
<div class="col-lg-8">
    <div class="card border-0 shadow-sm">
        <div class="card-header bg-white border-bottom">
            <h5 class="mb-0 fw-bold">Veículos Recentes</h5>
        </div>
        <div class="card-body">
            <div id="recentVehicles" class="list-group list-group-flush">
                <p class="text-muted text-center py-4">Carregando...</p>
            </div>
        </div>
    </div>
</div>
```

**ID:** `#recentVehicles` - Container onde os veículos são inseridos dinamicamente

#### 3.1.3 Seção de Leads Recentes

```html
<div class="col-lg-4">
    <div class="card border-0 shadow-sm">
        <div class="card-header bg-white border-bottom">
            <h5 class="mb-0 fw-bold">Leads Recentes</h5>
        </div>
        <div class="card-body">
            <div id="recentLeads" class="list-group list-group-flush">
                <p class="text-muted text-center py-4">Carregando...</p>
            </div>
        </div>
    </div>
</div>
```

**ID:** `#recentLeads` - Container onde os leads são inseridos dinamicamente

### 3.2 JavaScript (assets/js/dashboard.js)

#### 3.2.1 Carregamento Inicial

```javascript
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadDashboardStats();
    loadRecentVehicles();
    loadRecentLeads();
});
```

#### 3.2.2 Funções Principais

**loadDashboardStats()** - Carrega estatísticas gerais:
- Atualiza os 4 cards de métricas
- Faz requisição para `${API_URL}/dashboard?action=stats`

**loadRecentVehicles()** - Carrega veículos recentes:
- Lista os 5 veículos mais recentes
- Exibe marca, modelo, ano, preço e status
- Faz requisição para `${API_URL}/vehicles?limit=5`

**loadRecentLeads()** - Carrega leads recentes:
- Lista os 4 leads mais recentes
- Exibe nome, contato e status
- Faz requisição para `${API_URL}/leads?limit=4`

#### 3.2.3 Funções Auxiliares

```javascript
// Formata preço em Real (R$)
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

// Retorna classe Bootstrap de cor baseada no status do veículo
function getStatusColor(status) {
    const colors = {
        'available': 'success',
        'reserved': 'warning',
        'sold': 'secondary'
    };
    return colors[status] || 'secondary';
}

// Retorna classe Bootstrap de cor baseada no status do lead
function getLeadStatusColor(status) {
    const colors = {
        'new': 'primary',
        'contacted': 'info',
        'negotiating': 'warning',
        'converted': 'success',
        'lost': 'danger'
    };
    return colors[status] || 'secondary';
}
```

---

## 🚗 Módulo de Veículos

### 4.1 Listagem de Veículos

**Arquivo:** `veiculos.html`  
**Script:** `assets/js/vehicles.js`

#### 4.1.1 Estrutura HTML

```html
<!-- Filtros -->
<div class="row mb-4">
    <div class="col-md-6">
        <input type="text" class="form-control" id="searchInput" placeholder="Buscar por marca ou modelo...">
    </div>
    <div class="col-md-4">
        <select class="form-select" id="statusFilter">
            <option value="all">Todos os status</option>
            <option value="available">Disponível</option>
            <option value="reserved">Reservado</option>
            <option value="sold">Vendido</option>
        </select>
    </div>
</div>

<!-- Tabela -->
<table class="table">
    <thead>
        <tr>
            <th>Foto</th>
            <th>Veículo</th>
            <th>Ano</th>
            <th>Preço</th>
            <th>Status</th>
            <th>Ações</th>
        </tr>
    </thead>
    <tbody id="vehiclesTableBody">
        <!-- Veículos inseridos dinamicamente -->
    </tbody>
</table>
```

**IDs importantes:**
- `#searchInput` - Campo de busca
- `#statusFilter` - Filtro por status
- `#vehiclesTableBody` - Corpo da tabela onde veículos são inseridos

#### 4.1.2 JavaScript

**Carregamento inicial:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadVehicles();
    
    // Filtros com debounce
    document.getElementById('searchInput').addEventListener('input', debounce(loadVehicles, 500));
    document.getElementById('statusFilter').addEventListener('change', loadVehicles);
});
```

**Função loadVehicles():**
- Busca veículos com filtros aplicados
- Renderiza resultados na tabela
- Exibe spinner durante carregamento
- Trata erros e estados vazios

**Função displayVehicles(vehicles):**
- Recebe array de veículos
- Gera HTML da tabela dinamicamente
- Inclui foto, informações, status e botões de ação

### 4.2 Cadastro de Veículo

**Arquivo:** `veiculos-novo.html`  
**Script:** `assets/js/new-vehicle.js`

#### 4.2.1 Estrutura HTML

Formulário com os seguintes campos:

**Campos Obrigatórios:**
- Marca (brand)
- Modelo (model)
- Ano (year)
- Quilometragem (mileage)
- Preço (price)
- Tipo de carroceria (body_type)

**Campos Opcionais:**
- Cor (color)
- Combustível (fuel_type)
- Transmissão (transmission)
- Descrição (description)

**Upload de Imagens:**
```html
<input type="file" id="imagesInput" multiple accept="image/*">
<div id="imagesPreview" class="row g-2 mt-2">
    <!-- Preview das imagens selecionadas -->
</div>
```

**Funcionalidades Extras:**
- Features (características) - lista dinâmica
- Preview de imagens antes do upload
- Validação de formulário

#### 4.2.2 JavaScript

**Variáveis globais:**
```javascript
let features = [];  // Array de características
let images = [];    // Array de imagens (base64)
```

**Funções principais:**

**handleImageUpload(e):**
- Processa seleção de imagens
- Converte para base64
- Adiciona ao array `images`
- Atualiza preview

**updateImagesPreview():**
- Renderiza preview das imagens selecionadas
- Permite remover imagens antes de enviar

**addFeature():**
- Adiciona característica à lista
- Evita duplicatas

**saveVehicle(e):**
- Valida formulário
- Prepara dados (inclui imagens em base64)
- Envia requisição POST para API
- Redireciona para lista após sucesso

### 4.3 Edição de Veículo

**Arquivo:** `veiculo-editar.html` (ou integrado)  
**Script:** `assets/js/edit-vehicle.js`

**Funcionalidades:**
- Carrega dados do veículo existente
- Preenche formulário com dados atuais
- Permite alteração de campos
- Atualiza imagens (adicionar/remover)
- Envia atualização via PUT

---

## 👥 Módulo de Leads

**Arquivo:** `leads.html`  
**Script:** `assets/js/leads.js`

### 5.1 Estrutura HTML

```html
<!-- Filtros -->
<div class="row mb-4">
    <div class="col-md-6">
        <input type="text" class="form-control" id="searchInput" placeholder="Buscar por nome, telefone ou email...">
    </div>
    <div class="col-md-4">
        <select class="form-select" id="statusFilter">
            <option value="all">Todos os status</option>
            <option value="new">Novo</option>
            <option value="contacted">Contatado</option>
            <option value="negotiating">Em Negociação</option>
            <option value="converted">Convertido</option>
            <option value="lost">Perdido</option>
        </select>
    </div>
</div>

<!-- Lista de Leads -->
<div id="leadsList">
    <!-- Leads inseridos dinamicamente -->
</div>
```

**IDs importantes:**
- `#searchInput` - Campo de busca
- `#statusFilter` - Filtro por status
- `#leadsList` - Container onde leads são inseridos

### 5.2 Status de Leads

- **new** - Novo (não contactado) - badge `primary`
- **contacted** - Contactado - badge `info`
- **negotiating** - Em negociação - badge `warning`
- **converted** - Convertido (venda realizada) - badge `success`
- **lost** - Perdido - badge `danger`

### 5.3 JavaScript

**Função loadLeads():**
- Busca leads com filtros aplicados
- Renderiza lista de leads
- Exibe informações: nome, contato, veículo de interesse, mensagem, status, data

**Função displayLeads(leads):**
- Gera HTML dos cards de leads
- Inclui botão para atualizar status
- Formata datas em pt-BR

**Função updateLeadStatus(leadId, newStatus):**
- Atualiza status do lead via PUT
- Recarrega lista após atualização

---

## 📈 Módulo de Relatórios

**Arquivo:** `relatorios.html`  
**Script:** `assets/js/reports.js`

### 6.1 Estrutura HTML

**Cards de Métricas:**
```html
<div class="row g-4 mb-4">
    <div class="col-md-4">
        <div class="card">
            <div class="card-body">
                <p class="text-muted small mb-1">Visualizações (30d)</p>
                <h3 class="fw-bold mb-0" id="totalViews">0</h3>
                <small class="text-muted" id="viewsChange"></small>
            </div>
        </div>
    </div>
    <!-- Cards similares para Leads e Taxa de Conversão -->
</div>
```

**Seções:**
- Veículos Mais Visualizados (`#topVehicles`)
- Estatísticas Mensais (`#monthlyStats`)

### 6.2 JavaScript

**Função loadDashboardStats():**
- Carrega métricas gerais
- Calcula e exibe variações percentuais

**Função loadTopVehicles():**
- Lista veículos mais visualizados
- Exibe gráfico de barras horizontal
- Mostra views e leads por veículo

**Função loadMonthlyStats():**
- Carrega estatísticas mensais (últimos 3 meses)
- Exibe gráficos comparativos de views e leads
- Renderiza barras proporcionais

---

## ⚙️ Módulo de Configurações

**Arquivo:** `configuracoes.html`  
**Script:** `assets/js/settings.js`

### 7.1 Visão Geral

A página Configurações da Loja permite que o cliente personalize a aparência e as informações públicas da sua revenda, que serão exibidas na landing page.

**Localização no Menu:**
- Sidebar → "Configurações"
- Ícone: `bi-gear` (⚙️)
- Quando ativo: destaque visual com cor de fundo e borda esquerda

### 7.2 Layout Geral da Página

```
┌─────────────────────────────────────────────┐
│ Navbar fixa                                  │
├───────────────┬──────────────────────────────┤
│ Sidebar       │  Cabeçalho da Página         │
│               │  ┌─────────────────────────┐ │
│               │  │ Card: Informações       │ │
│               │  └─────────────────────────┘ │
│               │  ┌─────────────────────────┐ │
│               │  │ Card: Identidade Visual │ │
│               │  └─────────────────────────┘ │
│               │  ┌─────────────────────────┐ │
│               │  │ Card: Contatos          │ │
│               │  └─────────────────────────┘ │
│               │  ┌─────────────────────────┐ │
│               │  │ Card: Notificações      │ │
│               │  └─────────────────────────┘ │
└───────────────┴──────────────────────────────┘
```

#### 7.2.1 Cabeçalho da Página

```html
<div class="mb-4">
    <h1 class="h3 fw-bold">⚙️ Configurações</h1>
    <p class="text-muted mb-0">Personalize como sua loja será exibida para seus clientes</p>
</div>
```

### 7.3 Estrutura HTML por Seções

Cada seção é apresentada em cards Bootstrap com:
- Título com ícone
- Descrição curta
- Formulário interno organizado
- Botão "Salvar alterações" no rodapé

#### 7.3.1 Card: Informações da Loja

**Objetivo:** Definir os dados que aparecem no cabeçalho da landing page.

```html
<div class="card mb-4">
    <div class="card-header bg-white">
        <h5 class="fw-bold mb-0">🏪 Informações da Loja</h5>
        <small class="text-muted">Dados que aparecem no seu catálogo público</small>
    </div>
    <div class="card-body">
        <div class="row g-3">
            <!-- Nome da Loja -->
            <div class="col-md-6">
                <label for="storeName" class="form-label">Nome da Loja <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="storeName" 
                       placeholder="Ex: Auto Prime Veículos" required>
                <small class="text-muted">Nome que aparecerá no cabeçalho da sua loja</small>
            </div>
            
            <!-- URL do Catálogo -->
            <div class="col-md-6">
                <label for="slug" class="form-label">URL do Catálogo <span class="text-danger">*</span></label>
                <div class="input-group">
                    <span class="input-group-text bg-light">autostock.com.br/</span>
                    <input type="text" class="form-control" id="slug" 
                           placeholder="sua-loja" required 
                           pattern="[a-z0-9-]+">
                </div>
                <small class="text-muted">URL única para seu catálogo público</small>
                <div class="mt-2">
                    <a href="#" id="viewCatalogLink" target="_blank" class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-box-arrow-up-right me-1"></i>Ver Catálogo Público
                    </a>
                </div>
            </div>
            
            <!-- Descrição -->
            <div class="col-12">
                <label for="description" class="form-label">Descrição da Loja</label>
                <textarea class="form-control" id="description" rows="3" 
                          placeholder="Conte um pouco sobre sua loja, tempo de mercado, diferenciais..."></textarea>
                <small class="text-muted">Texto que aparecerá na página inicial do catálogo</small>
            </div>
            
            <!-- Localização -->
            <div class="col-md-8">
                <label for="city" class="form-label">Cidade</label>
                <input type="text" class="form-control" id="city" placeholder="São Paulo">
            </div>
            <div class="col-md-4">
                <label for="state" class="form-label">Estado</label>
                <input type="text" class="form-control" id="state" maxlength="2" 
                       placeholder="SP">
            </div>
            
            <!-- Endereço -->
            <div class="col-12">
                <label for="address" class="form-label">Endereço Completo</label>
                <input type="text" class="form-control" id="address" 
                       placeholder="Rua Exemplo, 123 - Centro">
            </div>
        </div>
    </div>
    <div class="card-footer bg-white">
        <button type="submit" class="btn btn-primary">
            <i class="bi bi-save me-2"></i>Salvar alterações
        </button>
    </div>
</div>
```

**IDs importantes:**
- `#storeName` - Nome da loja
- `#slug` - URL do catálogo
- `#description` - Descrição da loja
- `#city`, `#state`, `#address` - Localização
- `#viewCatalogLink` - Link para visualizar catálogo público

#### 7.3.2 Card: Identidade Visual

**Objetivo:** Personalização da marca da loja.

```html
<div class="card mb-4">
    <div class="card-header bg-white">
        <h5 class="fw-bold mb-0">🎨 Identidade Visual</h5>
        <small class="text-muted">Personalize como sua marca aparece</small>
    </div>
    <div class="card-body">
        <!-- Upload de Logo -->
        <div class="mb-4">
            <label for="logo" class="form-label">Logo da Loja</label>
            <div class="d-flex align-items-center gap-4">
                <!-- Preview do Logo -->
                <div id="logoPreview" class="border rounded p-2 bg-light" 
                     style="width: 220px; height: 66px; display: none; 
                            align-items: center; justify-content: center;">
                    <img id="logoPreviewImg" src="" alt="Logo Preview" 
                         class="logo-preview" 
                         style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                
                <!-- Botões de Ação -->
                <div class="d-flex flex-column gap-2">
                    <input type="file" class="form-control" id="logo" 
                           accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg" 
                           style="display: none;">
                    <button type="button" class="btn btn-outline-primary" 
                            onclick="document.getElementById('logo').click()">
                        <i class="bi bi-upload me-2"></i>Enviar Logo
                    </button>
                    <button type="button" class="btn btn-outline-danger" 
                            id="removeLogoBtn" onclick="removeLogo()" style="display: none;">
                        <i class="bi bi-trash me-2"></i>Remover Logo
                    </button>
                </div>
            </div>
            
            <!-- Mensagens de Ajuda e Erro -->
            <small class="text-muted d-block mt-2">
                <strong>Formato:</strong> SVG (preferencial), PNG ou JPG/JPEG<br>
                <strong>Resolução recomendada:</strong> 1000 × 300 px (proporção ~3.3:1)<br>
                <strong>Resolução mínima:</strong> 500 × 150 px<br>
                <strong>Tamanho máximo:</strong> 2MB. A imagem será redimensionada automaticamente.
            </small>
            <div id="logoError" class="alert alert-danger d-none mt-2" role="alert"></div>
        </div>
    </div>
    <div class="card-footer bg-white">
        <button type="submit" class="btn btn-primary">
            <i class="bi bi-save me-2"></i>Salvar alterações
        </button>
    </div>
</div>
```

**Especificações do Logo:**
- Preview com dimensões: 220px × 66px (desktop) / 150px × 45px (mobile)
- Validação automática de formato e dimensões
- Redimensionamento automático para 1000 × 300px
- Mantém proporção original (letterbox com fundo transparente)

**IDs importantes:**
- `#logo` - Input file (oculto)
- `#logoPreview` - Container do preview
- `#logoPreviewImg` - Imagem do preview
- `#removeLogoBtn` - Botão remover logo
- `#logoError` - Mensagem de erro

#### 7.3.3 Card: Contatos e Atendimento

**Objetivo:** Definir como o cliente entrará em contato.

**IMPORTANTE:** O WhatsApp exibido na landing é o mesmo cadastrado aqui.

```html
<div class="card mb-4">
    <div class="card-header bg-white">
        <h5 class="fw-bold mb-0">📞 Contatos e Atendimento</h5>
        <small class="text-muted">Como os clientes falam com você</small>
    </div>
    <div class="card-body">
        <div class="row g-3">
            <!-- Telefone -->
            <div class="col-md-6">
                <label for="phone" class="form-label">Telefone Principal</label>
                <input type="tel" class="form-control" id="phone" 
                       placeholder="(11) 3333-3333">
                <small class="text-muted">Telefone fixo da loja</small>
            </div>
            
            <!-- WhatsApp -->
            <div class="col-md-6">
                <label for="whatsapp" class="form-label">WhatsApp <span class="text-danger">*</span></label>
                <input type="tel" class="form-control" id="whatsapp" 
                       placeholder="(11) 99999-9999" required>
                <small class="text-muted">Este número aparecerá no botão de contato da landing</small>
            </div>
            
            <!-- Email -->
            <div class="col-md-6">
                <label for="email" class="form-label">E-mail Comercial</label>
                <input type="email" class="form-control" id="email" 
                       placeholder="contato@sualoja.com.br">
                <small class="text-muted">E-mail para contato comercial</small>
            </div>
            
            <!-- Preview do Botão WhatsApp -->
            <div class="col-12">
                <label class="form-label">Preview do Botão WhatsApp</label>
                <div class="border rounded p-3 bg-light">
                    <a href="https://wa.me/5544988611075" 
                       class="btn btn-success" 
                       id="whatsappPreviewBtn"
                       target="_blank">
                        <i class="bi bi-whatsapp me-2"></i>Falar no WhatsApp
                    </a>
                    <small class="text-muted d-block mt-2">
                        Assim o botão aparecerá na landing page dos seus clientes
                    </small>
                </div>
            </div>
        </div>
    </div>
    <div class="card-footer bg-white">
        <button type="submit" class="btn btn-primary">
            <i class="bi bi-save me-2"></i>Salvar alterações
        </button>
    </div>
</div>
```

**IDs importantes:**
- `#phone` - Telefone principal
- `#whatsapp` - WhatsApp (usado na landing)
- `#email` - E-mail comercial
- `#whatsappPreviewBtn` - Preview do botão WhatsApp

#### 7.3.4 Card: Notificações

**Objetivo:** Configurar preferências de notificações por e-mail.

```html
<div class="card mb-4">
    <div class="card-header bg-white">
        <h5 class="fw-bold mb-0">🔔 Notificações</h5>
        <small class="text-muted">Configure como você recebe alertas</small>
    </div>
    <div class="card-body">
        <!-- Novos leads por e-mail -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <p class="fw-medium mb-0">Novos leads por e-mail</p>
                <small class="text-muted">Receba um e-mail quando alguém entrar em contato</small>
            </div>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="newLeadEmail" checked>
            </div>
        </div>
        
        <!-- Relatório semanal -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <p class="fw-medium mb-0">Relatório semanal</p>
                <small class="text-muted">Resumo semanal de views e leads</small>
            </div>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="weeklyReport" checked>
            </div>
        </div>
        
        <!-- Novidades do AutoStock -->
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <p class="fw-medium mb-0">Novidades do AutoStock</p>
                <small class="text-muted">Atualizações e novos recursos da plataforma</small>
            </div>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="platformUpdates">
            </div>
        </div>
    </div>
    <div class="card-footer bg-white">
        <button type="submit" class="btn btn-primary">
            <i class="bi bi-save me-2"></i>Salvar alterações
        </button>
    </div>
</div>
```

**IDs importantes:**
- `#newLeadEmail` - Notificação de novos leads
- `#weeklyReport` - Relatório semanal
- `#platformUpdates` - Novidades da plataforma

### 7.4 Formulário Principal

Todas as seções estão dentro de um formulário único:

```html
<form id="settingsForm">
    <!-- Card: Informações da Loja -->
    <!-- Card: Identidade Visual -->
    <!-- Card: Contatos e Atendimento -->
    <!-- Card: Notificações -->
</form>
```

**ID:** `#settingsForm` - Formulário principal que engloba todas as seções

### 7.2 JavaScript

#### 7.2.1 Carregamento Inicial

```javascript
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadStoreSettings();
    loadNotificationSettings();
    
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);
    
    // Atualiza link do catálogo quando slug muda
    document.getElementById('slug').addEventListener('input', function() {
        updateCatalogLink(this.value);
    });
    
    // Handler de upload de logo
    document.getElementById('logo').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleLogoUpload(file, this);
        }
    });
});
```

#### 7.2.2 Funções Principais

**loadStoreSettings():**
- Carrega dados da loja
- Preenche formulário
- Exibe logo se existir
- Atualiza link do catálogo

**loadNotificationSettings():**
- Carrega preferências de notificações
- Atualiza toggles/checkboxes

**saveSettings(e):**
- Valida e prepara dados
- Processa logo (se houver novo upload)
- Envia atualizações (loja + notificações)
- Exibe mensagem de sucesso

#### 7.2.3 Upload de Logo

**Validações implementadas:**
- Formato: SVG, PNG, JPG/JPEG
- Tamanho máximo: 2MB
- Resolução mínima: 500x150px
- Proporção: horizontal (largura > altura)

**Processamento:**
- SVG: mantém arquivo original
- PNG/JPG: redimensiona automaticamente para 1000x300px
- Mantém proporção original (letterbox com fundo transparente)
- Converte para PNG com compressão sem perda

**Funções relacionadas:**
- `handleLogoUpload(file, inputElement)` - Processa upload
- `validateLogoFormat(file)` - Valida formato e tamanho
- `validateLogoDimensions(width, height)` - Valida dimensões
- `resizeImageToStandard(image, width, height)` - Redimensiona imagem
- `showLogoPreview(url)` - Exibe preview
- `removeLogo()` - Remove logo
- `showLogoError(message)` / `hideLogoError()` - Gerencia erros

### 7.5 Feedback Visual

#### 7.5.1 Mensagens de Sucesso

Após salvar as configurações com sucesso, exibir feedback positivo:

```javascript
// Exemplo de feedback de sucesso
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        <i class="bi bi-check-circle-fill me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    // Inserir no topo do formulário
    document.getElementById('settingsForm').insertBefore(alertDiv, settingsForm.firstChild);
    
    // Auto-remover após 5 segundos
    setTimeout(() => alertDiv.remove(), 5000);
}
```

**Exemplo de uso:**
```javascript
if (storeResponse.ok && notificationResponse.ok) {
    showSuccessMessage('Alterações salvas com sucesso!');
}
```

#### 7.5.2 Mensagens de Erro

Exibir erros de forma amigável, destacando campos com problema:

```html
<!-- Exemplo de mensagem de erro -->
<div class="alert alert-danger alert-dismissible fade show" role="alert">
    <i class="bi bi-exclamation-triangle-fill me-2"></i>
    Verifique os campos destacados
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
```

**Para campos inválidos:**
```javascript
// Adicionar classe de erro ao campo
inputElement.classList.add('is-invalid');

// Exibir mensagem de erro abaixo do campo
const feedbackDiv = document.createElement('div');
feedbackDiv.className = 'invalid-feedback';
feedbackDiv.textContent = 'Mensagem de erro específica';
inputElement.parentElement.appendChild(feedbackDiv);
```

#### 7.5.3 Validação em Tempo Real

**Atualização do link do catálogo:**
```javascript
document.getElementById('slug').addEventListener('input', function() {
    const slug = this.value;
    updateCatalogLink(slug);
    
    // Validação visual do slug
    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
        this.classList.add('is-invalid');
    } else {
        this.classList.remove('is-invalid');
    }
});
```

**Preview do WhatsApp:**
```javascript
document.getElementById('whatsapp').addEventListener('input', function() {
    const whatsapp = this.value.replace(/\D/g, ''); // Remove não-numéricos
    const previewBtn = document.getElementById('whatsappPreviewBtn');
    if (whatsapp) {
        previewBtn.href = `https://wa.me/55${whatsapp}`;
    }
});
```

### 7.6 Responsividade

#### 7.6.1 Breakpoints

A página utiliza breakpoints do Bootstrap 5:

- **Mobile (< 768px):**
  - Cards ocupam 100% da largura
  - Labels ficam acima dos campos (padrão Bootstrap)
  - Botões ficam em largura total (`w-100`)
  - Sidebar colapsa em menu hambúrguer
  - Preview do logo: 150px × 45px

- **Tablet (768px - 991px):**
  - Grid de 2 colunas para campos
  - Sidebar reduzida mas visível

- **Desktop (≥ 992px):**
  - Grid de 3 colunas quando apropriado
  - Sidebar completa
  - Preview do logo: 220px × 66px

#### 7.6.2 Classes Responsivas Utilizadas

```html
<!-- Exemplo de grid responsivo -->
<div class="row g-3">
    <!-- Mobile: 1 coluna, Tablet+: 2 colunas -->
    <div class="col-12 col-md-6">
        <label>Campo 1</label>
        <input type="text" class="form-control">
    </div>
    
    <!-- Mobile: 1 coluna, Tablet+: 2 colunas -->
    <div class="col-12 col-md-6">
        <label>Campo 2</label>
        <input type="text" class="form-control">
    </div>
</div>
```

#### 7.6.3 Ajustes Específicos Mobile

**Botões:**
```html
<!-- Mobile: botão em largura total -->
<button type="submit" class="btn btn-primary w-100 w-md-auto">
    <i class="bi bi-save me-2"></i>Salvar alterações
</button>
```

**Preview do Logo:**
```css
/* Mobile */
@media (max-width: 768px) {
    #logoPreview {
        width: 150px !important;
        height: 45px !important;
    }
}
```

**Formulário:**
- Campos de texto ficam em largura total no mobile
- Input groups (com prefixo/sufixo) mantêm estrutura mas se adaptam
- Textareas se expandem para largura total

### 7.7 Objetivo de Design

A tela de configurações deve transmitir:

✅ **Clareza** - Informações organizadas e fáceis de entender  
✅ **Organização** - Blocos bem definidos e separados visualmente  
✅ **Modernidade** - Design limpo e profissional  
✅ **Intuitividade** - Ações óbvias e feedback imediato  
✅ **Confiabilidade** - Validações claras e mensagens amigáveis

**Princípios visuais:**
- Espaçamento generoso entre seções
- Tipografia hierárquica clara
- Cores utilizadas apenas para feedback (sucesso/erro)
- Ícones que reforçam o significado dos elementos
- Preview de elementos importantes (logo, botão WhatsApp)

---

## 🔧 Estrutura de Arquivos Front-End

### 8.1 HTML (Páginas)

```
/
├── dashboard.html              # Dashboard principal
├── veiculos.html              # Listagem de veículos
├── veiculos-novo.html         # Cadastro de veículo
├── leads.html                 # Gerenciamento de leads
├── relatorios.html            # Relatórios e estatísticas
└── configuracoes.html         # Configurações da loja
```

### 8.2 JavaScript

```
assets/js/
├── auth.js            # Autenticação (checkAuth, logout, getAuthToken)
├── config.js          # Configuração da API_URL
├── dashboard.js       # Dashboard e estatísticas
├── vehicles.js        # Listagem de veículos
├── new-vehicle.js     # Cadastro de veículo
├── edit-vehicle.js    # Edição de veículo
├── leads.js           # Gerenciamento de leads
├── reports.js         # Relatórios
├── settings.js        # Configurações
└── toast.js           # Notificações toast (opcional)
```

### 8.3 CSS

```
assets/css/
└── style.css          # Estilos customizados
```

**Classes CSS utilizadas:**
- `.sidebar` - Estilos da sidebar
- `.stats-card` - Cards de estatísticas
- `.card-custom` - Cards customizados
- `.logo-preview` - Preview de logo

---

## 📱 Padrões e Boas Práticas

### 9.1 Padrão de Requisições

Todas as requisições seguem este padrão:

```javascript
async function fazerRequisicao() {
    try {
        const response = await fetch(`${API_URL}/endpoint`, {
            method: 'GET', // ou POST, PUT, DELETE
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json' // quando necessário
            },
            body: JSON.stringify(dados) // quando necessário
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            // Processar dados
        } else {
            // Tratar erro
        }
    } catch (error) {
        console.error('Erro:', error);
        // Exibir mensagem de erro ao usuário
    }
}
```

### 9.2 Tratamento de Erros

**Padrão comum:**
```javascript
if (data.success) {
    // Sucesso
} else {
    // Erro da API
    alert(data.error || 'Erro desconhecido');
}
```

**Tratamento de exceções:**
```javascript
try {
    // Código que pode gerar erro
} catch (error) {
    console.error('Erro:', error);
    // Exibir mensagem amigável ao usuário
}
```

### 9.3 Estados de Carregamento

**Padrão:**
```javascript
// Antes da requisição
container.innerHTML = '<div class="spinner-border"></div>';

// Após sucesso
container.innerHTML = dadosRenderizados;

// Após erro
container.innerHTML = '<p class="text-muted">Erro ao carregar</p>';

// Estado vazio
container.innerHTML = '<p class="text-muted">Nenhum item encontrado</p>';
```

### 9.4 Formatação de Dados

**Preços:**
```javascript
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}
```

**Datas:**
```javascript
const date = new Date(dataString);
const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});
```

### 9.5 Debounce para Busca

```javascript
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

// Uso
document.getElementById('searchInput').addEventListener('input', debounce(loadVehicles, 500));
```

---

## 🐛 Tratamento de Erros Comuns

### 10.1 Erro de Autenticação

**Sintoma:** Redirecionamento automático para login

**Causa:** Token inválido ou expirado

**Solução:** Fazer logout e login novamente

### 10.2 Erro 404

**Sintoma:** "Recurso não encontrado"

**Causa:** ID incorreto ou recurso não pertence ao usuário

**Verificar:** Console do navegador para detalhes

### 10.3 Erro ao Carregar Dados

**Sintoma:** Mensagem "Erro ao carregar"

**Causas possíveis:**
- API offline
- Erro de rede
- Token expirado

**Verificar:** Console do navegador (F12)

### 10.4 Validação de Formulário

**Padrão:**
```javascript
if (!campo.value.trim()) {
    alert('Campo obrigatório');
    campo.focus();
    return false;
}
```

---

## 📚 Referências

### 11.1 Bibliotecas Utilizadas

- **Bootstrap 5.3.2** - Framework CSS
- **Bootstrap Icons 1.11.1** - Ícones
- **JavaScript ES6+** - Linguagem

### 11.2 Variáveis Globais

- `API_URL` - Definida em `assets/js/config.js`
- `localStorage.getItem('token')` - Token de autenticação
- `localStorage.getItem('user')` - Dados do usuário

---

## 📅 Histórico de Versões

- **v1.0** - Documentação inicial focada apenas em front-end
- Inclui todos os módulos: Dashboard, Veículos, Leads, Relatórios e Configurações
- Documentação de estrutura HTML, JavaScript e interações do usuário

---

**Última atualização:** Janeiro 2024
