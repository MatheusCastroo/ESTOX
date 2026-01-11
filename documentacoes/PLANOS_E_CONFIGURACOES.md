# 📋 Documentação Completa - Planos e Configurações ESTOX

Este documento descreve detalhadamente todos os planos de assinatura, configurações e funcionalidades do sistema ESTOX.

---

## 📊 Índice

1. [Estrutura da Tabela de Planos](#estrutura-da-tabela-de-planos)
2. [Planos Ativos Atualmente](#planos-ativos-atualmente)
3. [Planos Legacy/Inativos](#planos-legacyinativos)
4. [Configurações de Assinatura](#configurações-de-assinatura)
5. [Limites e Features por Plano](#limites-e-features-por-plano)
6. [Status de Assinatura](#status-de-assinatura)
7. [Períodos de Assinatura](#períodos-de-assinatura)
8. [Tabelas Relacionadas](#tabelas-relacionadas)
9. [Endpoints da API](#endpoints-da-api)
10. [Notas Importantes](#notas-importantes)

---

## 🗄️ Estrutura da Tabela de Planos

### Tabela: `plans`

```sql
CREATE TABLE plans (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  vehicle_limit INTEGER NOT NULL,  -- -1 = ilimitado
  features JSON DEFAULT ('[]'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_plans_slug (slug),
  INDEX idx_plans_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Campos Explicados

- **id**: UUID único do plano
- **name**: Nome exibido do plano (ex: "Mensal", "Trimestral", "Anual")
- **slug**: Identificador único URL-friendly (ex: "profissional-mensal")
- **price**: Preço do plano em R$ (valor total, não mensal)
- **vehicle_limit**: Limite de veículos (-1 = ilimitado)
- **features**: Array JSON com lista de funcionalidades
- **is_active**: Se o plano está ativo e disponível para assinatura
- **created_at**: Data de criação do registro
- **updated_at**: Data da última atualização

---

## ✅ Planos Ativos Atualmente

### Sistema Atual (Planos Profissionais com Periodicidade)

O sistema atual utiliza **apenas planos profissionais** com diferentes periodicidades. Estes são os planos retornados pela API pública.

#### 1. Profissional Mensal

- **Nome**: `Mensal`
- **Slug**: `profissional-mensal`
- **Preço**: R$ 139,90 (valor único por mês)
- **Limite de Veículos**: 50
- **Status**: ✅ Ativo
- **Features**:
  - Até 50 veículos
  - Catálogo com URL personalizada
  - Suporte prioritário
  - Relatórios avançados
  - Integração WhatsApp
  - Destaque nos anúncios

#### 2. Profissional Trimestral

- **Nome**: `Trimestral`
- **Slug**: `profissional-trimestral`
- **Preço**: R$ 359,70 (total do trimestre)
  - Equivale a R$ 119,90/mês
  - **Economia**: R$ 20,00/mês em relação ao mensal
  - **Desconto**: 14,3%
- **Limite de Veículos**: 50
- **Status**: ✅ Ativo
- **Features**:
  - Até 50 veículos
  - Catálogo com URL personalizada
  - Suporte prioritário
  - Relatórios avançados
  - Integração WhatsApp
  - Destaque nos anúncios

#### 3. Profissional Anual

- **Nome**: `Anual`
- **Slug**: `profissional-anual`
- **Preço**: R$ 1.318,80 (total do ano)
  - Equivale a R$ 109,90/mês
  - **Economia**: R$ 30,00/mês em relação ao mensal
  - **Desconto**: 21,4%
- **Limite de Veículos**: 50
- **Status**: ✅ Ativo
- **Features**:
  - Até 50 veículos
  - Catálogo com URL personalizada
  - Suporte prioritário
  - Relatórios avançados
  - Integração WhatsApp
  - Destaque nos anúncios

### 📝 Observações sobre Planos Ativos

- Todos os três planos compartilham as mesmas features e limites
- A diferença está apenas no período de pagamento e preço
- O endpoint `/api/endpoints/plans.php` retorna apenas estes 3 planos
- Ordenação: Por preço ascendente (Mensal → Trimestral → Anual)

---

## 📜 Planos Legacy/Inativos

### Planos Antigos (Criados no Script 002)

Estes planos foram criados inicialmente mas **não estão mais em uso ativo**:

#### 1. Básico (Legacy)

- **Nome**: `Básico`
- **Slug**: `basico`
- **Preço**: R$ 99,90/mês
- **Limite de Veículos**: 20
- **Status**: ❓ Status desconhecido (não especificado no script)
- **Features**:
  - Até 20 veículos
  - Catálogo online personalizado
  - Leads via WhatsApp
  - Suporte por email

#### 2. Profissional (Legacy - Antigo)

- **Nome**: `Profissional`
- **Slug**: `profissional`
- **Preço**: R$ 199,90/mês
- **Limite de Veículos**: 50
- **Status**: ❌ **Desativado automaticamente** pelo script 008
  - O script 008 desativa este plano quando executa: `UPDATE plans SET is_active = false WHERE slug = 'profissional'`
- **Features**:
  - Até 50 veículos
  - Tudo do Básico
  - Relatórios avançados
  - Destaque nos resultados
  - Suporte prioritário

#### 3. Enterprise (Legacy)

- **Nome**: `Enterprise`
- **Slug**: `enterprise`
- **Preço**: R$ 399,90/mês
- **Limite de Veículos**: -1 (Ilimitado)
- **Status**: ❓ Status desconhecido (não especificado no script)
- **Features**:
  - Veículos ilimitados
  - Tudo do Profissional
  - API de integração
  - Multi-usuários
  - Gerente de conta dedicado

### ⚠️ Observações sobre Planos Legacy

- O plano "Profissional" antigo é automaticamente desativado quando o script 008 é executado
- Estes planos não são retornados pela API atual (`/api/endpoints/plans.php`)
- Podem ainda estar referenciados em `stores.plan_id` (por isso não são deletados, apenas desativados)
- O script 008 **deleta** os planos profissionais com periodicidade se existirem antes de recriá-los

---

## ⚙️ Configurações de Assinatura

### Tabela: `stores` - Campos de Assinatura

```sql
plan_id CHAR(36)                    -- FK para plans(id)
subscription_status VARCHAR(20)     -- Status da assinatura
subscription_ends_at TIMESTAMP NULL -- Data de expiração
```

### Relacionamento com Planos

- Uma loja (`store`) pode ter um plano (`plan`) associado
- O campo `plan_id` pode ser `NULL` (loja sem plano)
- Se o plano for deletado, `plan_id` é definido como `NULL` (ON DELETE SET NULL)
- O limite de veículos é verificado com base no `vehicle_limit` do plano associado

---

## 📋 Limites e Features por Plano

### Comparativo de Planos Ativos

| Plano | Preço Total | Preço Mensal Equivalente | Limite Veículos | Periodicidade |
|-------|------------|-------------------------|-----------------|---------------|
| Mensal | R$ 139,90 | R$ 139,90/mês | 50 | Mensal |
| Trimestral | R$ 359,70 | R$ 119,90/mês | 50 | Trimestral (3 meses) |
| Anual | R$ 1.318,80 | R$ 109,90/mês | 50 | Anual (12 meses) |

### Features Comuns (Todos os Planos Profissionais)

1. ✅ **Até 50 veículos** - Limite máximo de veículos no catálogo
2. ✅ **Catálogo com URL personalizada** - Domínio/subdomínio próprio
3. ✅ **Suporte prioritário** - Atendimento com prioridade
4. ✅ **Relatórios avançados** - Análises detalhadas de performance
5. ✅ **Integração WhatsApp** - Integração para comunicação com leads
6. ✅ **Destaque nos anúncios** - Veículos aparecem em destaque nos resultados

### Comparativo de Planos Legacy (Para Referência)

| Plano | Preço | Limite Veículos | Status |
|-------|-------|-----------------|--------|
| Básico | R$ 99,90/mês | 20 | Legacy |
| Profissional (antigo) | R$ 199,90/mês | 50 | Desativado |
| Enterprise | R$ 399,90/mês | Ilimitado (-1) | Legacy |

---

## 🔄 Status de Assinatura

### Valores Possíveis: `subscription_status`

Definidos na tabela `stores` com constraint CHECK:

```sql
subscription_status VARCHAR(20) DEFAULT 'trial' 
CHECK (subscription_status IN ('trial', 'active', 'pending', 'suspended', 'canceled'))
```

#### 1. `trial` (Padrão)
- **Descrição**: Período de teste gratuito
- **Comportamento**: Acesso limitado, geralmente 14 dias
- **Transição**: Automaticamente muda para `pending` quando expira

#### 2. `active`
- **Descrição**: Assinatura ativa e paga
- **Comportamento**: Acesso completo às funcionalidades do plano
- **Duração**: Definida por `subscription_ends_at` (geralmente 30 dias após pagamento)

#### 3. `pending`
- **Descrição**: Aguardando pagamento ou renovação
- **Comportamento**: Acesso pode ser limitado, aguardando confirmação de pagamento
- **Origem**: Trial expirado ou pagamento pendente

#### 4. `suspended`
- **Descrição**: Conta suspensa (administrativamente)
- **Comportamento**: Acesso bloqueado, pode ser reativado por admin
- **Ação**: Pode ser reativada para `active` por administrador

#### 5. `canceled`
- **Descrição**: Assinatura cancelada
- **Comportamento**: Acesso finalizado, conta mantida para histórico
- **Reversível**: Não reversível (requer nova assinatura)

### Fluxo de Status

```
[trial] → (expira) → [pending] → (pagamento) → [active] → (renovação) → [active]
                                    ↓
                            (pagamento falha) → [pending]
                                    ↓
                            (admin suspende) → [suspended] → (admin reativa) → [active]
                                    ↓
                            (cancelamento) → [canceled]
```

---

## 📅 Períodos de Assinatura

### Duração Padrão

- **Trial**: 15 dias (definido em `api/endpoints/stores.php` quando loja é criada)
  - ⚠️ **Nota**: Existe inconsistência no código TypeScript (`lib/actions/stores.ts`) que define 14 dias - precisa ser sincronizado
- **Ativa após pagamento**: 30 dias (definido no webhook de pagamento)
- **Renovação**: Cada pagamento aprovado adiciona +30 dias ao `subscription_ends_at`

### Cálculo de Expiração

```php
// Trial (ao criar loja)
'subscription_ends_at' => date('Y-m-d H:i:s', strtotime('+15 days'))

// Após pagamento aprovado (webhook Stripe)
$newEndsAt = date('Y-m-d H:i:s', strtotime('+30 days'));
```

### Renovação Automática

- Renovação ocorre via webhook quando pagamento é aprovado
- Cada pagamento aprovado adiciona +30 dias ao `subscription_ends_at`
- Se não houver pagamento, status muda para `pending` (via CRON job diário)
- CRON job verifica expirações e envia e-mails de lembrete automaticamente

### Script CRON Diário

**Arquivo**: `api/scripts/check-subscriptions.php`

**Funções**:
- ✅ Verifica lojas em trial ou ativas próximas ao vencimento
- ✅ Envia e-mails de lembrete (7, 10, 14 dias antes)
- ✅ Expira trial vencido automaticamente (muda para `pending`)
- ✅ Registra logs em `subscription_logs`

**Configuração CRON**:
```bash
0 9 * * * php /caminho/para/ESTOX/api/scripts/check-subscriptions.php
```
(Executa diariamente às 9h)

---

## 🔗 Tabelas Relacionadas

### 1. `payment_transactions`

Armazena todas as transações de pagamento relacionadas às assinaturas.

```sql
CREATE TABLE payment_transactions (
  id CHAR(36) PRIMARY KEY,
  store_id CHAR(36) NOT NULL,
  gateway VARCHAR(50) DEFAULT 'stripe',  -- 'stripe', 'pagarme', etc
  order_id VARCHAR(255),
  transaction_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50),  -- 'approved', 'refused', 'canceled', 'waiting_payment', 'expired', 'refunded'
  payment_method VARCHAR(50),  -- 'credit_card', 'boleto', 'pix'
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  metadata JSON DEFAULT ('{}'),
  payload_json JSON DEFAULT ('{}'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);
```

### 2. `subscription_logs`

Registra todas as mudanças de status e ações relacionadas a assinaturas.

```sql
CREATE TABLE subscription_logs (
  id CHAR(36) PRIMARY KEY,
  store_id CHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,  -- 'created', 'renewed', 'suspended', 'reactivated', 'canceled'
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  old_ends_at TIMESTAMP NULL,
  new_ends_at TIMESTAMP NULL,
  performed_by VARCHAR(255),  -- user_id ou "system"
  notes TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);
```

### 3. `subscription_emails`

Registra todos os e-mails enviados relacionados a assinaturas.

```sql
CREATE TABLE subscription_emails (
  id CHAR(36) PRIMARY KEY,
  store_id CHAR(36) NOT NULL,
  email_type VARCHAR(50) NOT NULL,  -- 'trial_reminder_7d', 'trial_reminder_10d', 'trial_reminder_14d', 'payment_success', 'payment_failed'
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'sent',  -- 'sent', 'failed'
  error_message TEXT,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);
```

### 4. `notification_settings`

Configurações de notificações por loja.

```sql
CREATE TABLE notification_settings (
  id CHAR(36) PRIMARY KEY,
  store_id CHAR(36) NOT NULL UNIQUE,
  new_lead_email BOOLEAN DEFAULT true,
  weekly_report BOOLEAN DEFAULT true,
  platform_updates BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);
```

---

## 🌐 Endpoints da API

### GET `/api/endpoints/plans.php`

**Descrição**: Retorna todos os planos profissionais ativos (Mensal, Trimestral, Anual)

**Autenticação**: Não requerida (público)

**Resposta de Sucesso**:
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
        "features": [
          "Até 50 veículos",
          "Catálogo com URL personalizada",
          "Suporte prioritário",
          "Relatórios avançados",
          "Integração WhatsApp",
          "Destaque nos anúncios"
        ],
        "is_active": true,
        "created_at": "2024-01-01 00:00:00",
        "updated_at": "2024-01-01 00:00:00"
      },
      // ... outros planos
    ]
  }
}
```

**Ordenação**: Por preço ascendente (ORDER BY price ASC)

**Filtros**:
- Apenas planos com `slug IN ('profissional-mensal', 'profissional-trimestral', 'profissional-anual')`
- Apenas planos com `is_active = true`

**Tratamento de Erro**: Retorna array vazio `{"plans": []}` em caso de erro

### GET `/api/endpoints/subscriptions.php`

**Descrição**: Retorna status atual da assinatura do usuário autenticado

**Autenticação**: ✅ Requerida (Bearer token)

**Resposta de Sucesso**:
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid",
      "name": "Nome da Loja",
      "plan_id": "uuid",
      "plan_name": "Mensal",
      "plan_price": 139.90,
      "subscription_status": "active",
      "subscription_ends_at": "2024-02-01 00:00:00",
      ...
    }
  }
}
```

**Comportamento**:
- Verifica automaticamente se trial expirou
- Se trial expirou, atualiza status para `pending` automaticamente
- Retorna informações do plano associado (se houver)

### POST `/api/endpoints/subscriptions.php?action=create_checkout`

**Descrição**: Cria checkout de pagamento no gateway (Stripe)

**Autenticação**: ✅ Requerida (Bearer token)

**Body**:
```json
{
  "plan_slug": "profissional-mensal",
  "payment_method": "credit_card"
}
```

**Resposta de Sucesso**:
```json
{
  "success": true,
  "data": {
    "checkout_url": "https://checkout.stripe.com/...",
    "session_id": "cs_test_...",
    "status": "waiting_payment"
  }
}
```

### POST `/api/webhooks/stripe.php`

**Descrição**: Webhook para receber notificações de pagamento do Stripe

**Autenticação**: Validação de assinatura do webhook Stripe (Stripe-Signature header)

**Eventos Tratados** (eventos Stripe):
- `checkout.session.completed` → Ativa assinatura (status `active` + 30 dias)
- `payment_intent.succeeded` → Confirma pagamento e ativa assinatura
- `payment_intent.payment_failed` → Marca como `pending`
- `charge.refunded` → Marca como `pending`
- `invoice.payment_failed` → Marca como `pending`

**Ações Automáticas**:
- ✅ Atualiza `subscription_status` e `subscription_ends_at` na tabela `stores`
- ✅ Registra transação em `payment_transactions`
- ✅ Cria log em `subscription_logs`
- ✅ Envia e-mail de confirmação/falha via `EmailService`

### GET/PUT `/api/endpoints/admin/subscriptions.php`

**Descrição**: Painel administrativo para gerenciar assinaturas

**Autenticação**: ✅ Requerida (admin)

**GET**: Lista assinaturas com filtros (status, página, limite)

**PUT**: Ações administrativas
- `suspend` → Suspende conta (status `suspended`)
- `reactivate` → Reativa conta (status `active` + 30 dias)
- `cancel` → Cancela conta (status `canceled`)

---

## ⚠️ Notas Importantes

### 1. Migração de Planos

- O script `008-seed-professional-plans.sql` **desativa** o plano antigo "Profissional" mas **não o deleta** para preservar referências em `stores.plan_id`
- Planos antigos com periodicidade são **deletados** antes de serem recriados (seguro pois não devem estar em uso)

### 2. Inconsistências entre Frontend e Backend

**Frontend** (`components/landing/pricing.tsx`):
- Mostra planos: Básico (R$ 97), Profissional (R$ 197), Empresarial (R$ 397)
- Limites diferentes: Profissional mostra "Até 100 veículos"

**Backend** (API e Banco):
- Retorna apenas planos profissionais com periodicidade (Mensal, Trimestral, Anual)
- Limite padrão: 50 veículos

⚠️ **Recomendação**: Sincronizar o frontend com os dados reais da API

### 3. Validação de Limites

- O limite de veículos deve ser verificado antes de permitir cadastro de novo veículo
- Valor `-1` no `vehicle_limit` significa **ilimitado**
- Validação deve considerar o plano atual da loja (`stores.plan_id`)

### 4. Preços e Valores

- Todos os preços são em **Reais Brasileiros (R$)**
- Valores armazenados como `DECIMAL(10, 2)` (máximo 99999999.99)
- Preços são **valores totais**, não mensais (exceto quando especificado)

### 5. Ativação/Desativação de Planos

- Planos desativados (`is_active = false`) não aparecem na API pública
- Lojas com planos desativados mantêm referência mas podem ter acesso limitado
- Recomendação: Migrar lojas de planos desativados para planos ativos

### 6. Webhooks de Pagamento

- Pagamentos processados via **Stripe** (gateway padrão)
- Status de pagamento atualiza automaticamente o `subscription_status`
- Pagamento aprovado → `active` + 30 dias
- Pagamento recusado/falhado → `pending`

### 7. Período de Trial

- Trial padrão: **15 dias** (configurado em `api/endpoints/stores.php`)
  ```php
  'subscription_ends_at' => date('Y-m-d H:i:s', strtotime('+15 days'))
  ```
- Após expiração: Status muda automaticamente para `pending` (via CRON job diário)
- E-mails de lembrança enviados em: **7 dias**, **10 dias** e **14 dias** antes do término
  - Executado pelo script CRON: `api/scripts/check-subscriptions.php`
  - E-mails registrados em `subscription_emails` com tipos: `trial_reminder_7d`, `trial_reminder_10d`, `trial_reminder_14d`

### 8. Integração de Pagamento (Stripe)

- **Gateway padrão**: Stripe
- **Webhook**: `/api/webhooks/stripe.php` - Recebe eventos do Stripe
- **Status de pagamento atualiza automaticamente**:
  - `checkout.session.completed` / `payment_intent.succeeded` → `active` + adiciona 30 dias
  - `payment_intent.payment_failed` / `charge.refunded` / `invoice.payment_failed` → `pending`
- **Checkout**: Endpoint `/api/subscriptions?action=create_checkout` cria sessão de checkout no Stripe
- **Transações registradas**: Tabela `payment_transactions` com payload completo do webhook
- **Eventos Stripe suportados**: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `invoice.payment_failed`

---

## 📝 Scripts SQL Relacionados

1. **001-create-tables.sql** - Cria estrutura da tabela `plans`
2. **002-seed-plans.sql** - Cria planos iniciais (Básico, Profissional antigo, Enterprise)
3. **006-create-subscription-tables.sql** - Cria tabelas de assinatura, pagamentos e logs
4. **008-seed-professional-plans.sql** - Cria planos profissionais com periodicidade (atual)

---

## 🔍 Queries Úteis

### Listar todos os planos (ativos e inativos)
```sql
SELECT id, name, slug, price, vehicle_limit, is_active, created_at
FROM plans
ORDER BY is_active DESC, price ASC;
```

### Listar apenas planos ativos
```sql
SELECT * FROM plans WHERE is_active = true ORDER BY price ASC;
```

### Verificar lojas com planos desativados
```sql
SELECT s.id, s.name, p.name as plan_name, p.slug, p.is_active
FROM stores s
JOIN plans p ON s.plan_id = p.id
WHERE p.is_active = false;
```

### Estatísticas de planos por loja
```sql
SELECT 
  p.name,
  p.slug,
  COUNT(s.id) as total_stores,
  SUM(CASE WHEN s.subscription_status = 'active' THEN 1 ELSE 0 END) as active_stores
FROM plans p
LEFT JOIN stores s ON s.plan_id = p.id
GROUP BY p.id, p.name, p.slug
ORDER BY total_stores DESC;
```

---

## 🔧 Variáveis de Ambiente Necessárias

### Configuração Stripe (Gateway de Pagamento)

```env
STRIPE_SECRET_KEY=sk_test_...  # ou sk_live_... em produção
STRIPE_PUBLISHABLE_KEY=pk_test_...  # ou pk_live_... em produção
STRIPE_WEBHOOK_SECRET=whsec_...  # Secret do webhook endpoint
STRIPE_ENV=test  # ou 'live' em produção
```

### Configuração E-mail

```env
EMAIL_FROM=noreply@seudominio.com
ADMIN_EMAILS=admin@seudominio.com,admin2@seudominio.com
APP_URL=https://seudominio.com  # URL base da aplicação
```

### Configuração Banco de Dados

```env
DB_HOST=localhost
DB_NAME=estox
DB_USER=root
DB_PASS=
DB_CHARSET=utf8mb4
```

> **Nota**: As variáveis de ambiente são utilizadas pelas classes de integração com Stripe, `EmailService` e `Database`.

---

## 📞 Suporte e Manutenção

### Para Alterações nos Planos

1. ✅ Atualizar script SQL correspondente (`scripts/008-seed-professional-plans.sql`)
2. ✅ Executar script em ambiente de desenvolvimento/teste
3. ✅ Testar endpoints da API (`/api/endpoints/plans.php`)
4. ✅ Verificar frontend (sincronizar se necessário)
5. ✅ Documentar mudanças neste arquivo
6. ✅ Executar em produção após aprovação

### Para Alterações no Período de Trial

1. ✅ Atualizar em `api/endpoints/stores.php` (PHP - valor oficial)
2. ✅ Sincronizar em `lib/actions/stores.ts` (TypeScript - se aplicável)
3. ✅ Ajustar e-mails de lembrete em `api/classes/EmailService.php` (se necessário)
4. ✅ Atualizar documentação

### Checklist de Manutenção Periódica

- [ ] Verificar CRON job está executando diariamente
- [ ] Monitorar logs de webhook (`payment_transactions`)
- [ ] Verificar e-mails não entregues (`subscription_emails` com `status = 'failed'`)
- [ ] Revisar lojas com status `pending` há mais de 7 dias
- [ ] Verificar planos desativados ainda em uso (`stores.plan_id`)

---

## 📚 Referências e Arquivos Relacionados

### Documentação Relacionada

- `documentacoes/REQUISITOS_E_IMPLEMENTACAO.md` - Estrutura geral do sistema
- `documentacoes/REQ-FR-020_IMPLEMENTADO.md` - Implementação de features

### Arquivos de Código Principais

**Backend (PHP)**:
- `api/endpoints/plans.php` - Endpoint público de planos
- `api/endpoints/subscriptions.php` - Gerenciamento de assinaturas
- `api/webhooks/stripe.php` - Webhook Stripe (recebe eventos de pagamento)
- `api/classes/EmailService.php` - Serviço de e-mails
- `api/scripts/check-subscriptions.php` - Script CRON diário

**Frontend (TypeScript/React)**:
- `components/landing/pricing.tsx` - Componente de planos (landing)
- `lib/actions/stores.ts` - Ações relacionadas a lojas
- `lib/types/database.ts` - Tipos TypeScript

**Banco de Dados (SQL)**:
- `scripts/001-create-tables.sql` - Estrutura da tabela `plans`
- `scripts/002-seed-plans.sql` - Planos iniciais (legacy)
- `scripts/006-create-subscription-tables.sql` - Tabelas de assinatura
- `scripts/008-seed-professional-plans.sql` - Planos profissionais atuais

---

**Última Atualização**: Janeiro 2024  
**Versão do Documento**: 1.1  
**Mantido por**: Equipe ESTOX

---

## 📝 Histórico de Versões

### v1.1 (Janeiro 2024)
- ✅ Adicionada seção de endpoints de assinatura
- ✅ Adicionada seção de webhooks
- ✅ Adicionada seção de variáveis de ambiente
- ✅ Corrigido período de trial (15 dias)
- ✅ Adicionada seção de CRON jobs
- ✅ Adicionada seção de referências e arquivos relacionados

### v1.0 (Janeiro 2024)
- ✅ Versão inicial da documentação
- ✅ Estrutura completa de planos ativos e legacy
- ✅ Configurações de assinatura
- ✅ Status e períodos
- ✅ Tabelas relacionadas
