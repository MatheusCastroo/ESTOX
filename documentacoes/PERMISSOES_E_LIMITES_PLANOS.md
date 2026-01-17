# 📋 Permissões e Limites dos Planos - ESTOX

Este documento explica como funcionam as permissões e limites dos planos no sistema ESTOX e como controlá-los pelo painel administrativo.

---

## 📊 Índice

1. [Visão Geral](#visão-geral)
2. [Planos Disponíveis](#planos-disponíveis)
3. [Como Funcionam os Limites](#como-funcionam-os-limites)
4. [Controle pelo Painel Admin](#controle-pelo-painel-admin)
5. [Validações Automáticas](#validações-automáticas)
6. [Adicionar Plano Gratuito](#adicionar-plano-gratuito)

---

## 🎯 Visão Geral

O sistema ESTOX possui controle automático de permissões e limites baseado no plano de assinatura de cada loja. Os limites são:

- ✅ **Limite de veículos**: Controlado automaticamente pelo sistema
- ✅ **Features/funcionalidades**: Definidas no campo `features` (JSON) do plano
- ✅ **Status de assinatura**: Controla se o usuário pode cadastrar veículos

---

## 📦 Planos Disponíveis

### Plano Gratuito (a adicionar)

- **Nome**: `Gratuito`
- **Slug**: `gratuito`
- **Preço**: R$ 0,00
- **Limite de Veículos**: 5
- **Status**: `trial` (período de teste)
- **Features**:
  - Até 5 veículos
  - Catálogo com URL personalizada
  - Integração WhatsApp

### Planos Profissionais (já configurados)

#### 1. Profissional Mensal
- **Limite de Veículos**: 50
- **Preço**: R$ 139,90/mês
- **Features**:
  - Até 50 veículos
  - Catálogo com URL personalizada
  - Suporte prioritário
  - Relatórios avançados
  - Integração WhatsApp
  - Destaque nos anúncios

#### 2. Profissional Trimestral
- **Limite de Veículos**: 50
- **Preço**: R$ 359,70/trimestre
- **Features**: Mesmas do Mensal

#### 3. Profissional Anual
- **Limite de Veículos**: 50
- **Preço**: R$ 1.318,80/ano
- **Features**: Mesmas do Mensal

---

## ⚙️ Como Funcionam os Limites

### 1. Limite de Veículos

O sistema verifica automaticamente o limite antes de permitir cadastrar um novo veículo:

```php
// Código em: api/endpoints/vehicles.php (linha 275-289)

// Verifica o limite do plano
$vehicleLimit = $store['vehicle_limit']; // Ex: 5, 50, ou -1 (ilimitado)

// Conta veículos atuais
$vehicleCount = COUNT(*) FROM vehicles WHERE store_id = :store_id;

// Bloqueia se exceder o limite
if ($vehicleCount >= $vehicleLimit) {
    Response::error("Você atingiu o limite de {$vehicleLimit} veículos do seu plano.");
}
```

**Valores especiais:**
- `-1` = Ilimitado (sem verificação de limite)
- `0` = Sem permissão para cadastrar veículos
- `5, 50, etc.` = Limite máximo de veículos

### 2. Status de Assinatura

O sistema também verifica se a assinatura está ativa:

```php
// Código em: api/endpoints/vehicles.php (linha 270-273)

if ($store['subscription_status'] !== 'active') {
    Response::error('Você precisa de uma assinatura ativa para cadastrar veículos.');
}
```

**Status permitidos para cadastrar veículos:**
- ✅ `active` = Assinatura paga e ativa
- ❌ `trial` = Período de teste (permitido, mas com limite)
- ❌ `pending` = Aguardando pagamento
- ❌ `suspended` = Suspenso pelo admin
- ❌ `canceled` = Cancelado

**⚠️ IMPORTANTE**: O sistema atual permite cadastrar veículos apenas com `status = 'active'`. Se você quiser permitir `trial` também, é necessário ajustar o código.

### 3. Features/Funcionalidades

As features são armazenadas como JSON no campo `features` da tabela `plans`:

```json
[
  "Até 5 veículos",
  "Catálogo com URL personalizada",
  "Integração WhatsApp"
]
```

**Observação**: As features são apenas informativas. O controle real de limites é feito pelo campo `vehicle_limit` e `subscription_status`.

---

## 🔧 Controle pelo Painel Admin

### ✅ O Painel Admin JÁ permite controlar planos!

O painel administrativo (`admin-panel.html`) permite:

1. **Ver todas as lojas e seus planos atuais**
2. **Alterar o plano de uma loja** (via ação `change_plan`)
3. **Suspender/Reativar assinaturas**
4. **Renovar assinaturas manualmente**
5. **Cancelar assinaturas**

### Como Alterar o Plano de um Usuário

**Passo 1**: Acesse o painel admin
```
https://nerdparadise.com.br/admin-panel.html
```

**Passo 2**: Encontre a loja/usuário na listagem

**Passo 3**: Clique em "Detalhes" ou "Ações"

**Passo 4**: Selecione a ação "Alterar Plano"

**Passo 5**: Escolha o novo plano e confirme

**Endpoint da API:**
```
PUT /api/endpoints/admin/subscriptions.php

Body:
{
  "store_id": "uuid-da-loja",
  "action": "change_plan",
  "plan_id": "uuid-do-novo-plano",
  "notes": "Motivo da alteração (opcional)"
}
```

### Como Ver os Limites Atuais

No painel admin, cada loja mostra:
- **Plano atual**: Nome do plano
- **Limite de veículos**: `vehicle_limit` do plano
- **Veículos cadastrados**: Contagem atual
- **Status**: `subscription_status`

---

## 🔒 Validações Automáticas

### Validações ao Cadastrar Veículo

O sistema valida automaticamente:

1. ✅ **Status da assinatura**: Deve ser `active` (ou `trial` se permitido)
2. ✅ **Limite de veículos**: Verifica se não excedeu o limite do plano
3. ✅ **Plano vinculado**: Verifica se a loja tem um `plan_id` associado

### Código de Validação

**Arquivo**: `api/endpoints/vehicles.php`

```php
// 1. Verifica status da assinatura
if ($store['subscription_status'] !== 'active') {
    Response::error('Você precisa de uma assinatura ativa para cadastrar veículos.');
}

// 2. Verifica limite de veículos
$vehicleLimit = (int)$store['vehicle_limit'];
if ($vehicleLimit !== -1) { // -1 = ilimitado
    $vehicleCount = COUNT(*) FROM vehicles WHERE store_id = :store_id;
    if ($vehicleCount >= $vehicleLimit) {
        Response::error("Você atingiu o limite de {$vehicleLimit} veículos do seu plano.");
    }
}
```

### Bloqueio de Acesso ao Catálogo Público

O sistema também bloqueia o acesso ao catálogo público se:
- Status for `pending`, `suspended` ou `canceled`
- Trial expirou (`subscription_ends_at` < agora)

**Arquivo**: `api/endpoints/vehicles.php` (linha 29-39)

---

## 📝 Adicionar Plano Gratuito

### Script SQL para Criar Plano Gratuito

Execute este SQL no phpMyAdmin ou via linha de comando:

```sql
-- Adicionar plano gratuito
INSERT INTO plans (id, name, slug, price, vehicle_limit, features, is_active, created_at, updated_at)
VALUES (
    UUID(),
    'Gratuito',
    'gratuito',
    0.00,
    5,
    '["Até 5 veículos", "Catálogo com URL personalizada", "Integração WhatsApp"]',
    true,
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE 
    name = 'Gratuito',
    price = 0.00,
    vehicle_limit = 5,
    features = '["Até 5 veículos", "Catálogo com URL personalizada", "Integração WhatsApp"]',
    is_active = true;
```

### Configurar Usuários para Plano Gratuito

Para atribuir o plano gratuito a uma loja existente:

```sql
-- Encontrar o ID do plano gratuito
SELECT id FROM plans WHERE slug = 'gratuito';

-- Atribuir plano gratuito a uma loja
UPDATE stores 
SET plan_id = 'ID_DO_PLANO_GRATUITO',
    subscription_status = 'trial',
    subscription_ends_at = DATE_ADD(NOW(), INTERVAL 15 DAY)
WHERE id = 'ID_DA_LOJA';
```

### ⚠️ Importante: Permitir Cadastro no Status `trial`

O código atual bloqueia cadastro de veículos se `subscription_status !== 'active'`. Para permitir cadastro no plano gratuito (status `trial`), você precisa ajustar:

**Arquivo**: `api/endpoints/vehicles.php` (linha 270-273)

**Alterar de:**
```php
if ($store['subscription_status'] !== 'active') {
    Response::error('Você precisa de uma assinatura ativa para cadastrar veículos.');
}
```

**Para:**
```php
// Permitir trial e active
if (!in_array($store['subscription_status'], ['active', 'trial'])) {
    Response::error('Você precisa de uma assinatura ativa ou estar em período de teste para cadastrar veículos.');
}
```

---

## 📋 Resumo das Permissões por Plano

| Plano | Limite Veículos | Status Permitido | Features |
|-------|----------------|------------------|----------|
| **Gratuito** | 5 | `trial` | Até 5 veículos<br>Catálogo com URL personalizada<br>Integração WhatsApp |
| **Profissional** | 50 | `active` | Até 50 veículos<br>Catálogo com URL personalizada<br>Suporte prioritário<br>Relatórios avançados<br>Integração WhatsApp<br>Destaque nos anúncios |

---

## 🎛️ Gerenciar Planos pelo Painel Admin

### O que já está funcionando:

✅ **Visualizar todas as lojas e seus planos**
- Listagem completa com filtros
- Informações de limite e uso atual

✅ **Alterar plano de uma loja**
- Ação `change_plan` no painel admin
- Logs de alteração em `subscription_logs`

✅ **Gerenciar status**
- Suspender/Reativar assinaturas
- Renovar manualmente
- Cancelar assinaturas

### Como usar:

1. **Acesse o painel admin**: `https://nerdparadise.com.br/admin-panel.html`
2. **Encontre a loja/usuário**: Use os filtros ou busca
3. **Clique em "Detalhes"**: Veja informações completas
4. **Clique em "Ações"**: Altere plano, status, etc.

---

## 🔍 Verificar Limites Atuais

### Query SQL para ver limite vs uso:

```sql
SELECT 
    s.name AS loja,
    p.name AS plano,
    p.vehicle_limit AS limite,
    COUNT(v.id) AS veiculos_cadastrados,
    (p.vehicle_limit - COUNT(v.id)) AS veiculos_restantes,
    s.subscription_status AS status
FROM stores s
LEFT JOIN plans p ON s.plan_id = p.id
LEFT JOIN vehicles v ON s.id = v.store_id
GROUP BY s.id, s.name, p.name, p.vehicle_limit, s.subscription_status
ORDER BY loja;
```

---

## 📞 Suporte e Manutenção

### Para Adicionar/Modificar Planos

1. ✅ Execute o SQL para criar/atualizar o plano na tabela `plans`
2. ✅ Verifique se o plano está `is_active = true`
3. ✅ Teste cadastrando veículos com o novo limite
4. ✅ Atualize o frontend se necessário (landing page de planos)

### Para Alterar Limites de um Plano

```sql
-- Alterar limite de veículos de um plano
UPDATE plans 
SET vehicle_limit = 10,
    updated_at = NOW()
WHERE slug = 'gratuito';
```

**⚠️ IMPORTANTE**: Alterar o limite não afeta veículos já cadastrados. O limite é verificado apenas ao cadastrar novos veículos.

---

## 📚 Referências

- **Código de validação**: `api/endpoints/vehicles.php` (linha 256-289)
- **Painel admin**: `api/endpoints/admin/subscriptions.php` (linha 260-301)
- **Documentação de planos**: `documentacoes/PLANOS_E_CONFIGURACOES.md`
- **Script SQL de planos**: `scripts/002-seed-plans.sql` e `scripts/008-seed-professional-plans.sql`

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0

