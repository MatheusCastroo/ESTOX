# 📚 Documentação Completa do Front-End da Loja

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Tecnologias e Dependências](#tecnologias-e-dependências)
5. [Páginas e Rotas](#páginas-e-rotas)
6. [Componentes Principais](#componentes-principais)
7. [Design System](#design-system)
8. [Funcionalidades](#funcionalidades)
9. [Integração com API](#integração-com-api)
10. [Responsividade](#responsividade)
11. [Guia de Desenvolvimento](#guia-de-desenvolvimento)

---

## 🎯 Visão Geral

O front-end da loja Estocx é composto por **duas versões principais**:

1. **Next.js App Router** (React/TypeScript) - Versão moderna e principal
2. **HTML Estático** (Bootstrap 5) - Versão alternativa para compatibilidade

Ambas as versões fornecem funcionalidades completas para:
- **Catálogo público de veículos** - Visualização e busca de veículos
- **Dashboard administrativo** - Gestão de estoque, veículos e relatórios
- **Autenticação** - Login, cadastro e recuperação de senha
- **Landing page** - Página inicial de apresentação da plataforma

---

## 🏗️ Arquitetura do Projeto

### Next.js App Router (Principal)

```
ESTOX/
├── app/                    # App Router do Next.js
│   ├── (auth)/            # Grupo de rotas de autenticação
│   ├── catalogo/          # Catálogo público
│   ├── dashboard/         # Área administrativa
│   ├── onboarding/        # Onboarding de novos usuários
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial (landing)
├── components/            # Componentes React reutilizáveis
│   ├── catalog/          # Componentes do catálogo
│   ├── dashboard/        # Componentes do dashboard
│   ├── landing/          # Componentes da landing page
│   └── ui/               # Componentes UI base (shadcn/ui)
├── lib/                   # Utilitários e helpers
├── hooks/                 # React hooks customizados
└── public/                # Arquivos estáticos
```

### HTML Estático (Alternativa)

```
ESTOX/
├── *.html                 # Páginas HTML estáticas
├── assets/
│   ├── css/              # Estilos CSS
│   └── js/               # Scripts JavaScript
└── public/               # Imagens e assets
```

---

## 📁 Estrutura de Pastas

### App Router (Next.js)

#### `/app` - Páginas e Rotas

| Pasta | Descrição | Rotas |
|-------|-----------|-------|
| `(auth)/` | Autenticação | `/login`, `/cadastro`, `/esqueci-senha`, `/cadastro-sucesso` |
| `catalogo/[slug]/` | Catálogo público | `/catalogo/{slug}`, `/catalogo/{slug}/{vehicleId}` |
| `dashboard/` | Área administrativa | `/dashboard`, `/dashboard/veiculos`, `/dashboard/relatorios`, `/dashboard/configuracoes` |
| `onboarding/` | Onboarding | `/onboarding` |
| `page.tsx` | Landing page | `/` |

#### `/components` - Componentes React

**Catalog Components** (`components/catalog/`)
- `catalog-header.tsx` - Cabeçalho do catálogo com logo e navegação
- `vehicle-card.tsx` - Card de veículo para grid
- `vehicle-detail.tsx` - Página de detalhes do veículo
- `vehicle-filters.tsx` - Filtros de busca (preço, marca, ano, etc.)
- `vehicle-grid.tsx` - Grid responsivo de veículos

**Dashboard Components** (`components/dashboard/`)
- `header.tsx` - Cabeçalho do dashboard
- `sidebar.tsx` - Menu lateral de navegação
- `stats-cards.tsx` - Cards de estatísticas
- `recent-vehicles.tsx` - Lista de veículos recentes
- `recent-leads.tsx` - Lista de leads recentes

**Landing Components** (`components/landing/`)
- `header.tsx` - Cabeçalho da landing page
- `hero.tsx` - Seção hero principal
- `features.tsx` - Seção de recursos
- `pricing.tsx` - Seção de planos
- `cta.tsx` - Call-to-action
- `footer.tsx` - Rodapé

**UI Components** (`components/ui/`)
- Componentes base do shadcn/ui (Button, Card, Input, etc.)
- 57 componentes UI reutilizáveis

#### `/lib` - Utilitários

- `utils.ts` - Funções utilitárias (cn, formatação, etc.)
- `mock-data.ts` - Dados mock para desenvolvimento
- `supabase/` - Cliente Supabase e helpers
- `actions/` - Server actions do Next.js
- `types/` - Definições de tipos TypeScript

#### `/hooks` - React Hooks

- `use-mobile.ts` - Hook para detectar dispositivos móveis
- `use-toast.ts` - Hook para notificações toast

### HTML Estático

#### Arquivos HTML Principais

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Landing page |
| `loja.html` | Catálogo público de veículos |
| `dashboard.html` | Dashboard administrativo |
| `veiculos.html` | Lista de veículos |
| `veiculo-detalhe.html` | Detalhes do veículo |
| `login.html` | Página de login |
| `cadastro.html` | Página de cadastro |
| `configuracoes.html` | Configurações da loja |
| `relatorios.html` | Relatórios e estatísticas |

#### Assets

**CSS** (`assets/css/`)
- `style.css` - Estilos globais e customizados

**JavaScript** (`assets/js/`)
- `config.js` - Configurações (API_URL, etc.)
- `loja.js` - Lógica do catálogo público
- `dashboard.js` - Lógica do dashboard
- `auth.js` - Autenticação
- `vehicles.js` - Gestão de veículos
- `mobile.js` - Utilitários mobile

---

## 🛠️ Tecnologias e Dependências

### Next.js (Principal)

**Framework:**
- Next.js 16.0.3 (App Router)
- React 19.2.0
- TypeScript 5

**Estilização:**
- Tailwind CSS 4.1.9
- Radix UI (componentes acessíveis)
- shadcn/ui (componentes UI)
- Lucide React (ícones)

**Formulários e Validação:**
- React Hook Form 7.60.0
- Zod 3.25.76
- @hookform/resolvers

**Autenticação:**
- Supabase (SSR)
- @supabase/ssr
- @supabase/supabase-js

**Outras Bibliotecas:**
- date-fns (manipulação de datas)
- recharts (gráficos)
- sonner (toast notifications)
- next-themes (tema dark/light)

### HTML Estático (Alternativa)

**Framework CSS:**
- Bootstrap 5.3.2

**Ícones:**
- Bootstrap Icons 1.11.1

**JavaScript:**
- Vanilla JavaScript (ES6+)
- Fetch API para requisições

---

## 📄 Páginas e Rotas

### Next.js App Router

#### Landing Page
- **Rota:** `/`
- **Arquivo:** `app/page.tsx`
- **Componentes:** Header, Hero, Features, Pricing, CTA, Footer
- **Descrição:** Página inicial de apresentação da plataforma

#### Autenticação

**Login**
- **Rota:** `/login`
- **Arquivo:** `app/(auth)/login/page.tsx`
- **Funcionalidades:** Login com email/senha, integração Supabase

**Cadastro**
- **Rota:** `/cadastro`
- **Arquivo:** `app/(auth)/cadastro/page.tsx`
- **Funcionalidades:** Formulário de cadastro, validação

**Esqueci Senha**
- **Rota:** `/esqueci-senha`
- **Arquivo:** `app/(auth)/esqueci-senha/page.tsx`
- **Funcionalidades:** Recuperação de senha

**Cadastro Sucesso**
- **Rota:** `/cadastro-sucesso`
- **Arquivo:** `app/(auth)/cadastro-sucesso/page.tsx`
- **Funcionalidades:** Confirmação de cadastro

#### Catálogo Público

**Lista de Veículos**
- **Rota:** `/catalogo/[slug]`
- **Arquivo:** `app/catalogo/[slug]/page.tsx`
- **Componentes:** CatalogHeader, VehicleFilters, VehicleGrid
- **Funcionalidades:** 
  - Busca e filtros (marca, modelo, preço, ano, etc.)
  - Ordenação (relevância, preço, ano)
  - Grid responsivo de veículos

**Detalhes do Veículo**
- **Rota:** `/catalogo/[slug]/[vehicleId]`
- **Arquivo:** `app/catalogo/[slug]/[vehicleId]/page.tsx`
- **Componentes:** VehicleDetail
- **Funcionalidades:** 
  - Galeria de imagens
  - Informações completas do veículo
  - Formulário de contato

#### Dashboard

**Dashboard Principal**
- **Rota:** `/dashboard`
- **Arquivo:** `app/dashboard/page.tsx`
- **Componentes:** DashboardHeader, StatsCards, RecentVehicles, RecentLeads
- **Funcionalidades:** 
  - Estatísticas gerais
  - Veículos recentes
  - Leads recentes

**Lista de Veículos**
- **Rota:** `/dashboard/veiculos`
- **Arquivo:** `app/dashboard/veiculos/page.tsx`
- **Funcionalidades:** Lista, busca e filtros de veículos

**Novo Veículo**
- **Rota:** `/dashboard/veiculos/novo`
- **Arquivo:** `app/dashboard/veiculos/novo/page.tsx`
- **Funcionalidades:** Formulário de cadastro de veículo

**Editar Veículo**
- **Rota:** `/dashboard/veiculos/[id]`
- **Arquivo:** `app/dashboard/veiculos/[id]/page.tsx`
- **Funcionalidades:** Formulário de edição de veículo

**Relatórios**
- **Rota:** `/dashboard/relatorios`
- **Arquivo:** `app/dashboard/relatorios/page.tsx`
- **Funcionalidades:** Gráficos e estatísticas

**Configurações**
- **Rota:** `/dashboard/configuracoes`
- **Arquivo:** `app/dashboard/configuracoes/page.tsx`
- **Funcionalidades:** Configurações da loja

#### Onboarding
- **Rota:** `/onboarding`
- **Arquivo:** `app/onboarding/page.tsx`
- **Funcionalidades:** Guia de primeiro uso

### HTML Estático

As rotas HTML seguem a mesma estrutura, mas são arquivos estáticos:
- `index.html` → `/`
- `loja.html?store_slug={slug}` → Catálogo
- `dashboard.html` → Dashboard
- `login.html` → Login
- etc.

---

## 🧩 Componentes Principais

### Catalog Components

#### `CatalogHeader`
**Arquivo:** `components/catalog/catalog-header.tsx`

**Props:**
```typescript
interface CatalogHeaderProps {
  store: {
    name: string
    logo?: string
    whatsapp?: string
    about?: string
  }
}
```

**Funcionalidades:**
- Exibe logo da loja (ou nome como fallback)
- Navegação (Comprar carros, Sobre, Contato)
- Botão WhatsApp (condicional)
- Header sticky

#### `VehicleCard`
**Arquivo:** `components/catalog/vehicle-card.tsx`

**Props:**
```typescript
interface VehicleCardProps {
  vehicle: Vehicle
  storeSlug: string
}
```

**Funcionalidades:**
- Card responsivo com imagem
- Badge de status (Disponível, Reservado, Vendido)
- Informações principais (ano, km, combustível, câmbio)
- Preço formatado
- Link para detalhes
- Hover effects (elevação e zoom)

#### `VehicleFilters`
**Arquivo:** `components/catalog/vehicle-filters.tsx`

**Props:**
```typescript
interface VehicleFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}
```

**Filtros Disponíveis:**
- Busca (texto livre)
- Marca
- Preço (min/max)
- Ano (min/max)
- Transmissão
- Combustível
- Tipo de carroceria
- Quilometragem

**Funcionalidades:**
- Filtros em sidebar (desktop) ou modal (mobile)
- Accordions expansíveis
- Debounce em inputs numéricos
- Filtros aplicados em tempo real

#### `VehicleGrid`
**Arquivo:** `components/catalog/vehicle-grid.tsx`

**Props:**
```typescript
interface VehicleGridProps {
  vehicles: Vehicle[]
  storeSlug: string
}
```

**Funcionalidades:**
- Grid responsivo (1-3 colunas)
- Ordenação de veículos
- Contador de resultados
- Loading states
- Empty state quando não há resultados

### Dashboard Components

#### `Sidebar`
**Arquivo:** `components/dashboard/sidebar.tsx`

**Funcionalidades:**
- Menu lateral fixo (desktop)
- Menu mobile com overlay
- Navegação principal:
  - Dashboard
  - Veículos
  - Novo Veículo
  - Relatórios
  - Configurações
- Link para catálogo público
- Botão de logout
- Indicador de rota ativa

#### `StatsCards`
**Arquivo:** `components/dashboard/stats-cards.tsx`

**Funcionalidades:**
- Cards de estatísticas:
  - Total de veículos
  - Veículos disponíveis
  - Veículos vendidos
  - Leads do mês
- Ícones e cores diferenciadas
- Layout responsivo

#### `RecentVehicles`
**Arquivo:** `components/dashboard/recent-vehicles.tsx`

**Funcionalidades:**
- Lista dos veículos mais recentes
- Informações resumidas
- Link para detalhes
- Status visual

#### `RecentLeads`
**Arquivo:** `components/dashboard/recent-leads.tsx`

**Funcionalidades:**
- Lista dos leads mais recentes
- Informações do contato
- Status do lead
- Link para detalhes

### Landing Components

#### `Header`
**Arquivo:** `components/landing/header.tsx`

**Funcionalidades:**
- Navegação principal
- Menu mobile responsivo
- Botões CTA (Entrar, Começar Agora)
- Scroll suave para âncoras

#### `Hero`
**Arquivo:** `components/landing/hero.tsx`

**Funcionalidades:**
- Seção hero com título e descrição
- Botão CTA principal
- Design moderno e impactante

#### `Features`
**Arquivo:** `components/landing/features.tsx`

**Funcionalidades:**
- Grid de recursos da plataforma
- Ícones e descrições
- Layout responsivo

#### `Pricing`
**Arquivo:** `components/landing/pricing.tsx`

**Funcionalidades:**
- Cards de planos
- Comparação de recursos
- Botões de assinatura
- Destaque para plano recomendado

---

## 🎨 Design System

### Paleta de Cores

#### Cores Principais

| Cor | Valor Hex | Uso |
|-----|-----------|-----|
| **Primary** | `#1A73E8` | Botões, links, destaques |
| **Primary Dark** | `#0D47A1` | Header, elementos escuros |
| **Primary Light** | `#E3F2FD` | Backgrounds secundários |
| **Gray** | `#424242` | Texto principal |
| **Gray Light** | `#F5F5F5` | Backgrounds |
| **Border** | `#E0E0E0` | Bordas e divisores |
| **Success** | `#25D366` | WhatsApp, sucesso |
| **Destructive** | `#DC2626` | Erros, ações destrutivas |

#### Variáveis CSS (Next.js)

```css
:root {
  --primary: #1a73e8;
  --primary-foreground: #ffffff;
  --secondary: #e3f2fd;
  --foreground: #424242;
  --background: #f5f5f5;
  --border: #e0e0e0;
  /* ... */
}
```

### Tipografia

**Font Family:**
- System fonts: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`
- Next.js: Inter (Google Fonts)

**Tamanhos:**
- Títulos: `text-2xl`, `text-3xl`, `text-4xl`
- Subtítulos: `text-xl`, `text-lg`
- Corpo: `text-base` (16px)
- Pequeno: `text-sm` (14px)
- Muito pequeno: `text-xs` (12px)

### Espaçamentos

**Sistema de Espaçamento (Tailwind):**
- `p-1` = 4px
- `p-2` = 8px
- `p-4` = 16px
- `p-6` = 24px
- `p-8` = 32px

**Gaps:**
- `gap-2` = 8px
- `gap-4` = 16px
- `gap-6` = 24px

### Bordas e Raios

- **Radius padrão:** `0.5rem` (8px)
- **Cards:** `rounded-lg` (8px) ou `rounded-xl` (12px)
- **Botões:** `rounded-md` (6px)
- **Inputs:** `rounded-md` (6px)

### Sombras

- **Cards:** `shadow-md` ou `shadow-lg`
- **Hover:** `hover:shadow-xl`
- **Header:** `shadow-lg`

### Transições

- **Padrão:** `transition-all duration-300`
- **Hover:** `hover:transition-all hover:duration-300`
- **Transform:** `transform hover:scale-105`

### Cursor Personalizado

**Regras CSS (REQ-FR-UI-002):**

```css
/* Elementos clicáveis */
button, a, [role="button"] {
  cursor: pointer;
}

/* Elementos desabilitados */
button:disabled, input:disabled {
  cursor: not-allowed;
}

/* Estados de carregamento */
.loading, [data-loading="true"] {
  cursor: wait;
}

/* Inputs de texto */
input[type="text"], textarea {
  cursor: text;
}

/* Elementos informativos */
p, h1, h2, h3 {
  cursor: default;
}
```

---

## ⚙️ Funcionalidades

### Catálogo Público

#### Busca e Filtros

**Busca por Texto:**
- Busca em tempo real
- Filtra por marca, modelo ou ano
- Debounce de 300ms

**Filtros Disponíveis:**
1. **Marca** - Dropdown com marcas disponíveis
2. **Modelo** - Dropdown (depende da marca selecionada)
3. **Preço** - Range (min/max)
4. **Ano** - Range (min/max)
5. **Transmissão** - Manual, Automático, CVT
6. **Combustível** - Gasolina, Etanol, Flex, Elétrico, etc.
7. **Tipo** - Sedan, Hatch, SUV, Pickup, etc.
8. **Quilometragem** - Máximo de km

**Ordenação:**
- Relevância (padrão)
- Menor preço
- Maior preço
- Mais novos

#### Cards de Veículos

**Informações Exibidas:**
- Imagem principal
- Marca e modelo
- Ano
- Quilometragem
- Combustível
- Câmbio
- Preço formatado
- Status (badge)

**Interações:**
- Hover: Elevação e zoom na imagem
- Click: Navega para detalhes
- Favorito (preparado para implementação)

### Dashboard

#### Estatísticas

**Métricas Exibidas:**
- Total de veículos
- Veículos disponíveis
- Veículos vendidos
- Leads do mês
- Taxa de conversão (preparado)

#### Gestão de Veículos

**Funcionalidades:**
- Lista de veículos com paginação
- Busca e filtros
- Adicionar novo veículo
- Editar veículo existente
- Excluir veículo
- Alterar status (Disponível, Reservado, Vendido)
- Upload de imagens

#### Relatórios

**Gráficos e Estatísticas:**
- Vendas por período
- Veículos mais visualizados
- Leads por origem
- Performance de anúncios

### Autenticação

**Funcionalidades:**
- Login com email/senha
- Cadastro de novo usuário
- Recuperação de senha
- Validação de formulários
- Integração com Supabase
- Proteção de rotas (middleware)

---

## 🔌 Integração com API

### Configuração

**Next.js:**
- Variáveis de ambiente em `.env.local`
- Cliente Supabase configurado em `lib/supabase/`

**HTML Estático:**
- URL da API em `assets/js/config.js`
- Função `API_URL` exportada

### Endpoints Utilizados

#### Catálogo Público

**GET `/api/stores?public=true&slug={slug}`**
- Busca informações da loja
- Retorna: nome, logo, descrição, contatos

**GET `/api/vehicles?public=true&store_slug={slug}`**
- Lista veículos públicos da loja
- Retorna: array de veículos

**GET `/api/vehicles/{id}?public=true`**
- Detalhes de um veículo específico

#### Dashboard

**GET `/api/vehicles`** (autenticado)
- Lista veículos do usuário logado
- Filtros e paginação

**POST `/api/vehicles`** (autenticado)
- Cria novo veículo

**PUT `/api/vehicles/{id}`** (autenticado)
- Atualiza veículo

**DELETE `/api/vehicles/{id}`** (autenticado)
- Remove veículo

**GET `/api/leads`** (autenticado)
- Lista leads da loja

**GET `/api/stores/{id}`** (autenticado)
- Informações da loja do usuário

**PUT `/api/stores/{id}`** (autenticado)
- Atualiza configurações da loja

### Tratamento de Erros

**Next.js:**
- Try/catch em server components
- Error boundaries
- Toast notifications para erros

**HTML Estático:**
- Try/catch em funções async
- Exibição de mensagens de erro
- Fallback para estados de erro

### Loading States

**Indicadores:**
- Spinner durante carregamento
- Skeleton loaders (Next.js)
- Mensagens "Carregando..."
- Estados vazios quando não há dados

---

## 📱 Responsividade

### Breakpoints

| Dispositivo | Largura | Breakpoint Tailwind |
|-------------|---------|---------------------|
| Mobile | < 640px | `sm:` |
| Tablet | 640px - 1024px | `md:` |
| Desktop | > 1024px | `lg:` |

### Ajustes Mobile

#### Catálogo

**Header:**
- Logo reduzida
- Menu hambúrguer
- Navegação em coluna

**Filtros:**
- Sidebar oculta
- Modal de filtros (mobile)
- Accordions colapsados por padrão

**Grid:**
- 1 coluna (mobile)
- 2 colunas (tablet)
- 3 colunas (desktop)

**Cards:**
- Altura de imagem reduzida
- Informações compactas

#### Dashboard

**Sidebar:**
- Menu hambúrguer (mobile)
- Overlay escuro ao abrir
- Sidebar fixa (desktop)

**Cards:**
- Empilhados verticalmente (mobile)
- Grid 2 colunas (tablet)
- Grid 4 colunas (desktop)

**Tabelas:**
- Scroll horizontal (mobile)
- Layout completo (desktop)

### Touch Interactions

- Botões com área de toque mínima (44x44px)
- Swipe gestures (preparado)
- Scroll suave
- Zoom desabilitado em inputs numéricos

---

## 🚀 Guia de Desenvolvimento

### Setup do Projeto

#### Next.js

```bash
# Instalar dependências
npm install
# ou
pnpm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

#### Variáveis de Ambiente

Criar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_API_URL=http://localhost/api
```

### HTML Estático

**Configuração:**
1. Editar `assets/js/config.js`
2. Definir `API_URL`
3. Abrir arquivo HTML no navegador ou servidor local

### Estrutura de Componentes

#### Criar Novo Componente

**Next.js:**

```typescript
// components/meu-componente.tsx
"use client" // Se usar hooks ou interatividade

import { Button } from "@/components/ui/button"

interface MeuComponenteProps {
  title: string
  onClick?: () => void
}

export function MeuComponente({ title, onClick }: MeuComponenteProps) {
  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={onClick}>Clique aqui</Button>
    </div>
  )
}
```

**HTML Estático:**

```html
<!-- meu-componente.html -->
<div class="meu-componente">
  <h2 id="componenteTitulo">Título</h2>
  <button onclick="componenteClick()">Clique aqui</button>
</div>
```

```javascript
// assets/js/meu-componente.js
function componenteClick() {
  // Lógica aqui
}
```

### Adicionar Nova Página

#### Next.js

1. Criar arquivo em `app/nova-pagina/page.tsx`
2. Exportar componente default
3. Rota automática: `/nova-pagina`

```typescript
// app/nova-pagina/page.tsx
export default function NovaPagina() {
  return <div>Nova Página</div>
}
```

#### HTML Estático

1. Criar `nova-pagina.html`
2. Incluir header e footer
3. Adicionar link na navegação

### Estilização

#### Tailwind CSS (Next.js)

```tsx
<div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h2 className="text-2xl font-bold text-[#424242]">Título</h2>
</div>
```

#### CSS Customizado

```css
/* Adicionar em globals.css ou style.css */
.meu-componente {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}
```

### Integração com API

#### Next.js (Server Component)

```typescript
// app/minha-pagina/page.tsx
async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`)
  return res.json()
}

export default async function MinhaPagina() {
  const data = await getData()
  return <div>{/* Renderizar data */}</div>
}
```

#### Next.js (Client Component)

```typescript
"use client"

import { useEffect, useState } from "react"

export function MeuComponente() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`)
      .then(res => res.json())
      .then(setData)
  }, [])

  return <div>{/* Renderizar data */}</div>
}
```

#### HTML Estático

```javascript
async function carregarDados() {
  try {
    const response = await fetch(`${API_URL}/endpoint`)
    const data = await response.json()
    // Processar dados
  } catch (error) {
    console.error('Erro:', error)
  }
}
```

### Testes

**Estrutura de Testes (preparado):**
- Jest para testes unitários
- React Testing Library para componentes
- Cypress para testes E2E (preparado)

### Performance

**Otimizações Implementadas:**
- Lazy loading de imagens (preparado)
- Code splitting automático (Next.js)
- Debounce em inputs
- Memoização de componentes pesados
- SSR/SSG quando possível

### Acessibilidade

**Boas Práticas:**
- Semântica HTML5 correta
- ARIA labels onde necessário
- Navegação por teclado
- Contraste de cores adequado
- Alt text em imagens

---

## 📝 Notas Importantes

### Diferenças entre Versões

1. **Next.js** - Versão moderna, recomendada para novos desenvolvimentos
2. **HTML Estático** - Versão alternativa, útil para compatibilidade ou hospedagem simples

### Migração

Para migrar de HTML para Next.js:
1. Converter HTML para componentes React
2. Mover lógica JavaScript para hooks/actions
3. Adaptar estilos para Tailwind CSS
4. Configurar rotas no App Router

### Manutenção

**Atualizações Regulares:**
- Dependências do Next.js
- Componentes shadcn/ui
- Tailwind CSS
- Supabase SDK

**Backup:**
- Manter versão HTML como fallback
- Documentar mudanças significativas

---

## 🔗 Referências

### Documentação Externa

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com/docs)
- [Radix UI](https://www.radix-ui.com)

### Documentação Interna

- `ESTRUTURA_FRONTEND_LOJA.md` - Documentação detalhada do HTML
- `DOCUMENTACAO_MOBILE.md` - Responsividade mobile
- `REQ-FR-UI-002_CURSOR_LOJA.md` - Comportamento do cursor
- `REQ-FR-UI-003_CURSOR_PADRONIZACAO.md` - Padronização de cursor

---

**Última atualização:** 2024  
**Versão:** 1.0  
**Autor:** Sistema Estocx





<<<<<<< HEAD

=======
>>>>>>> 0ce95f4594b2d76a44f1ee6811e50c5939cb2975

