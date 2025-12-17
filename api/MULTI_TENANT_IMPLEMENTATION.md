# Implementação Multi-Tenant - REQ-FR-031

## Resumo

Este documento descreve a implementação do sistema multi-tenant para o ESTOX, permitindo que cada loja tenha sua própria landing page pública e isolamento completo de dados.

## Funcionalidades Implementadas

### 1. Autenticação com Store ID

- **Arquivo**: `api/classes/Auth.php`
- O token JWT agora inclui `store_id` quando disponível
- Método `generateToken($userId, $storeId)` aceita store_id opcional
- Método `verifyTokenWithStore($token)` retorna userId e storeId

### 2. Middleware Aprimorado

- **Arquivo**: `api/classes/Middleware.php`
- Novo método `requireAuthWithStore()` que valida autenticação e retorna userId + storeId
- Método `validateStoreOwnership()` para validar propriedade de recursos
- Validação automática de store_id em todos os endpoints autenticados

### 3. Endpoint Público

- **Arquivo**: `api/endpoints/public.php`
- Endpoint público para landing pages: `/api/public?store_slug={slug}&action={action}`
- Ações disponíveis:
  - `store`: Retorna informações da loja
  - `vehicles`: Retorna veículos disponíveis da loja
- Validação de `store_slug` e verificação de loja ativa
- Registro automático de visualizações de veículos

### 4. Landing Page Dinâmica

- **Arquivo**: `html-version/loja.html` + `html-version/assets/js/loja.js`
- Carrega dados da loja via `store_slug` da URL
- Exibe logo, nome, WhatsApp da loja
- Lista veículos disponíveis com filtros
- Integração com WhatsApp da loja

### 5. Roteamento por Store Slug

- **Arquivo**: `.htaccess` (Apache) ou `store-router.php` (alternativa)
- URLs amigáveis: `/{store_slug}` → landing page
- URLs de veículos: `/{store_slug}/veiculo/{id}` → detalhe do veículo
- Redirecionamento automático baseado no slug

### 6. Validações de Segurança

Todos os endpoints autenticados agora validam:
- Token JWT válido
- Usuário possui loja cadastrada
- Recurso pertence à loja do usuário

**Endpoints atualizados:**
- `api/endpoints/stores.php` - Retorna novo token com store_id ao criar loja
- `api/endpoints/vehicles.php` - Já validava store_id
- `api/endpoints/leads.php` - Já validava store_id
- `api/endpoints/dashboard.php` - Já validava store_id

## Estrutura de URLs

### Públicas (sem autenticação)
- `/{store_slug}` - Landing page da loja
- `/{store_slug}/veiculo/{id}` - Detalhe do veículo
- `/api/public?store_slug={slug}&action=store` - API: dados da loja
- `/api/public?store_slug={slug}&action=vehicles` - API: veículos da loja

### Autenticadas (requer JWT)
- `/api/stores` - Gerenciar loja do usuário
- `/api/vehicles` - Gerenciar veículos da loja
- `/api/leads` - Gerenciar leads da loja
- `/api/dashboard` - Estatísticas da loja

## Fluxo de Funcionamento

### Landing Page Pública

1. Usuário acessa `/{store_slug}`
2. Sistema identifica loja pelo `store_slug`
3. Carrega dados da loja via `/api/public?store_slug={slug}&action=store`
4. Carrega veículos via `/api/public?store_slug={slug}&action=vehicles`
5. Exibe vitrine de veículos
6. Botão WhatsApp usa telefone cadastrado na loja

### Dashboard Autenticado

1. Usuário faz login
2. Sistema gera token JWT com `userId` e `storeId`
3. Todas as requisições validam token e store_id
4. Dashboard exibe apenas dados da loja do usuário

## Segurança

### Validações Implementadas

1. **Token JWT**: Validação de assinatura e expiração
2. **Store Ownership**: Validação de que recurso pertence à loja do usuário
3. **Store Active**: Landing pages só exibem lojas ativas
4. **Slug Uniqueness**: `store_slug` é único e imutável após criação

### Isolamento de Dados

- Todas as queries incluem `WHERE store_id = :store_id`
- Usuários não podem acessar dados de outras lojas
- Landing pages públicas não expõem dados sensíveis

## Scripts SQL

Execute o script de setup:
```sql
-- scripts/005-multi-tenant-setup.sql
```

Este script:
- Garante índices únicos em `store_slug`
- Adiciona índices para performance
- Documenta estrutura multi-tenant

## Testes

### Testar Landing Page Pública

1. Crie uma loja com slug `minha-loja`
2. Acesse: `http://localhost/ESTOX/minha-loja`
3. Verifique se exibe dados da loja e veículos

### Testar Isolamento

1. Crie dois usuários com lojas diferentes
2. Faça login com usuário 1
3. Tente acessar veículos da loja 2 (deve falhar)
4. Verifique que dashboard mostra apenas dados da loja 1

### Testar API Pública

```bash
# Obter dados da loja
curl "http://localhost/ESTOX/api/public?store_slug=minha-loja&action=store"

# Obter veículos
curl "http://localhost/ESTOX/api/public?store_slug=minha-loja&action=vehicles"
```

## Próximos Passos

1. ✅ Autenticação com store_id
2. ✅ Endpoint público
3. ✅ Landing page dinâmica
4. ✅ Roteamento por slug
5. ✅ Validações de segurança
6. ⏳ Testes end-to-end
7. ⏳ Documentação de API
8. ⏳ Performance optimization

## Notas Importantes

- O `store_slug` não pode ser alterado após criação (imutável)
- Landing pages só exibem veículos com `status = 'available'`
- Visualizações são registradas automaticamente
- WhatsApp usa o campo `whatsapp` da tabela `stores`

