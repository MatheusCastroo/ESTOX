# 📘 Documentação Completa - Sistema de Planos e Assinaturas com Stripe

**ESTOX - Integração Stripe para Assinaturas**

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Banco de Dados](#banco-de-dados)
5. [Classes e Componentes](#classes-e-componentes)
6. [Endpoints da API](#endpoints-da-api)
7. [Webhooks](#webhooks)
8. [Fluxos de Trabalho](#fluxos-de-trabalho)
9. [Configuração](#configuração)
10. [Validações e Regras de Negócio](#validações-e-regras-de-negócio)
11. [Scripts e Ferramentas](#scripts-e-ferramentas)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Sistema completo de planos e assinaturas integrado ao Stripe, permitindo que lojas contratem planos pagos (Mensal, Trimestral, Anual) para gerenciar seus veículos.

### Funcionalidades Principais

- ✅ Planos com diferentes periodicidades (30, 90, 365 dias)
- ✅ Checkout seguro via Stripe
- ✅ Processamento de webhooks automático
- ✅ Controle de limites por plano
- ✅ Trial de 15 dias
- ✅ Renovação automática
- ✅ Logs e auditoria completa
- ✅ Gestão administrativa

---

## 🏗️ Arquitetura do Sistema

```
Frontend → API Endpoints → Stripe Class → Stripe API
                ↓
          Database (MySQL) ← FONTE DE VERDADE
                ↓
          Webhooks ← Stripe Events
```

### ⚠️ Stripe NÃO é Fonte de Verdade

**Importante:** O Stripe é utilizado exclusivamente como:

- ✅ Gateway de pagamento
- ✅ Processamento de transações financeiras
- ✅ Registro de transações

**A lógica de acesso, status de assinatura e permissões:**

- ❌ **NÃO dependem do Stripe em tempo real**
- ✅ **São controladas pelo banco de dados local (fonte de verdade)**

**Fonte de Verdade:**
- `stores.subscription_status` → Banco de dados local
- `stores.subscription_ends_at` → Banco de dados local
- `stores.plan_id` → Banco de dados local
- `plans.*` → Banco de dados local
- `payment_transactions` → Histórico financeiro (referência complementar)

**Webhooks do Stripe:**
- ✅ Atualizam informações financeiras em `payment_transactions`
- ✅ Ativam assinaturas quando pagamento é confirmado
- ❌ **NUNCA concedem acesso direto**
- ❌ **NÃO sobrescrevem ações administrativas manuais** (canceled/suspended por admin)
- ❌ **NÃO são consultados para validação de acesso**

**⚠️ IMPORTANTE:** Mesmo se o Stripe estiver offline ou apresentar problemas, o sistema local continua funcionando com base nos dados do banco de dados.

### Fluxo de Assinatura

1. **Usuário seleciona plano** → Frontend chama `/api/endpoints/plans.php`
2. **Cria checkout** → Frontend chama `/api/endpoints/subscriptions.php?action=create_checkout`
3. **Redireciona para Stripe** → Usuário completa pagamento
4. **Webhook recebe evento** → `/api/webhooks/stripe.php` processa pagamento
5. **Assinatura ativada** → Status atualizado para `active`
6. **Loja pode usar recursos** → Limites validados em cada ação

---

## 📁 Estrutura de Arquivos

### Backend (API)

```
api/
├── classes/
│   ├── Stripe.php              # Classe de integração com Stripe
│   ├── Database.php            # Gerenciamento de banco de dados
│   ├── Response.php            # Formatador de respostas HTTP
│   ├── Middleware.php          # Autenticação e validações
│   └── EmailService.php        # Envio de e-mails
│
├── endpoints/
│   ├── plans.php               # Lista planos disponíveis (público)
│   ├── subscriptions.php       # Gerenciamento de assinaturas
│   ├── vehicles.php            # CRUD de veículos (com validação de limites)
│   └── admin/
│       └── subscriptions.php   # Painel administrativo
│
├── webhooks/
│   └── stripe.php              # Processador de eventos Stripe
│
├── scripts/
│   └── check-subscriptions.php # CRON job diário
│
└── config/
    ├── config.php              # Configurações gerais
    ├── database.php            # Configuração do banco
    └── load-env.php            # Carregador de variáveis de ambiente
```

### Scripts SQL

```
scripts/
├── 001-create-tables.sql           # Estrutura base (plans, stores, etc)
├── 006-create-subscription-tables.sql  # Tabelas de assinatura
├── 008-seed-professional-plans.sql     # Seed de planos profissionais
└── 009-add-duration-days-to-plans.sql  # Adiciona campo duration_days
```

---

## 🗄️ Banco de Dados

### Tabelas Principais

#### `plans` - Planos de Assinatura

**Campos:**
- `id` (CHAR(36)) - UUID do plano
- `name` (VARCHAR(50)) - Nome do plano (ex: "Mensal")
- `slug` (VARCHAR(50)) - Identificador único (ex: "profissional-mensal")
- `price` (DECIMAL(10,2)) - Preço em R$
- `vehicle_limit` (INT) - Limite de veículos (-1 = ilimitado)
- `duration_days` (INT) - Duração em dias (30, 90, 365)
- `features` (JSON) - Array de funcionalidades
- `is_active` (BOOLEAN) - Se está ativo
- `created_at`, `updated_at` (TIMESTAMP)

**Planos Oficiais:**
| Slug | Nome | Duração | Preço | Limite |
|------|------|---------|-------|--------|
| profissional-mensal | Mensal | 30 dias | R$ 139,90 | 50 |
| profissional-trimestral | Trimestral | 90 dias | R$ 359,70 | 50 |
| profissional-anual | Anual | 365 dias | R$ 1.318,80 | 50 |

#### `stores` - Lojas/Assinaturas

**Campos de Assinatura:**
- `plan_id` (CHAR(36)) - FK para plans
- `subscription_status` (VARCHAR(20)) - Status: `trial`, `active`, `pending`, `suspended`, `canceled`
- `subscription_ends_at` (TIMESTAMP) - Data de expiração

#### `payment_transactions` - Transações de Pagamento

**Campos:**
- `id` (CHAR(36)) - UUID
- `store_id` (CHAR(36)) - FK para stores
- `gateway` (VARCHAR(50)) - Gateway usado: `stripe`
- `order_id` (VARCHAR(255)) - ID da sessão/transação no Stripe
- `amount` (DECIMAL(10,2)) - Valor da transação
- `status` (VARCHAR(50)) - Status: `waiting_payment`, `approved`, `refused`, `refunded`
- `metadata` (JSON) - Metadados da transação
- `payload_json` (JSON) - Payload completo do webhook
- `created_at`, `updated_at` (TIMESTAMP)

#### `subscription_logs` - Logs de Assinatura

**Campos:**
- `id` (CHAR(36)) - UUID
- `store_id` (CHAR(36)) - FK para stores
- `action` (VARCHAR(50)) - Ação: `checkout_created`, `renewed`, `expired`, `payment_failed`, etc
- `old_status`, `new_status` (VARCHAR(20)) - Status anterior e novo
- `old_ends_at`, `new_ends_at` (TIMESTAMP) - Datas anterior e nova
- `performed_by` (VARCHAR(255)) - Quem executou: `system`, `admin`, `user_id`
- `notes` (TEXT) - Observações
- `created_at` (TIMESTAMP)

---

## 🔧 Classes e Componentes

### `Stripe` (`api/classes/Stripe.php`)

**Responsabilidade:** Integração com API do Stripe

**Métodos Principais:**

```php
// Cria uma sessão de checkout
createCheckoutSession($data)
  → Retorna: ['id' => 'session_id', 'url' => 'checkout_url']

// Busca informações de uma sessão
getCheckoutSession($sessionId)
  → Retorna: Dados completos da sessão

// Busca informações de um payment intent
getPaymentIntent($paymentIntentId)
  → Retorna: Dados do payment intent

// Valida assinatura do webhook
validateWebhook($payload, $signature)
  → Retorna: bool (true se válido)

// Retorna chave pública (para frontend)
getPublishableKey()
  → Retorna: STRIPE_PUBLISHABLE_KEY
```

**Configuração Necessária:**
- `STRIPE_SECRET_KEY` - Chave secreta da API
- `STRIPE_PUBLISHABLE_KEY` - Chave pública (para frontend)
- `STRIPE_WEBHOOK_SECRET` - Secret do webhook

---

## 🌐 Endpoints da API

### Público (Sem Autenticação)

#### `GET /api/endpoints/plans.php`

**Descrição:** Lista todos os planos ativos disponíveis

**Resposta:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "uuid",
        "name": "Mensal",
        "slug": "profissional-mensal",
        "price": 139.90,
        "vehicle_limit": 50,
        "duration_days": 30,
        "features": ["Até 50 veículos", "..."],
        "is_active": true
      },
      ...
    ]
  }
}
```

**Arquivo:** `api/endpoints/plans.php`

---

### Autenticado (Require Auth)

#### `GET /api/endpoints/subscriptions.php`

**Descrição:** Retorna status atual da assinatura da loja

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "store_uuid",
      "plan_id": "plan_uuid",
      "plan_name": "Mensal",
      "plan_price": 139.90,
      "subscription_status": "active",
      "subscription_ends_at": "2024-02-15 10:00:00",
      ...
    }
  }
}
```

**Arquivo:** `api/endpoints/subscriptions.php`

---

#### `POST /api/endpoints/subscriptions.php?action=create_checkout`

**Descrição:** Cria uma sessão de checkout no Stripe

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "plan_slug": "profissional-mensal"
}
```

**Validações:**
- ✅ Usuário autenticado
- ✅ Loja existe
- ✅ Plano existe e está ativo (RB02)
- ✅ Plano especificado

**Resposta:**
```json
{
  "success": true,
  "data": {
    "session_id": "cs_test_...",
    "checkout_url": "https://checkout.stripe.com/...",
    "status": "waiting_payment",
    "plan": {
      "id": "uuid",
      "name": "Mensal",
      "slug": "profissional-mensal",
      "price": 139.90,
      "duration_days": 30
    },
    "message": "Checkout criado com sucesso"
  }
}
```

**Fluxo:**
1. Valida loja e plano
2. Calcula nova data de expiração (RB04 - Renovação)
3. Cria checkout session no Stripe
4. Salva transação em `payment_transactions`
5. Cria log em `subscription_logs`
6. Retorna URL de checkout

**Arquivo:** `api/endpoints/subscriptions.php`

---

#### `POST /api/endpoints/vehicles.php`

**Descrição:** Cria um novo veículo (com validação de limites)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2023,
  ...
}
```

**Validações (Section 9 - Controle de Limites):**
- ✅ `subscription_status` deve ser `active`
- ✅ Total de veículos < `vehicle_limit` (ou -1 = ilimitado)

**Resposta de Erro (Limite):**
```json
{
  "success": false,
  "error": "Você atingiu o limite de 50 veículos do seu plano. Faça upgrade para cadastrar mais veículos."
}
```

**Resposta de Erro (Status):**
```json
{
  "success": false,
  "error": "Você precisa de uma assinatura ativa para cadastrar veículos. Renove seu plano para continuar."
}
```

**Arquivo:** `api/endpoints/vehicles.php`

---

### Admin (Require Admin Auth)

#### `GET /api/endpoints/admin/subscriptions.php`

**Descrição:** Lista todas as lojas com informações de assinatura

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Params:**
- `status` (opcional) - Filtrar por status
- `page` (opcional, default: 1) - Página
- `limit` (opcional, default: 50) - Itens por página
- `store_id` (opcional) - Buscar logs de uma loja específica

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
        "plan_name": "Mensal",
        "plan_price": 139.90,
        "vehicle_count": 25,
        ...
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

**Arquivo:** `api/endpoints/admin/subscriptions.php`

---

#### `PUT /api/endpoints/admin/subscriptions.php`

**Descrição:** Atualiza status de assinatura (suspend/reactivate/cancel)

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body:**
```json
{
  "store_id": "uuid",
  "action": "suspend", // ou "reactivate", "cancel"
  "notes": "Motivo da ação"
}
```

**Ações:**
- `suspend` - Suspende assinatura (status → `suspended`)
- `reactivate` - Reativa assinatura (status → `active`, adiciona `duration_days`)
- `cancel` - Cancela assinatura (status → `canceled`)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "store": { ... },
    "message": "Status alterado de active para suspended"
  }
}
```

**Arquivo:** `api/endpoints/admin/subscriptions.php`

---

## 🔔 Webhooks

### `POST /api/webhooks/stripe.php`

**Descrição:** Processa eventos do Stripe

**Configuração no Stripe Dashboard:**
- URL: `https://seudominio.com/api/webhooks/stripe.php`
- Eventos a escutar:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `invoice.payment_failed`
  - `charge.refunded`

**Validação:**
- ✅ Valida assinatura do webhook usando `STRIPE_WEBHOOK_SECRET`
- ✅ Verifica idempotência (não processa evento duplicado)

**Eventos Processados:**

#### `checkout.session.completed`
**Quando:** Checkout concluído
**Ação:**
- Se `payment_status === 'paid'` → Ativa assinatura (RB03)
- Calcula nova data de expiração (Section 8)
- Cria log
- Envia e-mail de confirmação

#### `payment_intent.succeeded`
**Quando:** Pagamento bem-sucedido
**Ação:**
- Ativa assinatura (RB03)
- Calcula nova data de expiração
- Cria log
- Envia e-mail

#### `payment_intent.payment_failed` / `invoice.payment_failed`
**Quando:** Pagamento falhou
**Ação:**
- Status → `pending` (RB05)
- Cria log
- Envia e-mail de falha

#### `charge.refunded`
**Quando:** Reembolso processado
**Ação:**
- Status → `pending`
- Cria log
- Atualiza transação

**Arquivo:** `api/webhooks/stripe.php`

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Nova Assinatura (Primeira Vez)

```
1. Usuário cria loja → subscription_status = 'trial'
                        subscription_ends_at = +15 dias

2. Usuário acessa planos → GET /api/endpoints/plans.php
                         → Lista planos disponíveis

3. Usuário seleciona plano → POST /api/endpoints/subscriptions.php?action=create_checkout
                           → { plan_slug: 'profissional-mensal' }
                           → Cria checkout session no Stripe
                           → Retorna checkout_url

4. Usuário completa pagamento → Stripe processa pagamento
                               → Webhook: checkout.session.completed

5. Webhook processa evento → Ativa assinatura
                           → subscription_status = 'active'
                           → subscription_ends_at = now + duration_days
                           → Cria log
                           → Envia e-mail

6. Loja pode usar recursos → Validações passam
```

### Fluxo 2: Renovação (Antes de Expirar)

```
1. Usuário acessa planos → GET /api/endpoints/plans.php

2. Usuário cria checkout → POST /api/endpoints/subscriptions.php?action=create_checkout
                         → Calcula: subscription_ends_at + duration_days (RB04)

3. Pagamento confirmado → Webhook: payment_intent.succeeded
                        → Nova data = data_atual + duration_days

4. Assinatura estendida → subscription_ends_at atualizado
```

### Fluxo 3: Renovação (Após Expirar)

```
1. Assinatura expirada → subscription_status = 'pending' (via CRON)
                       → Recursos bloqueados

2. Usuário cria checkout → Calcula: now + duration_days (RB04)

3. Pagamento confirmado → Webhook processa
                        → subscription_status = 'active'
                        → subscription_ends_at = now + duration_days
```

### Fluxo 4: Validação de Limites

```
1. Usuário tenta criar veículo → POST /api/endpoints/vehicles.php

2. Validação verifica:
   ✅ subscription_status === 'active'
   ✅ vehicle_count < vehicle_limit (ou -1 = ilimitado)

3. Se passou → Cria veículo
   Se falhou → Retorna erro 403
```

---

## ⚙️ Configuração

### Variáveis de Ambiente (`.env`)

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...                    # Chave secreta (test ou live)
STRIPE_PUBLISHABLE_KEY=pk_test_...               # Chave pública
STRIPE_WEBHOOK_SECRET=whsec_...                  # Secret do webhook

# Aplicação
APP_URL=https://seudominio.com                   # URL base da aplicação

# E-mail (opcional, para envio de e-mails)
EMAIL_FROM=noreply@seudominio.com
EMAIL_FROM_NAME=ESTOX

# Admin (para painel administrativo)
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=estox
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=seu-secret-jwt-aqui
```

### Configuração no Stripe Dashboard

1. **Criar conta no Stripe**
   - Acesse: https://dashboard.stripe.com
   - Complete o cadastro

2. **Obter chaves de API**
   - Desenvolvedores → Chaves de API
   - Copie `Chave secreta` e `Chave publicável`
   - Use modo Test para desenvolvimento

3. **Configurar Webhook**
   - Desenvolvedores → Webhooks
   - Adicione endpoint: `https://seudominio.com/api/webhooks/stripe.php`
   - Selecione eventos:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `invoice.payment_failed`
     - `charge.refunded`
   - Copie o `Signing secret` (whsec_...)

---

## ✅ Validações e Regras de Negócio

### RB01 - Trial
- Toda loja inicia em `trial`
- Duração: 15 dias
- Ao expirar: status → `pending`

**Implementação:**
- `api/endpoints/stores.php` (criação de loja)
- `api/scripts/check-subscriptions.php` (expiração)

---

### RB02 - Contratação
- Apenas lojas autenticadas podem contratar
- Apenas planos ativos podem ser usados
- Loja `canceled` pode fazer nova contratação

**Implementação:**
- `api/endpoints/subscriptions.php` (create_checkout)

---

### RB03 - Ativação
- Somente webhooks do Stripe podem ativar assinaturas
- Ativação deve:
  - Atualizar status para `active`
  - Atualizar `subscription_ends_at`
  - Criar registro em `payment_transactions`
  - Criar log em `subscription_logs`
  - Enviar e-mail de confirmação

**Implementação:**
- `api/webhooks/stripe.php` (função `activateSubscription`)

---

### RB04 - Renovação
- Se assinatura ainda válida: `subscription_ends_at + duration_days`
- Se expirada: `now + duration_days`

**Implementação:**
- `api/endpoints/subscriptions.php` (create_checkout)
- `api/webhooks/stripe.php` (activateSubscription)

---

### RB05 - Falha de Pagamento
- Status → `pending`
- Não altera data de expiração
- Bloqueia recursos pagos

**Implementação:**
- `api/webhooks/stripe.php` (handlePaymentFailed)

---

### RB06 - Cancelamento
- Status → `canceled`
- Irreversível (exceto via nova contratação)
- Dados mantidos para histórico

**Implementação:**
- `api/endpoints/admin/subscriptions.php` (PUT)

---

### RB07 - Suspensão Administrativa
- Apenas admin
- Status → `suspended`
- Pode ser revertido

**Implementação:**
- `api/endpoints/admin/subscriptions.php` (PUT)

---

### Section 9 - Controle de Limites

**Validações antes de cadastrar veículo:**
- ✅ `subscription_status === 'active'`
- ✅ Total de veículos < `vehicle_limit`
- ✅ Regra especial: `vehicle_limit = -1` → ilimitado

**Implementação:**
- `api/endpoints/vehicles.php` (POST)

---

## 🛠️ Scripts e Ferramentas

### Scripts SQL

#### `001-create-tables.sql`
**Descrição:** Cria estrutura base do banco
**Tabelas:** `plans`, `users`, `stores`, `vehicles`, `leads`, etc
**Ordem:** 1º a executar

#### `006-create-subscription-tables.sql`
**Descrição:** Cria tabelas de assinatura
**Tabelas:** `payment_transactions`, `subscription_logs`, `subscription_emails`
**Ordem:** 2º a executar

#### `008-seed-professional-plans.sql`
**Descrição:** Insere planos profissionais
**Planos:** Mensal, Trimestral, Anual
**Ordem:** 3º a executar

#### `009-add-duration-days-to-plans.sql`
**Descrição:** Adiciona campo `duration_days` na tabela `plans`
**Ordem:** 4º a executar (se tabela já existe)

---

### Script PHP

#### `api/scripts/check-subscriptions.php`

**Descrição:** CRON job diário para verificar assinaturas

**Responsabilidades:**
- ✅ Expira trials (RB01)
- ✅ Expira assinaturas ativas
- ✅ Envia e-mails de lembrete (7, 10, 14 dias)
- ✅ Cria logs de expiração

**Configuração CRON:**
```bash
0 9 * * * php /caminho/para/api/scripts/check-subscriptions.php
```

**Execução Manual:**
```bash
php api/scripts/check-subscriptions.php
```

**Arquivo:** `api/scripts/check-subscriptions.php`

---

## 🔍 Troubleshooting

### Problema: Checkout não é criado

**Possíveis causas:**
1. `STRIPE_SECRET_KEY` não configurado
2. Chave inválida ou expirada
3. Erro na classe Stripe

**Solução:**
- Verificar variáveis de ambiente
- Verificar logs do servidor
- Testar chave no Stripe Dashboard

---

### Problema: Webhook não processa eventos

**Possíveis causas:**
1. `STRIPE_WEBHOOK_SECRET` não configurado
2. URL do webhook incorreta
3. Assinatura inválida

**Solução:**
- Verificar webhook no Stripe Dashboard
- Verificar logs: `error_log("Stripe Webhook received: ...")`
- Testar webhook manualmente no dashboard

---

### Problema: Assinatura não ativa após pagamento

**Possíveis causas:**
1. Webhook não está configurado
2. Evento não está sendo escutado
3. Erro no processamento do webhook

**Solução:**
- Verificar eventos no Stripe Dashboard
- Verificar logs do webhook
- Verificar se função `activateSubscription` está sendo chamada

---

### Problema: Limite de veículos não funciona

**Possíveis causas:**
1. Validação não está sendo executada
2. `vehicle_limit` não está sendo consultado
3. Status de assinatura incorreto

**Solução:**
- Verificar código em `api/endpoints/vehicles.php`
- Verificar se `subscription_status === 'active'`
- Verificar limite do plano

---

## 📊 Resumo de Arquivos

| Arquivo | Responsabilidade | Tipo |
|---------|-----------------|------|
| `api/classes/Stripe.php` | Integração com Stripe API | Classe |
| `api/endpoints/plans.php` | Lista planos (público) | Endpoint |
| `api/endpoints/subscriptions.php` | Gerenciamento de assinaturas | Endpoint |
| `api/endpoints/vehicles.php` | CRUD veículos (com limites) | Endpoint |
| `api/endpoints/admin/subscriptions.php` | Painel administrativo | Endpoint |
| `api/webhooks/stripe.php` | Processa eventos Stripe | Webhook |
| `api/scripts/check-subscriptions.php` | CRON job diário | Script |
| `scripts/009-add-duration-days-to-plans.sql` | Migração duration_days | SQL |
| `scripts/008-seed-professional-plans.sql` | Seed de planos | SQL |

---

## ⚠️ Edge Cases Críticos

### Webhook Stripe após Ação Manual (CRÍTICO)

**Cenário:**
1. Admin cancela/suspende/alta plano manualmente via painel
2. Posteriormente chega um webhook do Stripe (pagamento confirmado, reembolso, etc)

**Regra Implementada:**
- ✅ O sistema **NÃO deve sobrescrever** o status definido manualmente por admin
- ✅ O webhook deve **apenas registrar a transação** em `payment_transactions`
- ✅ Qualquer tentativa de reativação automática deve ser **ignorada** se status for `canceled` ou `suspended` por admin

**Implementação:**
- Verificação em `activateSubscription()` no webhook
- Consulta `subscription_logs` para verificar se última ação foi por admin
- Se sim, apenas registra transação e retorna sem alterar status

**⚠️ IMPORTANTE:** Isso evita reativação indevida de cliente cancelado/suspenso por solicitação administrativa.

**Exemplo:**
```php
// Se loja foi cancelada/suspensa por admin
if (in_array($store['subscription_status'], ['canceled', 'suspended'])) {
    $lastAdminAction = $db->fetchOne(
        "SELECT * FROM subscription_logs 
         WHERE store_id = :store_id 
         AND action IN ('canceled', 'suspended')
         AND performed_by != 'system'",
        ['store_id' => $storeId]
    );
    
    if ($lastAdminAction) {
        // Apenas registrar transação, não alterar status
        return;
    }
}
```

---

## 📝 Notas Importantes

1. **Sem Hardcode:** Nenhum plano está hardcoded no código. Tudo vem do banco (Section 4.2)

2. **Cálculo de Expiração:** Sempre usa `duration_days` do plano. Nunca hardcode de `+30 days` (Section 8)

3. **Segurança:** Webhooks validados com assinatura (Section 13)

4. **Idempotência:** Webhooks verificam duplicatas antes de processar

5. **Logs Completos:** Toda ação importante é logada em `subscription_logs`

6. **E-mails:** E-mails enviados via `EmailService` (sucesso, falha, lembretes)

7. **Stripe não é Fonte de Verdade:** Status e permissões vêm do banco de dados local

8. **Proteção contra Sobrescrita:** Webhooks não sobrescrevem ações administrativas manuais

---

## 🚀 Próximos Passos

1. Execute os scripts SQL na ordem
2. Configure variáveis de ambiente
3. Configure webhook no Stripe Dashboard
4. Teste o fluxo completo
5. Configure CRON job diário
6. Monitore logs e transações

---

**Última atualização:** 2024-01-XX
**Versão:** 1.0.0
