# 🔐 Como Acessar o Painel Administrativo - ESTOX

**Guia Completo de Acesso ao Painel Admin**

---

## 📋 Índice

1. [Situação Atual](#situação-atual)
2. [Pré-requisitos](#pré-requisitos)
3. [Configurar Usuário Admin](#configurar-usuário-admin)
4. [Acessar via API (Postman/cURL)](#acessar-via-api-postmancurl)
5. [Criar Interface Web](#criar-interface-web)
6. [Testar Acesso](#testar-acesso)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Situação Atual

### ✅ O que já existe:
- ✅ **API Backend:** Endpoint `/api/endpoints/admin/subscriptions.php` (funcionando)
- ✅ **Autenticação:** Sistema de roles (admin/user) implementado
- ✅ **Segurança:** Validação de token JWT e role admin

### ⏳ O que falta:
- ⏳ **Interface Web:** Página HTML `admin-panel.html` (ainda não criada)
- ⏳ **JavaScript:** Arquivo `assets/js/admin-panel.js` (ainda não criado)

---

## ⚙️ Pré-requisitos

### 1. Banco de Dados Configurado

Certifique-se de que o script de migração foi executado:

```sql
-- Executar script: scripts/010-add-role-to-users.sql
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' COMMENT 'Role: user, admin' AFTER name;
```

### 2. API Funcionando

Teste se a API está acessível:
```
http://localhost/api/test.php
```

---

## 👤 Configurar Usuário Admin

### Método 1: Via phpMyAdmin

1. Acesse: `http://localhost/phpmyadmin`
2. Selecione o banco: `estox`
3. Vá na tabela: `users`
4. Encontre o usuário que deseja tornar admin
5. Clique em **Editar**
6. No campo `role`, altere de `user` para `admin`
7. Clique em **Executar**

### Método 2: Via SQL Direto

```sql
-- Tornar um usuário específico admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'seu_email@exemplo.com';
```

### Método 3: Via Script SQL

Edite o arquivo `scripts/010-add-role-to-users.sql` e descomente a linha:

```sql
-- No final do arquivo, descomente:
UPDATE users SET role = 'admin' WHERE email = 'seu_email@exemplo.com';
```

Depois execute no phpMyAdmin ou via linha de comando.

---

## 🌐 Acessar via API (Postman/cURL)

Como a interface web ainda não existe, você pode acessar o painel através da **API diretamente**.

### Passo 1: Fazer Login e Obter Token

**cURL:**
```bash
curl -X POST http://localhost/api/auth?action=login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu_email@exemplo.com","password":"sua_senha"}'
```

**Postman:**
- **Method:** POST
- **URL:** `http://localhost/api/auth?action=login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "email": "seu_email@exemplo.com",
  "password": "sua_senha"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "seu_email@exemplo.com",
      "name": "Nome",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

⚠️ **IMPORTANTE:** Copie o `token` da resposta!

---

### Passo 2: Listar Todas as Assinaturas

**cURL:**
```bash
curl -X GET "http://localhost/api/admin/subscriptions" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Postman:**
- **Method:** GET
- **URL:** `http://localhost/api/admin/subscriptions`
- **Headers:**
  - `Authorization: Bearer SEU_TOKEN_AQUI`

**Resposta:**
```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "id": "uuid",
        "name": "Nome da Loja",
        "slug": "nome-da-loja",
        "subscription_status": "active",
        "subscription_ends_at": "2024-12-31 23:59:59",
        "plan_name": "Mensal",
        "user_email": "email@loja.com",
        "vehicle_count": 25
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 10,
      "pages": 1
    }
  }
}
```

---

### Passo 3: Ver Detalhes de uma Loja Específica

**cURL:**
```bash
curl -X GET "http://localhost/api/admin/subscriptions?store_id=UUID_DA_LOJA" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Postman:**
- **Method:** GET
- **URL:** `http://localhost/api/admin/subscriptions?store_id=UUID_DA_LOJA`
- **Headers:**
  - `Authorization: Bearer SEU_TOKEN_AQUI`

**Resposta:**
```json
{
  "success": true,
  "data": {
    "store": {
      "id": "uuid",
      "name": "Nome da Loja",
      "subscription_status": "active",
      "plan_name": "Mensal"
    },
    "transactions": [
      {
        "id": "uuid",
        "amount": 139.90,
        "status": "approved",
        "created_at": "2024-01-15 10:00:00"
      }
    ],
    "logs": [
      {
        "action": "activated",
        "old_status": "pending",
        "new_status": "active",
        "performed_by": "webhook",
        "created_at": "2024-01-15 10:00:00"
      }
    ]
  }
}
```

---

### Passo 4: Executar Ações Administrativas

#### Renovar Assinatura

**cURL:**
```bash
curl -X PUT http://localhost/api/admin/subscriptions \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": "UUID_DA_LOJA",
    "action": "renew",
    "notes": "Renovação manual via painel admin"
  }'
```

**Postman:**
- **Method:** PUT
- **URL:** `http://localhost/api/admin/subscriptions`
- **Headers:**
  - `Authorization: Bearer SEU_TOKEN_AQUI`
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "store_id": "UUID_DA_LOJA",
  "action": "renew",
  "notes": "Renovação manual via painel admin"
}
```

#### Suspender Assinatura

```json
{
  "store_id": "UUID_DA_LOJA",
  "action": "suspend",
  "notes": "Suspensão por falta de pagamento"
}
```

#### Reativar Assinatura

```json
{
  "store_id": "UUID_DA_LOJA",
  "action": "reactivate",
  "notes": "Reativação após pagamento"
}
```

#### Cancelar Assinatura

```json
{
  "store_id": "UUID_DA_LOJA",
  "action": "cancel",
  "notes": "Cancelamento solicitado pelo cliente"
}
```

#### Alterar Plano

```json
{
  "store_id": "UUID_DA_LOJA",
  "action": "change_plan",
  "plan_id": "UUID_DO_NOVO_PLANO",
  "notes": "Upgrade para plano anual"
}
```

---

## 🎨 Criar Interface Web

Se você quiser criar uma interface web para o painel admin, siga os passos abaixo:

### 1. Criar Página HTML

Crie o arquivo `admin-panel.html` na raiz do projeto.

### 2. Estrutura Básica

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Administrativo - ESTOX</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
</head>
<body>
    <div class="container-fluid mt-4">
        <h1>Painel Administrativo de Assinaturas</h1>
        <div id="stores-list"></div>
    </div>
    
    <script src="assets/js/config.js"></script>
    <script src="assets/js/admin-panel.js"></script>
</body>
</html>
```

### 3. Criar JavaScript

Crie o arquivo `assets/js/admin-panel.js`:

```javascript
const API_URL = window.API_URL || 'http://localhost/api';

// Validar acesso admin
async function validateAdminAccess() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
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

// Carregar lista de lojas
async function loadStores() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/admin/subscriptions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.success) {
            renderStores(data.data.stores);
        } else {
            alert('Erro ao carregar lojas: ' + data.error);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar lojas');
    }
}

// Renderizar lista
function renderStores(stores) {
    const container = document.getElementById('stores-list');
    // Implementar renderização aqui
}

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    const isValid = await validateAdminAccess();
    if (!isValid) return;
    
    await loadStores();
});
```

### 4. Acessar via Web

Após criar os arquivos, acesse:
```
http://localhost/admin-panel.html
```

⚠️ **IMPORTANTE:** A página validará automaticamente se você é admin antes de renderizar qualquer conteúdo.

---

## 🧪 Testar Acesso

### Teste Rápido

1. **Verificar se usuário é admin:**
   ```sql
   SELECT id, email, name, role FROM users WHERE role = 'admin';
   ```

2. **Fazer login via API:**
   ```bash
   curl -X POST http://localhost/api/auth?action=login \
     -H "Content-Type: application/json" \
     -d '{"email":"seu_email@exemplo.com","password":"sua_senha"}'
   ```

3. **Testar endpoint admin (com token):**
   ```bash
   curl -X GET "http://localhost/api/admin/subscriptions" \
     -H "Authorization: Bearer SEU_TOKEN"
   ```

### Respostas Esperadas

✅ **Sucesso (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

❌ **Erro 401 (Não autorizado):**
```json
{
  "success": false,
  "error": "Token de autenticação não fornecido"
}
```

❌ **Erro 403 (Acesso negado - não é admin):**
```json
{
  "success": false,
  "error": "Acesso negado. Apenas administradores."
}
```

---

## 🔧 Troubleshooting

### Problema: Erro 401 (Não autorizado)

**Causas:**
- Token não foi enviado no header
- Token expirado
- Token inválido

**Soluções:**
1. Verificar se o token está sendo enviado no header `Authorization: Bearer TOKEN`
2. Fazer login novamente para obter novo token
3. Verificar se o token não expirou (padrão: 24 horas)

---

### Problema: Erro 403 (Acesso negado)

**Causas:**
- Usuário não tem role `admin`
- Role não está no token

**Soluções:**
1. Verificar no banco de dados:
   ```sql
   SELECT role FROM users WHERE email = 'seu_email@exemplo.com';
   ```
2. Se não for `admin`, atualizar:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'seu_email@exemplo.com';
   ```
3. Fazer login novamente para obter novo token com role admin

---

### Problema: Erro 404 (Não encontrado)

**Causas:**
- URL da API incorreta
- Endpoint não existe
- `.htaccess` não está configurado

**Soluções:**
1. Verificar URL: `http://localhost/api/admin/subscriptions`
2. Verificar se o arquivo existe: `api/endpoints/admin/subscriptions.php`
3. Verificar `.htaccess` em `api/.htaccess`

---

### Problema: Token não contém role

**Causas:**
- Token foi gerado antes de configurar role admin
- Sistema antigo não inclui role no token

**Soluções:**
1. Fazer logout (se houver interface)
2. Fazer login novamente
3. O novo token terá a role atualizada

---

## 📝 Endpoints Disponíveis

### GET `/api/admin/subscriptions`

Lista todas as lojas com filtros opcionais:

**Query Parameters:**
- `status` - Filtro por status (active, pending, suspended, canceled, trial)
- `plan` - Filtro por slug do plano
- `expired` - `true` para vencidos
- `expiring` - `true` para próximos do vencimento (≤7 dias)
- `trial` - `true` para trial
- `search` - Busca por nome ou email
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 50)

**Exemplo:**
```
GET /api/admin/subscriptions?status=active&page=1&limit=20
```

### GET `/api/admin/subscriptions?store_id={uuid}`

Detalhes completos de uma loja específica:

**Query Parameters:**
- `store_id` (obrigatório) - UUID da loja

**Retorna:**
- Dados da loja
- Histórico de transações
- Logs de assinatura

### PUT `/api/admin/subscriptions`

Executar ações administrativas:

**Body:**
```json
{
  "store_id": "uuid",
  "action": "renew|suspend|reactivate|cancel|change_plan",
  "plan_id": "uuid",  // Obrigatório apenas para change_plan
  "notes": "Observações opcionais"
}
```

---

## 🔗 Links Rápidos

### API
- **Teste API:** `http://localhost/api/test.php`
- **Login:** `POST http://localhost/api/auth?action=login`
- **Admin Subscriptions:** `GET http://localhost/api/admin/subscriptions`

### Banco de Dados
- **phpMyAdmin:** `http://localhost/phpmyadmin`
- **Tabela users:** `estox.users`
- **Campo role:** `users.role`

### Scripts SQL
- **Adicionar role:** `scripts/010-add-role-to-users.sql`
- **Tornar admin:** `UPDATE users SET role = 'admin' WHERE email = '...'`

---

## ⚠️ Segurança

### Boas Práticas

1. ✅ **Nunca compartilhar tokens**
2. ✅ **Usar HTTPS em produção**
3. ✅ **Limitar número de admins**
4. ✅ **Logout após uso**
5. ✅ **Tokens expiram em 24 horas (padrão)**

### Validações Implementadas

- ✅ Token JWT válido
- ✅ Role `admin` no token
- ✅ Role `admin` no banco de dados
- ✅ Expiração do token verificada
- ✅ Todas as ações são logadas

---

**Última atualização:** 2024-01-XX  
**Versão:** 1.0.0
