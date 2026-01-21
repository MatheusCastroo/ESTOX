# 📊 Como Funciona o Controle de Planos e Permissões

## 🎯 Visão Geral

O sistema controla **3 planos principais** (Mensal, Trimestral e Anual) com **fidelidade mínima** e **permissões de cancelamento** diferentes.

---

## 📋 1. Configuração dos Planos no Banco de Dados

### Tabela `plans`

Cada plano tem estas informações:

```sql
plans:
  - id: UUID único
  - name: "Mensal", "Trimestral" ou "Anual"
  - slug: "profissional-mensal", "profissional-trimestral", "profissional-anual"
  - price: Preço total (R$ 139,90, R$ 359,70 ou R$ 1.318,80)
  - loyalty_months: Fidelidade mínima (0, 3 ou 12 meses)
  - vehicle_limit: Limite de veículos (50 para todos)
  - duration_days: Duração em dias (30, 90 ou 365)
```

### Valores Configurados:

| Plano | Preço Total | Preço Mensal | Fidelidade | Duração |
|-------|-------------|--------------|------------|---------|
| **Mensal** | R$ 139,90 | R$ 139,90/mês | 0 meses | 30 dias |
| **Trimestral** | R$ 359,70 | R$ 119,90/mês | 3 meses | 90 dias |
| **Anual** | R$ 1.318,80 | R$ 109,90/mês | 12 meses | 365 dias |

---

## 🔄 2. Fluxo de Criação de Assinatura

### Passo 1: Cliente escolhe um plano

```
Front-end → POST /api/subscriptions?action=create_checkout
  {
    "plan_slug": "profissional-trimestral"
  }
```

### Passo 2: Sistema busca o plano

```php
// api/endpoints/subscriptions.php linha 130-137
$plan = $db->fetchOne(
    "SELECT * FROM plans WHERE slug = :slug AND is_active = true",
    ['slug' => $planSlug]
);
```

**Retorna:**
- `loyalty_months = 3` (para trimestral)
- `price = 359.70`
- `duration_days = 90`

### Passo 3: Calcula preço mensal para Stripe

```php
// Linha 185-195
$monthlyPrice = (float)$plan['price'];

if ($planSlug === 'profissional-trimestral') {
    $monthlyPrice = $monthlyPrice / 3; // R$ 119,90/mês
} elseif ($planSlug === 'profissional-anual') {
    $monthlyPrice = $monthlyPrice / 12; // R$ 109,90/mês
}
// Mensal já está correto: R$ 139,90/mês
```

**Por quê?** Todos os planos criam **assinaturas recorrentes mensais** no Stripe, mesmo que o plano seja trimestral ou anual. A diferença está na **fidelidade mínima**.

### Passo 4: Cria checkout no Stripe

```php
// Linha 202
$checkoutSession = $stripe->createSubscriptionCheckoutSession($checkoutData);
```

**Stripe cria:**
- Assinatura recorrente mensal
- Cobrança automática todo mês
- Preço mensal calculado (R$ 119,90 para trimestral)

### Passo 5: Webhook cria registro local

Quando o Stripe confirma o pagamento:

```
Stripe → Webhook: customer.subscription.created
  → api/webhooks/stripe.php
  → Cria registro em stripe_subscriptions
```

**Registro criado:**
```sql
stripe_subscriptions:
  - subscription_id: "sub_xxx" (do Stripe)
  - store_id: UUID da loja
  - plan_id: UUID do plano
  - plan_slug: "profissional-trimestral"
  - data_inicio: Data atual
  - meses_pagos: 0 (inicial)
  - loyalty_status: "locked" (em fidelidade)
  - data_liberacao_cancelamento: data_inicio + 3 meses
```

---

## 💰 3. Controle de Pagamentos Mensais

### Como funciona a cobrança:

1. **Stripe cobra mensalmente** o valor calculado:
   - Mensal: R$ 139,90/mês
   - Trimestral: R$ 119,90/mês
   - Anual: R$ 109,90/mês

2. **A cada pagamento**, o Stripe envia webhook:

```
Stripe → Webhook: invoice.paid
  → api/webhooks/stripe.php (handleInvoicePaid)
```

### Processamento do Webhook:

```php
// api/webhooks/stripe.php - handleInvoicePaid()

// 1. Verifica se invoice já foi processada (proteção contra duplicação)
$existingInvoice = $db->fetchOne(
    "SELECT * FROM stripe_invoices WHERE invoice_id = :invoice_id",
    ['invoice_id' => $invoiceId]
);

if ($existingInvoice) {
    return; // Já processada, ignora
}

// 2. Incrementa meses_pagos
$newMesesPagos = $stripeSubscription['meses_pagos'] + 1;

// 3. Verifica se fidelidade foi cumprida
if ($newMesesPagos >= $loyaltyMonths) {
    $loyaltyStatus = 'completed';
    $dataLiberacao = date('Y-m-d H:i:s'); // Liberação imediata
} else {
    $loyaltyStatus = 'locked';
    // Calcula data baseada na última invoice
    $dataLiberacao = calcularDataLiberacao(...);
}

// 4. Atualiza stripe_subscriptions
$db->update('stripe_subscriptions', [
    'meses_pagos' => $newMesesPagos,
    'loyalty_status' => $loyaltyStatus,
    'data_liberacao_cancelamento' => $dataLiberacao
]);

// 5. Salva invoice para prevenir duplicação
$db->insert('stripe_invoices', [
    'invoice_id' => $invoiceId, // UNIQUE - previne duplicação
    'subscription_id' => $subscriptionId,
    'amount' => $amount,
    'paid_at' => $paidAt
]);
```

---

## 🔐 4. Controle de Permissões de Cancelamento

### Validação Principal:

```php
// api/endpoints/subscriptions.php - handleCancelSubscription()

$loyaltyMonths = (int)($store['loyalty_months'] ?? 0);
$mesesPagos = (int)$stripeSubscription['meses_pagos'];

// VALIDAÇÃO CRÍTICA
if ($loyaltyMonths > 0 && $mesesPagos < $loyaltyMonths) {
    // ❌ BLOQUEADO - Ainda em fidelidade
    Response::error(
        "Este plano possui fidelidade mínima de {$loyaltyMonths} meses. 
         O cancelamento estará disponível a partir de {$dataLiberacaoFormatada}.",
        403
    );
} else {
    // ✅ PERMITIDO - Fidelidade cumprida ou sem fidelidade
    $stripe->cancelSubscriptionAtPeriodEnd($subscriptionId);
}
```

### Lógica de Permissão:

| Plano | Fidelidade | Meses Pagos | Pode Cancelar? |
|-------|------------|-------------|----------------|
| Mensal | 0 | Qualquer | ✅ **Sempre** |
| Trimestral | 3 | 0, 1, 2 | ❌ **Bloqueado** |
| Trimestral | 3 | 3+ | ✅ **Permitido** |
| Anual | 12 | 0-11 | ❌ **Bloqueado** |
| Anual | 12 | 12+ | ✅ **Permitido** |

---

## 📊 5. Como o Sistema Rastreia o Estado

### Tabela `stripe_subscriptions` (Estado Principal):

```sql
stripe_subscriptions:
  - meses_pagos: 2                    ← Quantos meses já foram pagos
  - loyalty_months: 3                  ← Fidelidade do plano (vem de plans)
  - loyalty_status: "locked"           ← "locked" ou "completed"
  - data_liberacao_cancelamento: ...   ← Quando pode cancelar
  - cancel_at_period_end: false        ← Se já solicitou cancelamento
```

### Cálculo de `can_cancel`:

```php
// api/endpoints/subscriptions.php linha 65
$canCancel = $loyaltyMonths === 0 || $mesesPagos >= $loyaltyMonths;
```

**Exemplos:**

1. **Plano Mensal** (`loyalty_months = 0`):
   - `can_cancel = true` (sempre)

2. **Plano Trimestral** (`loyalty_months = 3`, `meses_pagos = 2`):
   - `can_cancel = false` (ainda faltam 1 mês)

3. **Plano Trimestral** (`loyalty_months = 3`, `meses_pagos = 3`):
   - `can_cancel = true` (fidelidade cumprida)

---

## 🔍 6. Endpoints de Consulta

### GET /api/subscriptions

Retorna o estado atual da assinatura:

```json
{
  "subscription": {
    "plan_name": "Trimestral",
    "plan_slug": "profissional-trimestral",
    "loyalty_months": 3,
    "stripe_subscription": {
      "months_paid": 2,
      "loyalty_status": "locked",
      "can_cancel": false,
      "months_remaining": 1,
      "cancellation_available_date_formatted": "15/03/2024"
    }
  }
}
```

### GET /api/subscriptions?action=cancellation-preview

Preview detalhado de elegibilidade:

```json
{
  "can_cancel": false,
  "loyalty_months": 3,
  "months_paid": 2,
  "months_remaining": 1,
  "message": "Este plano possui fidelidade mínima de 3 meses. 
              Você ainda precisa pagar 1 mês(es) antes de poder cancelar.",
  "cancellation_available_date_formatted": "15/03/2024",
  "last_invoice": {
    "amount": 119.90,
    "paid_at_formatted": "15/01/2024 10:30"
  }
}
```

---

## 🛡️ 7. Proteções Implementadas

### 1. Proteção contra Duplicação de Webhooks

```php
// Antes de processar invoice.paid
$existingInvoice = $db->fetchOne(
    "SELECT * FROM stripe_invoices WHERE invoice_id = :invoice_id",
    ['invoice_id' => $invoiceId]
);

if ($existingInvoice) {
    return; // Já processada, ignora
}
```

**Por quê?** O Stripe pode reenviar webhooks. Sem essa proteção, `meses_pagos` seria incrementado múltiplas vezes, liberando cancelamento antes da hora.

### 2. Detecção de Cancelamento Indevido

```php
// No webhook customer.subscription.updated
if ($subscriptionData['status'] === 'canceled' && 
    $loyaltyMonths > 0 && 
    $mesesPagos < $loyaltyMonths &&
    !$stripeSubscription['cancel_at_period_end']) {
    
    // Cancelamento feito via Stripe Dashboard ou API direta
    // Log alerta para admin
    error_log("⚠️ UNAUTHORIZED CANCELLATION DETECTED");
}
```

**Por quê?** Alguém pode cancelar diretamente no Stripe Dashboard antes da fidelidade. O sistema detecta e alerta.

### 3. Log de Tentativas Bloqueadas

```php
// Quando cancelamento é bloqueado
$db->insert('subscription_logs', [
    'action' => 'cancel_blocked',
    'notes' => "Tentativa bloqueada. Meses pagos: {$mesesPagos}, 
                Fidelidade: {$loyaltyMonths}"
]);
```

**Por quê?** Facilita suporte e questões jurídicas.

---

## 📈 8. Fluxo Completo Exemplo

### Cenário: Cliente contrata Plano Trimestral

**Dia 1 - Contratação:**
```
1. Cliente escolhe "Trimestral"
2. Sistema cria checkout Stripe (R$ 119,90/mês)
3. Cliente paga primeira mensalidade
4. Webhook: customer.subscription.created
   → Cria stripe_subscriptions:
     - meses_pagos: 0
     - loyalty_status: "locked"
     - data_liberacao: data_inicio + 3 meses
```

**Dia 30 - Segunda Cobrança:**
```
1. Stripe cobra R$ 119,90
2. Webhook: invoice.paid
   → Atualiza:
     - meses_pagos: 1
     - loyalty_status: "locked" (ainda)
```

**Dia 60 - Terceira Cobrança:**
```
1. Stripe cobra R$ 119,90
2. Webhook: invoice.paid
   → Atualiza:
     - meses_pagos: 2
     - loyalty_status: "locked" (ainda)
```

**Dia 90 - Quarta Cobrança (Fidelidade Cumprida):**
```
1. Stripe cobra R$ 119,90
2. Webhook: invoice.paid
   → Atualiza:
     - meses_pagos: 3 ✅
     - loyalty_status: "completed" ✅
     - data_liberacao: AGORA ✅
```

**Dia 91 - Cliente tenta cancelar:**
```
1. POST /api/subscriptions?action=cancel
2. Sistema valida:
   - loyalty_months: 3
   - meses_pagos: 3
   - can_cancel: true ✅
3. Cancela no Stripe (cancel_at_period_end = true)
4. Cliente mantém acesso até fim do período atual
```

---

## 🎯 Resumo das Permissões

| Ação | Mensal | Trimestral | Anual |
|------|--------|------------|-------|
| **Criar assinatura** | ✅ | ✅ | ✅ |
| **Cobrança mensal** | R$ 139,90 | R$ 119,90 | R$ 109,90 |
| **Cancelar (mês 1)** | ✅ | ❌ | ❌ |
| **Cancelar (mês 2)** | ✅ | ❌ | ❌ |
| **Cancelar (mês 3)** | ✅ | ✅ | ❌ |
| **Cancelar (mês 12)** | ✅ | ✅ | ✅ |

---

## 🔑 Pontos-Chave

1. **Todos os planos são assinaturas recorrentes mensais** no Stripe
2. **A diferença está na fidelidade** (`loyalty_months`)
3. **Meses pagos são rastreados** via webhook `invoice.paid`
4. **Cancelamento é validado** comparando `meses_pagos >= loyalty_months`
5. **Proteção contra duplicação** via tabela `stripe_invoices`
6. **Estado explícito** via campo `loyalty_status`
