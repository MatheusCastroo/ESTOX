# Guia de Migração: Next.js/Supabase para PHP

Este guia explica como migrar do backend Next.js/Supabase para a API PHP.

## Passos de Migração

### 1. Configurar o Banco de Dados

Execute o script SQL para criar a tabela de usuários:

```bash
psql -U postgres -d estox -f scripts/004-create-users-table.sql
```

### 2. Migrar Usuários do Supabase Auth

Se você já tem usuários no Supabase Auth, você precisará migrá-los para a nova tabela `users`. Crie um script de migração:

```sql
-- Exemplo de migração (ajuste conforme necessário)
-- Você precisará exportar os usuários do Supabase Auth primeiro

INSERT INTO users (id, email, password, name, created_at)
SELECT 
    id,
    email,
    '$2y$10$...', -- Hash da senha (você precisará gerar novos hashes)
    raw_user_meta_data->>'name',
    created_at
FROM auth.users;
```

**Nota:** Como as senhas no Supabase Auth são criptografadas de forma diferente, você precisará:
- Pedir aos usuários para redefinir suas senhas, OU
- Implementar um sistema de migração de senhas (mais complexo)

### 3. Atualizar Referências na Tabela Stores

Se você já tem lojas cadastradas, atualize a foreign key:

```sql
-- Remover constraint antiga (se existir)
ALTER TABLE stores DROP CONSTRAINT IF EXISTS stores_user_id_fkey;

-- Adicionar nova constraint
ALTER TABLE stores 
ADD CONSTRAINT stores_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=estox
DB_USER=postgres
DB_PASSWORD=sua_senha

JWT_SECRET=seu-secret-key-muito-seguro
CORS_ORIGINS=http://localhost:3000
```

### 5. Atualizar o Frontend Next.js

Você precisará atualizar todas as chamadas de Server Actions para chamadas de API REST.

#### Antes (Server Action):
```typescript
import { createVehicle } from '@/lib/actions/vehicles'

const vehicle = await createVehicle(formData)
```

#### Depois (API REST):
```typescript
const response = await fetch('http://localhost/api/vehicles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(formData)
})

const data = await response.json()
```

### 6. Criar Cliente de API

Crie um arquivo `lib/api-client.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api'

export class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}/${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  }

  // Auth methods
  async register(email: string, password: string, name?: string) {
    return this.request('auth?action=register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  }

  async login(email: string, password: string) {
    return this.request('auth?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  // Store methods
  async getStore() {
    return this.request('stores')
  }

  async createStore(data: any) {
    return this.request('stores', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Vehicle methods
  async getVehicles(filters?: any) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`vehicles?${params}`)
  }

  async createVehicle(data: any) {
    return this.request('vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ... outros métodos
}

export const apiClient = new ApiClient()
```

### 7. Atualizar Autenticação

Substitua o uso do Supabase Auth pelo cliente de API:

```typescript
// Antes
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
await supabase.auth.signUp({ email, password })

// Depois
import { apiClient } from '@/lib/api-client'
const result = await apiClient.register(email, password, name)
apiClient.setToken(result.data.token)
localStorage.setItem('token', result.data.token)
```

### 8. Testar a API

Teste todos os endpoints para garantir que estão funcionando:

```bash
# Testar autenticação
curl -X POST http://localhost/api/auth?action=register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Testar com token
curl -X GET http://localhost/api/stores \
  -H "Authorization: Bearer seu-token"
```

## Diferenças Importantes

1. **Autenticação**: Não usa mais Supabase Auth, usa JWT próprio
2. **Server Actions**: Substituídas por chamadas HTTP REST
3. **Sessões**: Gerenciadas via tokens JWT no localStorage
4. **CORS**: Precisa ser configurado no PHP

## Checklist de Migração

- [ ] Criar tabela `users`
- [ ] Migrar usuários (ou implementar reset de senha)
- [ ] Atualizar foreign keys
- [ ] Configurar variáveis de ambiente
- [ ] Criar cliente de API no frontend
- [ ] Substituir todas as Server Actions
- [ ] Atualizar autenticação
- [ ] Testar todos os endpoints
- [ ] Atualizar middleware de autenticação no Next.js
- [ ] Configurar CORS adequadamente
- [ ] Testar em produção

## Suporte

Se encontrar problemas durante a migração, verifique:
- Logs do servidor PHP
- Logs do banco de dados
- Console do navegador para erros de CORS
- Headers de resposta HTTP



