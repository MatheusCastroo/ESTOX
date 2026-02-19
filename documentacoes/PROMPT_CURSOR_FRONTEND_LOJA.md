# Prompt Cursor: Gerar Front-End Loja Estocx com Dark Mode e Design Index

## Objetivo:
Criar toda a estrutura do front-end da loja Estocx usando **Next.js App Router + TypeScript + Tailwind CSS**, aplicando o **design do index em todas as páginas**, mantendo **todas funcionalidades existentes**, e adicionando **dark mode configurável pelo cliente via dashboard**.  

O front-end deve incluir:

- Catálogo público de veículos
- Detalhes de veículos
- Dashboard administrativo
- Landing page
- Autenticação (login, cadastro, esqueci senha)
- Dark mode toggle configurável pelo cliente
- Responsividade completa (mobile/tablet/desktop)
- Skeleton loaders e hover effects
- UX moderna com animações leves e acessibilidade

## Requisitos detalhados:

### 1. Estrutura do projeto (Next.js App Router)

```
ESTOX/
├── app/
│   ├── (auth)/              # login, cadastro, esqueci senha, cadastro-sucesso
│   ├── catalogo/             # catálogo público de veículos
│   ├── dashboard/            # dashboard administrativo
│   ├── onboarding/           # onboarding de novos usuários
│   ├── layout.tsx            # layout raiz com header, footer e tema dark mode
│   └── page.tsx              # landing page
├── components/
│   ├── catalog/              # VehicleCard, VehicleGrid, VehicleFilters, CatalogHeader
│   ├── dashboard/            # Sidebar, StatsCards, RecentVehicles, RecentLeads
│   ├── landing/              # Header, Hero, Features, Pricing, CTA, Footer
│   └── ui/                   # Buttons, Cards, Inputs, Modals, Toasts
├── hooks/
│   └── use-theme.ts          # hook para dark mode
├── lib/
│   └── supabase/             # cliente e helpers Supabase
└── public/                   # imagens, logos, ícones
```

### 2. Funcionalidades e componentes

- **Catálogo Público**
  - Grid responsivo (1-3 colunas)
  - Filtros: marca, modelo, preço, ano, tipo, combustível, transmissão
  - Ordenação por preço, ano e relevância
  - Hover effects em cards com elevação e zoom
  - Skeleton loaders e empty state

- **Detalhes do Veículo**
  - Galeria de imagens com zoom
  - Informações completas
  - Botão contato/WhatsApp

- **Dashboard**
  - Sidebar fixa e overlay mobile
  - Cards de estatísticas
  - Lista de veículos e leads recentes
  - CRUD de veículos
  - Dark mode toggle

- **Landing Page**
  - Hero, features, pricing, CTA, footer
  - Layout adaptado do index

- **Autenticação**
  - Login, cadastro, esqueci senha, confirmação de cadastro
  - Validação via React Hook Form + Zod
  - Integração com Supabase

### 3. Dark Mode

- Usar `next-themes`
- Variáveis CSS para cores light/dark
- Toggle configurável via `/dashboard/configuracoes`
- Abarca: header, footer, sidebar, cards, tabelas, modais, skeleton loaders

### 4. Estilização

- Tailwind CSS para todo o layout
- Transições suaves (`transition-all duration-300`)
- Hover e focus states
- Tipografia: Inter + system fonts
- Paleta de cores:
  - Primary: #1A73E8
  - Background light: #FFFFFF
  - Background dark: #121212
  - Foreground light: #424242
  - Foreground dark: #E0E0E0
  - Success: #25D366
  - Destructive: #DC2626

### 5. Responsividade

- Mobile (<640px): 1 coluna, sidebar modal
- Tablet (640-1024px): 2 colunas, overlay
- Desktop (>1024px): 3 colunas, sidebar fixa

### 6. Integração API

- Catálogo público: `GET /api/vehicles?public=true&store_slug={slug}`
- Detalhes veículo: `GET /api/vehicles/{id}?public=true`
- Dashboard: CRUD veículos, leads, lojas (autenticado)
- Tratamento de erros: try/catch + toast notifications
- Skeleton loaders em carregamento

### 7. Melhorias sugeridas

- Lazy loading de imagens
- Tooltip com infos rápidas
- Animações suaves de entrada (fade-in)
- Preparado para testes unitários e E2E

### 8. Estrutura de arquivo exemplo para Dark Mode

```ts
// hooks/use-theme.ts
import { useTheme } from 'next-themes'

export function useThemeToggle() {
  const { theme, setTheme } = useTheme()
  return { theme, setTheme }
}

// app/layout.tsx
"use client"
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <ThemeProvider attribute="class">
      <html lang="pt-br">
        <body className="bg-background text-foreground">
          {children}
        </body>
      </html>
    </ThemeProvider>
  )
}

// components/dashboard/DarkModeToggle.tsx
"use client"
import { useThemeToggle } from '@/hooks/use-theme'
import { Moon, Sun } from 'lucide-react'

export function DarkModeToggle() {
  const { theme, setTheme } = useThemeToggle()
  
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  )
}
```

### 9. Configuração do Tailwind para Dark Mode

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1A73E8',
        background: {
          light: '#FFFFFF',
          dark: '#121212',
        },
        foreground: {
          light: '#424242',
          dark: '#E0E0E0',
        },
        success: '#25D366',
        destructive: '#DC2626',
      },
    },
  },
}
```

### 10. Componente de Card de Veículo (Exemplo)

```tsx
// components/catalog/VehicleCard.tsx
"use client"
import Image from 'next/image'
import { useState } from 'react'

interface VehicleCardProps {
  vehicle: {
    id: string
    brand: string
    model: string
    year: number
    price: number
    mileage: number
    image?: string
  }
  onClick?: () => void
}

export function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const [imageError, setImageError] = useState(false)
  
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2"
    >
      <div className="relative h-48 w-full overflow-hidden">
        {vehicle.image && !imageError ? (
          <Image
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400">Sem imagem</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {vehicle.brand} {vehicle.model}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {vehicle.year} • {vehicle.mileage.toLocaleString()} km
        </p>
        <p className="text-xl font-bold text-primary mt-2">
          R$ {vehicle.price.toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  )
}
```

### 11. Skeleton Loader (Exemplo)

```tsx
// components/ui/Skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  )
}

// components/catalog/VehicleCardSkeleton.tsx
import { Skeleton } from '@/components/ui/Skeleton'

export function VehicleCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/3 mt-2" />
      </div>
    </div>
  )
}
```

### 12. Integração com API Existente

```ts
// lib/api/vehicles.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api'

export async function getPublicVehicles(storeSlug: string) {
  try {
    const response = await fetch(
      `${API_URL}/vehicles?public=true&store_slug=${storeSlug}`
    )
    if (!response.ok) throw new Error('Erro ao carregar veículos')
    return await response.json()
  } catch (error) {
    console.error('Erro:', error)
    throw error
  }
}

export async function getVehicleDetails(id: string) {
  try {
    const response = await fetch(`${API_URL}/vehicles/${id}?public=true`)
    if (!response.ok) throw new Error('Erro ao carregar veículo')
    return await response.json()
  } catch (error) {
    console.error('Erro:', error)
    throw error
  }
}
```

### 13. Página de Catálogo (Exemplo)

```tsx
// app/catalogo/page.tsx
"use client"
import { useEffect, useState } from 'react'
import { VehicleGrid } from '@/components/catalog/VehicleGrid'
import { VehicleFilters } from '@/components/catalog/VehicleFilters'
import { VehicleCardSkeleton } from '@/components/catalog/VehicleCardSkeleton'
import { getPublicVehicles } from '@/lib/api/vehicles'

export default function CatalogoPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})

  useEffect(() => {
    async function loadVehicles() {
      try {
        setLoading(true)
        const storeSlug = new URLSearchParams(window.location.search).get('store_slug') || 'demo'
        const data = await getPublicVehicles(storeSlug)
        setVehicles(data)
      } catch (error) {
        console.error('Erro ao carregar veículos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadVehicles()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <VehicleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <VehicleFilters filters={filters} onFiltersChange={setFilters} />
      <VehicleGrid vehicles={vehicles} />
    </div>
  )
}
```

### 14. Dashboard com Dark Mode Toggle

```tsx
// app/dashboard/configuracoes/page.tsx
"use client"
import { DarkModeToggle } from '@/components/dashboard/DarkModeToggle'
import { useThemeToggle } from '@/hooks/use-theme'

export default function ConfiguracoesPage() {
  const { theme } = useThemeToggle()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Configurações
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tema
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Escolha entre tema claro ou escuro
            </p>
          </div>
          <DarkModeToggle />
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
          Tema atual: <span className="font-semibold">{theme}</span>
        </p>
      </div>
    </div>
  )
}
```

### 15. Observações importantes

- ✅ Nenhuma funcionalidade existente deve ser alterada
- ✅ Todo design é adaptado do index
- ✅ Dark mode configurável pelo cliente
- ✅ Performance e acessibilidade garantidas
- ✅ Usar TypeScript strict mode
- ✅ Seguir padrões do Next.js 14+ (App Router)
- ✅ Implementar error boundaries
- ✅ Adicionar loading states em todas as requisições
- ✅ Validar formulários com Zod
- ✅ Usar React Hook Form para gerenciamento de formulários

## ✅ Instruções para o Cursor:

1. Gerar todos os arquivos TSX, CSS/Tailwind, hooks, layouts e componentes conforme acima
2. Estruturar pastas como descrito
3. Implementar dark mode e toggle via dashboard
4. Aplicar design do index para toda a loja
5. Garantir responsividade, acessibilidade e performance
6. Incluir skeleton loaders, hover effects, transições e animações suaves
7. Integrar com a API existente (endpoints PHP)
8. Manter compatibilidade com funcionalidades atuais
9. Adicionar tratamento de erros robusto
10. Implementar lazy loading de imagens e componentes

## Estrutura de Dependências (package.json)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next-themes": "^0.2.1",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.2.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "lucide-react": "^0.292.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "eslint": "^8.54.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

## Variáveis de Ambiente (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

**Este prompt deve ser usado no Cursor para gerar toda a estrutura do front-end da loja Estocx com Next.js, TypeScript, Tailwind CSS, Dark Mode configurável e design baseado no index.html existente.**
