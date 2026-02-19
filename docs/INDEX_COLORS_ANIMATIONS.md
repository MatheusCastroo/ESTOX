# 🎨 Documentação de Cores e Animações - index.html

## 📋 Índice

1. [Paleta de Cores](#paleta-de-cores)
2. [Gradientes](#gradientes)
3. [Animações CSS](#animações-css)
4. [Transições e Hover Effects](#transições-e-hover-effects)
5. [Efeitos JavaScript](#efeitos-javascript)
6. [Componentes Visuais](#componentes-visuais)
7. [Guia de Uso](#guia-de-uso)

---

## 🎨 Paleta de Cores

### Cores Principais

```css
:root {
    --primary: #2563EB;      /* Azul primário - botões principais, links */
    --secondary: #0F172A;   /* Azul escuro - títulos, footer, hero */
    --accent: #10B981;       /* Verde esmeralda - destaques, ícones */
    --bg: #F8FAFC;          /* Cinza claro - background principal */
}
```

### Detalhamento das Cores

#### 🔵 Primary (#2563EB)
- **Uso**: Botões principais, links, navbar brand, gradientes
- **Hover**: `#1d4ed8` (mais escuro)
- **Aplicações**:
  - `.btn-primary`
  - `.navbar-brand`
  - `.nav-link:hover`
  - Gradientes do hero
  - Cards de preço

#### ⚫ Secondary (#0F172A)
- **Uso**: Títulos, footer, hero section, textos escuros
- **Aplicações**:
  - `.section-title`
  - `footer` background
  - `.hero-section` gradient
  - `.card-title`
  - `.step-title`

#### 🟢 Accent (#10B981)
- **Uso**: Destaques, ícones de check, badges, elementos de sucesso
- **Aplicações**:
  - `.hero-feature-item i`
  - `.pricing-badge`
  - `.pricing-features li i`
  - `.pricing-card-free` border
  - Botões de sucesso

#### ⚪ Background (#F8FAFC)
- **Uso**: Background principal da página
- **Aplicações**:
  - `body` background
  - Seções claras
  - Cards background

### Cores de Texto

```css
/* Texto Principal */
color: #1E293B;              /* Texto padrão do body */

/* Texto Secundário */
color: #64748B;              /* Subtítulos, descrições */
color: #475569;              /* Links do navbar */

/* Texto Branco */
color: white;                 /* Hero section, footer */
opacity: 0.95;               /* Subtítulos no hero */
```

### Cores de Botões

#### Botão Primary
```css
background: #2563EB;
hover: #1d4ed8;
```

#### Botão Success (WhatsApp)
```css
background: #25d366;         /* Verde WhatsApp */
hover: #20ba5a;
```

#### Botão Light
```css
background: white;
color: #2563EB;
```

#### Botão Outline Light
```css
border: 2px solid white;
color: white;
hover: background white, color #2563EB;
```

---

## 🌈 Gradientes

### Hero Section Gradient

```css
background: linear-gradient(135deg, #2563EB 0%, #0F172A 100%);
```

**Aplicação**: `.hero-section`

**Efeito**: Gradiente diagonal de azul claro para azul escuro, criando profundidade visual.

### Hero Pattern (Overlay)

```css
background-image: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
```

**Aplicação**: `.hero-pattern`

**Efeito**: Cria padrão sutil com círculos radiais brancos semi-transparentes para adicionar textura ao hero.

### Card Icon Gradient

```css
background: linear-gradient(135deg, #2563EB, #3B82F6);
```

**Aplicação**: `.card-icon`, `.step-number`

**Efeito**: Gradiente azul para ícones de cards e números de passos.

### CTA Section Gradient

```css
background: linear-gradient(135deg, #2563EB 0%, #0F172A 100%);
```

**Aplicação**: `.cta-section`

**Efeito**: Mesmo gradiente do hero para manter consistência visual.

### Pricing Card Free Gradient

```css
background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
```

**Aplicação**: `.pricing-card-free`

**Efeito**: Gradiente sutil de branco para verde muito claro, destacando o plano gratuito.

---

## 🎬 Animações CSS

### Fade In Up

```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in-up {
    animation: fadeInUp 0.6s ease-out;
}
```

**Uso**: Elementos que aparecem ao carregar a página

**Duração**: 0.6s

**Easing**: `ease-out`

**Efeito**: Elemento aparece de baixo para cima com fade-in suave.

---

## 🔄 Transições e Hover Effects

### Navbar

#### Transição de Scroll
```css
.navbar {
    transition: all 0.3s ease;
}

.navbar.scrolled {
    background: rgba(15, 23, 42, 0.98) !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
```

**Efeito**: Navbar muda de cor e sombra ao fazer scroll (via JavaScript).

#### Nav Link Hover
```css
.nav-link {
    transition: color 0.3s ease;
}

.nav-link:hover {
    color: #2563EB !important;
}
```

**Duração**: 0.3s

**Efeito**: Cor do link muda suavemente para azul primário.

### Botões

#### Botão Primary
```css
.btn-primary {
    transition: all 0.3s ease;
}

.btn-primary:hover {
    background: #1d4ed8;
    transform: scale(1.05);
}
```

**Duração**: 0.3s

**Efeito**: Escurece e aumenta ligeiramente (5%) ao passar o mouse.

#### Botão Outline Light
```css
.btn-outline-light {
    transition: all 0.3s ease;
}

.btn-outline-light:hover {
    background: white;
    color: #2563EB !important;
    transform: scale(1.05);
}
```

**Duração**: 0.3s

**Efeito**: Preenche com branco, muda cor do texto e aumenta 5%.

#### Botão Success (WhatsApp)
```css
.btn-success {
    transition: all 0.3s ease;
}

.btn-success:hover {
    background: #20ba5a;
    transform: translateY(-2px);
}
```

**Duração**: 0.3s

**Efeito**: Escurece e sobe 2px (efeito de elevação).

#### Botão Light
```css
.btn-light {
    transition: all 0.3s ease;
}

.btn-light:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}
```

**Duração**: 0.3s

**Efeito**: Aumenta 5% e adiciona sombra.

### Cards

#### Card Custom
```css
.card-custom {
    transition: all 0.3s ease;
}

.card-custom:hover {
    transform: translateY(-8px);
    box-shadow: 0 18px 40px rgba(0,0,0,0.12);
}
```

**Duração**: 0.3s

**Efeito**: Card sobe 8px e sombra aumenta, criando efeito de elevação.

#### Pricing Card
```css
.pricing-card {
    transition: all 0.3s ease;
}

.pricing-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 18px 40px rgba(0,0,0,0.12);
}
```

**Duração**: 0.3s

**Efeito**: Mesmo efeito de elevação dos cards custom.

**Nota**: Cards `.featured` têm `transform: scale(1.03)` por padrão.

### Hero Image Wrapper

```css
.hero-image-wrapper {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}
```

**Efeito**: Glassmorphism com blur de 10px, criando efeito de vidro fosco.

---

## ⚡ Efeitos JavaScript

### Navbar Scroll Effect

```javascript
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});
```

**Comportamento**:
- Quando scroll > 50px: adiciona classe `.scrolled`
- Navbar muda para fundo escuro (`rgba(15, 23, 42, 0.98)`)
- Texto muda para branco
- Sombra aumenta

**Transição**: 0.3s ease (via CSS)

### Smooth Scroll

```javascript
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#top') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80; // Altura da navbar
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});
```

**Comportamento**:
- Links com `href="#..."` fazem scroll suave
- Offset de 80px para compensar navbar fixa
- Usa `behavior: 'smooth'` nativo do browser

---

## 🎯 Componentes Visuais

### Hero Section

**Estrutura**:
- Background: Gradiente azul (`linear-gradient(135deg, #2563EB 0%, #0F172A 100%)`)
- Pattern overlay: Círculos radiais brancos semi-transparentes
- Conteúdo: Texto branco, botões com hover effects
- Imagem: Container com glassmorphism (`backdrop-filter: blur(10px)`)

**Animações**:
- Fade-in ao carregar
- Hover nos botões (scale + cor)

### Cards de Funcionalidades

**Estrutura**:
- Background: Branco
- Ícone: Gradiente azul circular
- Hover: Elevação (-8px) + sombra aumentada

**Cores**:
- Título: `#0F172A` (secondary)
- Texto: `#64748B` (cinza)
- Ícone: Gradiente azul

### Cards de Preço

**Estrutura**:
- Background: Branco
- Border: 2px solid (primary para featured, verde para free)
- Badge: Verde (`#10B981`) no topo
- Hover: Elevação (-8px) + sombra

**Cores Especiais**:
- **Featured**: Border azul, escala 1.03
- **Free**: Border verde, background gradiente verde claro, preço verde

### CTA Section

**Estrutura**:
- Background: Gradiente azul (mesmo do hero)
- Texto: Branco
- Botões: Light e Outline Light
- Border-radius: 24px

---

## 📐 Especificações Técnicas

### Timing Functions

```css
/* Padrão para a maioria dos elementos */
transition: all 0.3s ease;

/* Animações de entrada */
animation: fadeInUp 0.6s ease-out;
```

### Transformações

```css
/* Scale (aumentar) */
transform: scale(1.05);        /* Botões hover */

/* TranslateY (mover verticalmente) */
transform: translateY(-8px);  /* Cards hover */
transform: translateY(-2px);  /* Botões hover */
transform: translateY(30px);  /* Fade-in inicial */
```

### Sombras

```css
/* Navbar normal */
box-shadow: 0 2px 10px rgba(0,0,0,0.05);

/* Navbar scrolled */
box-shadow: 0 4px 20px rgba(0,0,0,0.15);

/* Cards normal */
box-shadow: 0 10px 25px rgba(0,0,0,0.08);

/* Cards hover */
box-shadow: 0 18px 40px rgba(0,0,0,0.12);

/* Hero image wrapper */
box-shadow: 0 20px 60px rgba(0,0,0,0.3);

/* Hero stats card */
box-shadow: 0 10px 40px rgba(0,0,0,0.2);
```

### Backdrop Filter (Glassmorphism)

```css
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
```

**Aplicação**: Navbar, hero image wrapper

---

## 🎨 Guia de Uso

### Adicionar Nova Cor

1. **Definir no `:root`**:
```css
:root {
    --nova-cor: #HEX;
}
```

2. **Usar em elementos**:
```css
.meu-elemento {
    color: var(--nova-cor);
}
```

### Criar Nova Animação

1. **Definir keyframes**:
```css
@keyframes minhaAnimacao {
    from { /* estado inicial */ }
    to { /* estado final */ }
}
```

2. **Aplicar**:
```css
.elemento {
    animation: minhaAnimacao 0.6s ease-out;
}
```

### Adicionar Hover Effect

```css
.elemento {
    transition: all 0.3s ease;
}

.elemento:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}
```

### Criar Gradiente

```css
.gradiente {
    background: linear-gradient(135deg, #cor1 0%, #cor2 100%);
}
```

---

## 📊 Resumo de Cores

| Elemento | Cor | Hex | Uso |
|----------|-----|-----|-----|
| Primary | Azul | `#2563EB` | Botões, links, gradientes |
| Secondary | Azul Escuro | `#0F172A` | Títulos, footer, hero |
| Accent | Verde | `#10B981` | Destaques, badges |
| Background | Cinza Claro | `#F8FAFC` | Fundo principal |
| Texto | Cinza Escuro | `#1E293B` | Texto padrão |
| Texto Secundário | Cinza Médio | `#64748B` | Subtítulos |
| WhatsApp | Verde | `#25d366` | Botão WhatsApp |

---

## 🎬 Resumo de Animações

| Animação | Duração | Easing | Efeito |
|----------|---------|--------|--------|
| Fade In Up | 0.6s | ease-out | Aparece de baixo |
| Hover Botões | 0.3s | ease | Scale 1.05 |
| Hover Cards | 0.3s | ease | TranslateY -8px |
| Navbar Scroll | 0.3s | ease | Muda cor/fundo |
| Smooth Scroll | - | smooth | Scroll suave |

---

## 🔧 Customização Rápida

### Alterar Cor Primária

```css
:root {
    --primary: #SUA_COR;
}
```

### Alterar Velocidade das Animações

```css
/* Mais rápido */
transition: all 0.2s ease;

/* Mais lento */
transition: all 0.5s ease;
```

### Alterar Intensidade do Hover

```css
/* Mais sutil */
transform: translateY(-4px);

/* Mais intenso */
transform: translateY(-12px);
```

---

**Versão**: 1.0.0  
**Última Atualização**: 2024  
**Arquivo**: `index.html`  
**CSS**: Inline styles + `assets/css/style.css`
