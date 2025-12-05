# 🔧 Resolver Erro de Conexão com a API

Se você está recebendo o erro **"Erro de conexão. Verifique se a API está rodando e tente novamente"**, siga estes passos:

## ✅ Checklist de Verificação

### 1. Verificar se o XAMPP está rodando

1. Abra o **Painel de Controle do XAMPP**
2. Certifique-se de que o **Apache** está rodando (botão deve estar verde)
3. Certifique-se de que o **MySQL** está rodando (botão deve estar verde)

### 2. Verificar se o arquivo `.env` existe

O arquivo `.env` deve estar na raiz do projeto: `C:\xampp\htdocs\ESTOX\.env`

**Conteúdo esperado:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=estox
DB_USER=root
DB_PASSWORD=

JWT_SECRET=sua-chave-jwt-aqui
CORS_ORIGINS=http://localhost:8080,http://localhost:3000
```

### 3. Verificar se a API está acessível

**⚠️ IMPORTANTE:** Como o projeto está em `C:\xampp\htdocs\ESTOX`, você precisa usar a URL completa:

Abra no navegador:
```
http://localhost/ESTOX/api/plans
```

**OU** se você configurou um Virtual Host:
```
http://localhost/api/plans
```

**Resposta esperada:** JSON com os planos ou mensagem de erro da API (não erro 404 ou de conexão)

**Se receber erro 404, verifique:**
1. Se o módulo `mod_rewrite` do Apache está habilitado
2. Se o `AllowOverride` está configurado como `All` no `httpd.conf`
3. Se o arquivo `api/.htaccess` existe
4. Consulte o arquivo `DIAGNOSTICO_404.md` para mais detalhes

### 4. Verificar configuração do CORS

O CORS deve permitir requisições de `http://localhost:8080` (onde o frontend HTML está rodando).

## 🚀 Passos para Resolver

### Passo 1: Criar o arquivo `.env` (se não existir)

Execute na raiz do projeto:
```bash
C:\xampp\php\php.exe criar-env.php
```

**OU** crie manualmente o arquivo `.env` na raiz (`C:\xampp\htdocs\ESTOX\.env`) com:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=estox
DB_USER=root
DB_PASSWORD=

JWT_SECRET=3f8a9b2c7d4e1f6a5b8c9d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a
CORS_ORIGINS=http://localhost:8080,http://localhost:3000
```

### Passo 2: Verificar banco de dados

1. Acesse o phpMyAdmin: `http://localhost/phpmyadmin`
2. Verifique se o banco `estox` existe
3. Se não existir, crie:
   - Nome: `estox`
   - Charset: `utf8mb4_unicode_ci`
4. Execute os scripts SQL na ordem:
   - `scripts/001-create-tables.sql`
   - `scripts/002-seed-plans.sql`

### Passo 3: Testar a API diretamente

**Teste 1 - Arquivo de teste:**
```
http://localhost/ESTOX/api/test.php
```
Este teste mostra informações sobre a configuração da API.

**Teste 2 - Planos:**
```
http://localhost/ESTOX/api/plans
```

**Teste 3 - Health Check (se configurou Virtual Host):**
```
http://localhost/api/test.php
http://localhost/api/plans
```

### Passo 4: Verificar URL da API no Frontend

No arquivo `html-version/assets/js/auth.js`, a URL deve ser:
```javascript
const API_URL = 'http://localhost/api';
```

**Se o frontend estiver em outra porta ou domínio, ajuste a URL.**

### Passo 5: Verificar logs de erro

1. Abra o arquivo de log do Apache do XAMPP:
   - `C:\xampp\apache\logs\error.log`
2. Procure por erros relacionados ao PHP ou API

### Passo 6: Habilitar exibição de erros (temporariamente)

No arquivo `api/index.php`, altere temporariamente:

```php
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

Isso mostrará erros PHP na resposta, facilitando o diagnóstico.

### Passo 7: Verificar extensões PHP

No XAMPP, verifique se as extensões estão habilitadas no `php.ini`:

```ini
extension=pdo_mysql
extension=mbstring
extension=json
```

## 🔍 Diagnóstico Rápido

Execute no console do navegador (F12) para testar a conexão:

```javascript
fetch('http://localhost/api/plans')
  .then(r => r.json())
  .then(data => console.log('✅ API funcionando:', data))
  .catch(err => console.error('❌ Erro:', err));
```

## ⚠️ Problemas Comuns

### Erro 404 (Not Found)

**Causas mais comuns:**

1. **URL incorreta:**
   - Se o projeto está em `C:\xampp\htdocs\ESTOX`, use: `http://localhost/ESTOX/api/plans`
   - Se configurou Virtual Host, use: `http://localhost/api/plans`

2. **Módulo `mod_rewrite` não habilitado:**
   - Abra `C:\xampp\apache\conf\httpd.conf`
   - Procure: `#LoadModule rewrite_module modules/mod_rewrite.so`
   - Remova o `#` para descomentar
   - Reinicie o Apache

3. **`AllowOverride` não configurado:**
   - No `httpd.conf`, procure por `<Directory "C:/xampp/htdocs">`
   - Altere `AllowOverride None` para `AllowOverride All`
   - Reinicie o Apache

4. **Arquivo `.htaccess` ausente:**
   - Verifique se o arquivo `api/.htaccess` existe
   - Verifique se o conteúdo está correto

**📋 Consulte o arquivo `DIAGNOSTICO_404.md` para um guia completo de resolução.**

### Erro 500 (Internal Server Error)
- Verifique o arquivo `.env`
- Verifique se o banco de dados existe
- Verifique os logs do Apache

### Erro CORS
- Verifique o arquivo `.env` - CORS_ORIGINS deve incluir a URL do frontend
- Verifique se o Middleware está chamando `cors()` corretamente

### Erro de Conexão com Banco
- Verifique se o MySQL está rodando
- Verifique as credenciais no `.env`
- Teste a conexão no phpMyAdmin

## 📝 Próximos Passos

Após resolver, teste novamente:
1. Acesse `http://localhost:8080/cadastro.html`
2. Preencha o formulário
3. Clique em "Criar conta"

Se ainda houver problemas, compartilhe:
- A mensagem de erro completa do console
- O conteúdo do arquivo `.env` (sem senhas)
- A resposta do teste da API (`http://localhost/api/plans`)




