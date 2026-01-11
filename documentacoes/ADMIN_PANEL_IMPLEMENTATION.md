# 📘 Documentação Completa - Painel Administrativo de Assinaturas

**REQ-ADM-PAINEL-ASSINATURAS-COM-AUTH**

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação e Autorização](#autenticação-e-autorização)
3. [Estrutura do Sistema](#estrutura-do-sistema)
4. [Banco de Dados](#banco-de-dados)
5. [Endpoints da API](#endpoints-da-api)
6. [Frontend](#frontend)
7. [Funcionalidades](#funcionalidades)
8. [Relação com Stripe](#relação-com-stripe)
9. [Edge Cases Críticos](#edge-cases-críticos)
10. [Configuração](#configuração)
11. [Segurança](#segurança)
12. [Roles Futuras](#roles-futuras-opcional)

---

## 🎯 Visão Geral

Painel administrativo completo para gestão de assinaturas do ESTOX, protegido por autenticação com login/senha e controle de permissões baseado em roles.

### Funcionalidades Principais

- ✅ Autenticação com email + senha (bcrypt)
- ✅ Controle de acesso baseado em role (admin/user)
- ✅ Listagem completa de lojas e assinaturas
- ✅ Filtros avançados (status, plano, vencidos, etc)
- ✅ Detalhes completos de cada loja
- ✅ Ações administrativas (renovar, suspender, reativar, cancelar, alterar plano)
- ✅ Histórico de transações e logs
- ✅ Auditoria completa de todas as ações

---

## 🔐 Autenticação e Autorização

### Sistema de Roles

**Tabela `users`:**
- Campo `role` (VARCHAR(20)): `user` ou `admin`
- Default: `user`

**Script SQL:**
- `scripts/010-add-role-to-users.sql` - Adiciona campo `role`

### JWT Token

**Payload do Token:**
```json
{
  "userId": "uuid",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Geração:**
- `api/classes/Auth.php` → `generateToken($userId, $role)`
- Role é obtida do banco de dados automaticamente

**Validação:**
- `api/classes/Middleware.php` → `requireAdmin()`
- Valida token e verifica `role === 'admin'`
- Retorna 403 Forbidden se não for admin

### ⚠️ Acesso ao Painel Admin (OBRIGATÓRIO)

**Regras de Acesso:**
- ✅ Apenas usuários com `role = 'admin'` podem acessar
- ✅ O frontend admin DEVE validar o token ANTES de renderizar qualquer conteúdo
- ✅ Caso o token seja inválido ou o role não seja admin:
  - **Redirecionar imediatamente para tela de login**
  - **NÃO renderizar conteúdo administrativo**

**Implementação Frontend:**
```javascript
// Validar token antes de renderizar
async function validateAdminAccess() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth`);
        const data = await response.json();
        
        if (!data.success || data.data.user.role !== 'admin') {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return false;
        }
        
        return true;
    } catch (error) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return false;
    }
}

// Usar antes de renderizar
document.addEventListener('DOMContentLoaded', async () => {
    const isValid = await validateAdminAccess();
    if (!isValid) return;
    
    // Renderizar conteúdo admin apenas se validado
    loadAdminPanel();
});
```

**⚠️ IMPORTANTE:** Isso evita que alguém abra `admin-panel.html` diretamente sem autenticação adequada.

---

## 🏗️ Estrutura do Sistema

### Backend

```
api/
├── classes/
│   ├── Auth.php                    # Autenticação com role no token
│   ├── Middleware.php              # requireAdmin() - validação de role
│   └── ...
│
├── endpoints/
│   ├── auth.php                    # Login/Register (gera token com role)
│   └── admin/
│       └── subscriptions.php       # Painel admin completo
│
└── scripts/
    └── 010-add-role-to-users.sql   # Migração: adiciona role
```

### Frontend (a criar)

```
admin-panel.html                    # Página principal do painel
assets/js/admin-panel.js            # JavaScript do painel
```

---

## 🗄️ Banco de Dados

### Migração

**Script:** `scripts/010-add-role-to-users.sql`

```sql
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' COMMENT 'Role: user, admin' AFTER name;

ALTER TABLE users 
  ADD INDEX IF NOT EXISTS idx_users_role (role);
```

### Criar Usuário Admin

```sql
-- Criar usuário admin
INSERT INTO users (id, email, password, name, role, created_at) 
VALUES (
    UUID(),
    'admin@example.com',
    '$2y$10$...',  -- Hash bcrypt da senha
    'Admin',
    'admin',
    NOW()
);

-- Ou atualizar usuário existente
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## 🌐 Endpoints da API

### Autenticação

#### `POST /api/endpoints/auth.php?action=login`

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "Admin",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Arquivo:** `api/endpoints/auth.php`

---

### Admin - Listagem

#### `GET /api/endpoints/admin/subscriptions.php`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Params:**
- `status` (opcional) - Filtrar por status: `trial`, `active`, `pending`, `suspended`, `canceled`
- `plan` (opcional) - Filtrar por slug do plano
- `expired` (opcional) - `true` para vencidos
- `expiring` (opcional) - `true` para próximos do vencimento (≤7 dias)
- `trial` (opcional) - `true` para trials
- `search` (opcional) - Busca por nome ou email
- `page` (opcional, default: 1) - Página
- `limit` (opcional, default: 50) - Itens por página

**Resposta:**
```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "id": "uuid",
        "name": "Loja Exemplo",
        "subscription_status": "active",
        "subscription_ends_at": "2024-02-15 10:00:00",
        "user_name": "João Silva",
        "user_email": "joao@example.com",
        "plan_name": "Mensal",
        "plan_slug": "profissional-mensal",
        "plan_price": 139.90,
        "plan_vehicle_limit": 50,
        "vehicle_count": 25,
        "last_payment": "2024-01-15 10:00:00",
        "last_gateway": "stripe"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "pages": 2
    }
  }
}
```

**Ordenação:** 
1. pending vencidos
2. trial próximos do vencimento
3. active
4. suspended
5. canceled

**Arquivo:** `api/endpoints/admin/subscriptions.php`

---

### Admin - Detalhes da Loja

#### `GET /api/endpoints/admin/subscriptions.php?store_id={uuid}`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "store": {
      "id": "uuid",
      "name": "Loja Exemplo",
      "subscription_status": "active",
      "subscription_ends_at": "2024-02-15 10:00:00",
      "plan_name": "Mensal",
      "plan_price": 139.90,
      "vehicle_count": 25,
      "user_name": "João Silva",
      "user_email": "joao@example.com",
      ...
    },
    "transactions": [
      {
        "id": "uuid",
        "gateway": "stripe",
        "amount": 139.90,
        "status": "approved",
        "created_at": "2024-01-15 10:00:00",
        ...
      }
    ],
    "logs": [
      {
        "id": "uuid",
        "action": "renewed",
        "old_status": "trial",
        "new_status": "active",
        "performed_by": "admin_user_id",
        "notes": "Renovação manual",
        "created_at": "2024-01-15 10:00:00"
      }
    ]
  }
}
```

**Arquivo:** `api/endpoints/admin/subscriptions.php`

---

### Admin - Ações

#### `PUT /api/endpoints/admin/subscriptions.php`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body:**
```json
{
  "store_id": "uuid",
  "action": "renew",  // ou "suspend", "reactivate", "cancel", "change_plan"
  "notes": "Observações opcionais",
  "plan_id": "uuid"   // apenas para change_plan
}
```

**Ações Disponíveis:**

1. **`renew`** - Renovar Assinatura (Manual)
   - Status → `active`
   - Soma `duration_days` do plano
   - Não gera cobrança no Stripe

2. **`suspend`** - Suspender Assinatura
   - Status → `suspended`
   - Não altera datas
   - Bloqueia acesso

3. **`reactivate`** - Reativar Assinatura
   - Status permitido: `pending` ou `suspended`
   - Status → `active`
   - Define nova data de expiração

4. **`cancel`** - Cancelar Assinatura
   - Status → `canceled`
   - Ação irreversível
   - Bloqueia acesso pago

5. **`change_plan`** - Alterar Plano
   - Atualiza `plan_id`
   - Ajusta limites
   - Não altera Stripe automaticamente
   - Requer `plan_id` no body

**Resposta:**
```json
{
  "success": true,
  "data": {
    "store": { ... },
    "message": "Status alterado de trial para active"
  }
}
```

**Arquivo:** `api/endpoints/admin/subscriptions.php`

---

## 🖥️ Frontend

### Estrutura da Página

**Arquivo:** `admin-panel.html` (a criar)

**Seções:**
1. **Header** - Logo, logout
2. **Filtros** - Status, plano, busca, etc
3. **Tabela de Lojas** - Listagem com todas as informações
4. **Pagination** - Navegação de páginas
5. **Modal de Detalhes** - Detalhes completos da loja
6. **Modal de Ações** - Formulário para ações administrativas

### JavaScript

**Arquivo:** `assets/js/admin-panel.js` (a criar)

**Funcionalidades:**
- Carregar lista de lojas
- Aplicar filtros
- Exibir detalhes da loja
- Executar ações administrativas
- Gerenciar autenticação

---

## ⚙️ Funcionalidades

### Tela Principal - Listagem (Section 5)

**Informações Exibidas:**
- Nome da Loja (`stores.name`)
- Email (`stores.email` / `users.email`)
- Plano (`plans.name`)
- Status (`stores.subscription_status`)
- Expira em (`stores.subscription_ends_at`)
- Veículos cadastrados (`COUNT(vehicles)`)
- Limite do plano (`plans.vehicle_limit`)
- Último pagamento (`payment_transactions.created_at`)
- Gateway (`payment_transactions.gateway`)

**Filtros:**
- Status da assinatura
- Plano
- Vencidos (`expired=true`)
- Próximos do vencimento (`expiring=true`)
- Trial (`trial=true`)
- Busca por loja (nome ou email)

**Ordenação:**
1. pending vencidos
2. trial próximos do vencimento
3. active
4. suspended
5. canceled

---

### Tela de Detalhes (Section 6)

#### Dados Gerais
- Nome
- Email
- Data de cadastro
- Plano atual
- Status da assinatura
- Data de expiração

#### Financeiro
- Histórico de transações
- Status dos pagamentos
- Método de pagamento
- IDs do Stripe

#### Histórico de Assinatura
- Lista completa de `subscription_logs`
- Ação
- Status anterior → novo
- Data
- Executado por (admin / sistema / webhook)
- Observações

---

### Ações Administrativas (Section 7)

#### 7.1 Renovar Assinatura (Manual)
- Status → `active`
- Soma dias do plano à expiração
- Não gera cobrança no Stripe
- Cria log `renewed`

#### 7.2 Cancelar Assinatura
- Status → `canceled`
- Ação irreversível
- Bloqueia acesso pago
- Cria log `canceled`

#### 7.3 Suspender Assinatura
- Status → `suspended`
- Não altera datas
- Bloqueia acesso
- Cria log `suspended`

#### 7.4 Reativar Assinatura
- Status permitido: `pending` ou `suspended`
- Status → `active`
- Define nova data de expiração
- Cria log `reactivated`

#### 7.5 Alterar Plano
- Atualiza `plan_id`
- Ajusta limites
- Não altera Stripe automaticamente
- Cria log `plan_changed`

---

## 💳 Relação com Stripe

### ⚠️ Stripe NÃO é Fonte de Verdade

**Importante:** O Stripe é utilizado exclusivamente como:

- ✅ Gateway de pagamento
- ✅ Registro financeiro
- ✅ Processamento de transações

**A lógica de acesso, status de assinatura e permissões:**

- ❌ **NÃO dependem do Stripe em tempo real**
- ✅ **São controladas pelo banco de dados local (fonte de verdade)**

**Webhooks do Stripe apenas:**

- ✅ Atualizam informações financeiras em `payment_transactions`
- ✅ Ativam assinaturas quando pagamento é confirmado
- ❌ **NUNCA concedem acesso direto**
- ❌ **NÃO sobrescrevem ações administrativas manuais**

**Fonte de Verdade:**
- `stores.subscription_status` → Banco de dados local
- `stores.subscription_ends_at` → Banco de dados local
- `stores.plan_id` → Banco de dados local
- `payment_transactions` → Histórico financeiro (referência)

**⚠️ IMPORTANTE:** Mesmo se o Stripe estiver offline ou apresentar problemas, o sistema local continua funcionando com base nos dados do banco de dados.

---

## ⚠️ Edge Cases Críticos

### Webhook Stripe após Ação Manual (CRÍTICO)

**Cenário:**
1. Admin cancela/suspende/altera plano manualmente
2. Posteriormente chega um webhook do Stripe

**Regra Implementada:**
- ✅ O sistema **NÃO deve sobrescrever** o status definido manualmente
- ✅ O webhook deve **apenas registrar a transação** em `payment_transactions`
- ✅ Qualquer tentativa de reativação automática deve ser **ignorada** se status for `canceled` ou `suspended` por admin

**Implementação em `api/webhooks/stripe.php`:**
```php
// Verificar se loja foi cancelada/suspensa por admin antes de ativar
if (in_array($store['subscription_status'], ['canceled', 'suspended'])) {
    // Apenas registrar transação, não alterar status
    // Log da tentativa de reativação automática
}
```

**⚠️ IMPORTANTE:** Isso evita reativação indevida de cliente cancelado por solicitação administrativa.

---

## 🔒 Segurança

### Autenticação (Section 3.1)

- ✅ Login via email + senha
- ✅ Senhas armazenadas com bcrypt
- ✅ Proibido texto puro

### Autorização (Section 3.2)

- ✅ Token JWT contém `role`
- ✅ Endpoints admin validam `role === 'admin'`
- ✅ 403 Forbidden se não for admin

### Validação (Section 3.3)

- ✅ Token válido
- ✅ Usuário autenticado
- ✅ Usuário possui `role = admin`
- ✅ Proibido acesso apenas por URL
- ✅ Frontend valida role antes de renderizar

### Sessão Admin

**Expiração de Token:**
- ✅ Tokens JWT possuem expiração (24 horas por padrão)
- ✅ Configurado em `api/config/config.php` → `jwt_expiration`

**Logout:**
- ✅ Token deve ser removido do `localStorage`/`sessionStorage`
- ✅ Frontend deve limpar todas as variáveis de sessão
- ✅ Redirecionar para tela de login

**Após Expiração:**
- ✅ Requisições retornam 401 Unauthorized
- ✅ Frontend deve detectar e redirecionar automaticamente para login
- ✅ Não permitir acesso ao painel sem token válido

**Implementação Frontend:**
```javascript
// Interceptor para verificar expiração
async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('token');
    
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    
    try {
        const response = await fetch(url, options);
        
        if (response.status === 401) {
            // Token expirado ou inválido
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
```

---

## 📝 Logs e Auditoria (Section 9)

Toda ação administrativa cria registro em `subscription_logs`:

**Campos:**
- `action` - Tipo de ação
- `old_status` / `new_status` - Status anterior e novo
- `old_ends_at` / `new_ends_at` - Datas anterior e nova
- `performed_by` - ID do admin que executou
- `notes` - Observações
- `created_at` - Data/hora

**Ações Logadas:**
- `renewed` - Renovação manual
- `suspended` - Suspensão
- `reactivated` - Reativação
- `canceled` - Cancelamento
- `plan_changed` - Alteração de plano

---

## ⚙️ Configuração

### Criar Usuário Admin

**Opção 1: Via SQL**
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

**Opção 2: Via código (script temporário)**
```php
// Criar arquivo temporário: create-admin.php
require_once 'api/classes/Database.php';
require_once 'api/classes/Auth.php';

$db = Database::getInstance();
$auth = new Auth();

// Criar usuário admin
$user = $auth->register('admin@example.com', 'senha123', 'Admin');

// Atualizar role
$db->update('users', ['role' => 'admin'], 'id = :id', ['id' => $user['id']]);

echo "Admin criado com sucesso!";
```

---

## 📊 Resumo de Arquivos

| Arquivo | Responsabilidade | Status |
|---------|-----------------|--------|
| `scripts/010-add-role-to-users.sql` | Adiciona campo role | ✅ Criado |
| `api/classes/Auth.php` | Gera token com role | ✅ Atualizado |
| `api/classes/Middleware.php` | Valida role admin | ✅ Atualizado |
| `api/endpoints/admin/subscriptions.php` | Endpoint completo | ✅ Atualizado |
| `admin-panel.html` | Página frontend | ⏳ A criar |
| `assets/js/admin-panel.js` | JavaScript | ⏳ A criar |

---

## 🔮 Roles Futuras (Opcional)

### Expansão de Níveis de Admin

A estrutura atual suporta expansão sem refatoração:

**Possíveis Roles:**
- `user` - Usuário comum (padrão)
- `admin` - Administrador (atual)
- `super_admin` - Super administrador (futuro)
  - Acesso a ações financeiras críticas
  - Exclusões definitivas
  - Gerenciamento de outros admins
- `support` - Suporte (futuro)
  - Apenas leitura
  - Visualização de logs e histórico
  - Sem permissão para alterar status

**Implementação Futura:**
```php
// Middleware.php
public static function requireRole($requiredRole) {
    $userData = $auth->verifyTokenWithRole($token);
    
    $roleHierarchy = [
        'user' => 1,
        'support' => 2,
        'admin' => 3,
        'super_admin' => 4
    ];
    
    $userLevel = $roleHierarchy[$userData['role']] ?? 0;
    $requiredLevel = $roleHierarchy[$requiredRole] ?? 999;
    
    if ($userLevel < $requiredLevel) {
        Response::forbidden('Acesso negado. Permissão insuficiente.');
    }
    
    return $userData['userId'];
}
```

**⚠️ Nota:** A implementação atual com `role = 'admin'` já suporta esta expansão. Basta adicionar novos roles e atualizar a validação conforme necessário.

---

## 🚀 Próximos Passos

1. ✅ Executar script SQL `010-add-role-to-users.sql`
2. ✅ Criar usuário admin no banco
3. ✅ Testar autenticação admin
4. ⏳ Criar página HTML `admin-panel.html`
5. ⏳ Criar JavaScript `assets/js/admin-panel.js`
6. ⏳ Testar todas as funcionalidades
7. ⏳ Documentar para usuários

---

**Última atualização:** 2024-01-XX
**Versão:** 1.0.0
**Requisito:** REQ-ADM-PAINEL-ASSINATURAS-COM-AUTH
