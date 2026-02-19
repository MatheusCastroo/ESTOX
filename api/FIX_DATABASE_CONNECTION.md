# 🔧 Como Corrigir Erro de Conexão com Banco de Dados

## ❌ Erro: `Access denied for user 'root'@'localhost' (using password: YES)`

Este erro ocorre quando o sistema está tentando usar uma senha para o usuário `root`, mas:
- O MySQL não tem senha configurada (padrão XAMPP)
- OU a senha está incorreta

## ✅ Soluções

### Solução 1: Verificar se MySQL está rodando (XAMPP)

1. Abra o **XAMPP Control Panel**
2. Verifique se o **MySQL** está com status **Running** (verde)
3. Se não estiver, clique em **Start**

### Solução 2: Verificar se o banco existe

1. Acesse **phpMyAdmin**: `http://localhost/phpmyadmin`
2. Verifique se o banco `estox` existe
3. Se não existir, crie:
   ```sql
   CREATE DATABASE estox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### Solução 3: Se você configurou senha para root

Se você configurou uma senha para o usuário `root` no MySQL, você precisa criar um arquivo `.env`:

1. Crie o arquivo `api/.env` (na pasta `api/`)
2. Adicione:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=estox
   DB_USER=root
   DB_PASSWORD=sua_senha_aqui
   ```
3. Substitua `sua_senha_aqui` pela senha real do root

### Solução 4: Remover senha do root (se possível)

Se você não precisa de senha no root para desenvolvimento:

1. Acesse **phpMyAdmin**
2. Vá em **Usuários**
3. Clique em **Editar** no usuário `root@localhost`
4. Deixe o campo **Senha** vazio
5. Clique em **Executar**

### Solução 5: Criar novo usuário sem senha

1. Acesse **phpMyAdmin**
2. Vá em **Usuários** > **Adicionar conta de usuário**
3. Configure:
   - **Nome de usuário:** `estox_user`
   - **Host:** `localhost`
   - **Senha:** (deixe vazio)
   - **Privilégios:** Selecione o banco `estox` e dê todos os privilégios
4. Crie o arquivo `api/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=estox
   DB_USER=estox_user
   DB_PASSWORD=
   ```

## 🧪 Testar Conexão

Acesse: `http://localhost/ESTOX/api/test-db-connection.php`

Este arquivo mostra:
- ✅ Se a conexão está funcionando
- 📋 Configuração atual
- 💡 Sugestões de correção

## 📝 Verificar Configuração Atual

O arquivo `api/config/database.php` detecta automaticamente se está em:
- **Localhost:** Usa `root` sem senha
- **Produção:** Usa credenciais da Hostinger

Se você tem um arquivo `.env` na pasta `api/`, ele será usado.

## 🔍 Debug

Para ver informações de debug, adicione `?__debug_db=1` na URL:
```
http://localhost/ESTOX/api/index.php?__debug_db=1
```

Isso mostrará informações sobre a detecção de ambiente (apenas em desenvolvimento).

## ⚠️ Importante

- O arquivo `.env` não deve ser commitado no Git
- Em produção (Hostinger), as credenciais são detectadas automaticamente
- Em localhost, o padrão é `root` sem senha
