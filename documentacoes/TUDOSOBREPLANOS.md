# 📘 Tudo Sobre Planos - ESTOX

**Documentação Completa: Configurações, Controle e Implementação de Planos**

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura da Tabela Plans](#estrutura-da-tabela-plans)
3. [Planos Oficiais](#planos-oficiais)
4. [Campos e Configurações](#campos-e-configurações)
5. [Controle de Limites](#controle-de-limites)
6. [Validações e Regras de Negócio](#validações-e-regras-de-negócio)
7. [Integração com Assinaturas](#integração-com-assinaturas)
8. [Gestão Administrativa](#gestão-administrativa)
9. [Scripts SQL](#scripts-sql)
10. [Endpoints da API](#endpoints-da-api)
11. [Fluxos de Trabalho](#fluxos-de-trabalho)
12. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral

O sistema ESTOX utiliza um modelo de planos de assinatura que controla o acesso e os limites de recursos para cada loja. Os planos definem:

- **Preço e periodicidade** (Mensal, Trimestral, Anual)
- **Limite de veículos** que podem ser cadastrados
- **Duração da assinatura** em dias
- **Funcionalidades disponíveis**
- **Status de ativação**

### Princípios Fundamentais

1. **Banco de Dados é Fonte de Verdade:** Todos os dados de planos vêm da tabela `plans`
2. **Sem Hardcode:** Nenhum plano está codificado no código-fonte
3. **Controle Dinâmico:** Planos podem ser ativados/desativados sem alterar código
4. **Auditoria Completa:** Todas as alterações são logadas

---

## 🗄️ Estrutura da Tabela Plans

### Schema Completo

```sql
CREATE TABLE plans (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  vehicle_limit INTEGER NOT NULL,
  duration_days INT NOT NULL,
  features JSON DEFAULT ('[]'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_plans_slug (slug),
  INDEX idx_plans_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Descrição dos Campos

#### `id` (CHAR(36))
- **Tipo:** UUID (CHAR(36))
- **Descrição:** Identificador único do plano
- **Formato:** UUID v4 (ex: `550e8400-e29b-41d4-a716-446655440000`)
- **Uso:** Chave primária, referências em outras tabelas

#### `name` (VARCHAR(50))
- **Tipo:** String (máximo 50 caracteres)
- **Descrição:** Nome exibido do plano
- **Exemplos:** `"Mensal"`, `"Trimestral"`, `"Anual"`
- **Uso:** Exibição no frontend, relatórios, logs

#### `slug` (VARCHAR(50))
- **Tipo:** String único (máximo 50 caracteres)
- **Descrição:** Identificador URL-friendly do plano
- **Formato:** lowercase, hífens (ex: `profissional-mensal`)
- **Uso:** Referências em URLs, API, identificação técnica
- **Único:** Não pode haver dois planos com o mesmo slug

#### `price` (DECIMAL(10, 2))
- **Tipo:** Decimal (10 dígitos, 2 decimais)
- **Descrição:** Preço do plano em R$ (valor total, não mensal)
- **Exemplos:** 
  - `139.90` (Mensal - R$ 139,90)
  - `359.70` (Trimestral - R$ 359,70)
  - `1318.80` (Anual - R$ 1.318,80)
- **Uso:** Exibição, cálculos financeiros, Stripe

#### `vehicle_limit` (INTEGER)
- **Tipo:** Integer
- **Descrição:** Limite máximo de veículos que a loja pode cadastrar
- **Valores Especiais:**
  - `-1` = **Ilimitado** (sem limite)
  - `0` = Nenhum veículo permitido
  - `50` = Até 50 veículos
- **Uso:** Validação ao criar veículos, exibição de limites

#### `duration_days` (INT)
- **Tipo:** Integer
- **Descrição:** Duração da assinatura em dias
- **Exemplos:**
  - `30` = 30 dias (Mensal)
  - `90` = 90 dias (Trimestral)
  - `365` = 365 dias (Anual)
- **Uso:** Cálculo de expiração de assinatura, renovação
- **⚠️ IMPORTANTE:** Sempre usado em vez de hardcode (+30 days)

#### `features` (JSON)
- **Tipo:** JSON Array
- **Descrição:** Lista de funcionalidades incluídas no plano
- **Formato:** Array de strings
- **Exemplo:**
```json
[
  "Até 50 veículos",
  "Catálogo com URL personalizada",
  "Suporte prioritário",
  "Relatórios avançados",
  "Integração WhatsApp",
  "Destaque nos anúncios"
]
```
- **Uso:** Exibição no frontend, comparação de planos

#### `is_active` (BOOLEAN)
- **Tipo:** Boolean (TINYINT(1) no MySQL)
- **Descrição:** Se o plano está ativo e disponível para contratação
- **Valores:**
  - `true` (1) = Ativo, pode ser contratado
  - `false` (0) = Inativo, não pode ser contratado
- **Uso:** Filtros na API, controle de disponibilidade
- **⚠️ IMPORTANTE:** Planos inativos não aparecem na listagem pública

#### `created_at` (TIMESTAMP)
- **Tipo:** TIMESTAMP
- **Descrição:** Data/hora de criação do registro
- **Formato:** `YYYY-MM-DD HH:MM:SS`
- **Uso:** Auditoria, ordenação

#### `updated_at` (TIMESTAMP)
- **Tipo:** TIMESTAMP (auto-update)
- **Descrição:** Data/hora da última atualização
- **Formato:** `YYYY-MM-DD HH:MM:SS`
- **Uso:** Auditoria, sincronização

---

## 📊 Planos Oficiais

### Planos Ativos no Sistema

O ESTOX utiliza **apenas planos profissionais** com diferentes periodicidades:

#### 1. Mensal

**Configuração:**
- **Nome:** `Mensal`
- **Slug:** `profissional-mensal`
- **Preço:** R$ 139,90
- **Duração:** 30 dias
- **Limite de Veículos:** 50
- **Status:** ✅ Ativo

**Características:**
- Valor cheio mensal (sem desconto)
- Renovação mensal
- Ideal para teste inicial
- Maior flexibilidade

**JSON no Banco:**
```json
{
  "id": "uuid",
  "name": "Mensal",
  "slug": "profissional-mensal",
  "price": 139.90,
  "vehicle_limit": 50,
  "duration_days": 30,
  "features": [
    "Até 50 veículos",
    "Catálogo com URL personalizada",
    "Suporte prioritário",
    "Relatórios avançados",
    "Integração WhatsApp",
    "Destaque nos anúncios"
  ],
  "is_active": true
}
```

---

#### 2. Trimestral

**Configuração:**
- **Nome:** `Trimestral`
- **Slug:** `profissional-trimestral`
- **Preço:** R$ 359,70
- **Duração:** 90 dias (3 meses)
- **Limite de Veículos:** 50
- **Status:** ✅ Ativo

**Características:**
- Equivale a R$ 119,90/mês
- **Economia:** R$ 20,00/mês em relação ao mensal
- **Desconto:** 14,3%
- Renovação trimestral
- Melhor custo-benefício

**Cálculo:**
```
Preço total: R$ 359,70
Preço mensal: R$ 359,70 ÷ 3 = R$ 119,90/mês
Economia: R$ 139,90 - R$ 119,90 = R$ 20,00/mês
Desconto: (R$ 20,00 ÷ R$ 139,90) × 100 = 14,3%
```

**JSON no Banco:**
```json
{
  "id": "uuid",
  "name": "Trimestral",
  "slug": "profissional-trimestral",
  "price": 359.70,
  "vehicle_limit": 50,
  "duration_days": 90,
  "features": [
    "Até 50 veículos",
    "Catálogo com URL personalizada",
    "Suporte prioritário",
    "Relatórios avançados",
    "Integração WhatsApp",
    "Destaque nos anúncios"
  ],
  "is_active": true
}
```

---

#### 3. Anual

**Configuração:**
- **Nome:** `Anual`
- **Slug:** `profissional-anual`
- **Preço:** R$ 1.318,80
- **Duração:** 365 dias (1 ano)
- **Limite de Veículos:** 50
- **Status:** ✅ Ativo

**Características:**
- Equivale a R$ 109,90/mês
- **Economia:** R$ 30,00/mês em relação ao mensal
- **Desconto:** 21,4%
- Renovação anual
- Melhor opção para uso contínuo

**Cálculo:**
```
Preço total: R$ 1.318,80
Preço mensal: R$ 1.318,80 ÷ 12 = R$ 109,90/mês
Economia: R$ 139,90 - R$ 109,90 = R$ 30,00/mês
Desconto: (R$ 30,00 ÷ R$ 139,90) × 100 = 21,4%
```

**JSON no Banco:**
```json
{
  "id": "uuid",
  "name": "Anual",
  "slug": "profissional-anual",
  "price": 1318.80,
  "vehicle_limit": 50,
  "duration_days": 365,
  "features": [
    "Até 50 veículos",
    "Catálogo com URL personalizada",
    "Suporte prioritário",
    "Relatórios avançados",
    "Integração WhatsApp",
    "Destaque nos anúncios"
  ],
  "is_active": true
}
```

---

### Comparativo de Planos

| Característica | Mensal | Trimestral | Anual |
|----------------|--------|------------|-------|
| **Preço Total** | R$ 139,90 | R$ 359,70 | R$ 1.318,80 |
| **Preço Mensal** | R$ 139,90 | R$ 119,90 | R$ 109,90 |
| **Duração** | 30 dias | 90 dias | 365 dias |
| **Limite Veículos** | 50 | 50 | 50 |
| **Economia** | - | R$ 20,00/mês | R$ 30,00/mês |
| **Desconto** | - | 14,3% | 21,4% |
| **Renovação** | Mensal | Trimestral | Anual |

---

## ⚙️ Campos e Configurações

### Regras de Validação

#### Nome (`name`)
- **Obrigatório:** Sim
- **Tamanho Máximo:** 50 caracteres
- **Formato:** Texto livre
- **Recomendação:** Nome curto e descritivo

#### Slug (`slug`)
- **Obrigatório:** Sim
- **Único:** Sim (constraint UNIQUE)
- **Tamanho Máximo:** 50 caracteres
- **Formato:** 
  - lowercase
  - hífens para separação
  - sem espaços
  - sem caracteres especiais
- **Exemplos Válidos:**
  - ✅ `profissional-mensal`
  - ✅ `profissional-trimestral`
  - ✅ `profissional-anual`
- **Exemplos Inválidos:**
  - ❌ `Profissional Mensal` (maiúsculas, espaços)
  - ❌ `profissional_mensal` (underscore)
  - ❌ `profissional.mensal` (ponto)

#### Preço (`price`)
- **Obrigatório:** Sim
- **Tipo:** DECIMAL(10, 2)
- **Formato:** `99999999.99` (máximo R$ 99.999.999,99)
- **Valor Mínimo:** 0.01
- **Unidade:** Reais (R$)
- **Precisão:** 2 casas decimais

#### Limite de Veículos (`vehicle_limit`)
- **Obrigatório:** Sim
- **Tipo:** INTEGER
- **Valores Especiais:**
  - `-1` = **Ilimitado** (sem limite)
  - `0` = Nenhum veículo permitido
  - `> 0` = Limite numérico
- **Valor Padrão Recomendado:** 50
- **Uso:** Validação antes de criar veículos

#### Duração (`duration_days`)
- **Obrigatório:** Sim (recomendado)
- **Tipo:** INT
- **Valores Comuns:**
  - `30` = Mensal
  - `90` = Trimestral
  - `180` = Semestral
  - `365` = Anual
- **Valor Mínimo:** 1
- **Uso:** Cálculo de expiração de assinatura

#### Features (`features`)
- **Obrigatório:** Não (default: `[]`)
- **Tipo:** JSON Array
- **Formato:** Array de strings
- **Exemplo:**
```json
[
  "Até 50 veículos",
  "Catálogo com URL personalizada",
  "Suporte prioritário",
  "Relatórios avançados",
  "Integração WhatsApp",
  "Destaque nos anúncios"
]
```

#### Status Ativo (`is_active`)
- **Obrigatório:** Não (default: `true`)
- **Tipo:** BOOLEAN (TINYINT(1))
- **Valores:** `true` (1) ou `false` (0)
- **Uso:** Controla disponibilidade para contratação

---

## 🔒 Controle de Limites

### Validação de Limite de Veículos

#### Onde é Validado

**Arquivo:** `api/endpoints/vehicles.php`

**Método:** `POST /api/endpoints/vehicles.php`

**Momento:** Antes de criar um novo veículo

#### Regras de Validação

1. **Status da Assinatura:**
   ```php
   if ($store['subscription_status'] !== 'active') {
       // Bloquear criação de veículo
   }
   ```

2. **Limite de Veículos:**
   ```php
   $vehicleLimit = (int)$store['vehicle_limit'];
   
   if ($vehicleLimit !== -1) {  // -1 = ilimitado
       $currentCount = COUNT(vehicles WHERE store_id = X);
       
       if ($currentCount >= $vehicleLimit) {
           // Bloquear criação de veículo
       }
   }
   ```

#### Código de Implementação

```php
// REQ-PLN-STRIPE-ASSINATURAS: Section 9 - Controle de Limites
// Check subscription status and vehicle limit before creating vehicle
$store = $db->fetchOne(
    "SELECT s.*, p.vehicle_limit 
     FROM stores s 
     LEFT JOIN plans p ON s.plan_id = p.id 
     WHERE s.id = :store_id",
    ['store_id' => $storeId]
);

// Check if subscription is active
if ($store['subscription_status'] !== 'active') {
    Response::error('Você precisa de uma assinatura ativa para cadastrar veículos. Renove seu plano para continuar.', 403);
}

// Check vehicle limit
$vehicleLimit = isset($store['vehicle_limit']) ? (int)$store['vehicle_limit'] : 0;

if ($vehicleLimit !== -1) { // -1 means unlimited
    // Get current vehicle count
    $vehicleCount = $db->fetchOne(
        "SELECT COUNT(*) as count FROM vehicles WHERE store_id = :store_id",
        ['store_id' => $storeId]
    );
    $currentCount = (int)($vehicleCount['count'] ?? 0);
    
    if ($currentCount >= $vehicleLimit) {
        Response::error("Você atingiu o limite de {$vehicleLimit} veículos do seu plano. Faça upgrade para cadastrar mais veículos.", 403);
    }
}
```

#### Mensagens de Erro

**Status Não Ativo:**
```json
{
  "success": false,
  "error": "Você precisa de uma assinatura ativa para cadastrar veículos. Renove seu plano para continuar."
}
```

**Limite Atingido:**
```json
{
  "success": false,
  "error": "Você atingiu o limite de 50 veículos do seu plano. Faça upgrade para cadastrar mais veículos."
}
```

#### Casos Especiais

**Limite Ilimitado (`vehicle_limit = -1`):**
- ✅ Não há validação de contagem
- ✅ Loja pode cadastrar quantos veículos quiser
- ✅ Sempre permite criação

**Sem Plano (`plan_id = NULL`):**
- ⚠️ `vehicle_limit` será `NULL`
- ⚠️ Sistema trata como `0` (nenhum veículo permitido)
- ⚠️ Recomendado: Sempre ter um plano associado

---

## ✅ Validações e Regras de Negócio

### RB-PLN-01: Planos Ativos

**Regra:** Apenas planos com `is_active = true` podem ser contratados

**Implementação:**
- Endpoint `GET /api/endpoints/plans.php` filtra por `is_active = true`
- Endpoint `POST /api/endpoints/subscriptions.php?action=create_checkout` valida plano ativo

**Código:**
```php
// Listagem pública
$plans = $db->fetchAll(
    "SELECT * FROM plans WHERE is_active = true ORDER BY price ASC"
);

// Validação no checkout
$plan = $db->fetchOne(
    "SELECT * FROM plans WHERE slug = :slug AND is_active = true",
    ['slug' => $planSlug]
);
```

---

### RB-PLN-02: Banco de Dados é Fonte de Verdade

**Regra:** Nenhum plano deve estar hardcoded no código

**Implementação:**
- ✅ Todos os planos vêm da tabela `plans`
- ✅ Frontend não mantém lista de planos
- ✅ API sempre consulta banco de dados

**Verificação:**
```php
// ❌ ERRADO (hardcode)
$plans = [
    ['name' => 'Mensal', 'price' => 139.90],
    ['name' => 'Trimestral', 'price' => 359.70]
];

// ✅ CORRETO (banco de dados)
$plans = $db->fetchAll("SELECT * FROM plans WHERE is_active = true");
```

---

### RB-PLN-03: Duração é Obrigatória

**Regra:** Campo `duration_days` deve estar presente e válido

**Implementação:**
- Campo adicionado via migration
- Validação em cálculos de expiração
- Sempre usa `duration_days` do plano, nunca hardcode

**Código:**
```php
// ❌ ERRADO (hardcode)
$newEndsAt = date('Y-m-d H:i:s', strtotime('+30 days'));

// ✅ CORRETO (do plano)
$durationDays = (int)$plan['duration_days'];
$newEndsAt = date('Y-m-d H:i:s', strtotime("+{$durationDays} days"));
```

---

### RB-PLN-04: Cálculo de Expiração

**Regra:** Nova data de expiração calculada a partir de `duration_days`

**Lógica:**
```php
if (subscription_ends_at > now && status === 'active') {
    // Se ainda válida: soma dias à data atual
    new_ends_at = subscription_ends_at + duration_days
} else {
    // Se expirada: conta a partir de agora
    new_ends_at = now + duration_days
}
```

**Implementação:**
- `api/endpoints/subscriptions.php` (create_checkout)
- `api/webhooks/stripe.php` (activateSubscription)
- `api/endpoints/admin/subscriptions.php` (renew, reactivate)

---

### RB-PLN-05: Limite de Veículos

**Regra:** Validação antes de criar veículo

**Validações:**
1. ✅ `subscription_status === 'active'`
2. ✅ `vehicle_count < vehicle_limit` (ou `-1` = ilimitado)

**Implementação:**
- `api/endpoints/vehicles.php` (POST)

---

## 🔗 Integração com Assinaturas

### Relacionamento com Stores

**Tabela `stores`:**
- Campo `plan_id` → FK para `plans.id`
- Pode ser `NULL` (sem plano)
- Atualizado quando assinatura é ativada

**Relacionamento:**
```sql
stores.plan_id → plans.id (FOREIGN KEY)
```

### Ativação de Plano

**Fluxo:**
1. Usuário seleciona plano → `plan_slug`
2. Backend busca plano → `plans` WHERE `slug = plan_slug`
3. Valida plano ativo → `is_active = true`
4. Cria checkout Stripe → com `plan_id` em metadata
5. Webhook processa pagamento → ativa assinatura
6. Atualiza `stores.plan_id` → associa plano à loja

**Código:**
```php
// Buscar plano
$plan = $db->fetchOne(
    "SELECT * FROM plans WHERE slug = :slug AND is_active = true",
    ['slug' => $planSlug]
);

// Atualizar loja
$db->update('stores', [
    'plan_id' => $plan['id'],
    'subscription_status' => 'active',
    'subscription_ends_at' => $newEndsAt
], 'id = :id', ['id' => $storeId]);
```

---

## 🛠️ Gestão Administrativa

### Alteração de Plano

**Endpoint:** `PUT /api/endpoints/admin/subscriptions.php`

**Ação:** `change_plan`

**Body:**
```json
{
  "store_id": "uuid",
  "action": "change_plan",
  "plan_id": "novo_plan_uuid",
  "notes": "Upgrade solicitado pelo cliente"
}
```

**Implementação:**
- Atualiza `stores.plan_id`
- Ajusta limites automaticamente
- Não altera status ou datas
- Cria log `plan_changed`

**Código:**
```php
// Get new plan
$newPlan = $db->fetchOne(
    "SELECT * FROM plans WHERE id = :id AND is_active = true",
    ['id' => $newPlanId]
);

// Update plan_id
$db->update('stores', [
    'plan_id' => $newPlanId,
    'updated_at' => date('Y-m-d H:i:s')
], 'id = :id', ['id' => $storeId]);
```

---

## 📜 Scripts SQL

### Script 008: Seed de Planos Profissionais

**Arquivo:** `scripts/008-seed-professional-plans.sql`

**Descrição:** Insere os 3 planos profissionais (Mensal, Trimestral, Anual)

**Ações:**
1. Desativa plano antigo 'profissional' (se existir)
2. Deleta planos profissionais antigos (se existirem)
3. Insere novos planos com `duration_days`

**Execução:**
```sql
-- Executar no phpMyAdmin ou cliente MySQL
SOURCE scripts/008-seed-professional-plans.sql;
```

**Ou copiar e colar o conteúdo no phpMyAdmin**

---

### Script 009: Adicionar duration_days

**Arquivo:** `scripts/009-add-duration-days-to-plans.sql`

**Descrição:** Adiciona campo `duration_days` na tabela `plans`

**Ações:**
1. Adiciona coluna `duration_days` (se não existir)
2. Atualiza planos existentes com valores corretos
3. Define default para planos sem valor

**Execução:**
```sql
-- Executar no phpMyAdmin ou cliente MySQL
SOURCE scripts/009-add-duration-days-to-plans.sql;
```

**Ordem de Execução:**
1. ✅ `001-create-tables.sql` (cria estrutura base)
2. ✅ `006-create-subscription-tables.sql` (cria tabelas de assinatura)
3. ✅ `008-seed-professional-plans.sql` (insere planos)
4. ✅ `009-add-duration-days-to-plans.sql` (adiciona duration_days, se tabela já existia)

---

## 🌐 Endpoints da API

### Público: Listar Planos

**Endpoint:** `GET /api/endpoints/plans.php`

**Autenticação:** Não requerida

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
        "features": [
          "Até 50 veículos",
          "Catálogo com URL personalizada",
          "Suporte prioritário",
          "Relatórios avançados",
          "Integração WhatsApp",
          "Destaque nos anúncios"
        ],
        "is_active": true,
        "created_at": "2024-01-01 10:00:00",
        "updated_at": "2024-01-01 10:00:00"
      }
    ]
  }
}
```

**Filtros:**
- Apenas planos com `is_active = true`
- Ordenados por `price ASC` (menor para maior)

**Arquivo:** `api/endpoints/plans.php`

---

### Autenticado: Criar Checkout

**Endpoint:** `POST /api/endpoints/subscriptions.php?action=create_checkout`

**Autenticação:** Requerida (Bearer token)

**Body:**
```json
{
  "plan_slug": "profissional-mensal"
}
```

**Validações:**
- ✅ Plano existe
- ✅ Plano está ativo (`is_active = true`)
- ✅ Loja existe
- ✅ Usuário autenticado

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

**Arquivo:** `api/endpoints/subscriptions.php`

---

### Admin: Alterar Plano

**Endpoint:** `PUT /api/endpoints/admin/subscriptions.php`

**Autenticação:** Requerida (Bearer token + role = admin)

**Body:**
```json
{
  "store_id": "uuid",
  "action": "change_plan",
  "plan_id": "novo_plan_uuid",
  "notes": "Upgrade solicitado"
}
```

**Validações:**
- ✅ Usuário é admin
- ✅ Loja existe
- ✅ Novo plano existe e está ativo
- ✅ Plano válido

**Resposta:**
```json
{
  "success": true,
  "data": {
    "store": { ... },
    "message": "Plano alterado com sucesso"
  }
}
```

**Arquivo:** `api/endpoints/admin/subscriptions.php`

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Contratação de Plano

```
1. Usuário acessa página de planos
   → GET /api/endpoints/plans.php
   → Lista planos ativos

2. Usuário seleciona plano (ex: "profissional-mensal")
   → Frontend envia plan_slug

3. Backend valida plano
   → Verifica se existe
   → Verifica se está ativo
   → Busca dados completos

4. Backend cria checkout Stripe
   → Inclui plan_id, duration_days em metadata
   → Calcula nova data de expiração

5. Usuário completa pagamento
   → Stripe processa
   → Webhook recebe evento

6. Webhook ativa assinatura
   → Atualiza stores.plan_id
   → Atualiza subscription_status = 'active'
   → Calcula subscription_ends_at usando duration_days

7. Loja pode usar recursos
   → Validações passam
   → Limites aplicados
```

---

### Fluxo 2: Validação de Limite

```
1. Usuário tenta criar veículo
   → POST /api/endpoints/vehicles.php

2. Backend valida assinatura
   → Verifica subscription_status === 'active'
   → Se não ativo → Erro 403

3. Backend busca plano da loja
   → SELECT plan_id FROM stores
   → SELECT vehicle_limit FROM plans

4. Backend verifica limite
   → COUNT(vehicles) WHERE store_id = X
   → Compara com vehicle_limit

5. Se vehicle_limit = -1
   → Permite criação (ilimitado)

6. Se vehicle_limit > 0
   → Se count < limit → Permite
   → Se count >= limit → Erro 403

7. Veículo criado (se passou validações)
```

---

### Fluxo 3: Alteração Administrativa de Plano

```
1. Admin acessa painel
   → Autenticação admin

2. Admin seleciona loja
   → GET /api/endpoints/admin/subscriptions.php?store_id=...

3. Admin escolhe alterar plano
   → Seleciona novo plano
   → PUT /api/endpoints/admin/subscriptions.php

4. Backend valida
   → Novo plano existe e está ativo
   → Admin tem permissão

5. Backend atualiza
   → stores.plan_id = novo_plan_id
   → Cria log plan_changed

6. Limites atualizados automaticamente
   → Novo vehicle_limit aplicado
   → Validações futuras usam novo limite
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Criar Novo Plano (SQL)

```sql
-- Inserir novo plano "Semestral"
INSERT INTO plans (
    id,
    name,
    slug,
    price,
    vehicle_limit,
    duration_days,
    features,
    is_active
) VALUES (
    UUID(),
    'Semestral',
    'profissional-semestral',
    719.40,  -- R$ 119,90/mês × 6 = R$ 719,40
    50,
    180,  -- 6 meses = 180 dias
    '["Até 50 veículos", "Catálogo com URL personalizada", "Suporte prioritário", "Relatórios avançados", "Integração WhatsApp", "Destaque nos anúncios"]',
    true
);
```

---

### Exemplo 2: Desativar Plano

```sql
-- Desativar plano (não deletar para manter histórico)
UPDATE plans 
SET is_active = false, 
    updated_at = NOW()
WHERE slug = 'profissional-mensal';
```

**Resultado:**
- ✅ Plano não aparece mais na listagem pública
- ✅ Lojas existentes mantêm referência
- ✅ Histórico preservado

---

### Exemplo 3: Atualizar Preço

```sql
-- Atualizar preço do plano Mensal
UPDATE plans 
SET price = 149.90,
    updated_at = NOW()
WHERE slug = 'profissional-mensal';
```

**Resultado:**
- ✅ Novas assinaturas usarão novo preço
- ✅ Assinaturas existentes mantêm preço original
- ✅ Stripe recebe novo valor no checkout

---

### Exemplo 4: Alterar Limite de Veículos

```sql
-- Aumentar limite do plano Mensal para 100
UPDATE plans 
SET vehicle_limit = 100,
    updated_at = NOW()
WHERE slug = 'profissional-mensal';
```

**Resultado:**
- ✅ Novas assinaturas terão limite de 100
- ✅ Assinaturas existentes terão novo limite imediatamente
- ✅ Lojas podem cadastrar mais veículos

---

### Exemplo 5: Criar Plano Ilimitado

```sql
-- Plano Enterprise com veículos ilimitados
INSERT INTO plans (
    id,
    name,
    slug,
    price,
    vehicle_limit,
    duration_days,
    features,
    is_active
) VALUES (
    UUID(),
    'Enterprise',
    'enterprise-anual',
    4999.90,
    -1,  -- Ilimitado
    365,
    '["Veículos ilimitados", "Catálogo premium", "Suporte 24/7", "API dedicada", "Consultoria personalizada"]',
    true
);
```

**Uso:**
- `vehicle_limit = -1` → Sem limite de veículos
- Validação sempre passa (exceto se status não ativo)

---

### Exemplo 6: Consultar Planos via API (JavaScript)

```javascript
// Buscar planos disponíveis
async function getPlans() {
    try {
        const response = await fetch(`${API_URL}/endpoints/plans.php`);
        const data = await response.json();
        
        if (data.success) {
            console.log('Planos disponíveis:', data.data.plans);
            
            data.data.plans.forEach(plan => {
                console.log(`${plan.name}: R$ ${plan.price} (${plan.duration_days} dias)`);
                console.log(`Limite: ${plan.vehicle_limit === -1 ? 'Ilimitado' : plan.vehicle_limit} veículos`);
            });
        }
    } catch (error) {
        console.error('Erro ao buscar planos:', error);
    }
}
```

---

### Exemplo 7: Validar Limite Antes de Criar Veículo (PHP)

```php
// Validar se pode criar veículo
function canCreateVehicle($storeId, $db) {
    // Buscar loja e plano
    $store = $db->fetchOne(
        "SELECT s.*, p.vehicle_limit 
         FROM stores s 
         LEFT JOIN plans p ON s.plan_id = p.id 
         WHERE s.id = :store_id",
        ['store_id' => $storeId]
    );
    
    // Verificar status
    if ($store['subscription_status'] !== 'active') {
        return ['can_create' => false, 'reason' => 'Assinatura não está ativa'];
    }
    
    // Verificar limite
    $vehicleLimit = (int)$store['vehicle_limit'];
    
    if ($vehicleLimit === -1) {
        return ['can_create' => true, 'reason' => 'Limite ilimitado'];
    }
    
    // Contar veículos
    $count = $db->fetchOne(
        "SELECT COUNT(*) as count FROM vehicles WHERE store_id = :store_id",
        ['store_id' => $storeId]
    );
    
    $currentCount = (int)$count['count'];
    
    if ($currentCount >= $vehicleLimit) {
        return [
            'can_create' => false, 
            'reason' => "Limite atingido ({$currentCount}/{$vehicleLimit})"
        ];
    }
    
    return [
        'can_create' => true, 
        'reason' => "Pode criar ({$currentCount}/{$vehicleLimit})"
    ];
}
```

---

## 📝 Notas Importantes

### 1. Fonte de Verdade

**✅ Banco de Dados:** A tabela `plans` é a única fonte de verdade
**❌ Código:** Nenhum plano hardcoded
**❌ Frontend:** Não mantém lista de planos
**❌ Stripe:** Não é fonte de verdade para limites/status

---

### 2. Cálculo de Duração

**✅ Sempre usa `duration_days`:** Nunca hardcode de `+30 days`
**✅ Do banco de dados:** Sempre consulta `plans.duration_days`
**✅ Cálculo dinâmico:** Suporta qualquer duração (30, 90, 365, etc)

---

### 3. Limites de Veículos

**✅ Validação obrigatória:** Sempre verifica antes de criar veículo
**✅ Limite ilimitado:** `-1` = sem limite
**✅ Limite zero:** `0` = nenhum veículo permitido
**✅ Limite numérico:** `> 0` = limite específico

---

### 4. Status de Plano

**✅ `is_active = true`:** Pode ser contratado
**❌ `is_active = false`:** Não aparece na listagem pública
**⚠️ Histórico:** Planos inativos mantêm referências existentes

---

### 5. Alterações de Plano

**✅ Admin pode alterar:** Via painel administrativo
**✅ Logs completos:** Todas as alterações são logadas
**✅ Limites atualizados:** Novos limites aplicados imediatamente
**⚠️ Preço histórico:** Preço original mantido na transação

---

## 🔍 Queries Úteis

### Listar Todos os Planos

```sql
SELECT * FROM plans ORDER BY price ASC;
```

### Listar Apenas Planos Ativos

```sql
SELECT * FROM plans WHERE is_active = true ORDER BY price ASC;
```

### Buscar Plano por Slug

```sql
SELECT * FROM plans WHERE slug = 'profissional-mensal';
```

### Contar Lojas por Plano

```sql
SELECT 
    p.name as plan_name,
    p.slug as plan_slug,
    COUNT(s.id) as store_count
FROM plans p
LEFT JOIN stores s ON p.id = s.plan_id
GROUP BY p.id, p.name, p.slug
ORDER BY store_count DESC;
```

### Verificar Lojas com Plano Específico

```sql
SELECT 
    s.id,
    s.name as store_name,
    s.subscription_status,
    p.name as plan_name,
    p.vehicle_limit,
    (SELECT COUNT(*) FROM vehicles WHERE store_id = s.id) as vehicle_count
FROM stores s
JOIN plans p ON s.plan_id = p.id
WHERE p.slug = 'profissional-mensal'
ORDER BY s.created_at DESC;
```

### Encontrar Lojas Próximas do Limite

```sql
SELECT 
    s.id,
    s.name as store_name,
    p.name as plan_name,
    p.vehicle_limit,
    (SELECT COUNT(*) FROM vehicles WHERE store_id = s.id) as vehicle_count,
    (p.vehicle_limit - (SELECT COUNT(*) FROM vehicles WHERE store_id = s.id)) as remaining
FROM stores s
JOIN plans p ON s.plan_id = p.id
WHERE p.vehicle_limit > 0  -- Exclui ilimitado
  AND s.subscription_status = 'active'
HAVING remaining <= 5  -- Próximas do limite (5 ou menos)
ORDER BY remaining ASC;
```

---

## 🚀 Próximos Passos

1. ✅ Executar scripts SQL na ordem correta
2. ✅ Verificar planos criados no banco
3. ✅ Testar endpoints da API
4. ✅ Validar controle de limites
5. ✅ Testar integração com Stripe
6. ✅ Monitorar logs e auditoria

---

**Última atualização:** 2024-01-XX
**Versão:** 1.0.0
**Requisitos:** REQ-PLN-STRIPE-ASSINATURAS
