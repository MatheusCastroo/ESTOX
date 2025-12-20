# REQ-FR-031 - Controle de Usuários por Cliente com Landing Page Pública

## Visão Geral

Este documento descreve a implementação do requisito REQ-FR-031, que estabelece o isolamento de dados por cliente (loja/revenda) no sistema ESTOX, funcionando como um modelo multi-tenant onde cada cliente possui:

- Usuários próprios para gestão interna
- Uma landing page pública exclusiva
- Catálogo de veículos independente
- Informações de contato próprias (WhatsApp, nome, logo)

## Arquitetura Multi-Tenant

### Modelo de Dados

O sistema utiliza um modelo de isolamento baseado em `store_id`:

```
users (1) ----< (N) stores (1) ----< (N) vehicles
                                    ----< (N) leads
                                    ----< (1) notification_settings
```

- **Relacionamento Usuário-Loja**: Atualmente, cada usuário possui uma única loja (relação 1:1 via `stores.user_id`)
- **Isolamento de Dados**: Todas as tabelas principais possuem `store_id` como chave estrangeira
- **Identificador Único**: Cada loja possui um `slug` único e imutável usado para URLs públicas

### Tabelas com Isolamento

As seguintes tabelas possuem `store_id` para isolamento:

- `vehicles` - Veículos cadastrados
- `leads` - Leads gerados
- `vehicle_views` - Visualizações de veículos
- `notification_settings` - Configurações de notificação

## Segurança e Validação

### Middleware de Autenticação

O sistema utiliza duas funções principais no `Middleware` para garantir isolamento:

#### 1. `getUserStoreId($db, $userId)`

Obtém o `store_id` do usuário autenticado, validando que o usuário possui uma loja vinculada.

```php
$storeId = Middleware::getUserStoreId($db, $userId);
```

**Comportamento:**
- Valida que o usuário está autenticado
- Busca a loja vinculada ao usuário via `stores WHERE user_id = :user_id`
- Retorna erro 404 se a loja não for encontrada

#### 2. `validateResourceOwnership($db, $storeId, $resourceTable, $resourceId)`

Valida que um recurso específico pertence à loja do usuário.

```php
Middleware::validateResourceOwnership($db, $storeId, 'vehicles', $vehicleId);
```

**Comportamento:**
- Valida o nome da tabela (prevenção de SQL injection)
- Verifica que o recurso existe e pertence à loja
- Retorna erro 404 se o recurso não for encontrado ou não pertencer à loja

### Validação em Endpoints

#### Endpoints Autenticados (Protegidos)

Todos os endpoints autenticados seguem o padrão:

1. **Autenticação JWT**
   ```php
   $userId = Middleware::requireAuth();
   ```

2. **Obtenção do store_id**
   ```php
   $storeId = Middleware::getUserStoreId($db, $userId);
   ```

3. **Filtragem por store_id em todas as queries**
   ```php
   $vehicles = $db->fetchAll(
       "SELECT * FROM vehicles WHERE store_id = :store_id",
       ['store_id' => $storeId]
   );
   ```

4. **Validação de propriedade em operações específicas (PUT/DELETE)**
   ```php
   Middleware::validateResourceOwnership($db, $storeId, 'vehicles', $vehicleId);
   ```

#### Endpoints Públicos (Catálogo)

Endpoints públicos não requerem autenticação e validam apenas o `store_slug`:

```php
if ($isPublic && $storeSlug) {
    // Busca loja pelo slug
    $store = $db->fetchOne(
        "SELECT id FROM stores WHERE slug = :slug AND is_active = true",
        ['slug' => $storeSlug]
    );
    
    if (!$store) {
        Response::error('Loja não encontrada', 404);
    }
    
    // Retorna apenas dados da loja identificada pelo slug
}
```

### Endpoints Protegidos

Os seguintes endpoints validam o vínculo usuário-loja:

- `GET /api/stores` - Obtém loja do usuário
- `PUT /api/stores` - Atualiza loja do usuário
- `GET /api/vehicles` - Lista veículos da loja
- `POST /api/vehicles` - Cria veículo na loja
- `PUT /api/vehicles?id={id}` - Atualiza veículo (valida propriedade)
- `DELETE /api/vehicles?id={id}` - Exclui veículo (valida propriedade)
- `GET /api/leads` - Lista leads da loja
- `PUT /api/leads?id={id}` - Atualiza lead (valida propriedade)
- `DELETE /api/leads?id={id}` - Exclui lead (valida propriedade)
- `GET /api/dashboard` - Estatísticas da loja
- `GET /api/notifications` - Configurações da loja
- `PUT /api/notifications` - Atualiza configurações da loja

### Endpoints Públicos

Os seguintes endpoints são públicos e validam apenas o `store_slug`:

- `GET /api/stores?public=true&slug={slug}` - Dados públicos da loja
- `GET /api/vehicles?public=true&store_slug={slug}` - Veículos disponíveis da loja
- `GET /api/vehicles?public=true&store_slug={slug}&vehicle_id={id}` - Detalhes de um veículo
- `POST /api/leads?public=true` - Criar lead (requer `store_slug` no body)

## Landing Page Pública

### Acesso

A landing page pública é acessível via URL:

```
https://estox.com.br/{store_slug}
```

Ou via query parameter:

```
/loja.html?store_slug={slug}
/catalogo.html?store_slug={slug}
```

### Funcionalidades

A landing page pública exibe:

1. **Informações da Loja**
   - Logo da loja
   - Nome da loja
   - Cidade e estado
   - Descrição

2. **Catálogo de Veículos**
   - Apenas veículos com status `available`
   - Filtros por marca, ano, preço, quilometragem
   - Busca por marca ou modelo

3. **Página de Detalhes do Veículo**
   - Todas as informações do veículo
   - Galeria de imagens
   - Botão de contato via WhatsApp

4. **Contato via WhatsApp**
   - Botão fixo flutuante
   - Botão no header
   - Botões em pontos estratégicos
   - Mensagem automática com nome do veículo e link

## Regras de Negócio

### Isolamento de Dados

1. **Todo usuário autenticado só pode acessar dados de sua própria loja**
   - Validação automática via `store_id` obtido do `user_id`

2. **Nenhum dado de outra loja é acessível via API autenticada**
   - Todas as queries incluem `WHERE store_id = :store_id`

3. **Landing page pública exibe apenas dados da loja identificada pelo slug**
   - Validação do `store_slug` e `is_active = true`

### Validações de Segurança

1. **Token JWT obrigatório para endpoints protegidos**
   - Middleware valida token antes de qualquer operação

2. **Validação de propriedade em operações específicas**
   - PUT e DELETE sempre validam que o recurso pertence à loja

3. **Validação de tabela permitida**
   - `validateResourceOwnership` valida tabelas permitidas (prevenção de SQL injection)

4. **Slug único e imutável**
   - `store_slug` é único no banco de dados
   - Não pode ser alterado após criação (política de negócio)

## Fluxos Principais

### Fluxo: Acesso à Landing Page

```
1. Usuário acessa /loja.html?store_slug=minha-loja
2. Frontend busca: GET /api/stores?public=true&slug=minha-loja
3. Backend valida slug e retorna dados da loja
4. Frontend busca: GET /api/vehicles?public=true&store_slug=minha-loja
5. Backend retorna apenas veículos com status='available' da loja
6. Frontend exibe landing page com dados da loja
```

### Fluxo: Acesso ao Dashboard

```
1. Usuário faz login: POST /api/auth?action=login
2. Backend retorna token JWT
3. Frontend armazena token
4. Frontend acessa: GET /api/dashboard (com token)
5. Backend valida token e obtém user_id
6. Backend busca store_id do usuário
7. Backend retorna apenas estatísticas da loja do usuário
```

### Fluxo: Criar Veículo

```
1. Usuário autenticado faz: POST /api/vehicles (com token)
2. Backend valida token e obtém user_id
3. Backend busca store_id do usuário
4. Backend cria veículo com store_id do usuário
5. Veículo é vinculado automaticamente à loja do usuário
```

## Considerações de Segurança

### Prevenção de Ataques

1. **SQL Injection**
   - Uso de prepared statements em todas as queries
   - Validação de nomes de tabelas em `validateResourceOwnership`

2. **Acesso Não Autorizado**
   - Validação obrigatória de token JWT
   - Validação de propriedade em operações sensíveis
   - Isolamento automático via `store_id` em todas as queries

3. **Acesso Público**
   - Endpoints públicos validam apenas `store_slug`
   - Apenas lojas ativas (`is_active = true`) são acessíveis
   - Apenas veículos disponíveis são exibidos

### Boas Práticas Implementadas

1. **Separação de Responsabilidades**
   - Middleware centraliza validação de autenticação e isolamento
   - Helpers reutilizáveis para validação

2. **Documentação no Código**
   - Comentários explicando validações REQ-FR-031
   - Funções documentadas com PHPDoc

3. **Mensagens de Erro Apropriadas**
   - Erros genéricos para evitar vazamento de informações
   - Mensagens claras para casos legítimos (ex: "Loja não encontrada")

## Checklist de Implementação

- [x] Todos os endpoints autenticados validam store_id
- [x] Middleware com funções helper para isolamento
- [x] Validação de propriedade em PUT/DELETE
- [x] Endpoints públicos validam apenas store_slug
- [x] Landing page pública implementada (REQ-FR-021)
- [x] Isolamento de dados em todas as tabelas principais
- [x] Documentação de segurança
- [x] Prevenção de SQL injection
- [x] Validação de token JWT em endpoints protegidos

## Conclusão

A implementação do REQ-FR-031 garante isolamento total de dados entre clientes, permitindo que cada loja funcione como um "site próprio" enquanto compartilha a mesma infraestrutura. O sistema está preparado para escalar para múltiplos clientes mantendo segurança e isolamento de dados.

