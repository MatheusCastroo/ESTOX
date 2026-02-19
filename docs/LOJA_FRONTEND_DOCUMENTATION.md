# 🎨 Documentação do Front-End Premium - Loja ESTOCX

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Design System](#design-system)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Componentes](#componentes)
5. [Animações](#animações)
6. [Responsividade](#responsividade)
7. [Dark Mode](#dark-mode)
8. [Integração JavaScript](#integração-javascript)
9. [Guia de Customização](#guia-de-customização)

---

## 🎯 Visão Geral

O front-end da loja foi completamente reconstruído com um design premium inspirado em startups globais como Stripe, Linear, Vercel, Apple e Tesla. O objetivo é criar uma experiência visual moderna, elegante e profissional que transmita confiança e qualidade.

### Características Principais

- ✅ Design System completo e consistente
- ✅ Animações suaves e micro-interações
- ✅ Responsividade premium (mobile-first)
- ✅ Dark Mode completo
- ✅ Performance otimizada
- ✅ Acessibilidade considerada
- ✅ Integração preservada com JavaScript existente

---

## 🎨 Design System

### Paleta de Cores - Light Mode

```css
--primary: #6366F1          /* Indigo vibrante e moderno */
--primary-hover: #4F46E5   /* Indigo escuro para hover */
--accent: #8B5CF6          /* Roxo moderno */
--accent-hover: #7C3AED    /* Roxo escuro */
--background: #FAFBFC      /* Fundo suave */
--card: #FFFFFF            /* Cards brancos */
--border: rgba(0, 0, 0, 0.08)  /* Bordas sutis */
--text-primary: #0A0E27     /* Texto principal escuro */
--text-secondary: #6B7280   /* Texto secundário */
--success: #10B981         /* Verde esmeralda */
--danger: #F43F5E          /* Vermelho moderno */
```

### Paleta de Cores - Dark Mode

```css
--primary: #818CF8          /* Indigo claro */
--primary-hover: #A5B4FC   /* Indigo muito claro */
--accent: #A78BFA          /* Roxo claro */
--accent-hover: #C4B5FD    /* Roxo muito claro */
--background: #0A0E27      /* Fundo escuro profundo */
--card: #111827            /* Cards escuros */
--card-elevated: #1F2937   /* Cards elevados */
--border: rgba(255, 255, 255, 0.08)  /* Bordas claras */
--text-primary: #F9FAFB     /* Texto claro */
--text-secondary: #9CA3AF  /* Texto secundário claro */
```

### Sistema de Sombras

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
--shadow-xl: 0 25px 50px -12px rgba(99, 102, 241, 0.25)
--glow-primary: 0 0 20px rgba(99, 102, 241, 0.3)
```

### Sistema de Bordas

```css
--radius-sm: 8px   /* Elementos pequenos */
--radius: 12px     /* Padrão */
--radius-lg: 16px  /* Cards e containers grandes */
--radius-xl: 20px  /* Elementos especiais */
```

### Tipografia

- **Fonte Principal**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
- **Tamanhos**:
  - Títulos: `1.125rem` a `2.5rem`
  - Corpo: `0.9375rem` a `1rem`
  - Pequeno: `0.8125rem` a `0.875rem`
- **Pesos**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

---

## 📁 Estrutura de Arquivos

```
ESTOX/
├── loja.html                    # Página principal da loja
├── assets/
│   └── css/
│       └── loja.css            # CSS premium completo
└── docs/
    └── LOJA_FRONTEND_DOCUMENTATION.md  # Esta documentação
```

### Dependências Externas

- **Bootstrap 5.3.2**: Grid system e componentes base
- **Bootstrap Icons 1.11.1**: Ícones
- **JavaScript Custom**: `config.js`, `mobile.js`, `loja.js`

---

## 🧩 Componentes

### 1. Header Premium

**Localização**: Topo da página, sticky

**Características**:
- Fundo semi-transparente com `backdrop-filter: blur(20px)`
- Borda inferior sutil
- Altura: 72px (desktop), 64px (mobile)
- Logo à esquerda
- Navegação central
- Botão WhatsApp à direita

**Classes CSS**:
- `.main-header` - Container principal
- `.header-container` - Container interno
- `.header-nav` - Navegação
- `.header-whatsapp-btn` - Botão WhatsApp

**IDs JavaScript**:
- `storeLogoHeader` - Logo da loja
- `storeNameHeaderFallback` - Nome da loja (fallback)
- `headerWhatsAppBtn` - Botão WhatsApp

### 2. Search Bar

**Localização**: Abaixo do header

**Características**:
- Input grande e arredondado (border-radius: 50px)
- Focus com glow azul
- Padding generoso (16px 24px)

**IDs JavaScript**:
- `searchInput` - Input de busca

### 3. Filtros Premium

#### Desktop Sidebar

**Localização**: Coluna esquerda (col-lg-3)

**Características**:
- Card elevado com sombra
- Position sticky (top: 100px)
- Accordions animados
- Inputs com focus glow

**Estrutura**:
```html
<aside class="col-lg-3">
    <div class="filters-sidebar">
        <!-- Filtros aqui -->
    </div>
</aside>
```

**IDs JavaScript (Desktop)**:
- `minPrice`, `maxPrice` - Faixa de preço
- `brandFilter` - Marca
- `modelFilter` - Modelo
- `minYear`, `maxYear` - Ano
- `maxMileage` - Quilometragem
- `bodyTypeFilter` - Tipo de carro
- `transmissionFilter` - Câmbio
- `colorFilter` - Cor

#### Mobile Drawer

**Localização**: Bottom sheet (offcanvas)

**Características**:
- Aparece de baixo para cima
- Máximo 95vh de altura
- Botão "Aplicar filtros" fixo no rodapé
- Botão "Limpar" no header

**IDs JavaScript (Mobile)**:
- `minPriceMobile`, `maxPriceMobile`
- `brandFilterMobile`
- `modelFilterMobile`
- `minYearMobile`, `maxYearMobile`
- `maxMileageMobile`
- `bodyTypeFilterMobile`
- `transmissionFilterMobile`
- `colorFilterMobile`
- `applyFiltersBtn` - Botão aplicar
- `clearFiltersBtn` - Botão limpar

**Funções JavaScript**:
- `toggleAccordion(button)` - Abrir/fechar accordion
- `applyFiltersAndClose()` - Aplicar filtros e fechar drawer
- `clearAllFilters()` - Limpar todos os filtros
- `syncMobileFilters()` - Sincronizar mobile com desktop

### 4. Cards de Veículos

**Estrutura**:
```html
<div class="col-md-6 col-lg-4">
    <div class="vehicle-card-modern">
        <div class="vehicle-card-image">
            <img src="..." alt="...">
            <span class="vehicle-card-badge">Novidade</span>
            <button class="vehicle-card-favorite">❤️</button>
        </div>
        <div class="vehicle-card-body">
            <h3 class="vehicle-card-title">Marca Modelo</h3>
            <div class="vehicle-card-info">...</div>
            <div class="vehicle-card-price">R$ 50.000</div>
            <div class="vehicle-card-location">📍 Cidade, Estado</div>
        </div>
    </div>
</div>
```

**Características**:
- Imagem 16:9 (aspect-ratio)
- Hover: translateY(-6px) + scale(1.02)
- Sombra com glow azul no hover
- Badge flutuante (verde/vermelho/roxo)
- Botão favorito no canto superior direito
- Preço destacado e grande
- Animações stagger (fade-in progressivo)

**Classes CSS**:
- `.vehicle-card-modern` - Card principal
- `.vehicle-card-image` - Container da imagem
- `.vehicle-card-badge` - Badge de status
- `.vehicle-card-favorite` - Botão favorito
- `.vehicle-card-body` - Corpo do card
- `.vehicle-card-title` - Título
- `.vehicle-card-info` - Informações técnicas
- `.vehicle-card-price` - Preço
- `.vehicle-card-location` - Localização

**Grid Responsivo**:
- Mobile: 1 coluna
- Tablet (≥768px): 2 colunas
- Desktop (≥992px): 3 colunas
- Large (≥1280px): 4 colunas

### 5. Results Header

**Localização**: Acima do grid de veículos

**Componentes**:
- Contador de resultados (`resultsCount`)
- Select de ordenação (`sortSelect`)

**IDs JavaScript**:
- `resultsCount` - Contador de resultados
- `sortSelect` - Select de ordenação

### 6. About Section

**Localização**: Seção "Sobre a Loja"

**Características**:
- Fundo branco (light) / card escuro (dark)
- Texto centralizado
- Padding generoso (80px vertical)

**IDs JavaScript**:
- `storeAbout` - Texto sobre a loja

### 7. Footer Premium

**Localização**: Rodapé da página

**Características**:
- Fundo escuro (#111827)
- Texto claro
- Links com hover suave
- Botão WhatsApp com gradiente verde

**IDs JavaScript**:
- `footerStoreName` - Nome da loja
- `footerAddress` - Endereço
- `footerPhone` - Telefone
- `footerCityState` - Cidade, Estado
- `footerWhatsAppBtn` - Botão WhatsApp
- `footerCopyright` - Copyright

---

## 🎬 Animações

### 1. Fade-in Up (Cards)

```css
@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.vehicle-card-modern {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease forwards;
}
```

**Stagger Animation**: Cada card tem um delay progressivo (0.05s, 0.1s, 0.15s...)

### 2. Gradient Shift (Botões)

```css
@keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

.filters-toggle-btn {
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    background-size: 200% 200%;
    animation: gradientShift 5s ease infinite;
}
```

### 3. Skeleton Loader

```css
@keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.skeleton {
    background: linear-gradient(90deg, var(--card) 0%, rgba(0, 0, 0, 0.05) 50%, var(--card) 100%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}
```

### 4. Hover Effects

**Cards**:
- `transform: translateY(-6px) scale(1.02)`
- `box-shadow: var(--shadow-xl), var(--glow-primary)`
- Imagem: `transform: scale(1.1)`

**Botões**:
- `transform: translateY(-2px)`
- Sombra aumentada

**Links**:
- Mudança de cor suave
- Background sutil no hover

---

## 📱 Responsividade

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) { ... }

/* Tablet */
@media (min-width: 768px) and (max-width: 991.98px) { ... }

/* Desktop */
@media (min-width: 992px) { ... }

/* Large */
@media (min-width: 1280px) { ... }
```

### Grid de Veículos

| Tela | Colunas | Gap |
|------|---------|-----|
| Mobile (<768px) | 1 | 24px |
| Tablet (768px-991px) | 2 | 32px |
| Desktop (992px-1279px) | 3 | 32px |
| Large (≥1280px) | 4 | 32px |

### Header Mobile

- Altura reduzida: 64px
- Navegação oculta
- WhatsApp vira ícone apenas
- Logo menor

### Filtros Mobile

- Sidebar desktop oculta
- Botão "Filtrar" sticky abaixo do header
- Drawer bottom sheet ao clicar
- Filtros sincronizados com desktop

---

## 🌗 Dark Mode

### Ativação

Adicionar classe `dark-mode` no `<body>`:

```html
<body class="dark Mode">
```

### Elementos que Mudam

- ✅ Background
- ✅ Cards
- ✅ Bordas
- ✅ Texto (primary e secondary)
- ✅ Inputs
- ✅ Sombras (com glow azul)
- ✅ Hover states

### Exemplo de Implementação

```css
.dark-mode {
    --background: #0A0E27;
    --card: #111827;
    --text-primary: #F9FAFB;
    /* ... */
}

.dark-mode .vehicle-card-modern:hover {
    box-shadow: var(--shadow-xl), var(--glow-accent);
}
```

---

## 🔌 Integração JavaScript

### IDs Críticos (NÃO ALTERAR)

#### Header
- `storeLogoHeader`
- `storeNameHeaderFallback`
- `headerWhatsAppBtn`

#### Busca
- `searchInput`

#### Filtros Desktop
- `minPrice`, `maxPrice`
- `brandFilter`
- `modelFilter`
- `minYear`, `maxYear`
- `maxMileage`
- `bodyTypeFilter`
- `transmissionFilter`
- `colorFilter`

#### Filtros Mobile
- `minPriceMobile`, `maxPriceMobile`
- `brandFilterMobile`
- `modelFilterMobile`
- `minYearMobile`, `maxYearMobile`
- `maxMileageMobile`
- `bodyTypeFilterMobile`
- `transmissionFilterMobile`
- `colorFilterMobile`
- `applyFiltersBtn`
- `clearFiltersBtn`

#### Results
- `resultsCount`
- `sortSelect`
- `vehiclesGrid`

#### Footer
- `footerStoreName`
- `footerAddress`
- `footerPhone`
- `footerCityState`
- `footerWhatsAppBtn`
- `footerCopyright`

#### About
- `storeAbout`

### Classes Críticas (NÃO ALTERAR)

- `.vehicle-card-modern` - Card de veículo
- `.lista-veiculos` - Grid de veículos
- `.filter-accordion-button` - Botão de accordion
- `.filter-accordion-content` - Conteúdo do accordion
- `.filters-sidebar` - Sidebar de filtros
- `.filters-toggle-btn` - Botão mobile de filtros
- `#filtersOffcanvas` - Drawer mobile

### Funções JavaScript

#### `toggleAccordion(button)`
Abre/fecha accordions dos filtros.

#### `applyFiltersAndClose()`
Aplica filtros e fecha drawer mobile.

#### `clearAllFilters()`
Limpa todos os filtros (desktop + mobile).

#### `syncMobileFilters()`
Sincroniza filtros mobile com desktop.

#### `filterVehicles()`
Filtra veículos baseado nos filtros (em `loja.js`).

#### `displayAllVehicles(vehicles)`
Exibe veículos no grid (em `loja.js`).

#### `createVehicleCard(vehicle, isFeatured)`
Cria HTML do card de veículo (em `loja.js`).

---

## 🎨 Guia de Customização

### Alterar Cores Primárias

Edite as variáveis CSS em `assets/css/loja.css`:

```css
:root {
    --primary: #6366F1;        /* Sua cor primária */
    --primary-hover: #4F46E5;   /* Hover da primária */
    --accent: #8B5CF6;          /* Cor de destaque */
}
```

### Alterar Espaçamento

```css
:root {
    --radius-sm: 8px;   /* Bordas pequenas */
    --radius: 12px;      /* Padrão */
    --radius-lg: 16px;   /* Cards */
    --radius-xl: 20px;   /* Especiais */
}
```

### Alterar Sombras

```css
:root {
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    /* ... */
}
```

### Adicionar Nova Animação

```css
@keyframes minhaAnimacao {
    from { /* estado inicial */ }
    to { /* estado final */ }
}

.meu-elemento {
    animation: minhaAnimacao 0.5s ease;
}
```

### Customizar Cards

```css
.vehicle-card-modern {
    /* Suas customizações */
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
}

.vehicle-card-modern:hover {
    /* Hover customizado */
    transform: translateY(-8px);
}
```

---

## 📊 Performance

### Otimizações Implementadas

1. **CSS Puro**: Sem dependências pesadas
2. **Animações GPU**: `transform` e `opacity` apenas
3. **Lazy Loading**: Imagens com `loading="lazy"`
4. **Will-change**: Aplicado em elementos animados
5. **Transitions**: Suaves e rápidas (0.2s - 0.3s)

### Boas Práticas

- ✅ Usar `transform` ao invés de `top/left` para animações
- ✅ Evitar animações em `width/height`
- ✅ Usar `will-change` apenas quando necessário
- ✅ Limitar número de animações simultâneas

---

## 🐛 Troubleshooting

### Filtros Duplicados

**Problema**: Filtros aparecem no footer

**Solução**: Verificar se `#filtersOffcanvas` tem `display: none` quando não tem classe `.show`

### Cards Não Animam

**Problema**: Cards não fazem fade-in

**Solução**: Verificar se `.vehicle-card-modern` tem `opacity: 0` inicial e `animation: fadeInUp`

### Dark Mode Não Funciona

**Problema**: Dark mode não aplica

**Solução**: Verificar se classe `dark-mode` está no `<body>` e se variáveis CSS estão definidas

### Grid Quebrado

**Problema**: Grid não responde corretamente

**Solução**: Verificar se `.lista-veiculos` tem `display: grid` e `grid-template-columns` corretos

---

## 📝 Notas Importantes

### ⚠️ NÃO ALTERAR

- IDs usados pelo JavaScript
- Classes críticas (`.vehicle-card-modern`, `.lista-veiculos`, etc.)
- Estrutura HTML dos filtros
- Atributos `data-*` e `onclick`

### ✅ PODE ALTERAR

- Cores (variáveis CSS)
- Espaçamentos
- Sombras
- Animações (velocidade, easing)
- Tipografia (tamanhos, pesos)
- Border radius

---

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras

1. **Dark Mode Toggle**: Botão para alternar modo escuro
2. **Loading States**: Skeleton loaders mais elaborados
3. **Empty States**: Ilustrações customizadas
4. **Micro-interações**: Mais feedback visual
5. **Acessibilidade**: ARIA labels e navegação por teclado
6. **PWA**: Service worker e offline support

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar esta documentação
2. Consultar código fonte comentado
3. Verificar console do navegador para erros JavaScript

---

**Versão**: 1.0.0  
**Última Atualização**: 2024  
**Autor**: ESTOCX Development Team
