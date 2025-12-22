# Configuração MySQL para ESTOX

Este guia explica como configurar o banco de dados MySQL para uso no phpMyAdmin (XAMPP).

## Pré-requisitos

- XAMPP instalado e rodando
- MySQL/MariaDB ativo no XAMPP
- phpMyAdmin acessível

## Passo a Passo

### 1. Criar o Banco de Dados

1. Acesse o phpMyAdmin: `http://localhost/phpmyadmin`
2. Clique em "Novo" no menu lateral
3. Nome do banco: `estox`
4. Colação: `utf8mb4_unicode_ci`
5. Clique em "Criar"

**Ou via SQL:**
```sql
CREATE DATABASE estox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Executar os Scripts SQL

Execute os scripts na ordem abaixo:

#### Script 1: Criar Tabelas
1. No phpMyAdmin, selecione o banco `estox`
2. Clique na aba "SQL"
3. Abra o arquivo `scripts/001-create-tables.sql`
4. Copie e cole todo o conteúdo na área SQL
5. Clique em "Executar"

#### Script 2: Popular Planos
1. Ainda na aba "SQL"
2. Abra o arquivo `scripts/002-seed-plans.sql`
3. Copie e cole todo o conteúdo
4. Clique em "Executar"

**Nota:** O script `003-rls-policies.sql` não precisa ser executado - ele é apenas documentação, pois RLS é específico do PostgreSQL.

### 3. Configurar a API

#### Opção A: Usar Script Automático (Recomendado)

1. Execute o script PHP na raiz do projeto:
   ```bash
   php criar-env.php
   ```
   
   O script irá:
   - Criar o arquivo `.env` automaticamente
   - Gerar uma chave JWT segura automaticamente
   - Configurar todas as variáveis necessárias

#### Opção B: Criar Manualmente

1. Crie um arquivo chamado `.env` na raiz do projeto (mesmo nível que a pasta `api/` e `scripts/`)

2. Adicione o seguinte conteúdo:

```env
# ESTOX - Configuração do Banco de Dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=estox
DB_USER=root
DB_PASSWORD=

# JWT Secret - Gere uma chave segura
# Para gerar: php -r "echo bin2hex(random_bytes(32));"
JWT_SECRET=3f8a9b2c7d4e1f6a5b8c9d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a

# CORS Origins - URLs permitidas (separadas por vírgula)
CORS_ORIGINS=http://localhost:8080,http://localhost:3000
```

3. **Ajuste as credenciais se necessário:**
   - `DB_USER`: padrão do XAMPP é `root`
   - `DB_PASSWORD`: padrão do XAMPP é vazio (deixe em branco ou adicione sua senha)
   - `JWT_SECRET`: **IMPORTANTE** - Gere uma nova chave segura:
     ```bash
     php -r "echo bin2hex(random_bytes(32));"
     ```
     Substitua o valor no arquivo `.env` pela chave gerada.
   - `CORS_ORIGINS`: Adicione todas as URLs do frontend (separadas por vírgula)

### 4. Verificar Extensões PHP

Certifique-se de que as seguintes extensões estão habilitadas no PHP:

- `pdo`
- `pdo_mysql`
- `json`
- `mbstring`

No XAMPP, edite `php.ini` e descomente (remova o `;`):
```ini
extension=pdo_mysql
extension=mbstring
```

### 5. Testar a Conexão

Acesse um endpoint da API para verificar se está funcionando:
```
http://localhost/api/plans
```

Você deve receber uma resposta JSON com os planos cadastrados.

## Estrutura das Tabelas

O sistema cria as seguintes tabelas:

- **users** - Usuários do sistema
- **plans** - Planos de assinatura (Básico, Profissional, Enterprise)
- **stores** - Lojas/Concessionárias
- **vehicles** - Veículos cadastrados
- **leads** - Leads/interessados
- **vehicle_views** - Estatísticas de visualização
- **notification_settings** - Configurações de notificação

## Diferenças do PostgreSQL

O projeto foi migrado de PostgreSQL para MySQL. Principais mudanças:

1. **UUID**: Usa `CHAR(36)` ao invés de tipo UUID nativo
2. **JSON**: Usa tipo `JSON` do MySQL (funciona similar ao JSONB)
3. **Timestamps**: Usa `TIMESTAMP` com `ON UPDATE CURRENT_TIMESTAMP`
4. **RLS**: Não há Row Level Security - segurança via API
5. **ILIKE**: Substituído por `LOWER() LIKE LOWER()`

## Solução de Problemas

### Erro de conexão
- Verifique se o MySQL está rodando no XAMPP
- Confirme usuário e senha no `.env`
- Verifique a porta (padrão: 3306)

### Erro ao executar SQL
- Verifique se o banco `estox` foi criado
- Confirme que está usando utf8mb4
- Verifique se as extensões PHP estão habilitadas

### Tabelas não criadas
- Execute o script 001 novamente
- Verifique erros no phpMyAdmin
- Confirme que o banco está selecionado antes de executar

## Próximos Passos

Após configurar o banco:

1. Teste os endpoints da API
2. Crie um usuário via `POST /api/auth?action=register`
3. Faça login via `POST /api/auth?action=login`
4. Crie uma loja via `POST /api/stores`

Para mais informações, consulte `api/README.md`.


