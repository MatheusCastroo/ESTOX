# Integração Appmax — Sistema de Planos de Hospedagem

## 📌 Objetivo

Implementar um sistema de planos de hospedagem com:
- ✅ 15 dias gratuitos (trial)
- ✅ Checkout via Appmax
- ✅ Bloqueio automático após o vencimento
- ✅ E-mails automáticos de lembrete
- ✅ Painel administrativo para controle das assinaturas
- ✅ Logs completos (auditoria)

## 🏗️ Arquitetura Geral

```
Usuário cria loja → 15 dias trial
↓
Sistema envia lembretes (D-7, D-10, D-14)
↓
Usuário acessa "renovar plano"
↓
Checkout Appmax
↓
Webhook Appmax atualiza status
↓
Plano ativo por 30 dias
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
APPMAX_API_KEY=sua_chave_api
APPMAX_STORE_ID=seu_store_id
APPMAX_ENV=sandbox
APPMAX_WEBHOOK_SECRET=seu_secret

APP_URL=https://seudominio.com
EMAIL_FROM=noreply@seudominio.com
ADMIN_EMAILS=admin@seudominio.com
```

## 🗄️ Banco de Dados

### Tabelas Principais

#### 1️⃣ stores
- `subscription_status` - Status da subscrição (trial, active, pending, suspended, canceled)
- `subscription_ends_at` - Data de expiração

#### 2️⃣ payment_transactions
- `gateway` - Gateway usado (appmax, pagarme, etc)
- `order_id` - ID do pedido no gateway
- `status` - Status do pagamento
- `payload_json` - Payload completo do webhook

#### 3️⃣ subscription_logs
- Histórico completo de mudanças de status
- Ações realizadas
- Quem realizou (system/admin/user)

#### 4️⃣ subscription_emails
- Controle dos e-mails enviados
- Tipo de e-mail
- Status (sent/failed)

### Scripts SQL

Execute os scripts SQL na ordem:

1. `scripts/006-create-subscription-tables.sql` - Cria tabelas de subscrição
2. `scripts/007-rename-payment-table.sql` - Renomeia tabela para genérica (se já existir)

> **Importante:** Suspensão/cancelamento não apaga dados — apenas bloqueia acesso.

## 📁 Estrutura de Arquivos

### Classes
- `api/classes/Appmax.php` - Classe de integração com Appmax API

### Endpoints
- `api/endpoints/subscriptions.php` - Gerenciamento de subscrições e checkout
- `api/webhooks/appmax.php` - Webhook handler para notificações da Appmax
- `api/endpoints/admin/subscriptions.php` - Painel administrativo

### Scripts
- `api/scripts/check-subscriptions.php` - Script CRON diário para verificar subscrições

### Frontend
- `renovar-plano.html` - Página de renovação/assinatura

## 🔄 Fluxo de Checkout (Appmax)

### 1️⃣ Usuário acessa página

Mostra:
- Status do plano
- Data de vencimento
- Botão "Renovar Plano"

### 2️⃣ Backend cria checkout

**Endpoint:**
```
POST /api/subscriptions?action=create_checkout
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "checkout_url": "https://appmax.com/checkout/...",
    "order_id": "12345",
    "status": "waiting_payment"
  }
}
```

### 3️⃣ Usuário paga no Appmax
- Redirecionado para checkout seguro
- Processa pagamento

### 4️⃣ Appmax envia webhook

**Endpoint:**
```
POST /api/webhooks/appmax
```

O sistema:
- ✅ Valida assinatura
- ✅ Lê o status
- ✅ Atualiza assinatura
- ✅ Grava log
- ✅ Envia e-mail

## 📧 E-mails Automáticos

### Trial
- **D-7** - 7 dias antes do vencimento
- **D-10** - 10 dias antes do vencimento
- **D-14** - Último aviso (expira hoje)

### Pagamento
- **Sucesso** - Quando pagamento é aprovado
- **Falha** - Quando pagamento é recusado/cancelado

> Enviados via cron job diário.

## 🛑 Bloqueio Automático

### Status Bloqueados para Exibição Pública:
- `pending` - Aguardando pagamento
- `canceled` - Cancelado
- `suspended` - Suspenso pelo admin

### Mensagem:
> "Esta loja está temporariamente indisponível. Entre em contato com o proprietário."

### Implementação:
- ✅ Endpoint `/api/vehicles?public=true&store_slug=...` - Bloqueado
- ✅ Endpoint `/api/leads?public=true` - Bloqueado
- ✅ Trial expirado também é bloqueado automaticamente

## ⏳ Trial de 15 Dias

Ao criar uma loja:
- `subscription_status` = `trial`
- `subscription_ends_at` = +15 dias

Após expirar → muda automaticamente para `pending`.

## 📊 Estados do Plano

| Status | Descrição | Acesso Público |
|--------|-----------|----------------|
| `trial` | Teste 15 dias | ✅ Sim |
| `active` | Plano pago | ✅ Sim |
| `pending` | Aguardando pagamento | ❌ Não |
| `suspended` | Suspenso pelo admin | ❌ Não |
| `canceled` | Cancelado | ❌ Não |

## 🧲 Webhooks — Eventos Tratados

| Evento Appmax | Ação |
|--------------|------|
| `approved` | Ativa plano +30 dias |
| `waiting_payment` | Aguarda confirmação |
| `refused` | Volta para `pending` |
| `canceled` | Marca como `pending` |
| `refunded` | Marca como `pending` |
| `expired` | Marca como `pending` |

## ⏰ CRON Job

```bash
0 9 * * * php /caminho/para/api/scripts/check-subscriptions.php
```

### Funções:
- ✅ Enviar lembretes (D-7, D-10, D-14)
- ✅ Expirar trial vencido
- ✅ Suspender planos vencidos

## 🔐 Segurança

- ✅ Validação de assinatura do webhook
- ✅ Tokens protegidos
- ✅ Sem deleção de dados
- ✅ Auditoria completa

## 📝 Logs e Auditoria

Todas as ações são registradas em:
- `subscription_logs` - Histórico de mudanças
- `subscription_emails` - E-mails enviados
- `payment_transactions` - Transações de pagamento

## 🛠️ Painel Administrador

**Endpoint:** `/api/admin/subscriptions`

### Funcionalidades:
- ✅ Listar assinaturas
- ✅ Filtrar por status
- ✅ Suspender
- ✅ Reativar (sem apagar dados)
- ✅ Cancelar
- ✅ Ver histórico

## 📝 Logs

Tudo é registrado:
- ✅ Mudanças de status
- ✅ Webhooks recebidos
- ✅ E-mails enviados
- ✅ Ações do admin

## 🧪 Testes Sugeridos

1. ✅ Criar loja (ver trial)
2. ✅ Simular expiração
3. ✅ Criar checkout
4. ✅ Simular webhook aprovado
5. ✅ Simular recusado
6. ✅ Bloqueio automático
7. ✅ Reativação manual

## 📚 Referências

- [Documentação Appmax](https://docs.appmax.com.br)
- Endpoint de Checkout: `/api/subscriptions?action=create_checkout`
- Webhook: `/api/webhooks/appmax`

