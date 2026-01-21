# 🏗️ Documentação: Estrutura de Front-End - loja.html

## 📋 Visão Geral

Este documento descreve detalhadamente toda a estrutura de front-end da página `loja.html`, que é o catálogo público de veículos de uma loja específica. A página é totalmente responsiva e utiliza Bootstrap 5, CSS customizado e JavaScript para funcionalidades dinâmicas.

**Arquivo:** `loja.html`  
**Tipo:** Catálogo público de veículos  
**Framework:** Bootstrap 5.3.2  
**Dependências:** Bootstrap Icons, CSS Customizado, JavaScript Customizado

---

## 📐 Estrutura Geral

```
loja.html
├── <head>
│   ├── Meta tags
│   ├── Bootstrap 5 CSS
│   ├── Bootstrap Icons
│   ├── CSS Customizado (style.css)
│   └── Estilos inline (REQ-FR-LP-001)
├── <body>
│   ├── Header (Navegação + Logo)
│   ├── Barra de Busca
│   ├── Conteúdo Principal
│   │   ├── Sidebar de Filtros
│   │   └── Área de Resultados
│   ├── Seção Sobre
│   ├── Footer
│   └── Scripts
│       ├── Bootstrap 5 JS
│       ├── config.js
│       ├── mobile.js
│       ├── loja.js
│       └── Scripts inline
```

---

## 🎨 1. HEAD - Configurações e Estilos

### 1.1 Meta Tags e Título

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Catálogo - Estocx</title>
```

### 1.2 Bibliotecas Externas

```html
<!-- Bootstrap 5 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Bootstrap Icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">

<!-- CSS Customizado -->
<link rel="stylesheet" href="assets/css/style.css">
```

### 1.3 Estilos Inline (REQ-FR-LP-001)

Os estilos inline estão organizados nas seguintes seções:

#### 1.3.1 Body e Tipografia Base
- Font-family: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- Background: `#f5f5f5`
- Cor do texto: `#333`

#### 1.3.2 Header (REQ-FR-LP-001 4.1)
```css
.main-header {
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    position: sticky;
    top: 0;
    z-index: 1000;
    padding: 0.25rem 0;
}
```

**Componentes:**
- `.header-logo-wrapper` - Wrapper da logo
- `.header-logo` - Imagem da logo (max-height: 150px, max-width: 600px)
- `.header-nav` - Navegação do header
- `.header-whatsapp-btn` - Botão WhatsApp no header

#### 1.3.3 Barra de Busca (REQ-FR-LP-001 4.2)
```css
.search-bar-container {
    background: white;
    padding: 2rem 0;
    border-bottom: 1px solid #e0e0e0;
}

.search-input-large {
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
    border: 2px solid #e0e0e0;
    border-radius: 50px;
}
```

#### 1.3.4 Filtros Laterais (REQ-FR-LP-001 4.3)
```css
.filters-sidebar {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.filter-accordion-button {
    /* Botões de accordion dos filtros */
}

.filter-accordion-content {
    /* Conteúdo expansível dos filtros */
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}
```

#### 1.3.5 Cards de Veículos (REQ-FR-LP-001 4.5)
```css
.vehicle-card-modern {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
```

**Componentes do Card:**
- `.vehicle-card-image` - Container da imagem (height: 250px)
- `.vehicle-card-badge` - Badge de destaque
- `.vehicle-card-favorite` - Botão de favorito
- `.vehicle-card-body` - Corpo do card
- `.vehicle-card-title` - Título do veículo
- `.vehicle-card-info` - Informações do veículo
- `.vehicle-card-price` - Preço (font-size: 1.75rem, color: #1A73E8)
- `.vehicle-card-location` - Localização

#### 1.3.6 Comportamento do Cursor (REQ-FR-UI-002)
- Elementos clicáveis: `cursor: pointer`
- Elementos desabilitados: `cursor: not-allowed`
- Estados de carregamento: `cursor: wait`
- Elementos informativos: `cursor: default`
- Inputs de texto: `cursor: text`

#### 1.3.7 Responsividade

**Mobile/Tablet (≤ 991.98px):**
- Filtros laterais ocultos
- Logo reduzida (max-height: 100px, max-width: 400px)
- Cards de veículo com altura de imagem reduzida (200px)
- Navegação em coluna

**Desktop (≥ 992px):**
- Modal de filtros oculto
- Sidebar de filtros visível
- Layout completo

---

## 🏠 2. BODY - Estrutura HTML

### 2.1 Header (Linhas 425-446)

**Estrutura:**
```html
<header class="main-header">
    <div class="container">
        <div class="d-flex justify-content-between align-items-center">
            <!-- Logo -->
            <div class="header-logo-wrapper">
                <div class="header-logo-container">
                    <img id="storeLogoHeader" class="header-logo d-none">
                    <h1 id="storeNameHeaderFallback" class="d-none">Carregando...</h1>
                </div>
            </div>
            
            <!-- Navegação -->
            <div class="header-nav">
                <a href="#veiculos">Comprar carros</a>
                <a href="#sobre">Sobre a loja</a>
                <a href="#contato">Contato</a>
                <a id="headerWhatsAppBtn" class="header-whatsapp-btn d-none">
                    <i class="bi bi-whatsapp"></i>WhatsApp
                </a>
            </div>
        </div>
    </div>
</header>
```

**Funcionalidades:**
- Logo carregada dinamicamente via JavaScript
- Fallback para nome da loja quando não há logo
- Botão WhatsApp exibido condicionalmente
- Navegação com scroll suave para âncoras
- Header sticky (fixo no topo ao rolar)

**IDs e Classes:**
- `#storeLogoHeader` - Imagem da logo
- `#storeNameHeaderFallback` - Nome da loja (fallback)
- `#headerWhatsAppBtn` - Botão WhatsApp do header
- `.header-logo-wrapper` - Wrapper da logo
- `.header-nav` - Container de navegação

---

### 2.2 Barra de Busca (Linhas 448-460)

**Estrutura:**
```html
<div class="search-bar-container">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <input type="text" 
                       class="form-control search-input-large" 
                       id="searchInput" 
                       placeholder="Busque por marca, modelo ou ano">
            </div>
        </div>
    </div>
</div>
```

**Funcionalidades:**
- Busca em tempo real com debounce (300ms)
- Filtra veículos por marca, modelo ou ano
- Campo de busca grande e destacado

**IDs:**
- `#searchInput` - Campo de busca principal

---

### 2.3 Conteúdo Principal (Linhas 462-615)

#### 2.3.1 Sidebar de Filtros (Linhas 465-590)

**Estrutura:**
```html
<aside class="col-lg-3">
    <div class="filters-sidebar">
        <h5>Filtros</h5>
        
        <!-- Filtros em Accordion -->
        <!-- Preço, Marca, Modelo, Ano, Quilometragem, Tipo, Câmbio, Cor -->
    </div>
</aside>
```

**Filtros Disponíveis:**

| Filtro | ID | Tipo | Descrição |
|--------|-----|------|-----------|
| **Preço** | `#minPrice`, `#maxPrice` | Number | Range de preço |
| **Marca** | `#brandFilter` | Select | Dropdown de marcas |
| **Modelo** | `#modelFilter` | Select | Dropdown de modelos |
| **Ano** | `#minYear`, `#maxYear` | Number | Range de ano |
| **Quilometragem** | `#maxMileage` | Number | Máximo de km |
| **Tipo** | `#bodyTypeFilter` | Select | Sedan, Hatch, SUV, Pickup |
| **Câmbio** | `#transmissionFilter` | Select | Manual, Automático, CVT |
| **Cor** | `#colorFilter` | Text | Campo de texto livre |

**Funcionalidades:**
- Accordions expansíveis/colapsáveis
- Filtros aplicados em tempo real
- Debounce em inputs numéricos (300ms)
- Filtros laterais ocultos em mobile (display: none)

**JavaScript:**
- Função `toggleAccordion(button)` para expandir/colapsar
- Event listeners em todos os filtros
- Integração com `filterVehicles()`

---

#### 2.3.2 Área de Resultados (Linhas 592-613)

**Estrutura:**
```html
<div class="col-lg-9">
    <div class="results-header">
        <div class="results-count" id="resultsCount">Carregando veículos...</div>
        <select class="sort-select" id="sortSelect">
            <option value="relevance">Relevância</option>
            <option value="price_low">Menor preço</option>
            <option value="price_high">Maior preço</option>
            <option value="year_new">Mais novos</option>
        </select>
    </div>
    
    <div id="vehiclesGrid" class="row g-3">
        <!-- Cards de veículos gerados dinamicamente -->
    </div>
</div>
```

**Funcionalidades:**
- Contador de resultados dinâmico
- Ordenação de veículos (relevância, preço, ano)
- Grid responsivo de cards
- Loading spinner durante carregamento

**IDs:**
- `#resultsCount` - Contador de resultados
- `#sortSelect` - Select de ordenação
- `#vehiclesGrid` - Container do grid de veículos

**Ordenação:**
1. **Relevância** - Ordem padrão
2. **Menor preço** - Preço crescente
3. **Maior preço** - Preço decrescente
4. **Mais novos** - Ano decrescente

---

#### 2.3.3 Card de Veículo (Estrutura Dinâmica)

**Estrutura gerada via JavaScript:**
```html
<div class="col-md-6 col-lg-4">
    <div class="vehicle-card-modern" onclick="goToVehicleDetail(...)">
        <div class="vehicle-card-image">
            <img src="..." alt="...">
            <div class="vehicle-card-badge">Destaque</div>
            <button class="vehicle-card-favorite" onclick="toggleFavorite(...)">
                <i class="bi bi-heart"></i>
            </button>
        </div>
        <div class="vehicle-card-body">
            <h3 class="vehicle-card-title">Marca Modelo</h3>
            <div class="vehicle-card-info">
                <span>Ano</span>
                <span>Quilometragem</span>
                <span>Câmbio</span>
            </div>
            <div class="vehicle-card-price">R$ 0,00</div>
            <div class="vehicle-card-location">Cidade, Estado</div>
        </div>
    </div>
</div>
```

**Efeitos Visuais:**
- Hover: Elevação (`translateY(-4px)`) e sombra aumentada
- Zoom na imagem no hover (scale 1.05)
- Transições suaves (0.3s ease)
- Cursor pointer no card inteiro

---

### 2.4 Seção Sobre (Linhas 617-627)

**Estrutura:**
```html
<section class="py-5 bg-white mt-5" id="sobre">
    <div class="container">
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <h2 class="h3 fw-bold mb-4 text-center">Sobre a Loja</h2>
                <p class="text-muted text-center" id="storeAbout">
                    Carregando informações...
                </p>
            </div>
        </div>
    </div>
</section>
```

**Funcionalidades:**
- Descrição da loja carregada dinamicamente
- Seção centralizada e responsiva
- Texto mutável via JavaScript

**IDs:**
- `#storeAbout` - Texto descritivo da loja

---

### 2.5 Footer (Linhas 629-662)

**Estrutura:**
```html
<footer class="bg-dark text-white py-5 mt-5" id="contato">
    <div class="container">
        <div class="row g-4">
            <!-- Informações da Loja -->
            <div class="col-md-4">
                <h5 id="footerStoreName">Nome da Loja</h5>
                <p id="footerAddress">Endereço</p>
                <p id="footerPhone">Telefone</p>
                <p id="footerCityState">Cidade, Estado</p>
            </div>
            
            <!-- Links Rápidos -->
            <div class="col-md-4">
                <h5>Links Rápidos</h5>
                <ul class="list-unstyled">
                    <li><a href="#veiculos">Comprar carros</a></li>
                    <li><a href="#sobre">Sobre a loja</a></li>
                    <li><a href="#contato">Contato</a></li>
                </ul>
            </div>
            
            <!-- Contato -->
            <div class="col-md-4">
                <h5>Contato</h5>
                <a id="footerWhatsAppBtn" class="btn btn-success d-none">
                    <i class="bi bi-whatsapp"></i>Falar no WhatsApp
                </a>
            </div>
        </div>
        
        <!-- Copyright -->
        <hr class="my-4 bg-secondary">
        <div class="row">
            <div class="col-12 text-center">
                <p>&copy; 2024 <span id="footerCopyright">Nome da Loja</span>. Todos os direitos reservados.</p>
                <p>Powered by <strong>ESTOX</strong></p>
            </div>
        </div>
    </div>
</footer>
```

**IDs:**
- `#footerStoreName` - Nome da loja
- `#footerAddress` - Endereço
- `#footerPhone` - Telefone
- `#footerCityState` - Cidade e Estado
- `#footerWhatsAppBtn` - Botão WhatsApp do footer
- `#footerCopyright` - Nome no copyright

**Funcionalidades:**
- Informações da loja preenchidas dinamicamente
- Botão WhatsApp condicional
- Links de navegação com scroll suave
- Layout responsivo em 3 colunas (mobile: empilhado)

---

## ⚙️ 3. JavaScript - Funcionalidades

### 3.1 Arquivos JavaScript Carregados

```html
<!-- Bootstrap 5 JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

<!-- Custom JS -->
<script src="assets/js/config.js"></script>
<script src="assets/js/mobile.js"></script>
<script src="assets/js/loja.js"></script>
```

### 3.2 Scripts Inline (Linhas 672-700)

#### 3.2.1 Função toggleAccordion
```javascript
function toggleAccordion(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('.bi-chevron-down');
    
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('active');
        icon.style.transform = 'rotate(180deg)';
    }
}
```

**Funcionalidade:**
- Expande/colapsa conteúdo do accordion
- Rotaciona ícone chevron (0° ↔ 180°)
- Transição suave via CSS

#### 3.2.2 Smooth Scroll para Âncoras
```javascript
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
```

**Funcionalidade:**
- Scroll suave para âncoras internas
- Previne comportamento padrão
- Scroll até o início do elemento

---

### 3.3 loja.js - Funcionalidades Principais

#### 3.3.1 Inicialização
```javascript
const urlParams = new URLSearchParams(window.location.search);
const storeSlug = urlParams.get('store_slug') || urlParams.get('slug');

document.addEventListener('DOMContentLoaded', function() {
    loadStoreInfo();
    loadAllVehicles();
    // Event listeners para filtros...
});
```

#### 3.3.2 Funções Principais

| Função | Descrição |
|--------|-----------|
| `loadStoreInfo()` | Carrega informações da loja via API |
| `displayStoreInfo(store)` | Exibe dados da loja no header/footer |
| `loadAllVehicles()` | Carrega todos os veículos da loja |
| `displayAllVehicles(vehicles)` | Renderiza cards de veículos |
| `createVehicleCard(vehicle)` | Cria HTML do card individual |
| `filterVehicles()` | Aplica filtros e busca |
| `debounce(func, wait)` | Limita chamadas de função |
| `setupWhatsAppButtons(store)` | Configura botões WhatsApp |
| `toggleFavorite(vehicleId)` | Adiciona/remove favorito |
| `goToVehicleDetail(vehicleId)` | Navega para detalhes do veículo |

#### 3.3.3 Event Listeners

**Filtros:**
- `#searchInput` - Input (debounce 300ms)
- `#brandFilter` - Change
- `#modelFilter` - Change
- `#minYear` - Input (debounce 300ms)
- `#maxYear` - Input (debounce 300ms)
- `#minPrice` - Input (debounce 300ms)
- `#maxPrice` - Input (debounce 300ms)
- `#maxMileage` - Input (debounce 300ms)
- `#transmissionFilter` - Change
- `#colorFilter` - Input (debounce 300ms)
- `#bodyTypeFilter` - Change

**Ordenação:**
- `#sortSelect` - Change

---

## 🎨 4. Design e Estilização

### 4.1 Paleta de Cores

| Cor | Valor | Uso |
|-----|-------|-----|
| **Primary** | `#1A73E8` | Links, botões, destaque |
| **Primary Dark** | `#0D47A1` | Header gradient |
| **Success** | `#25d366` | Botões WhatsApp |
| **Background** | `#f5f5f5` | Body background |
| **White** | `#ffffff` | Cards, header, sidebar |
| **Text** | `#333` | Texto principal |
| **Text Muted** | `#666`, `#999` | Texto secundário |
| **Border** | `#e0e0e0` | Bordas, divisores |

### 4.2 Tipografia

- **Font Family:** System fonts (Apple, Segoe, Roboto)
- **Tamanhos:**
  - Título do card: `1.25rem` (20px)
  - Preço: `1.75rem` (28px)
  - Texto normal: `0.9rem` - `1rem`
  - Texto pequeno: `0.75rem` - `0.85rem`

### 4.3 Espaçamentos

- **Padding Header:** `0.25rem` vertical
- **Padding Cards:** `1.5rem`
- **Margin Bottom Cards:** `2rem`
- **Gap Navegação:** `2rem` (desktop)
- **Border Radius:** 
  - Cards: `12px`
  - Inputs: `4px` - `50px` (busca)
  - Botões: `25px` (WhatsApp)

### 4.4 Sombras

- **Header:** `0 2px 4px rgba(0,0,0,0.08)`
- **Cards:** `0 2px 8px rgba(0,0,0,0.08)`
- **Cards Hover:** `0 8px 24px rgba(0,0,0,0.12)`

### 4.5 Transições

- **Cards:** `all 0.3s ease`
- **Links:** `color 0.2s`
- **Botões:** `all 0.2s`
- **Accordion:** `max-height 0.3s ease`
- **Imagens:** `transform 0.3s`

---

## 📱 5. Responsividade

### 5.1 Breakpoints

| Breakpoint | Largura | Ajustes |
|------------|---------|---------|
| **Mobile** | < 768px | Filtros ocultos, cards empilhados |
| **Tablet** | 768px - 991.98px | Filtros ocultos, cards em 2 colunas |
| **Desktop** | ≥ 992px | Layout completo, sidebar visível |

### 5.2 Ajustes Mobile/Tablet

**Header:**
- Logo reduzida: `max-height: 100px`, `max-width: 400px`
- Navegação em coluna
- Padding reduzido

**Cards:**
- Altura da imagem: `200px` (vs 250px desktop)
- Cards em coluna única ou 2 colunas

**Filtros:**
- Sidebar oculta (`display: none`)
- Modal de filtros (não implementado no HTML, mas preparado)

**Resultados:**
- Grid ocupa 100% da largura
- Contador e ordenação empilhados

---

## 🔄 6. Interações e Comportamentos

### 6.1 Loading States

**Estados visuais:**
- Spinner durante carregamento inicial
- "Carregando veículos..." no contador
- "Carregando informações..." nas seções

**Cursos:**
- `cursor: wait` durante carregamento
- `cursor: pointer` em elementos clicáveis
- `cursor: not-allowed` em elementos desabilitados

### 6.2 Hover Effects

**Cards:**
- Elevação (`translateY(-4px)`)
- Sombra aumentada
- Zoom na imagem (scale 1.05)

**Links:**
- Mudança de cor para `#1A73E8`
- Transição suave

**Botões:**
- Elevação ou escala
- Mudança de cor de fundo

### 6.3 Focus States

**Inputs:**
- Borda azul (`border-color: #1A73E8`)
- Box-shadow azul translúcido
- Outline removido (estilo customizado)

---

## 🗂️ 7. IDs e Classes Principais

### 7.1 IDs Únicos

| ID | Elemento | Função |
|----|----------|--------|
| `storeLogoHeader` | `<img>` | Logo no header |
| `storeNameHeaderFallback` | `<h1>` | Nome da loja (fallback) |
| `headerWhatsAppBtn` | `<a>` | Botão WhatsApp header |
| `searchInput` | `<input>` | Campo de busca |
| `resultsCount` | `<div>` | Contador de resultados |
| `sortSelect` | `<select>` | Select de ordenação |
| `vehiclesGrid` | `<div>` | Grid de veículos |
| `storeAbout` | `<p>` | Descrição da loja |
| `footerStoreName` | `<h5>` | Nome no footer |
| `footerAddress` | `<p>` | Endereço no footer |
| `footerPhone` | `<p>` | Telefone no footer |
| `footerCityState` | `<p>` | Cidade/Estado no footer |
| `footerWhatsAppBtn` | `<a>` | Botão WhatsApp footer |
| `footerCopyright` | `<span>` | Nome no copyright |

**Filtros:**
- `minPrice`, `maxPrice`
- `brandFilter`, `modelFilter`
- `minYear`, `maxYear`
- `maxMileage`
- `bodyTypeFilter`
- `transmissionFilter`
- `colorFilter`

### 7.2 Classes Principais

**Layout:**
- `.container` - Container Bootstrap
- `.row` - Linha Bootstrap
- `.col-lg-3`, `.col-lg-9` - Colunas Bootstrap

**Componentes:**
- `.main-header` - Header principal
- `.header-logo-wrapper` - Wrapper da logo
- `.header-nav` - Navegação
- `.search-bar-container` - Container da busca
- `.filters-sidebar` - Sidebar de filtros
- `.filter-accordion` - Accordion de filtro
- `.vehicle-card-modern` - Card de veículo
- `.results-header` - Cabeçalho de resultados

**Estados:**
- `.active` - Accordion expandido
- `.d-none` - Elemento oculto
- `.disabled` - Elemento desabilitado

---

## 📊 8. Fluxo de Dados

### 8.1 Carregamento Inicial

```
1. URL parse (store_slug)
   ↓
2. loadStoreInfo()
   ↓
3. API: /stores?public=true&slug={slug}
   ↓
4. displayStoreInfo(store)
   ↓
5. Header e Footer atualizados
   ↓
6. loadAllVehicles()
   ↓
7. API: /vehicles?public=true&store_slug={slug}
   ↓
8. displayAllVehicles(vehicles)
   ↓
9. Cards renderizados
```

### 8.2 Filtragem de Veículos

```
1. Usuário interage com filtro
   ↓
2. Event listener acionado
   ↓
3. Debounce (300ms para inputs)
   ↓
4. filterVehicles()
   ↓
5. Aplica todos os filtros
   ↓
6. Ordena resultados
   ↓
7. Atualiza contador
   ↓
8. Re-renderiza grid
```

---

## 🎯 9. Requisitos Implementados

### 9.1 REQ-FR-LP-001 - Landing Page Pública

- ✅ **4.1** - Header clean e moderno
- ✅ **4.2** - Barra de busca
- ✅ **4.3** - Filtros laterais com accordion
- ✅ **4.4** - Área de resultados com ordenação
- ✅ **4.5** - Cards de veículos modernos

### 9.2 REQ-FR-UI-002 - Comportamento do Cursor

- ✅ RN-01 - Cursor pointer em clicáveis
- ✅ RN-02 - Cursor not-allowed em desabilitados
- ✅ RN-03 - Cursor wait em carregamento
- ✅ RN-04 - Cursor default em informativos

### 9.3 REQ-FR-UI-003 - Padronização de Cursor

- ✅ Regras globais aplicadas

---

## 🔧 10. Manutenção e Customização

### 10.1 Alterar Cores

Editar variáveis CSS ou valores diretos em:
- Header: `.main-header`
- Botões: `.header-whatsapp-btn`
- Preços: `.vehicle-card-price`
- Links hover: `.header-nav a:hover`

### 10.2 Alterar Tamanhos

**Logo:**
```css
.header-logo {
    max-height: 150px;  /* Alterar aqui */
    max-width: 600px;   /* Alterar aqui */
}
```

**Cards:**
```css
.vehicle-card-image {
    height: 250px;  /* Alterar aqui */
}
```

### 10.3 Adicionar Novo Filtro

1. Adicionar HTML no sidebar:
```html
<div class="filter-accordion">
    <button class="filter-accordion-button" onclick="toggleAccordion(this)">
        <span><i class="bi bi-icon"></i>Nome do Filtro</span>
        <i class="bi bi-chevron-down"></i>
    </button>
    <div class="filter-accordion-content">
        <!-- Inputs do filtro -->
    </div>
</div>
```

2. Adicionar event listener em `loja.js`:
```javascript
document.getElementById('novoFiltro').addEventListener('change', filterVehicles);
```

3. Adicionar lógica de filtro em `filterVehicles()`

---

## 📚 11. Arquivos Relacionados

| Arquivo | Descrição |
|---------|-----------|
| `loja.html` | HTML principal |
| `assets/css/style.css` | CSS global |
| `assets/js/loja.js` | JavaScript principal |
| `assets/js/config.js` | Configurações (API_URL) |
| `assets/js/mobile.js` | Utilitários mobile |
| `api/endpoints/stores.php` | API de lojas |
| `api/endpoints/vehicles.php` | API de veículos |

---

## ✅ 12. Checklist de Funcionalidades

- [x] Header sticky com logo dinâmica
- [x] Barra de busca funcional
- [x] Filtros laterais com accordion
- [x] Grid responsivo de veículos
- [x] Cards com hover effects
- [x] Ordenação de resultados
- [x] Contador de resultados
- [x] Loading states
- [x] Seção sobre a loja
- [x] Footer informativo
- [x] Botões WhatsApp condicionais
- [x] Scroll suave para âncoras
- [x] Responsividade completa
- [x] Cursor personalizado
- [x] Tratamento de erros

---

## 📝 13. Notas Técnicas

### 13.1 Performance

- **Debounce:** Aplicado em inputs (300ms) para reduzir chamadas à API
- **Lazy Loading:** Preparado para imagens (não implementado no HTML)
- **Transições:** Utilizam `transform` para melhor performance (GPU)

### 13.2 Acessibilidade

- Semântica HTML5 correta (`header`, `main`, `section`, `footer`, `aside`)
- Atributos `alt` em imagens
- Labels em inputs
- Contraste de cores adequado
- Navegação por teclado suportada

### 13.3 Compatibilidade

- Bootstrap 5.3.2 (compatibilidade moderna)
- JavaScript ES6+ (arrow functions, const/let, template literals)
- CSS Grid e Flexbox
- Navegadores modernos (Chrome, Firefox, Safari, Edge)

---

**Última atualização:** 2024  
**Versão:** 1.0  
**Autor:** Sistema Estocx
