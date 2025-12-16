# 🔍 Diagnóstico de Erro 404 na API

## Problema
Ao acessar `http://localhost/api/plans` (ou `http://localhost/ESTOX/api/plans`), recebe erro 404.

## ✅ Checklist de Verificação

### 1. Verificar a URL Correta

Como o projeto está em `C:\xampp\htdocs\ESTOX`, você tem **duas opções**:

**Opção A - Com o nome da pasta:**
```
http://localhost/ESTOX/api/plans
```

**Opção B - Configurar Virtual Host (recomendado):**
Se você configurar um Virtual Host no Apache, pode usar:
```
http://localhost/api/plans
```

### 2. Verificar se o Apache está rodando
- Abra o Painel de Controle do XAMPP
- Certifique-se de que o **Apache** está rodando (botão verde)

### 3. Verificar se o módulo `mod_rewrite` está habilitado

1. Abra o arquivo `C:\xampp\apache\conf\httpd.conf`
2. Procure pela linha: `#LoadModule rewrite_module modules/mod_rewrite.so`
3. Remova o `#` para descomentar (deve ficar: `LoadModule rewrite_module modules/mod_rewrite.so`)
4. Reinicie o Apache

### 4. Verificar se `AllowOverride` está configurado

No arquivo `C:\xampp\apache\conf\httpd.conf`, procure por:

```apache
<Directory "C:/xampp/htdocs">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
```

**Altere para:**
```apache
<Directory "C:/xampp/htdocs">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

Depois, **reinicie o Apache**.

### 5. Testar se o PHP está funcionando

Acesse no navegador:
```
http://localhost/ESTOX/api/test.php
```

Se funcionar, você verá um JSON com informações da API.

### 6. Verificar se o arquivo `.htaccess` existe

O arquivo `api/.htaccess` deve existir e ter o conteúdo correto.

### 7. Verificar se o arquivo `index.php` existe

O arquivo `api/index.php` deve existir.

## 🚀 Soluções

### Solução 1: Usar a URL com o nome da pasta

Se você não configurou um Virtual Host, use:
```
http://localhost/ESTOX/api/plans
```

### Solução 2: Configurar Virtual Host (Recomendado)

1. Abra o arquivo `C:\xampp\apache\conf\extra\httpd-vhosts.conf`

2. Adicione no final do arquivo:

```apache
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot "C:/xampp/htdocs/ESTOX"
    
    <Directory "C:/xampp/htdocs/ESTOX">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog "logs/estox-error.log"
    CustomLog "logs/estox-access.log" common
</VirtualHost>
```

3. No arquivo `C:\xampp\apache\conf\httpd.conf`, certifique-se de que esta linha está descomentada:
```apache
Include conf/extra/httpd-vhosts.conf
```

4. Reinicie o Apache

Agora você pode acessar: `http://localhost/api/plans`

### Solução 3: Criar `.htaccess` na raiz (Alternativa)

Se não quiser configurar Virtual Host, crie um arquivo `.htaccess` na raiz do projeto (`C:\xampp\htdocs\ESTOX\.htaccess`):

```apache
RewriteEngine On

# Redirect /api to /ESTOX/api
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ /ESTOX/api/$1 [L]

# Allow access to api directory
<Directory "api">
    AllowOverride All
    Require all granted
</Directory>
```

## 🔧 Teste Rápido

Execute este comando no PowerShell para testar:

```powershell
# Teste 1: Verificar se o Apache está respondendo
Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing

# Teste 2: Verificar se a pasta existe
Test-Path "C:\xampp\htdocs\ESTOX\api\index.php"

# Teste 3: Testar a API diretamente
Invoke-WebRequest -Uri "http://localhost/ESTOX/api/test.php" -UseBasicParsing
```

## 📝 Próximos Passos

Após resolver o 404:

1. Teste: `http://localhost/ESTOX/api/test.php` (ou `http://localhost/api/test.php` se configurou Virtual Host)
2. Teste: `http://localhost/ESTOX/api/plans` (ou `http://localhost/api/plans`)
3. Verifique se retorna JSON (não erro 404)

## ⚠️ Problemas Comuns

### Erro 404 mesmo após configurar tudo
- Verifique os logs do Apache: `C:\xampp\apache\logs\error.log`
- Certifique-se de que reiniciou o Apache após as mudanças
- Verifique se não há erros de sintaxe no `httpd.conf`

### Erro 403 (Forbidden)
- Verifique as permissões da pasta
- Certifique-se de que `Require all granted` está configurado

### Erro 500 (Internal Server Error)
- Verifique o arquivo `.env`
- Verifique os logs do Apache
- Habilite `display_errors` temporariamente no `api/index.php`





