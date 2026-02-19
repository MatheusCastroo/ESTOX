# 🚀 Quick Reference - Front-End Loja ESTOCX

## 📁 Arquivos Principais

- `loja.html` - Página principal
- `assets/css/loja.css` - Estilos premium

## 🎨 Cores Principais

### Light Mode
- **Primary**: `#6366F1` (Indigo)
- **Accent**: `#8B5CF6` (Roxo)
- **Success**: `#10B981` (Verde)
- **Background**: `#FAFBFC`
- **Card**: `#FFFFFF`

### Dark Mode
- **Primary**: `#818CF8` (Indigo claro)
- **Accent**: `#A78BFA` (Roxo claro)
- **Background**: `#0A0E27`
- **Card**: `#111827`

## 🔑 IDs Críticos (NÃO ALTERAR)

### Header
- `storeLogoHeader`, `storeNameHeaderFallback`, `headerWhatsAppBtn`

### Busca
- `searchInput`

### Filtros Desktop
- `minPrice`, `maxPrice`, `brandFilter`, `modelFilter`, `minYear`, `maxYear`, `maxMileage`, `bodyTypeFilter`, `transmissionFilter`, `colorFilter`

### Filtros Mobile
- `minPriceMobile`, `maxPriceMobile`, `brandFilterMobile`, `modelFilterMobile`, `minYearMobile`, `maxYearMobile`, `maxMileageMobile`, `bodyTypeFilterMobile`, `transmissionFilterMobile`, `colorFilterMobile`, `applyFiltersBtn`, `clearFiltersBtn`

### Results
- `resultsCount`, `sortSelect`, `vehiclesGrid`

### Footer
- `footerStoreName`, `footerAddress`, `footerPhone`, `footerCityState`, `footerWhatsAppBtn`, `footerCopyright`

## 🎯 Classes Críticas (NÃO ALTERAR)

- `.vehicle-card-modern` - Card de veículo
- `.lista-veiculos` - Grid de veículos
- `.filter-accordion-button` - Botão accordion
- `.filter-accordion-content` - Conteúdo accordion
- `.filters-sidebar` - Sidebar filtros
- `#filtersOffcanvas` - Drawer mobile

## 📱 Breakpoints

- Mobile: `< 768px` (1 coluna)
- Tablet: `768px - 991px` (2 colunas)
- Desktop: `≥ 992px` (3 colunas)
- Large: `≥ 1280px` (4 colunas)

## 🎬 Animações

- **Fade-in Up**: Cards aparecem de baixo
- **Gradient Shift**: Botões com gradiente animado
- **Skeleton Loader**: Loading animado
- **Hover**: translateY + scale + glow

## 🌗 Dark Mode

Adicionar classe `dark-mode` no `<body>`:

```html
<body class="dark-mode">
```

## ⚠️ Regras Importantes

1. **NÃO alterar IDs** usados pelo JavaScript
2. **NÃO alterar classes** críticas
3. **PODE alterar** cores, espaçamentos, sombras
4. **Preservar** estrutura HTML dos filtros

## 📚 Documentação Completa

Ver: `docs/LOJA_FRONTEND_DOCUMENTATION.md`
 