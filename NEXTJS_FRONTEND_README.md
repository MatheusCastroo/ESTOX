# Front-End Next.js Estocx - Documentação

## ✅ Implementações Realizadas

### 1. Estrutura Next.js Completa
- ✅ App Router configurado
- ✅ TypeScript configurado
- ✅ Tailwind CSS configurado com variáveis de dark mode
- ✅ Componentes UI base (shadcn/ui)

### 2. Dark Mode
- ✅ `ThemeProvider` integrado no layout raiz
- ✅ Hook `use-theme.ts` criado
- ✅ Componente `ThemeToggle` criado
- ✅ Toggle de dark mode adicionado na página de configurações
- ✅ Todas as cores atualizadas para usar variáveis CSS do Tailwind que suportam dark mode

### 3. Componentes Atualizados para Dark Mode
- ✅ `components/catalog/vehicle-card.tsx` - Cards de veículos
- ✅ `components/catalog/vehicle-grid.tsx` - Grid de veículos
- ✅ `components/catalog/vehicle-filters.tsx` - Filtros
- ✅ `components/catalog/catalog-header.tsx` - Header do catálogo
- ✅ `components/dashboard/sidebar.tsx` - Sidebar do dashboard
- ✅ `components/dashboard/header.tsx` - Header do dashboard
- ✅ `components/landing/header.tsx` - Header da landing page
- ✅ `components/landing/footer.tsx` - Footer da landing page

### 4. Integração com API PHP
- ✅ Cliente API criado em `lib/api/client.ts`
- ✅ Funções para catálogo público (`getPublicStore`, `getPublicVehicles`, `getPublicVehicle`)
- ✅ Funções autenticadas (`getStore`, `updateStore`, `getVehicles`, etc.)
- ✅ Tratamento de erros com `ApiError`
- ✅ Suporte a tokens JWT via localStorage

### 5. Páginas Atualizadas
- ✅ `app/layout.tsx` - Layout raiz com ThemeProvider
- ✅ `app/page.tsx` - Landing page (já existia)
- ✅ `app/catalogo/[slug]/page.tsx` - Catálogo público com integração API
- ✅ `app/(auth)/login/page.tsx` - Login integrado com API PHP
- ✅ `app/dashboard/configuracoes/page.tsx` - Configurações com toggle de dark mode

### 6. Melhorias de UX
- ✅ Skeleton loaders na página de catálogo
- ✅ Estados de erro com Alert
- ✅ Transições suaves (`transition-all duration-300`)
- ✅ Hover effects nos cards
- ✅ Responsividade completa

## 🎨 Paleta de Cores (Dark Mode Ready)

As cores estão definidas em `app/globals.css` usando variáveis CSS:

- **Primary**: `#1A73E8` (azul)
- **Background Light**: `#FFFFFF`
- **Background Dark**: `#1a1a1a`
- **Foreground Light**: `#424242`
- **Foreground Dark**: `#f5f5f5`
- **Success**: `#25D366` (verde WhatsApp)
- **Destructive**: `#DC2626` (vermelho)

## 📁 Estrutura de Arquivos

```
ESTOX/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx ✅
│   │   ├── cadastro/page.tsx
│   │   └── esqueci-senha/page.tsx
│   ├── catalogo/
│   │   └── [slug]/
│   │       └── page.tsx ✅
│   ├── dashboard/
│   │   ├── configuracoes/page.tsx ✅
│   │   └── page.tsx
│   ├── layout.tsx ✅
│   └── page.tsx
├── components/
│   ├── catalog/
│   │   ├── vehicle-card.tsx ✅
│   │   ├── vehicle-grid.tsx ✅
│   │   ├── vehicle-filters.tsx ✅
│   │   └── catalog-header.tsx ✅
│   ├── dashboard/
│   │   ├── sidebar.tsx ✅
│   │   └── header.tsx ✅
│   ├── landing/
│   │   ├── header.tsx ✅
│   │   └── footer.tsx ✅
│   └── ui/
│       └── theme-toggle.tsx ✅
├── hooks/
│   └── use-theme.ts ✅
├── lib/
│   └── api/
│       └── client.ts ✅
└── app/globals.css ✅
```

## 🚀 Como Usar

### 1. Instalar Dependências
```bash
npm install
# ou
pnpm install
```

### 2. Configurar Variável de Ambiente
Crie um arquivo `.env.local` na raiz:
```
NEXT_PUBLIC_API_URL=http://localhost/ESTOX/api/index.php
```

### 3. Executar em Desenvolvimento
```bash
npm run dev
# ou
pnpm dev
```

### 4. Alternar Dark Mode
- Via código: use o hook `useThemeToggle()` ou o componente `<ThemeToggle />`
- Via dashboard: acesse `/dashboard/configuracoes` e use o toggle de tema

## 📝 Próximos Passos (Opcional)

1. **Páginas de Autenticação**: Atualizar `cadastro` e `esqueci-senha` para usar a API PHP
2. **Página de Detalhes do Veículo**: Criar/atualizar `app/catalogo/[slug]/[vehicleId]/page.tsx`
3. **Dashboard Completo**: Integrar todas as páginas do dashboard com a API
4. **Testes**: Adicionar testes unitários e E2E
5. **Otimizações**: Lazy loading de imagens, code splitting, etc.

## 🔧 Configuração do Dark Mode

O dark mode está configurado usando `next-themes`:

1. **ThemeProvider** está no `app/layout.tsx`
2. **Variáveis CSS** estão em `app/globals.css`
3. **Toggle** está disponível em `components/ui/theme-toggle.tsx`
4. **Hook** está em `hooks/use-theme.ts`

O tema é persistido automaticamente no localStorage e respeita a preferência do sistema.

## ⚠️ Notas Importantes

- A API PHP existente continua funcionando normalmente
- O front-end Next.js pode coexistir com o HTML/JS vanilla atual
- Para produção, configure `NEXT_PUBLIC_API_URL` com a URL da API de produção
- O token JWT é armazenado no `localStorage` após login

## 🎯 Funcionalidades Implementadas

✅ Dark mode configurável pelo cliente via dashboard  
✅ Integração com API PHP existente  
✅ Responsividade completa (mobile/tablet/desktop)  
✅ Skeleton loaders  
✅ Hover effects e transições suaves  
✅ Design adaptado do index.html  
✅ Todas as cores usando variáveis CSS para dark mode  
