# Guia de Solução de Problemas - Conexão com API

## Erro: "Erro de conexão. Verifique se a API está acessível"

### Passo 1: Verificar se a API está acessível

1. Abra o navegador e acesse:
   ```
   http://localhost/ESTOX/api/test.php
   ```

2. Se você ver um JSON com informações da API, a API está funcionando.

3. Se você ver um erro 404 ou página não encontrada, verifique:
   - O XAMPP está rodando?
   - O Apache está ativo?
   - A pasta `api` existe em `C:\xampp\htdocs\ESTOX\`?

### Passo 2: Verificar a URL da API

1. Abra o arquivo `html-version/assets/js/config.js`
2. Verifique se a URL está correta:
   ```javascript
   const API_URL = 'http://localhost/ESTOX/api';
   ```

3. Se você estiver usando uma porta diferente ou um caminho diferente, ajuste conforme necessário.

### Passo 3: Verificar CORS

1. Abra o Console do navegador (F12)
2. Tente fazer login
3. Se aparecer um erro de CORS, verifique:
   - O arquivo `api/config/config.php` tem as origens corretas?
   - O arquivo `api/classes/Middleware.php` está configurado corretamente?

### Passo 4: Verificar o Banco de Dados

1. Acesse `http://localhost/ESTOX/api/test.php`
2. Verifique se o campo `database` mostra "conectado com sucesso"
3. Se mostrar erro, verifique:
   - O MySQL está rodando no XAMPP?
   - O banco de dados `estox` existe?
   - As credenciais em `api/config/database.php` estão corretas?

### Passo 5: Testar Endpoints Manualmente

Use o arquivo `test-api.html` para testar a conexão:

1. Abra `http://localhost/ESTOX/html-version/test-api.html`
2. Clique em "Testar Conexão"
3. Verifique os resultados

### URLs de Teste

- Teste da API: `http://localhost/ESTOX/api/test.php`
- Endpoint de Login: `http://localhost/ESTOX/api/auth?action=login` (POST)
- Endpoint de Registro: `http://localhost/ESTOX/api/auth?action=register` (POST)

### Problemas Comuns

#### 1. Erro 404 ao acessar a API
- **Solução**: Verifique se o módulo `mod_rewrite` está habilitado no Apache
- Verifique se o arquivo `.htaccess` existe na pasta `api/`

#### 2. Erro de CORS
- **Solução**: A API já está configurada para permitir localhost. Se ainda houver erro, verifique o console do navegador para mais detalhes.

#### 3. Erro de conexão com banco de dados
- **Solução**: 
  1. Verifique se o MySQL está rodando
  2. Verifique as credenciais em `api/config/database.php`
  3. Crie o banco de dados se não existir:
     ```sql
     CREATE DATABASE estox;
     ```

#### 4. A API retorna erro 500
- **Solução**: 
  1. Verifique os logs de erro do Apache (geralmente em `C:\xampp\apache\logs\error.log`)
  2. Verifique se todas as dependências do Composer estão instaladas:
     ```bash
     cd api
     composer install
     ```

### Verificação Rápida

Execute estes comandos no terminal:

```bash
# Verificar se o Apache está rodando
# (Verifique no XAMPP Control Panel)

# Verificar se a pasta api existe
dir C:\xampp\htdocs\ESTOX\api

# Verificar se o index.php existe
dir C:\xampp\htdocs\ESTOX\api\index.php
```


