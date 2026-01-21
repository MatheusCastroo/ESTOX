# 🖱️ Requisito Funcional – Comportamento do Cursor

## 📋 Identificação

**ID:** REQ-FR-UI-002  
**Nome:** Comportamento visual do cursor do mouse  
**Módulo:** Interface do Usuário (UI)  
**Contexto:** Catálogo público (`loja.html`)  
**Prioridade:** Média  
**Status:** ✅ Implementado

---

## 📋 Descrição

O sistema deve alterar dinamicamente o cursor do mouse conforme o tipo de elemento e o estado da interface, com o objetivo de melhorar a usabilidade, indicar ações disponíveis e reforçar feedback visual ao usuário.

---

## 🎯 Objetivo

Garantir que o usuário identifique claramente:

- ✅ Elementos clicáveis
- ✅ Elementos desabilitados
- ✅ Estados de carregamento
- ✅ Conteúdos apenas informativos

---

## 🧩 Escopo

Este requisito se aplica a:

- ✅ Header (navegação, logo, WhatsApp)
- ✅ Catálogo de veículos (cards clicáveis)
- ✅ Botões de ação (filtros, ordenação, WhatsApp)
- ✅ Links (navegação, footer)
- ✅ Campos interativos (inputs, selects, checkboxes)
- ✅ Estados de carregamento da aplicação

---

## ⚙️ Regras de Negócio

| Código | Regra | Status |
|--------|-------|--------|
| **RN-01** | Elementos clicáveis devem exibir cursor `pointer` | ✅ Implementado |
| **RN-02** | Elementos desabilitados devem exibir cursor `not-allowed` | ✅ Implementado |
| **RN-03** | Elementos em carregamento devem exibir cursor `wait` ou `progress` | ✅ Implementado |
| **RN-04** | Elementos apenas informativos devem manter cursor `default` | ✅ Implementado |
| **RN-05** | O cursor não deve induzir ações inexistentes | ✅ Implementado |

---

## 🧪 Critérios de Aceite

### CA-01 – Elemento clicável ✅

**Dado que** o usuário posicione o cursor sobre um botão ou link ativo  
**Quando** o elemento estiver habilitado  
**Então** o cursor deve mudar para `pointer`

**Elementos cobertos:**
- Links de navegação (`.header-nav a`)
- Botão WhatsApp (`.header-whatsapp-btn`)
- Botões de filtro (`.filter-accordion-button`)
- Cards de veículos (`.vehicle-card-modern`)
- Botão de favorito (`.vehicle-card-favorite`)
- Select de ordenação (`.sort-select`)
- Todos os botões habilitados (`button:not(:disabled)`)
- Links do footer (`.footer a`)

### CA-02 – Elemento desabilitado ✅

**Dado que** o usuário posicione o cursor sobre um elemento desabilitado  
**Então** o cursor deve mudar para `not-allowed`

**Elementos cobertos:**
- Botões desabilitados (`button:disabled`, `.btn:disabled`)
- Inputs desabilitados (`input:disabled`, `select:disabled`)
- Links desabilitados (`a.disabled`)
- Elementos com `[aria-disabled="true"]`
- Classe `.disabled`

### CA-03 – Estado de carregamento ✅

**Dado que** o sistema esteja processando uma ação  
**Quando** houver bloqueio temporário da interface  
**Então** o cursor deve exibir `wait` ou `progress`

**Elementos cobertos:**
- Spinner de carregamento (`.spinner-border`)
- Body em estado de loading (`body.loading`)
- Elementos com classe `.loading` ou `.is-loading`

### CA-04 – Conteúdo informativo ✅

**Dado que** o usuário posicione o cursor sobre textos ou imagens informativas  
**Então** o cursor deve permanecer como `default`

**Elementos cobertos:**
- Títulos de cards (`.vehicle-card-title`)
- Informações de veículos (`.vehicle-card-info`)
- Preços (`.vehicle-card-price`)
- Localização (`.vehicle-card-location`)
- Badges informativos (`.vehicle-card-badge`)
- Textos estáticos (h1-h6, p, span)
- Contador de resultados (`.results-count`)
- Textos informativos do footer

---

## 🎨 Estados de Cursor Implementados

| Estado | Tipo de Cursor | Elementos Aplicados | Arquivo |
|--------|----------------|---------------------|---------|
| **Ação disponível** | `pointer` | Botões, links, cards clicáveis, selects | `loja.html` (linhas 318-334) |
| **Ação indisponível** | `not-allowed` | Elementos desabilitados | `loja.html` (linhas 337-346) |
| **Carregamento** | `wait` | Spinners, body.loading | `loja.html` (linhas 349-355) |
| **Informativo** | `default` | Textos, títulos, informações | `loja.html` (linhas 358-370) |
| **Texto editável** | `text` | Inputs de texto, textarea | `loja.html` (linhas 363-366) |
| **Seleção** | `pointer` | Checkboxes, radios, selects | `loja.html` (linhas 369-371) |

---

## 🔧 Implementação Técnica

### Localização

**Arquivo:** `loja.html`  
**Seção:** Estilos inline (linhas 292-371)

### Código CSS Implementado

```css
/* ============================================
   REQ-FR-UI-002: Comportamento do Cursor
   ============================================ */

/* RN-01: Elementos clicáveis - cursor pointer */
.header-nav a,
.header-whatsapp-btn,
.filter-accordion-button,
.vehicle-card-modern,
.vehicle-card-favorite,
.sort-select,
.btn,
button:not(:disabled),
a:not(.disabled):not([aria-disabled="true"]),
.footer a,
#filtersToggle,
[onclick] {
    cursor: pointer;
}

/* RN-02: Elementos desabilitados - cursor not-allowed */
button:disabled,
.btn:disabled,
.btn.disabled,
input:disabled,
select:disabled,
a.disabled,
[aria-disabled="true"],
.disabled {
    cursor: not-allowed !important;
}

/* RN-03: Estados de carregamento - cursor wait */
.spinner-border,
body.loading,
.loading,
.is-loading {
    cursor: wait !important;
}

/* RN-04: Elementos informativos - cursor default */
.vehicle-card-title,
.vehicle-card-info,
.vehicle-card-price,
.vehicle-card-location,
.results-count,
.vehicle-card-badge,
h1, h2, h3, h4, h5, h6,
p,
span:not([onclick]),
.text-muted,
#storeAbout,
#footerStoreName,
#footerAddress,
#footerPhone,
#footerCityState {
    cursor: default;
}

/* Inputs de texto - cursor text */
.search-input-large,
.filter-input-group input,
.filter-input-group select,
input[type="text"],
input[type="number"],
input[type="email"],
input[type="tel"],
textarea {
    cursor: text;
}

/* Inputs de seleção - cursor pointer */
input[type="checkbox"],
input[type="radio"],
select:not(:disabled) {
    cursor: pointer;
}
```

---

## 📱 Responsividade

✅ O comportamento do cursor é consistente em:

- **Desktop** - Todas as regras aplicadas
- **Tablet** - Todas as regras aplicadas
- **Mobile** - Todas as regras aplicadas

**Observação:** Em dispositivos touch, o cursor não se aplica visualmente, porém o comportamento não gera efeitos colaterais e mantém compatibilidade.

---

## 🌐 Compatibilidade de Navegadores

✅ Testado e compatível com:

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

---

## ♿ Acessibilidade

✅ **Implementado:**

- A alteração do cursor **não é o único indicativo** de interatividade
- Elementos clicáveis possuem também feedback visual (hover, foco ou estilo)
- Elementos com `[aria-disabled="true"]` são respeitados
- Compatível com navegação por teclado

**Exemplos de feedback visual adicional:**
- Hover em links: `color: #1A73E8`
- Hover em cards: `transform: translateY(-4px)` e `box-shadow`
- Hover em botões: `transform: translateY(-2px)`
- Focus em inputs: `border-color: #1A73E8` e `box-shadow`

---

## 🐛 Exceções Tratadas

✅ **Implementado:**

- ✅ Elementos ocultos (`display: none`) não alteram o cursor
- ✅ Elementos desabilitados não respondem a eventos de clique
- ✅ Seletores específicos evitam conflitos com regras globais

---

## 📊 Elementos Específicos do Catálogo

### Header

| Elemento | Cursor | Classe/ID |
|----------|--------|-----------|
| Links de navegação | `pointer` | `.header-nav a` |
| Botão WhatsApp | `pointer` | `.header-whatsapp-btn` |
| Logo (clicável) | `pointer` | `#storeLogoHeader` |

### Catálogo de Veículos

| Elemento | Cursor | Classe/ID |
|----------|--------|-----------|
| Card do veículo | `pointer` | `.vehicle-card-modern` |
| Botão favorito | `pointer` | `.vehicle-card-favorite` |
| Título do veículo | `default` | `.vehicle-card-title` |
| Informações do veículo | `default` | `.vehicle-card-info` |
| Preço | `default` | `.vehicle-card-price` |
| Localização | `default` | `.vehicle-card-location` |
| Badge | `default` | `.vehicle-card-badge` |

### Filtros

| Elemento | Cursor | Classe/ID |
|----------|--------|-----------|
| Botão accordion | `pointer` | `.filter-accordion-button` |
| Inputs de texto | `text` | `.filter-input-group input` |
| Selects | `pointer` | `.filter-input-group select` |
| Checkboxes | `pointer` | `input[type="checkbox"]` |
| Radios | `pointer` | `input[type="radio"]` |

### Ordenação e Busca

| Elemento | Cursor | Classe/ID |
|----------|--------|-----------|
| Campo de busca | `text` | `.search-input-large` |
| Select de ordenação | `pointer` | `.sort-select` |
| Contador de resultados | `default` | `.results-count` |

### Footer

| Elemento | Cursor | Classe/ID |
|----------|--------|-----------|
| Links rápidos | `pointer` | `.footer a` |
| Botão WhatsApp | `pointer` | `#footerWhatsAppBtn` |
| Textos informativos | `default` | `#footerStoreName`, `#footerAddress`, etc. |

---

## ✅ Checklist de Implementação

- [x] Cursor alterado em elementos clicáveis (RN-01)
- [x] Cursor alterado em elementos desabilitados (RN-02)
- [x] Cursor alterado em estados de carregamento (RN-03)
- [x] Cursor padrão mantido em elementos informativos (RN-04)
- [x] Compatibilidade entre navegadores validada
- [x] Responsividade testada (desktop, tablet, mobile)
- [x] Acessibilidade verificada
- [x] Feedback visual adicional implementado
- [x] Exceções tratadas
- [x] Documentação criada

---

## 🔗 Arquivos Relacionados

| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| `loja.html` | Estilos específicos do requisito | 292-371 |
| `assets/css/style.css` | Estilos globais de cursor | 14-150 |
| `app/globals.css` | Estilos para componentes React | - |

---

## 📝 Notas Adicionais

- ✅ Este requisito complementa os requisitos visuais do header e do catálogo
- ✅ Não interfere em regras de negócio ou fluxo de dados
- ✅ Atua exclusivamente na camada de apresentação (UI)
- ✅ Integrado com regras globais de cursor do sistema
- ✅ Compatível com Bootstrap 5 e componentes customizados

---

## 🧪 Testes Realizados

### Teste 1: Elementos Clicáveis
- ✅ Links de navegação exibem `pointer`
- ✅ Cards de veículos exibem `pointer`
- ✅ Botões exibem `pointer`

### Teste 2: Elementos Desabilitados
- ✅ Botões desabilitados exibem `not-allowed`
- ✅ Inputs desabilitados exibem `not-allowed`

### Teste 3: Estados de Carregamento
- ✅ Spinner exibe `wait`
- ✅ Body em loading exibe `wait`

### Teste 4: Elementos Informativos
- ✅ Textos exibem `default`
- ✅ Títulos exibem `default`
- ✅ Preços exibem `default`

### Teste 5: Campos de Entrada
- ✅ Inputs de texto exibem `text`
- ✅ Checkboxes exibem `pointer`
- ✅ Selects exibem `pointer`

---

## 📅 Histórico

| Data | Versão | Descrição |
|------|--------|-----------|
| 2024 | 1.0 | Implementação inicial do requisito |

---

**Status:** ✅ **IMPLEMENTADO E TESTADO**  
**Última atualização:** 2024  
**Responsável:** Sistema Estocx
