# 📘 Documentação Completa - Front-End Index.html

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Paleta de Cores](#paleta-de-cores)
3. [Tipografia](#tipografia)
4. [Estrutura da Página](#estrutura-da-página)
5. [Componentes Detalhados](#componentes-detalhados)
6. [Responsividade](#responsividade)
7. [Funcionalidades JavaScript](#funcionalidades-javascript)
8. [Animações e Transições](#animações-e-transições)

---

## 🎯 Visão Geral

O `index.html` é a página inicial (landing page) do Estocx, uma plataforma de gestão de estoque de veículos. A página é totalmente responsiva e utiliza Bootstrap 5 como framework base.

**Tecnologias Utilizadas:**
- HTML5
- CSS3 (Inline + Externo)
- JavaScript (Vanilla)
- Bootstrap 5.3.3
- Bootstrap Icons 1.11.1
- Google Fonts (Montserrat + Inter)

**Estrutura de Arquivos:**
- `index.html` - Página principal
- `assets/css/style.css` - Estilos globais
- `assets/js/config.js` - Configuração da API
- `assets/js/landing-plans.js` - Carregamento dinâmico de planos
- `assets/js/mobile.js` - Funcionalidades mobile
- `assets/js/main.js` - Scripts principais

---

## 🎨 Paleta de Cores

### Cores Principais (Variáveis CSS)

```css
:root {
    --primary: #2563EB;      /* Azul primário - Botões, links, destaques */
    --secondary: #0F172A;    /* Azul escuro - Textos, footer, navbar scrolled */
    --accent: #10B981;       /* Verde - Badges, ícones de sucesso */
    --bg: #F8FAFC;           /* Cinza claro - Background da página */
}
```

### Cores Específicas por Componente

#### Navbar
- **Background padrão:** `rgba(255, 255, 255, 0.95)` - Branco com 95% de opacidade
- **Background scrolled:** `rgba(15, 23, 42, 0.98)` - Azul escuro com 98% de opacidade
- **Brand (logo):** `#2563EB` (--primary) / `white` quando scrolled
- **Links:** `#475569` (padrão) / `white` quando scrolled
- **Links hover:** `#2563EB` (--primary) / `#10B981` (--accent) quando scrolled
- **Sombra padrão:** `0 2px 10px rgba(0,0,0,0.05)`
- **Sombra scrolled:** `0 4px 20px rgba(0,0,0,0.15)`

#### Hero Section
- **Background:** `linear-gradient(135deg, #2563EB 0%, #0F172A 100%)`
- **Texto:** `white`
- **Padrão de fundo:** Gradientes radiais brancos com opacidade (0.1, 0.1, 0.05)

#### Botões
- **btn-primary:**
  - Background: `#2563EB` (--primary)
  - Hover: `#1d4ed8`
  - Padding: `0.75rem 2rem`
  - Border-radius: `12px`
  - Font-weight: `600`

- **btn-light:**
  - Background: `white`
  - Color: `#2563EB` (--primary)
  - Hover: Transform `scale(1.05)`, sombra `0 10px 25px rgba(0,0,0,0.15)`

- **btn-outline-light:**
  - Border: `2px solid white`
  - Hover: Background `white`, color `#2563EB`

- **btn-success (WhatsApp):**
  - Background: `#25d366`
  - Hover: `#20ba5a`
  - Border-radius: `25px`

#### Cards de Funcionalidades
- **Background:** `white`
- **Border-radius:** `18px`
- **Box-shadow:** `0 10px 25px rgba(0,0,0,0.08)`
- **Hover:** Transform `translateY(-8px)`, sombra `0 18px 40px rgba(0,0,0,0.12)`
- **Ícone background:** `linear-gradient(135deg, #2563EB, #3B82F6)`
- **Ícone tamanho:** `64px x 64px`
- **Ícone border-radius:** `16px`

#### Cards de Planos
- **Background:** `white`
- **Border-radius:** `18px`
- **Padding:** `2.5rem` (desktop) / `2rem 1.5rem` (tablet) / `2.5rem 2rem` (XL)
- **Box-shadow:** `0 10px 30px rgba(0,0,0,0.1)`
- **Featured (destaque):** Border `2px solid #2563EB`, transform `scale(1.03)`
- **Free (grátis):** Border `2px solid #10B981`, background `linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)`
- **Badge:** Background `#10B981` (--accent), color `white`, border-radius `25px`

#### Footer
- **Background:** `#0F172A` (--secondary)
- **Text:** `white`
- **Links:** `rgba(255, 255, 255, 0.7)`
- **Links hover:** `white`

---

## 📝 Tipografia

### Fontes

**Família Principal (Body):**
- `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Font-weight: `300, 400, 500, 600`
- Line-height: `1.6`

**Família Títulos:**
- `'Montserrat', sans-serif`
- Font-weight: `600, 700, 800`

### Tamanhos de Fonte

#### Títulos
- **Hero Title:** `3.5rem` (desktop) / `2.5rem` (mobile)
- **Hero Subtitle:** `1.25rem` (desktop) / `1.125rem` (mobile)
- **Section Title:** `2.5rem` (desktop) / `2rem` (mobile)
- **Section Subtitle:** `1.125rem`
- **Card Title:** `1.25rem`
- **Step Title:** `1.5rem`
- **CTA Title:** `2.5rem` (desktop) / `2rem` (mobile)
- **Footer Title:** `1.125rem`

#### Textos
- **Body:** `1rem` (padrão)
- **Card Text:** `1rem`, color `#64748B`
- **Step Description:** `1rem`, color `#64748B`, line-height `1.7`
- **Nav Links:** `1rem`, font-weight `500`
- **Brand (Logo):** `1.5rem`, font-weight `700`

#### Preços
- **Pricing Price:** `2.25rem` (desktop) / `2rem` (tablet)
- **Pricing Price Free:** `2.5rem` (desktop) / `2.25rem` (tablet)
- **Font-weight:** `800`

---

## 🏗️ Estrutura da Página

### 1. Navbar (Navegação Superior)

**Posição:** `fixed-top`
**Z-index:** Padrão do Bootstrap
**Altura:** Variável (conteúdo)

#### Elementos:
1. **Brand (Logo)**
   - Ícone: `bi-car-front`, tamanho `fs-4`
   - Texto: "Estocx"
   - Font-family: Montserrat, font-weight: 700, font-size: 1.5rem
   - Color: `#2563EB` (padrão) / `white` (scrolled)

2. **Menu de Navegação**
   - Links: Home, Sobre, Funcionalidades, Planos, Contato
   - Color: `#475569` (padrão) / `white` (scrolled)
   - Padding: `0.5rem 1rem`
   - Font-weight: `500`
   - Hover: `#2563EB` (padrão) / `#10B981` (scrolled)

3. **Botão WhatsApp**
   - Background: `#25d366`
   - Tamanho: `btn-sm`
   - Ícone: `bi-whatsapp`
   - Link: `https://wa.me/5544988558293`

4. **Botão Entrar**
   - Link para: `login.html`
   - Estilo: `nav-link`

5. **Botão Começar Agora**
   - Link para: `cadastro.html`
   - Estilo: `btn btn-primary btn-sm`

**Comportamento:**
- Ao scroll > 50px: Adiciona classe `scrolled`
- Backdrop-filter: `blur(10px)`
- Transição: `all 0.3s ease`

---

### 2. Hero Section

**ID:** `#top`
**Classe:** `hero-section`
**Altura mínima:** `90vh`
**Padding-top:** `100px` (compensar navbar fixa)

#### Layout:
- **Container:** Bootstrap container
- **Grid:** `row align-items-center`
- **Colunas:** `col-lg-6` cada (50% desktop)

#### Coluna Esquerda (Conteúdo):

1. **Título Principal**
   - Texto: "Gerencie seu estoque de veículos com facilidade"
   - Classe: `hero-title`
   - Font-size: `3.5rem` (desktop) / `2.5rem` (mobile)
   - Font-weight: `800`
   - Line-height: `1.2`
   - Margin-bottom: `1.5rem`
   - Color: `white`

2. **Subtítulo**
   - Texto: "A plataforma completa para lojas de veículos..."
   - Classe: `hero-subtitle`
   - Font-size: `1.25rem` (desktop) / `1.125rem` (mobile)
   - Line-height: `1.6`
   - Margin-bottom: `2rem`
   - Opacity: `0.95`
   - Color: `white`

3. **Botões de Ação**
   - Container: `d-flex flex-column flex-sm-row gap-3 mb-4`
   - Botão 1: "Criar Conta Grátis" → `cadastro.html`
     - Estilo: `btn btn-light btn-lg`
   - Botão 2: "Ver Demonstração" → `loja.html?store_slug=demo`
     - Estilo: `btn btn-outline-light btn-lg`

4. **Features (Lista de Benefícios)**
   - Container: `hero-features`
   - Display: `flex`, `flex-wrap`, gap: `2rem`
   - Itens:
     - "Sem taxa de setup"
     - "Suporte dedicado"
     - "Cancele quando quiser"
   - Ícone: `bi-check-circle-fill`, tamanho `1.25rem`, color `#10B981`
   - Font-size: `1rem`

#### Coluna Direita (Imagem):

1. **Container de Imagem**
   - Classe: `hero-image-container`
   - Position: `relative`

2. **Wrapper da Imagem**
   - Classe: `hero-image-wrapper`
   - Background: `rgba(255, 255, 255, 0.1)`
   - Backdrop-filter: `blur(10px)`
   - Border-radius: `18px`
   - Padding: `1.5rem`
   - Box-shadow: `0 20px 60px rgba(0,0,0,0.3)`

3. **Imagem Principal**
   - ID: `heroImage`
   - Src: `./public/imageReal.png`
   - Alt: "Dashboard de gestão de veículos"
   - Classe: `img-fluid`
   - Loading: `eager`
   - Style: `max-width: 100%; height: auto; display: block;`
   - Border-radius: `12px`

4. **Fallback da Imagem**
   - ID: `heroImageFallback`
   - Display: `none` (inicialmente)
   - Background: `linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)`
   - Min-height: `400px`
   - Border-radius: `12px`
   - Ícone: `bi-speedometer2`, tamanho `4rem`
   - Texto: "Estocx Dashboard"

5. **Card de Estatísticas** (Desktop apenas)
   - Classe: `hero-stats-card`
   - Position: `absolute`
   - Bottom: `-20px`
   - Left: `-20px`
   - Background: `white`
   - Border-radius: `18px`
   - Padding: `1.5rem`
   - Box-shadow: `0 10px 40px rgba(0,0,0,0.2)`
   - Display: `none` (mobile) / `block` (desktop ≥992px)
   - Conteúdo: "500+ Lojas cadastradas"

**Padrão de Fundo:**
- Gradientes radiais brancos com opacidade
- Position: `absolute`, cobrindo toda a seção
- Pointer-events: `none`

---

### 3. Seção "Como Funciona"

**ID:** `#sobre`
**Classe:** `section how-it-works`
**Background:** `white`
**Padding:** `90px 0` (desktop) / `60px 0` (mobile)

#### Estrutura:

1. **Título da Seção**
   - Texto: "Como Funciona"
   - Classe: `section-title`
   - Font-size: `2.5rem` (desktop) / `2rem` (mobile)

2. **Subtítulo**
   - Texto: "Três passos simples para começar a vender mais"
   - Classe: `section-subtitle`
   - Font-size: `1.125rem`
   - Color: `#64748B`
   - Max-width: `700px`
   - Margin: `0 auto 4rem`

3. **Cards de Passos** (3 colunas)
   - Grid: `row g-4`
   - Colunas: `col-md-4` (33.33% cada)
   - Classe: `step-card`
   - Padding: `2rem`
   - Text-align: `center`

   **Cada Card contém:**
   - **Número do Passo**
     - Classe: `step-number`
     - Tamanho: `64px x 64px`
     - Border-radius: `50%` (círculo)
     - Background: `linear-gradient(135deg, #2563EB, #3B82F6)`
     - Color: `white`
     - Font-size: `1.5rem`
     - Font-weight: `700`
     - Margin: `0 auto 1.5rem`
     - Display: `flex`, centralizado

   - **Título do Passo**
     - Classe: `step-title`
     - Font-size: `1.5rem`
     - Font-weight: `700`
     - Margin-bottom: `1rem`
     - Color: `#0F172A` (--secondary)

   - **Descrição**
     - Classe: `step-description`
     - Color: `#64748B`
     - Line-height: `1.7`

   **Passos:**
   1. "Criar Conta" - Cadastro gratuito sem cartão
   2. "Configurar Loja" - Adicionar informações e cadastrar veículos
   3. "Publicar e Vender" - Publicar catálogo e receber leads

---

### 4. Seção "Funcionalidades"

**ID:** `#recursos`
**Classe:** `section`
**Background:** Padrão (herda do body: `#F8FAFC`)
**Padding:** `90px 0` (desktop) / `60px 0` (mobile)

#### Estrutura:

1. **Título da Seção**
   - Texto: "Tudo que você precisa para vender mais"
   - Classe: `section-title`

2. **Subtítulo**
   - Texto: "Ferramentas poderosas para gerenciar seu estoque..."
   - Classe: `section-subtitle`

3. **Grid de Cards** (6 funcionalidades)
   - Grid: `row g-4`
   - Colunas: `col-md-6 col-lg-4` (50% tablet, 33.33% desktop)
   - Classe: `card-custom p-4`

   **Cada Card contém:**
   - **Ícone**
     - Container: `card-icon`
     - Tamanho: `64px x 64px`
     - Border-radius: `16px`
     - Background: `linear-gradient(135deg, #2563EB, #3B82F6)`
     - Color: `white`
     - Font-size: `1.75rem`
     - Margin-bottom: `1.5rem`
     - Display: `flex`, centralizado

   - **Título**
     - Classe: `card-title`
     - Font-size: `1.25rem`
     - Font-weight: `700`
     - Margin-bottom: `1rem`
     - Color: `#0F172A` (--secondary)

   - **Texto**
     - Classe: `card-text`
     - Color: `#64748B`
     - Line-height: `1.7`

   **Funcionalidades:**
   1. **Gestão de Estoque** - Ícone: `bi-car-front`
   2. **Catálogo Online** - Ícone: `bi-globe`
   3. **Relatórios Detalhados** - Ícone: `bi-bar-chart`
   4. **100% Responsivo** - Ícone: `bi-phone`
   5. **Dados Seguros** - Ícone: `bi-shield-check`
   6. **Integração WhatsApp** - Ícone: `bi-lightning-charge`

---

### 5. Seção "Planos"

**ID:** `#planos`
**Classe:** `section bg-light`
**Background:** `#F8FAFC` (bg-light)
**Padding:** `90px 0` (desktop) / `60px 0` (mobile)

#### Estrutura:

1. **Título da Seção**
   - Texto: "Planos que cabem no seu bolso"
   - Classe: `section-title`

2. **Subtítulo**
   - Texto: "Teste grátis por 15 dias. Sem compromisso, cancele quando quiser."
   - Classe: `section-subtitle`

3. **Container de Planos**
   - ID: `plans-container`
   - Classe: `row g-4 justify-content-center`
   - **Carregamento:** Dinâmico via JavaScript (`landing-plans.js`)

#### Planos Carregados Dinamicamente:

**Plano Grátis** (apenas no index, não em planos.html):
- **Nome:** "Grátis"
- **Slug:** `gratis`
- **Preço:** `0` (exibido como "Grátis")
- **Badge:** "Grátis Para Sempre" (verde `#10B981`)
- **Features:**
  - Até 5 veículos
  - Catálogo com URL personalizada
  - Integração WhatsApp
- **Botão:** "Começar Grátis" → `cadastro.html?plan=gratis`
- **Estilo:** `pricing-card-free`, border verde

**Plano Mensal:**
- **Nome:** "Mensal"
- **Slug:** `profissional-mensal`
- **Preço:** `R$ 105,90/mês`
- **Features:**
  - Até 50 veículos
  - Catálogo com URL personalizada
  - Suporte prioritário
  - Relatórios avançados
  - Integração WhatsApp
  - Destaque nos anúncios
- **Link Stripe:** `https://buy.stripe.com/9B600daUv0IhaAofeTfjG03`
- **Botão:** "Começar Agora" (abre em nova aba)

**Plano Trimestral:**
- **Nome:** "Trimestral"
- **Slug:** `profissional-trimestral`
- **Preço:** `R$ 95,90/mês` (R$ 287,70 total)
- **Badge:** "Mais Popular" (azul `#2563EB`)
- **Economia:** R$ 10,00/mês (9,4% de desconto)
- **Features:** Mesmas do Mensal
- **Link Stripe:** `https://buy.stripe.com/5kQdR31jV4Yx8sgfeTfjG04`
- **Estilo:** `featured` (destaque)

**Plano Anual:**
- **Nome:** "Anual"
- **Slug:** `profissional-anual`
- **Preço:** `R$ 85,90/mês` (R$ 1.030,80 total)
- **Economia:** R$ 20,00/mês (18,9% de desconto)
- **Features:** Mesmas do Mensal
- **Link Stripe:** `https://buy.stripe.com/5kQdR31jV4Yx8sgfeTfjG04`

#### Estrutura do Card de Plano:

```html
<div class="col-md-6 col-lg-3"> <!-- 4 planos no index -->
  <div class="pricing-card [featured/free]">
    <!-- Badge (se aplicável) -->
    <div class="pricing-badge">...</div>
    
    <!-- Título -->
    <h3 class="pricing-title">Nome do Plano</h3>
    
    <!-- Preço -->
    <div class="pricing-price">
      R$ [preço]/mês
    </div>
    
    <!-- Período/Economia -->
    <p class="pricing-period">...</p>
    
    <!-- Features -->
    <ul class="pricing-features">
      <li><i class="bi bi-check-circle-fill"></i> Feature</li>
    </ul>
    
    <!-- Botão -->
    <a href="[link]" class="btn btn-primary">Começar Agora</a>
  </div>
</div>
```

**Layout Desktop:**
- 4 colunas: `col-lg-3` (25% cada)
- Max-width: `25%` por card

**Layout Mobile:**
- 2 colunas: `col-md-6` (50% cada)
- Featured: `transform: scale(1)` (sem destaque visual)

---

### 6. Seção CTA Final

**Classe:** `section`
**Padding:** `90px 0` (desktop) / `60px 0` (mobile)

#### Container CTA:
- **Classe:** `cta-section text-center`
- **Background:** `linear-gradient(135deg, #2563EB 0%, #0F172A 100%)`
- **Color:** `white`
- **Border-radius:** `24px`
- **Padding:** `4rem 2rem`
- **Margin:** `4rem 0`

#### Conteúdo:

1. **Título**
   - Texto: "Pronto para digitalizar sua loja de veículos?"
   - Classe: `cta-title`
   - Font-size: `2.5rem` (desktop) / `2rem` (mobile)
   - Font-weight: `800`
   - Margin-bottom: `1rem`

2. **Subtítulo**
   - Texto: "Junte-se a centenas de lojas..."
   - Classe: `cta-subtitle`
   - Font-size: `1.25rem`
   - Margin-bottom: `2rem`
   - Opacity: `0.95`

3. **Botões**
   - Container: `d-flex flex-column flex-sm-row gap-3 justify-content-center`
   - Botão 1: "Criar Conta Grátis" → `cadastro.html`
     - Estilo: `btn btn-light btn-lg`
   - Botão 2: "Falar com Vendas" → `#contato`
     - Estilo: `btn btn-outline-light btn-lg`

---

### 7. Footer

**ID:** `#contato`
**Classe:** `bg-dark text-white`
**Background:** `#0F172A` (--secondary)
**Padding:** `4rem 0 2rem`
**Color:** `white`

#### Estrutura:

**Grid:** `row g-4` (4 colunas desktop)

**Coluna 1 - Brand:**
- Logo: Ícone `bi-car-front`, tamanho `fs-4`
- Texto: "Estocx", tamanho `fs-5`, font-weight `700`
- Descrição: "A plataforma completa para gestão de estoque de veículos."
- Color: `text-white-50` (rgba(255, 255, 255, 0.7))

**Coluna 2 - Produto:**
- Título: "Produto" (classe `footer-title`)
- Links:
  - Recursos → `#recursos`
  - Planos → `#planos`
  - Demonstração → `loja.html?store_slug=demo`

**Coluna 3 - Empresa:**
- Título: "Empresa"
- Links:
  - Sobre Nós → `#sobre`
  - Blog → `#`
  - Contato → `#contato`

**Coluna 4 - Legal:**
- Título: "Legal"
- Links:
  - Termos de Uso → `#`
  - Privacidade → `#`

**Rodapé:**
- HR: `my-4 opacity-25`
- Texto: "© 2024 Estocx. Todos os direitos reservados."
- Color: `text-white-50`

**Estilos dos Links:**
- Color: `rgba(255, 255, 255, 0.7)`
- Hover: `white`
- Transition: `color 0.3s ease`
- Text-decoration: `none`

---

## 📱 Responsividade

### Breakpoints

#### Desktop (≥992px)
- Planos: 4 colunas (`col-lg-3`)
- Funcionalidades: 3 colunas (`col-lg-4`)
- Como Funciona: 3 colunas (`col-md-4`)
- Hero Stats Card: Visível
- Pricing Card Featured: `scale(1.02)`

#### Tablet (768px - 991px)
- Planos: 2 colunas (`col-md-6`)
- Funcionalidades: 2 colunas (`col-md-6`)
- Hero Stats Card: Oculto

#### Mobile (<768px)
- **Hero Title:** `2.5rem`
- **Hero Subtitle:** `1.125rem`
- **Section Title:** `2rem`
- **Section Padding:** `60px 0`
- **CTA Title:** `2rem`
- **Pricing Card Featured:** `scale(1)`, `margin-top: 2rem`
- **Hero Image:**
  - Margin-top: `2rem`
  - Padding wrapper: `1rem`
  - Display: `block !important`
  - Visibility: `visible !important`
  - Opacity: `1 !important`

### Ajustes Específicos

#### Planos (Desktop XL ≥1400px)
- Padding dos cards: `2.5rem 2rem`

#### Planos (Tablet ≤1200px)
- Preço: `2rem`
- Preço Free: `2.25rem`

---

## ⚙️ Funcionalidades JavaScript

### 1. Carregamento de Planos (`landing-plans.js`)

**Função Principal:** `loadPlans()`

**Fluxo:**
1. Verifica se está em `planos.html`
2. Faz requisição para `${API_URL}/plans`
3. Se sucesso: Filtra e exibe planos
4. Se erro: Usa planos fallback estáticos

**Planos Fallback:**
- Mensal: R$ 105,90
- Trimestral: R$ 287,70 (R$ 95,90/mês)
- Anual: R$ 1.030,80 (R$ 85,90/mês)

**Função de Exibição:** `displayPlans(plans, isPlanosPage)`

**Lógica de Preços:**
- Mensal: Valor cheio, sem desconto
- Trimestral: Divide por 3, calcula economia vs mensal
- Anual: Divide por 12, calcula economia vs mensal

**Referência de Preço:** R$ 105,90/mês (plano mensal)

### 2. Navbar Scroll Effect

**Script:** Inline no `index.html`

**Comportamento:**
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

**Efeitos ao scroll:**
- Background muda para azul escuro
- Textos ficam brancos
- Sombra aumenta
- Transição suave

### 3. Smooth Scroll

**Script:** Inline no `index.html`

**Comportamento:**
- Intercepta cliques em links `href^="#"`
- Previne comportamento padrão
- Calcula posição com offset de 80px (altura navbar)
- Scroll suave com `behavior: 'smooth'`

### 4. Carregamento de Imagem Hero

**Funções:**
- `handleImageError(img)` - Exibe fallback se imagem falhar
- `ensureImageLoads()` - Tenta múltiplos caminhos

**Caminhos testados:**
1. `./public/imageReal.png`
2. `public/imageReal.png`
3. `/public/imageReal.png`
4. URL absoluta completa

**Fallback:**
- Gradiente azul
- Ícone `bi-speedometer2`
- Texto "Estocx Dashboard"

---

## 🎬 Animações e Transições

### Transições Gerais

**Duração padrão:** `0.3s ease`

**Elementos com transição:**
- Navbar: `all 0.3s ease`
- Botões: `all 0.3s ease`
- Cards: `all 0.3s ease`
- Links: `color 0.3s ease`

### Animações

**fadeInUp:**
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
```
- Duração: `0.6s ease-out`
- Aplicada via classe: `fade-in-up`

### Efeitos Hover

**Botões:**
- `btn-primary`: `scale(1.05)`
- `btn-light`: `scale(1.05)` + sombra
- `btn-outline-light`: Background branco + cor primária
- `btn-success`: `translateY(-2px)`

**Cards:**
- `card-custom`: `translateY(-8px)` + sombra aumentada
- `pricing-card`: Sem transform (apenas sombra)

**Links:**
- Navbar: Mudança de cor
- Footer: `rgba(255,255,255,0.7)` → `white`

---

## 📊 Especificações Técnicas

### Espaçamentos

**Padding:**
- Sections: `90px 0` (desktop) / `60px 0` (mobile)
- Cards: `2.5rem` (desktop) / `2rem 1.5rem` (tablet)
- Hero wrapper: `1.5rem`
- Navbar links: `0.5rem 1rem`
- Botões: `0.75rem 2rem`

**Margin:**
- Section subtitle: `0 auto 4rem`
- Hero title: `0 0 1.5rem`
- Hero subtitle: `0 0 2rem`
- Card icon: `0 0 1.5rem`
- Card title: `0 0 1rem`

**Gap:**
- Hero features: `2rem`
- Botões: `gap-3` (1rem)
- Grid: `g-4` (1.5rem)

### Bordas e Raios

**Border-radius:**
- Cards: `18px`
- Botões primários: `12px`
- Botão WhatsApp: `25px`
- Badges: `25px`
- Ícones: `16px` (quadrados) / `50%` (círculos)
- Hero image wrapper: `18px`
- Hero image: `12px`
- CTA section: `24px`

**Borders:**
- Pricing featured: `2px solid #2563EB`
- Pricing free: `2px solid #10B981`
- Outline light: `2px solid white`

### Sombras

**Box-shadow:**
- Navbar padrão: `0 2px 10px rgba(0,0,0,0.05)`
- Navbar scrolled: `0 4px 20px rgba(0,0,0,0.15)`
- Cards custom: `0 10px 25px rgba(0,0,0,0.08)`
- Cards custom hover: `0 18px 40px rgba(0,0,0,0.12)`
- Pricing cards: `0 10px 30px rgba(0,0,0,0.1)`
- Hero image wrapper: `0 20px 60px rgba(0,0,0,0.3)`
- Hero stats card: `0 10px 40px rgba(0,0,0,0.2)`
- Botão light hover: `0 10px 25px rgba(0,0,0,0.15)`

### Z-index

- Navbar: Padrão Bootstrap (geralmente 1030)
- Hero pattern: `z-index: 2`
- Hero content: `z-index: 2`
- Hero stats card: Posicionado absolutamente

---

## 🔧 Scripts Carregados

### Ordem de Carregamento:

1. **Bootstrap 5.3.3 JS** (CDN)
2. **config.js** - Define `API_URL`
3. **landing-plans.js** - Carrega planos dinamicamente
4. **mobile.js** - Funcionalidades mobile
5. **main.js** - Scripts principais

### Scripts Inline:

1. **Diagnóstico de Recursos**
   - Verifica carregamento de CSS
   - Verifica carregamento de imagem hero
   - Função `handleImageError`
   - Função `ensureImageLoads`

2. **Navbar Scroll Effect**
   - Adiciona classe `scrolled` ao scroll > 50px

3. **Smooth Scroll**
   - Intercepta links âncora
   - Scroll suave com offset

---

## 📐 Grid System (Bootstrap)

### Breakpoints Bootstrap:
- `xs`: <576px
- `sm`: ≥576px
- `md`: ≥768px
- `lg`: ≥992px
- `xl`: ≥1200px
- `xxl`: ≥1400px

### Uso no Index:

**Hero Section:**
- `col-lg-6` (50% desktop)

**Como Funciona:**
- `col-md-4` (33.33% tablet+)

**Funcionalidades:**
- `col-md-6 col-lg-4` (50% tablet, 33.33% desktop)

**Planos:**
- `col-md-6 col-lg-3` (50% tablet, 25% desktop)

---

## 🎯 IDs e Classes Importantes

### IDs:
- `#navbar` - Navbar principal
- `#top` - Hero section (âncora)
- `#sobre` - Seção Como Funciona
- `#recursos` - Seção Funcionalidades
- `#planos` - Seção Planos
- `#contato` - Footer
- `#plans-container` - Container dos planos
- `#heroImage` - Imagem do hero
- `#heroImageFallback` - Fallback da imagem

### Classes Principais:
- `.navbar` - Navbar
- `.hero-section` - Hero
- `.section` - Seções gerais
- `.section-title` - Títulos de seção
- `.section-subtitle` - Subtítulos
- `.card-custom` - Cards de funcionalidades
- `.pricing-card` - Cards de planos
- `.pricing-card.featured` - Plano em destaque
- `.pricing-card-free` - Plano grátis
- `.cta-section` - Seção CTA final

---

## 📱 Comportamento Mobile

### Navbar Mobile:
- Menu hamburger (Bootstrap collapse)
- Links empilhados verticalmente
- Botões mantêm tamanho

### Hero Mobile:
- Título reduzido para `2.5rem`
- Subtítulo reduzido para `1.125rem`
- Imagem com margin-top `2rem`
- Stats card oculto

### Seções Mobile:
- Padding reduzido: `60px 0`
- Títulos reduzidos: `2rem`
- Cards em 1-2 colunas

### Planos Mobile:
- Featured sem destaque visual
- Cards em 2 colunas
- Preços ajustados

---

## 🔗 Links e Navegação

### Links Internos (Âncoras):
- `#top` - Hero section
- `#sobre` - Como Funciona
- `#recursos` - Funcionalidades
- `#planos` - Planos
- `#contato` - Footer

### Links Externos:
- WhatsApp: `https://wa.me/5544988558293`
- Login: `login.html`
- Cadastro: `cadastro.html`
- Demonstração: `loja.html?store_slug=demo`

### Links Stripe (Planos):
- Mensal: `https://buy.stripe.com/9B600daUv0IhaAofeTfjG03`
- Trimestral: `https://buy.stripe.com/5kQdR31jV4Yx8sgfeTfjG04`
- Anual: `https://buy.stripe.com/5kQdR31jV4Yx8sgfeTfjG04`

---

## 🎨 Estados Visuais

### Estados dos Botões:

**Normal:**
- Background conforme tipo
- Sem transformação

**Hover:**
- `btn-primary`: Background escurece, `scale(1.05)`
- `btn-light`: `scale(1.05)` + sombra
- `btn-outline-light`: Background branco, cor primária
- `btn-success`: Background escurece, `translateY(-2px)`

**Active:**
- Estados padrão do Bootstrap

### Estados dos Cards:

**Normal:**
- Sombra padrão
- Sem transformação

**Hover:**
- `translateY(-8px)`
- Sombra aumentada
- Transição suave

### Estados da Navbar:

**Normal:**
- Background branco translúcido
- Textos coloridos

**Scrolled:**
- Background azul escuro
- Textos brancos
- Sombra aumentada

---

## 📦 Dependências Externas

### CDN Links:

**Bootstrap 5.3.3:**
- CSS: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css`
- JS: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js`

**Bootstrap Icons 1.11.1:**
- CSS: `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css`

**Google Fonts:**
- Montserrat: `wght@600;700;800`
- Inter: `wght@300;400;500;600`
- URL: `https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap`

---

## 🔍 Detalhes de Implementação

### Meta Tags:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="A plataforma completa para lojas de veículos...">
```

### Viewport:
- `width=device-width` - Largura do dispositivo
- `initial-scale=1.0` - Zoom inicial 100%

### Acessibilidade:

- Alt text em todas as imagens
- Labels descritivos
- Navegação por teclado (Bootstrap)
- Contraste adequado (WCAG)

### Performance:

- Imagem hero: `loading="eager"` (carrega imediatamente)
- Scripts: Carregados no final do body
- CSS: Inline crítico + externo
- Fontes: Google Fonts com `display=swap`

---

## 📝 Notas Finais

### Características Especiais:

1. **Navbar Transparente:** Efeito glassmorphism com backdrop-filter
2. **Hero Gradient:** Gradiente azul vibrante
3. **Planos Dinâmicos:** Carregados via API com fallback
4. **Smooth Scroll:** Navegação suave entre seções
5. **Responsive First:** Mobile-first approach
6. **Fallback de Imagem:** Sistema robusto de fallback

### Melhorias Implementadas:

- ✅ Carregamento otimizado de imagens
- ✅ Múltiplos caminhos de fallback
- ✅ Tratamento de erros robusto
- ✅ Animações suaves
- ✅ Acessibilidade básica
- ✅ Performance otimizada

---

**Última Atualização:** 2024
**Versão do Documento:** 1.0
