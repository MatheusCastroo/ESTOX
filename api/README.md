# ESTOX API - Backend PHP

Esta é a API REST em PHP que substitui o backend Next.js/Supabase.

## Requisitos

- PHP 7.4 ou superior
- PostgreSQL 12 ou superior
- Extensões PHP: `pdo`, `pdo_pgsql`, `json`, `mbstring`

## Instalação

1. Configure as variáveis de ambiente no arquivo `.env` (crie este arquivo na raiz do projeto):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=estox
DB_USER=postgres
DB_PASSWORD=sua_senha

JWT_SECRET=seu-secret-key-muito-seguro-aqui
CORS_ORIGINS=http://localhost:3000,https://seu-dominio.com
```

2. Execute o script SQL para criar a tabela de usuários:

```bash
psql -U postgres -d estox -f scripts/004-create-users-table.sql
```

3. Configure o servidor web (Apache ou Nginx) para apontar para a pasta `api/`.

### Configuração Apache

Se estiver usando Apache, certifique-se de que o módulo `mod_rewrite` está habilitado e o arquivo `.htaccess` está funcionando.

### Configuração Nginx

```nginx
location /api {
    try_files $uri $uri/ /api/index.php?$query_string;
}
```

## Estrutura da API

### Endpoints

#### Autenticação
- `POST /api/auth?action=register` - Registrar novo usuário
- `POST /api/auth?action=login` - Fazer login
- `GET /api/auth` - Obter usuário atual (requer autenticação)

#### Lojas (Stores)
- `GET /api/stores` - Obter loja do usuário
- `POST /api/stores` - Criar nova loja
- `PUT /api/stores` - Atualizar loja
- `GET /api/stores?check_slug=slug` - Verificar disponibilidade de slug

#### Veículos (Vehicles)
- `GET /api/vehicles` - Listar veículos (requer autenticação)
- `GET /api/vehicles?id=uuid` - Obter veículo específico
- `POST /api/vehicles` - Criar veículo
- `PUT /api/vehicles?id=uuid` - Atualizar veículo
- `DELETE /api/vehicles?id=uuid` - Excluir veículo

**Endpoints públicos (catálogo):**
- `GET /api/vehicles?public=true&store_slug=slug` - Listar veículos públicos
- `GET /api/vehicles?public=true&store_slug=slug&vehicle_id=uuid` - Obter veículo público

#### Leads
- `GET /api/leads` - Listar leads
- `GET /api/leads?stats=true` - Obter estatísticas de leads
- `PUT /api/leads?id=uuid` - Atualizar status do lead
- `DELETE /api/leads?id=uuid` - Excluir lead

**Endpoint público:**
- `POST /api/leads?public=true` - Criar lead (público)

#### Dashboard
- `GET /api/dashboard?action=stats` - Estatísticas do dashboard
- `GET /api/dashboard?action=top-vehicles` - Veículos mais vistos
- `GET /api/dashboard?action=monthly-stats` - Estatísticas mensais

#### Planos
- `GET /api/plans` - Listar planos disponíveis

#### Notificações
- `GET /api/notifications` - Obter configurações de notificação
- `PUT /api/notifications` - Atualizar configurações

## Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer seu-token-aqui
```

## Formato de Resposta

### Sucesso
```json
{
  "success": true,
  "data": { ... },
  "message": "Mensagem opcional"
}
```

### Erro
```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

## Códigos de Status HTTP

- `200` - Sucesso
- `400` - Requisição inválida
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `405` - Método não permitido
- `500` - Erro interno do servidor

## Exemplos de Uso

### Registrar usuário
```bash
curl -X POST http://localhost/api/auth?action=register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123","name":"João Silva"}'
```

### Fazer login
```bash
curl -X POST http://localhost/api/auth?action=login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'
```

### Criar veículo (autenticado)
```bash
curl -X POST http://localhost/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-token" \
  -d '{
    "brand":"Toyota",
    "model":"Corolla",
    "year":2023,
    "price":120000,
    "status":"available"
  }'
```

## Migração do Supabase

Se você estava usando Supabase Auth, você precisará:

1. Migrar os usuários existentes para a tabela `users`
2. Atualizar as referências de `auth.users` para `users` na tabela `stores`

## Segurança

- Use HTTPS em produção
- Altere o `JWT_SECRET` para um valor seguro e aleatório
- Configure CORS adequadamente
- Valide e sanitize todas as entradas
- Use prepared statements (já implementado)

## Desenvolvimento

Para desenvolvimento local, você pode usar o servidor built-in do PHP:

```bash
php -S localhost:8000 -t api
```

Acesse: `http://localhost:8000`



