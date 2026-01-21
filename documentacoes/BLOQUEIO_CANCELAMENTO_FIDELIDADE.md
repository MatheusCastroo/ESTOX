# 📌 Bloqueio de Cancelamento por Fidelidade (Stripe)

## ✅ Implementação Completa

Este documento descreve a implementação do sistema de bloqueio de cancelamento por fidelidade para assinaturas Stripe.

## 🗄️ Estrutura do Banco de Dados

### 1. Campo `loyalty_months` na tabela `plans`

Adicionado campo para definir o período mínimo de fidelidade em meses:

```sql
-- Script: scripts/010-add-loyalty-months-to-plans.sql
loyalty_months INT DEFAULT 0
```

**Valores configurados:**
- `profissional-mensal`: 0 meses (sem fidelidade)
- `profissional-trimestral`: 3 meses
- `profissional-anual`: 12 meses

### 2. Tabela `stripe_subscriptions`

Nova tabela para rastrear assinaturas Stripe:

```sql
-- Script: scripts/011-create-stripe-subscriptions-table.sql
CREATE TABLE stripe_subscriptions (
  id CHAR(36) PRIMARY KEY,
  store_id CHAR(36) NOT NULL,
  subscription_id VARCHAR(255) UNIQUE NOT NULL,
  plan_id CHAR(36) NOT NULL,
  plan_slug VARCHAR(50) NOT NULL,
  data_inicio TIMESTAMP NOT NULL,
  meses_pagos INT DEFAULT 0,
  data_liberacao_cancelamento TIMESTAMP NULL,
  loyalty_status VARCHAR(20) DEFAULT 'locked', -- 'locked' ou 'completed'
  status VARCHAR(50) DEFAULT 'active',
  cancel_at_period_end BOOLEAN DEFAULT false,
  ...
)
```

### 3. Tabela `stripe_invoices` ⚠️ CRÍTICO

**Proteção contra processamento duplicado de webhooks:**

```sql
-- Script: scripts/012-create-stripe-invoices-table.sql
CREATE TABLE stripe_invoices (
  id CHAR(36) PRIMARY KEY,
  invoice_id VARCHAR(255) UNIQUE NOT NULL, -- Previne duplicação
  subscription_id VARCHAR(255) NOT NULL,
  store_id CHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  paid_at TIMESTAMP NULL,
  period_start TIMESTAMP NULL,
  period_end TIMESTAMP NULL,
  ...
)
```

**Por que é crítico:**
- Stripe pode reenviar webhooks
- Sem essa proteção, `meses_pagos` pode ser incrementado múltiplas vezes
- Isso liberaria cancelamento antes da hora

## 🔧 Funcionalidades Implementadas

### 1. Classe Stripe Atualizada

**Novos métodos em `api/classes/Stripe.php`:**

- `createSubscriptionCheckoutSession()` - Cria checkout para assinatura recorrente mensal
- `getSubscription()` - Busca assinatura no Stripe
- `cancelSubscriptionAtPeriodEnd()` - Cancela assinatura ao final do período
- `resumeSubscription()` - Reativa assinatura cancelada
- `listPaidInvoices()` - Lista faturas pagas
- `countPaidInvoices()` - Conta faturas pagas

### 2. Endpoint de Cancelamento

**POST /api/subscriptions?action=cancel**

Valida fidelidade antes de permitir cancelamento:

```php
// Validação de fidelidade
if ($loyaltyMonths > 0 && $mesesPagos < $loyaltyMonths) {
    // Bloqueia cancelamento
    Response::error(
        "Este plano possui fidelidade mínima de {$loyaltyMonths} meses. 
         O cancelamento estará disponível a partir de {$dataLiberacaoFormatada}.",
        403
    );
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Cancelamento solicitado com sucesso. Sua assinatura será cancelada ao final do período atual.",
  "subscription_id": "sub_xxx",
  "cancel_at_period_end": true,
  "current_period_end": "2024-12-31 23:59:59",
  "current_period_end_formatted": "31/12/2024 23:59"
}
```

**Resposta de bloqueio:**
```json
{
  "success": false,
  "message": "Este plano possui fidelidade mínima de 3 meses. O cancelamento estará disponível a partir de 15/03/2024.",
  "loyalty_months": 3,
  "months_paid": 2,
  "months_required": 3,
  "cancellation_available_date": "2024-03-15",
  "cancellation_available_date_formatted": "15/03/2024"
}
```

### 3. Webhook Stripe Atualizado

**Novos eventos processados em `api/webhooks/stripe.php`:**

- `customer.subscription.created` - Cria registro em `stripe_subscriptions`
- `customer.subscription.updated` - Atualiza status da assinatura + **detecta cancelamentos indevidos**
- `invoice.paid` - Incrementa `meses_pagos` quando fatura é paga (**com proteção contra duplicação**)

**Fluxo:**
1. Cliente cria assinatura → `customer.subscription.created` → Cria registro
2. Fatura paga → `invoice.paid` → Verifica se já processada → Incrementa `meses_pagos` → Atualiza `data_liberacao_cancelamento` baseado em invoices
3. Após fidelidade cumprida → `loyalty_status = 'completed'` → Cancelamento permitido

**Proteção contra duplicação:**
- Antes de processar `invoice.paid`, verifica se `invoice_id` já existe em `stripe_invoices`
- Se já processada, ignora o webhook
- Previne contagem duplicada de meses

**Detecção de cancelamento indevido:**
- No `customer.subscription.updated`, verifica se cancelamento ocorreu antes da fidelidade
- Se detectado, registra em `subscription_logs` com ação `unauthorized_cancellation`
- Alerta admin via log (TODO: implementar email de alerta)

### 4. Criação de Checkout Atualizada

**Em `api/endpoints/subscriptions.php`:**

- ✅ **TODOS os planos agora usam subscription mode** (não payment)
- Mantém lógica única de cobrança
- Facilita métricas MRR
- Plano Mensal: subscription com cancelamento imediato (sem fidelidade)
- Planos Trimestral/Anual: subscription com fidelidade

**Cálculo de preço mensal:**
- Mensal: R$ 139,90/mês (já está correto)
- Trimestral: R$ 359,70 / 3 = R$ 119,90/mês
- Anual: R$ 1.318,80 / 12 = R$ 109,90/mês

### 5. GET /api/subscriptions Atualizado

Retorna informações de fidelidade:

```json
{
  "success": true,
  "subscription": {
    "id": "...",
    "subscription_status": "active",
    "plan_name": "Trimestral",
    "plan_slug": "profissional-trimestral",
    "loyalty_months": 3,
    "stripe_subscription": {
      "subscription_id": "sub_xxx",
      "months_paid": 2,
      "loyalty_months": 3,
      "loyalty_status": "locked",
      "can_cancel": false,
      "cancel_at_period_end": false,
      "cancellation_available_date": "2024-03-15",
      "cancellation_available_date_formatted": "15/03/2024",
      "months_remaining": 1
    }
  }
}
```

### 6. Endpoint de Preview de Cancelamento

**GET /api/subscriptions?action=cancellation-preview**

Retorna informações detalhadas sobre elegibilidade de cancelamento:

```json
{
  "success": true,
  "can_cancel": false,
  "has_subscription": true,
  "subscription_id": "sub_xxx",
  "plan_name": "Trimestral",
  "plan_slug": "profissional-trimestral",
  "loyalty_months": 3,
  "months_paid": 2,
  "loyalty_status": "locked",
  "cancel_at_period_end": false,
  "message": "Este plano possui fidelidade mínima de 3 meses. Você ainda precisa pagar 1 mês(es) antes de poder cancelar.",
  "months_remaining": 1,
  "cancellation_available_date": "2024-03-15",
  "cancellation_available_date_formatted": "15/03/2024",
  "last_invoice": {
    "invoice_id": "in_xxx",
    "amount": 119.90,
    "paid_at": "2024-01-15 10:30:00",
    "paid_at_formatted": "15/01/2024 10:30",
    "period_start": "2024-01-15",
    "period_end": "2024-02-15"
  }
}
```

## 🔐 Regras de Negócio Implementadas

### Fidelidade por Plano

| Plano | Valor mensal | Fidelidade mínima | Cancelamento |
|-------|--------------|-------------------|--------------|
| Mensal | R$ 139,90 | Nenhuma | ✅ Sempre permitido |
| Trimestral | R$ 119,90 | 3 meses | ✅ Após 3 faturas pagas |
| Anual | R$ 109,90 | 12 meses | ✅ Após 12 faturas pagas |

### Validação de Cancelamento

1. **Plano Mensal**: Sempre permite cancelamento
2. **Plano Trimestral**: 
   - ❌ Bloqueado se `meses_pagos < 3`
   - ✅ Permitido se `meses_pagos >= 3`
3. **Plano Anual**:
   - ❌ Bloqueado se `meses_pagos < 12`
   - ✅ Permitido se `meses_pagos >= 12`

### Cancelamento no Stripe

Quando permitido, o cancelamento usa:
- `cancel_at_period_end = true`
- Cliente mantém acesso até o final do período já pago
- Nenhuma nova cobrança é gerada

## 📋 Scripts SQL Necessários

Execute na ordem:

1. `scripts/010-add-loyalty-months-to-plans.sql` - Adiciona campo `loyalty_months`
2. `scripts/011-create-stripe-subscriptions-table.sql` - Cria tabela `stripe_subscriptions`
3. `scripts/012-create-stripe-invoices-table.sql` - Cria tabela `stripe_invoices` (proteção contra duplicação)
4. `scripts/013-add-loyalty-status-to-subscriptions.sql` - Adiciona campo `loyalty_status` (se tabela já existir)

## 🔄 Fluxo Completo

### 1. Criação de Assinatura

```
Cliente → POST /api/subscriptions?action=create_checkout
  → Stripe Checkout (modo subscription)
  → Cliente paga
  → Webhook: customer.subscription.created
  → Cria registro em stripe_subscriptions
  → meses_pagos = 0
```

### 2. Pagamento Mensal

```
Stripe cobra mensalmente
  → Webhook: invoice.paid
  → Incrementa meses_pagos
  → Atualiza stripe_subscriptions
```

### 3. Tentativa de Cancelamento

```
Cliente → POST /api/subscriptions?action=cancel
  → Valida fidelidade
  → Se bloqueado: 
     → Retorna erro com data de liberação
     → Log em subscription_logs (action: 'cancel_blocked')
  → Se permitido: 
     → Stripe: cancel_at_period_end = true
     → Atualiza stripe_subscriptions
     → Log em subscription_logs (action: 'cancel_requested')
```

### 4. Cancelamento Efetivo

```
Período atual termina
  → Webhook: customer.subscription.updated (status = canceled)
  → Atualiza stores.subscription_status = 'canceled'
  → Log em subscription_logs
```

## ⚠️ Restrições Técnicas

1. **Stripe Customer Portal**: Não deve ser usado para cancelamento antes do fim da fidelidade
2. **Front-end**: Não pode cancelar diretamente - deve usar endpoint do back-end
3. **Validação**: Toda lógica de fidelidade reside no back-end
4. **Proteção contra duplicação**: Webhooks `invoice.paid` são verificados contra `stripe_invoices` antes de processar
5. **Detecção de cancelamento indevido**: Sistema detecta cancelamentos feitos via Stripe Dashboard ou API direta antes da fidelidade

## 🧪 Cenários de Teste

### ✅ Cenário 1: Cliente Trimestral tenta cancelar no 2º mês
- `meses_pagos = 2`
- `loyalty_months = 3`
- **Resultado**: ❌ Bloqueado
- **Mensagem**: "Este plano possui fidelidade mínima de 3 meses. O cancelamento estará disponível a partir de DD/MM/YYYY."

### ✅ Cenário 2: Cliente Trimestral tenta cancelar após 3º pagamento
- `meses_pagos = 3`
- `loyalty_months = 3`
- **Resultado**: ✅ Permitido
- **Ação**: `cancel_at_period_end = true` no Stripe

### ✅ Cenário 3: Cliente Anual tenta cancelar no 11º mês
- `meses_pagos = 11`
- `loyalty_months = 12`
- **Resultado**: ❌ Bloqueado

### ✅ Cenário 4: Cliente Mensal cancela a qualquer momento
- `loyalty_months = 0`
- **Resultado**: ✅ Sempre permitido

## 📝 Notas Importantes

1. **Todos os planos usam subscription mode**: Mantém lógica única, métricas MRR e facilita gestão
2. **Rastreamento**: `meses_pagos` é atualizado via webhook `invoice.paid` com proteção contra duplicação
3. **Data de Liberação**: Calculada baseada em invoices pagos (mais preciso que `data_inicio + meses`)
   - Quando `meses_pagos >= loyalty_months`: liberação imediata
   - Caso contrário: calculada baseada no período da última invoice paga
4. **Logs**: Todas as ações são registradas em `subscription_logs`, incluindo tentativas bloqueadas
5. **Estado de Fidelidade**: Campo `loyalty_status` facilita debug e relatórios ('locked' ou 'completed')
6. **Proteção Crítica**: Tabela `stripe_invoices` previne processamento duplicado de webhooks

## 🔗 Endpoints

- `GET /api/subscriptions` - Status da assinatura com info de fidelidade
- `GET /api/subscriptions?action=cancellation-preview` - Preview de elegibilidade de cancelamento
- `POST /api/subscriptions?action=create_checkout` - Criar checkout (sempre subscription mode)
- `POST /api/subscriptions?action=cancel` - Cancelar assinatura (com validação)

## 🎯 Próximos Passos

1. ✅ Executar scripts SQL no banco de dados (ordem importante):
   - `scripts/010-add-loyalty-months-to-plans.sql`
   - `scripts/011-create-stripe-subscriptions-table.sql`
   - `scripts/012-create-stripe-invoices-table.sql` ⚠️ CRÍTICO
   - `scripts/013-add-loyalty-status-to-subscriptions.sql` (se tabela já existir)
2. ✅ Configurar webhooks no Stripe Dashboard:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.paid` ⚠️ CRÍTICO
3. ✅ Testar fluxo completo de criação e cancelamento
4. ✅ Atualizar front-end para usar endpoint de cancelamento
5. ✅ Desabilitar cancelamento no Stripe Customer Portal (se necessário)
6. ✅ Implementar email de alerta para cancelamentos indevidos (opcional mas recomendado)

## ⚠️ Melhorias Críticas Implementadas

### 1. Proteção contra Invoice.paid Duplicado ✅
- Tabela `stripe_invoices` com `invoice_id UNIQUE`
- Verificação antes de processar webhook
- Previne contagem duplicada de meses

### 2. Todos os Planos Usam Subscription Mode ✅
- Lógica única de cobrança
- Facilita métricas MRR
- Plano Mensal: subscription com cancelamento imediato

### 3. Detecção de Cancelamento Indevido ✅
- Validação no webhook `customer.subscription.updated`
- Log em `subscription_logs` com ação `unauthorized_cancellation`
- Alerta via error_log (TODO: email para admin)

### 4. Cálculo Melhorado de Data de Liberação ✅
- Baseado em invoices pagos (não apenas `data_inicio + meses`)
- Mais preciso em caso de atrasos ou retries
- Atualizado a cada `invoice.paid`

### 5. Endpoint de Preview ✅
- `GET /api/subscriptions?action=cancellation-preview`
- Retorna informações detalhadas sobre elegibilidade
- Melhor UX para o front-end

### 6. Log de Tentativas Bloqueadas ✅
- Todas as tentativas de cancelamento bloqueadas são logadas
- Facilita suporte e questões jurídicas
