# 📘 Como Acessar as Páginas - ESTOX

**Guia Completo de Acesso e Navegação**

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Páginas Públicas](#páginas-públicas)
4. [Páginas de Autenticação](#páginas-de-autenticação)
5. [Páginas do Dashboard (Autenticadas)](#páginas-do-dashboard-autenticadas)
6. [Páginas de Catálogo Público](#páginas-de-catálogo-público)
7. [Páginas Administrativas](#páginas-administrativas)
8. [Sistema Next.js (App Router)](#sistema-nextjs-app-router)
9. [Sistema HTML (Versão Estática)](#sistema-html-versão-estática)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O sistema ESTOX possui **duas versões de frontend**:

1. **Sistema HTML** - Páginas estáticas (HTML/CSS/JavaScript)
2. **Sistema Next.js** - Páginas dinâmicas (React/Next.js)

Ambos compartilham a mesma API backend (`/api`), mas têm estruturas de roteamento diferentes.

---

## ⚙️ Configuração Inicial

### URLs Base

**Desenvolvimento Local:**
- **Base URL:** `http://localhost` (ou `http://localhost:8080` se usar porta customizada)
- **API URL:** `http://localhost/api` (ou `http://localhost:8080/api`)

**Produção:**
- **Base URL:** `https://seudominio.com`
- **API URL:** `https://seudominio.com/api`

### Configurar Variáveis de Ambiente

**Para Sistema HTML:**
- Edite os arquivos JavaScript em `assets/js/`
- Configure `API_URL` no início de cada arquivo:
  ```javascript
  const API_URL = 'http://localhost/api';  // Local
  // ou
  const API_URL = 'https://seudominio.com/api';  // Produção
  ```

**Para Sistema Next.js:**
- Configure no arquivo `.env.local`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost/api
  ```

---

## 🌐 Páginas Públicas

### 1. Landing Page (Página Inicial)

**Sistema HTML:**
- **URL:** `http://localhost/index.html` ou `http://localhost/`
- **Arquivo:** `index.html`
- **Descrição:** Página principal com hero, features, pricing e CTA
- **Autenticação:** ❌ Não requerida

**Sistema Next.js:**
- **URL:** `http://localhost:3000/` (porta padrão do Next.js)
- **Rota:** `app/page.tsx`
- **Descrição:** Landing page com componentes React
- **Autenticação:** ❌ Não requerida

**Conteúdo:**
- Hero section
- Features (recursos)
- Pricing (planos)
- CTA (call to action)
- Footer

---

### 2. Catálogo Público da Loja

**Sistema HTML:**
- **URL:** `http://localhost/loja.html?slug=nome-da-loja`
- **Arquivo:** `loja.html`
- **Descrição:** Catálogo público de veículos de uma loja específica
- **Autenticação:** ❌ Não requerida
- **Parâmetros:**
  - `slug` (obrigatório) - Slug da loja

**Exemplo:**
```
http://localhost/loja.html?slug=auto-carros-ltda
```

**Sistema Next.js:**
- **URL:** `http://localhost:3000/catalogo/[slug]`
- **Rota:** `app/catalogo/[slug]/page.tsx`
- **Exemplo:**
  ```
  http://localhost:3000/catalogo/auto-carros-ltda
  ```

---

### 3. Detalhes do Veículo (Público)

**Sistema HTML:**
- **URL:** `http://localhost/veiculo-detalhe.html?id={vehicle_id}`
- **Arquivo:** `veiculo-detalhe.html`
- **Descrição:** Detalhes completos de um veículo (visualização pública)
- **Autenticação:** ❌ Não requerida
- **Parâmetros:**
  - `id` (obrigatório) - UUID do veículo

**Exemplo:**
```
http://localhost/veiculo-detalhe.html?id=550e8400-e29b-41d4-a716-446655440000
```

**Sistema Next.js:**
- **URL:** `http://localhost:3000/catalogo/[slug]/[vehicleId]`
- **Rota:** `app/catalogo/[slug]/[vehicleId]/page.tsx`
- **Exemplo:**
  ```
  http://localhost:3000/catalogo/auto-carros-ltda/550e8400-e29b-41d4-a716-446655440000
  ```

---

## 🔐 Páginas de Autenticação

### 1. Login

**Sistema HTML:**
- **URL:** `http://localhost/login.html`
- **Arquivo:** `login.html`
- **Descrição:** Página de login (email + senha)
- **Autenticação:** ❌ Não requerida (pública)
- **Redirecionamento após login:** `dashboard.html`

**Sistema Next.js:**
- **URL:** `http://localhost:3000/login`
- **Rota:** `app/(auth)/login/page.tsx`
- **Redirecionamento após login:** `/dashboard`

**Funcionalidades:**
- Formulário de login (email + senha)
- Validação de campos
- Geração de token JWT
- Armazenamento de token no localStorage (HTML) ou cookies (Next.js)
- Link para "Esqueci minha senha"
- Link para "Cadastrar"

---

### 2. Cadastro

**Sistema HTML:**
- **URL:** `http://localhost/cadastro.html`
- **Arquivo:** `cadastro.html`
- **Descrição:** Página de cadastro de novo usuário
- **Autenticação:** ❌ Não requerida (pública)
- **Redirecionamento após cadastro:** `cadastro-sucesso.html`

**Sistema Next.js:**
- **URL:** `http://localhost:3000/cadastro`
- **Rota:** `app/(auth)/cadastro/page.tsx`
- **Redirecionamento após cadastro:** `/cadastro-sucesso`

**Campos:**
- Nome completo
- Email
- Senha
- Confirmar senha
- Telefone (opcional)

---

### 3. Cadastro Sucesso

**Sistema HTML:**
- **URL:** `http://localhost/cadastro-sucesso.html`
- **Arquivo:** `cadastro-sucesso.html`
- **Descrição:** Confirmação de cadastro realizado
- **Autenticação:** ❌ Não requerida

**Sistema Next.js:**
- **URL:** `http://localhost:3000/cadastro-sucesso`
- **Rota:** `app/(auth)/cadastro-sucesso/page.tsx`

**Conteúdo:**
- Mensagem de sucesso
- Link para fazer login
- Informações sobre próximos passos

---

### 4. Esqueci Senha

**Sistema HTML:**
- **URL:** `http://localhost/esqueci-senha.html`
- **Arquivo:** `esqueci-senha.html`
- **Descrição:** Recuperação de senha
- **Autenticação:** ❌ Não requerida (pública)

**Sistema Next.js:**
- **URL:** `http://localhost:3000/esqueci-senha`
- **Rota:** `app/(auth)/esqueci-senha/page.tsx`

**Funcionalidades:**
- Campo para email
- Envio de link de recuperação (se implementado)
- Link para voltar ao login

---

## 🏠 Páginas do Dashboard (Autenticadas)

⚠️ **IMPORTANTE:** Todas as páginas do dashboard requerem autenticação. Se não estiver autenticado, será redirecionado para a página de login.

### 1. Dashboard Principal

**Sistema HTML:**
- **URL:** `http://localhost/dashboard.html`
- **Arquivo:** `dashboard.html`
- **Descrição:** Dashboard principal com estatísticas
- **Autenticação:** ✅ Requerida (JWT token)

**Sistema Next.js:**
- **URL:** `http://localhost:3000/dashboard`
- **Rota:** `app/dashboard/page.tsx`
- **Autenticação:** ✅ Requerida (Supabase Auth)

**Conteúdo:**
- Cards com estatísticas (total de veículos, leads, etc)
- Veículos recentes
- Leads recentes
- Gráficos (se implementados)

---

### 2. Onboarding (Configuração Inicial)

**Sistema HTML:**
- **URL:** `http://localhost/onboarding.html`
- **Arquivo:** `onboarding.html`
- **Descrição:** Configuração inicial da loja (primeiro acesso)
- **Autenticação:** ✅ Requerida

**Sistema Next.js:**
- **URL:** `http://localhost:3000/onboarding`
- **Rota:** `app/onboarding/page.tsx`
- **Autenticação:** ✅ Requerida

**Quando Acessar:**
- Primeiro login após cadastro
- Quando loja não está configurada
- Redirecionamento automático se loja não existe

**Campos:**
- Nome da loja
- Slug (URL amigável)
- CNPJ (opcional)
- Telefone
- Endereço
- Logo (upload)

---

### 3. Lista de Veículos

**Sistema HTML:**
- **URL:** `http://localhost/veiculos.html`
- **Arquivo:** `veiculos.html`
- **Descrição:** Lista completa de veículos da loja
- **Autenticação:** ✅ Requerida

**Sistema Next.js:**
- **URL:** `http://localhost:3000/dashboard/veiculos`
- **Rota:** `app/dashboard/veiculos/page.tsx`
- **Autenticação:** ✅ Requerida

**Funcionalidades:**
- Lista todos os veículos
- Filtros (marca, modelo, ano, status)
- Busca
- Paginação (se implementada)
- Ações: Ver, Editar, Excluir

---

### 4. Novo Veículo

**Sistema HTML:**
- **URL:** `http://localhost/veiculos-novo.html`
- **Arquivo:** `veiculos-novo.html`
- **Descrição:** Formulário para cadastrar novo veículo
- **Autenticação:** ✅ Requerida

**Sistema Next.js:**
- **URL:** `http://localhost:3000/dashboard/veiculos/novo`
- **Rota:** `app/dashboard/veiculos/novo/page.tsx`
- **Autenticação:** ✅ Requerida

**Validações:**
- Verifica se assinatura está ativa
- Verifica limite de veículos do plano
- Campos obrigatórios validados

---

### 5. Editar Veículo

**Sistema HTML:**
- **URL:** `http://localhost/veiculo-editar.html?id={vehicle_id}`
- **Arquivo:** `veiculo-editar.html`
- **Descrição:** Formulário para editar veículo existente
- **Autenticação:** ✅ Requerida
- **Parâmetros:**
  - `id` (obrigatório) - UUID do veículo

**Sistema Next.js:**
- **URL:** `http://localhost:3000/dashboard/veiculos/[id]`
- **Rota:** `app/dashboard/veiculos/[id]/page.tsx`
- **Parâmetros:**
  - `id` (obrigatório) - UUID do veículo

**Exemplo:**
```
http://localhost/veiculo-editar.html?id=550e8400-e29b-41d4-a716-446655440000
```

---

### 6. Leads

**Sistema HTML:**
- **URL:** `http://localhost/leads.html`
- **Arquivo:** `leads.html`
- **Descrição:** Lista de leads (interessados em veículos)
- **Autenticação:** ✅ Requerida

**Sistema Next.js:**
- **URL:** `http://localhost:3000/dashboard/leads` (se implementado)
- **Rota:** Ainda não implementado no Next.js

**Funcionalidades:**
- Lista todos os leads
- Filtros por status (novo, contatado, convertido, perdido)
- Informações do lead (nome, email, telefone, veículo de interesse)
- Atualizar status

---

### 7. Relatórios

**Sistema HTML:**
- **URL:** `http://localhost/relatorios.html`
- **Arquivo:** `relatorios.html`
- **Descrição:** Relatórios e estatísticas avançadas
- **Autenticação:** ✅ Requerida

**Sistema Next.js:**
- **URL:** `http://localhost:3000/dashboard/relatorios`
- **Rota:** `app/dashboard/relatorios/page.tsx`
- **Autenticação:** ✅ Requerida

**Conteúdo:**
- Estatísticas detalhadas
- Gráficos (se implementados)
- Relatórios de vendas
- Relatórios de leads
- Exportação (se implementado)

---

### 8. Configurações

**Sistema HTML:**
- **URL:** `http://localhost/configuracoes.html`
- **Arquivo:** `configuracoes.html`
- **Descrição:** Configurações da loja e perfil
- **Autenticação:** ✅ Requerida

**Sistema Next.js:**
- **URL:** `http://localhost:3000/dashboard/configuracoes`
- **Rota:** `app/dashboard/configuracoes/page.tsx`
- **Autenticação:** ✅ Requerida

**Funcionalidades:**
- Editar dados da loja
- Alterar logo
- Configurar notificações
- Alterar senha (se implementado)
- Configurar integração WhatsApp

---

### 9. Planos e Assinatura

**Sistema HTML:**
- **URL:** `http://localhost/planos.html`
- **Arquivo:** `planos.html` (se existir)
- **Descrição:** Visualização de planos disponíveis
- **Autenticação:** ⚠️ Depende da implementação

**Sistema Next.js:**
- **URL:** Ainda não implementado

---

### 10. Renovar Plano

**Sistema HTML:**
- **URL:** `http://localhost/renovar-plano.html`
- **Arquivo:** `renovar-plano.html`
- **Descrição:** Renovação/contratação de plano
- **Autenticação:** ✅ Requerida

**Sistema Next.js:**
- **URL:** Ainda não implementado

**Funcionalidades:**
- Lista planos disponíveis
- Selecionar plano
- Criar checkout Stripe
- Redirecionamento para pagamento
- Retorno após pagamento (success/canceled)

---

## 🏪 Páginas de Catálogo Público

### Catálogo por Slug da Loja

**Sistema HTML:**
- **URL:** `http://localhost/loja.html?slug={store_slug}`
- **Parâmetros:**
  - `slug` (obrigatório) - Slug da loja

**Exemplo:**
```
http://localhost/loja.html?slug=auto-carros-ltda
```

**Sistema Next.js:**
- **URL:** `http://localhost:3000/catalogo/{slug}`
- **Rota:** `app/catalogo/[slug]/page.tsx`

**Exemplo:**
```
http://localhost:3000/catalogo/auto-carros-ltda
```

---

## 👨‍💼 Páginas Administrativas

⚠️ **IMPORTANTE:** Requer autenticação com role `admin`.

### Painel Admin de Assinaturas

**⚠️ IMPORTANTE:** A interface web do painel admin ainda não foi criada. Atualmente, o acesso é feito **diretamente via API** (Postman, cURL, etc).

**📚 Documentação Completa:** Veja `documentacoes/COMO_ACESSAR_PAINEL_ADMIN.md` para instruções detalhadas.

**Sistema HTML:**
- **URL:** `http://localhost/admin-panel.html` (⏳ a criar)
- **Arquivo:** `admin-panel.html` (⏳ a criar)
- **Descrição:** Painel administrativo para gerenciar assinaturas
- **Autenticação:** ✅ Requerida (role = admin)

**Acesso via API (Atual):**
- **URL:** `http://localhost/api/admin/subscriptions`
- **Método:** GET (listar) ou PUT (ações)
- **Headers:** `Authorization: Bearer TOKEN`
- **Requisitos:** 
  - Token JWT válido
  - Role no token = `admin`
  - Usuário deve ter `role = 'admin'` no banco de dados

**Sistema Next.js:**
- **URL:** Ainda não implementado

**Funcionalidades (via API):**
- Lista todas as lojas com filtros
- Visualizar detalhes de loja (com transações e logs)
- Renovar assinatura manualmente
- Suspender/Reativar assinatura
- Cancelar assinatura
- Alterar plano
- Histórico completo de logs

**Como Configurar Usuário Admin:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'seu_email@exemplo.com';
```

**Como Acessar (Exemplo com cURL):**
```bash
# 1. Fazer login
curl -X POST http://localhost/api/auth?action=login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemplo.com","password":"senha"}'

# 2. Usar o token retornado
curl -X GET "http://localhost/api/admin/subscriptions" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🔄 Sistema Next.js (App Router)

### Estrutura de Rotas

O sistema Next.js usa o **App Router** com estrutura baseada em pastas:

```
app/
├── page.tsx                    → / (landing page)
├── (auth)/                     → Grupo de rotas de autenticação
│   ├── login/
│   │   └── page.tsx            → /login
│   ├── cadastro/
│   │   └── page.tsx            → /cadastro
│   ├── cadastro-sucesso/
│   │   └── page.tsx            → /cadastro-sucesso
│   └── esqueci-senha/
│       └── page.tsx            → /esqueci-senha
├── dashboard/                  → Dashboard (protegido)
│   ├── page.tsx                → /dashboard
│   ├── veiculos/
│   │   ├── page.tsx            → /dashboard/veiculos
│   │   ├── novo/
│   │   │   └── page.tsx        → /dashboard/veiculos/novo
│   │   └── [id]/
│   │       └── page.tsx        → /dashboard/veiculos/{id}
│   ├── relatorios/
│   │   └── page.tsx            → /dashboard/relatorios
│   └── configuracoes/
│       └── page.tsx            → /dashboard/configuracoes
├── catalogo/                   → Catálogo público
│   └── [slug]/
│       ├── page.tsx            → /catalogo/{slug}
│       └── [vehicleId]/
│           └── page.tsx        → /catalogo/{slug}/{vehicleId}
└── onboarding/
    └── page.tsx                → /onboarding
```

### Como Executar (Desenvolvimento)

```bash
# Instalar dependências (primeira vez)
npm install
# ou
pnpm install

# Executar servidor de desenvolvimento
npm run dev
# ou
pnpm dev
```

**URL Padrão:** `http://localhost:3000`

### Autenticação Next.js

O Next.js usa **Supabase Auth** para autenticação:
- Middleware em `middleware.ts`
- Proteção automática de rotas
- Redirecionamento automático se não autenticado

---

## 📄 Sistema HTML (Versão Estática)

### Estrutura de Arquivos

```
/
├── index.html                  → Landing page
├── login.html                  → Login
├── cadastro.html               → Cadastro
├── cadastro-sucesso.html       → Sucesso no cadastro
├── esqueci-senha.html          → Recuperação de senha
├── onboarding.html             → Configuração inicial
├── dashboard.html              → Dashboard
├── veiculos.html               → Lista de veículos
├── veiculos-novo.html          → Novo veículo
├── veiculo-editar.html         → Editar veículo
├── veiculo-detalhe.html        → Detalhes (público)
├── loja.html                   → Catálogo público
├── leads.html                  → Leads
├── relatorios.html             → Relatórios
├── configuracoes.html          → Configurações
├── renovar-plano.html          → Renovar plano
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        ├── auth.js
        ├── dashboard.js
        ├── vehicles.js
        └── ...
```

### Como Acessar

**Via Servidor Web:**
- XAMPP/WAMP: Coloque os arquivos em `htdocs/ESTOX/`
- Acesse: `http://localhost/ESTOX/`

**Via Servidor PHP:**
```bash
php -S localhost:8000
```
- Acesse: `http://localhost:8000`

### Autenticação HTML

- Token JWT armazenado no `localStorage`
- Validação em cada página protegida
- Redirecionamento manual para `login.html` se não autenticado

---

## 🔐 Requisitos de Autenticação

### Páginas Públicas (Sem Autenticação)

✅ **Acesso Livre:**
- Landing page (`index.html` ou `/`)
- Login (`login.html` ou `/login`)
- Cadastro (`cadastro.html` ou `/cadastro`)
- Esqueci senha (`esqueci-senha.html` ou `/esqueci-senha`)
- Catálogo público (`loja.html?slug=...` ou `/catalogo/[slug]`)
- Detalhes do veículo (`veiculo-detalhe.html?id=...` ou `/catalogo/[slug]/[vehicleId]`)

### Páginas Autenticadas (Requer Token JWT)

🔒 **Requer Autenticação:**
- Dashboard (`dashboard.html` ou `/dashboard`)
- Onboarding (`onboarding.html` ou `/onboarding`)
- Veículos (`veiculos.html` ou `/dashboard/veiculos`)
- Novo veículo (`veiculos-novo.html` ou `/dashboard/veiculos/novo`)
- Editar veículo (`veiculo-editar.html?id=...` ou `/dashboard/veiculos/[id]`)
- Leads (`leads.html`)
- Relatórios (`relatorios.html` ou `/dashboard/relatorios`)
- Configurações (`configuracoes.html` ou `/dashboard/configuracoes`)
- Renovar plano (`renovar-plano.html`)

### Páginas Administrativas (Requer Role Admin)

👨‍💼 **Requer Role = Admin:**
- Painel admin de assinaturas (`admin-panel.html` - a criar)

**Validação:**
- Token JWT válido
- Campo `role` no token = `"admin"`
- Redireciona para login se não for admin

---

## 🔗 Exemplos de Navegação

### Fluxo de Cadastro

```
1. Landing Page (/) 
   ↓ (clicar em "Cadastrar")
2. Cadastro (/cadastro)
   ↓ (preencher e enviar)
3. Cadastro Sucesso (/cadastro-sucesso)
   ↓ (clicar em "Fazer Login")
4. Login (/login)
   ↓ (fazer login)
5. Onboarding (/onboarding) [se loja não existe]
   ↓ (configurar loja)
6. Dashboard (/dashboard)
```

### Fluxo de Login

```
1. Landing Page (/)
   ↓ (clicar em "Entrar")
2. Login (/login)
   ↓ (fazer login)
3. Dashboard (/dashboard) [se loja existe]
   ou
   Onboarding (/onboarding) [se loja não existe]
```

### Fluxo de Contratação de Plano

```
1. Dashboard (/dashboard)
   ↓ (acessar "Planos" ou "Renovar Plano")
2. Renovar Plano (/renovar-plano)
   ↓ (selecionar plano)
3. Stripe Checkout (externo)
   ↓ (completar pagamento)
4. Renovar Plano (/renovar-plano?status=success)
```

### Fluxo de Catálogo Público

```
1. Landing Page (/)
   ↓ (usar URL do catálogo)
2. Catálogo da Loja (/catalogo/nome-da-loja)
   ↓ (clicar em veículo)
3. Detalhes do Veículo (/catalogo/nome-da-loja/vehicle-id)
   ↓ (preencher formulário de interesse)
4. Lead criado (retorno para catálogo)
```

---

## 🛠️ Troubleshooting

### Problema: Página não carrega

**Causas Possíveis:**
1. Arquivo não existe
2. URL incorreta
3. Servidor não está rodando
4. Erro 404

**Soluções:**
- Verificar se o arquivo existe
- Verificar URL (case-sensitive em alguns servidores)
- Verificar se servidor está rodando
- Verificar logs do servidor

---

### Problema: Redirecionamento para login

**Causas Possíveis:**
1. Token expirado
2. Token inválido
3. Token não existe
4. Não está autenticado

**Soluções:**
- Fazer login novamente
- Verificar localStorage (HTML) ou cookies (Next.js)
- Verificar expiração do token (24 horas padrão)
- Limpar cache e cookies

---

### Problema: Erro 403 (Acesso Negado)

**Causas Possíveis:**
1. Não tem permissão (não é admin)
2. Token inválido
3. Role incorreta no token

**Soluções:**
- Verificar se usuário tem role `admin` (para páginas admin)
- Fazer login com conta admin
- Verificar token no backend

---

### Problema: API não responde

**Causas Possíveis:**
1. API_URL incorreta
2. Servidor API não está rodando
3. CORS bloqueado
4. Erro no backend

**Soluções:**
- Verificar API_URL nos arquivos JavaScript
- Verificar se servidor PHP/API está rodando
- Verificar configuração de CORS
- Verificar logs do servidor

---

### Problema: Next.js não inicia

**Causas Possíveis:**
1. Dependências não instaladas
2. Porta 3000 em uso
3. Erro de configuração

**Soluções:**
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Usar outra porta
npm run dev -- -p 3001
```

---

## 📝 Notas Importantes

### 1. Sistema Duplo

⚠️ O projeto possui dois sistemas frontend:
- **HTML:** Para uso direto (sem build)
- **Next.js:** Para desenvolvimento React (requer build)

Escolha um sistema para produção.

---

### 2. Autenticação

- **HTML:** Token JWT no `localStorage`
- **Next.js:** Supabase Auth (cookies)

---

### 3. URLs Relativas vs Absolutas

**HTML:**
- Use URLs relativas: `login.html`, `dashboard.html`
- Ou absolutas: `/login.html`, `/dashboard.html`

**Next.js:**
- Use componente `Link` do Next.js
- Ou `router.push('/dashboard')`

---

### 4. Parâmetros de URL

**HTML:**
- Query strings: `?id=123&slug=loja`
- JavaScript: `new URLSearchParams(window.location.search)`

**Next.js:**
- Dynamic routes: `[slug]`, `[id]`
- Hooks: `useParams()`, `useSearchParams()`

---

### 5. Build e Deploy

**HTML:**
- Não requer build
- Apenas copiar arquivos para servidor

**Next.js:**
```bash
# Build para produção
npm run build

# Executar produção
npm start
```

---

## 🔗 Links Rápidos

### Páginas Públicas
- Landing: `/` ou `/index.html`
- Login: `/login.html` ou `/login`
- Cadastro: `/cadastro.html` ou `/cadastro`
- Catálogo: `/loja.html?slug=nome` ou `/catalogo/nome`

### Páginas Autenticadas
- Dashboard: `/dashboard.html` ou `/dashboard`
- Veículos: `/veiculos.html` ou `/dashboard/veiculos`
- Configurações: `/configuracoes.html` ou `/dashboard/configuracoes`

---

**Última atualização:** 2024-01-XX
**Versão:** 1.0.0
