# 🔧 Diagnóstico: Arquivos PHP Não Funcionam na Pasta /api/

## ❌ Problema:

Acessar arquivos PHP diretamente na pasta `api/` retorna "This Page Does Not Exist":
- `https://nerdparadise.com.br/api/test.php`
- `https://nerdparadise.com.br/api/test-route.php`
- `https://nerdparadise.com.br/api/info.php`

## 🔍 Possíveis Causas:

### 1. **Arquivos não foram enviados para o servidor**
   - Os arquivos `.php` não existem fisicamente no servidor
   - Estrutura de pastas incorreta

### 2. **PHP não está habilitado na pasta api/**
   - Configuração do servidor bloqueia PHP em subpastas
   - Permissões incorretas

### 3. **.htaccess está redirecionando tudo para index.php**
   - Regras de rewrite incorretas
   - Ordem das regras está errada

### 4. **Configuração do servidor Hostinger**
   - Algumas configurações podem bloquear acesso direto a PHP
   - Pode precisar de configuração especial

## ✅ Correções Aplicadas:

### 1. **Atualizado .htaccess**
   - Regra para permitir acesso direto a arquivos `.php` que existem
   - Ordem das regras corrigida (deve estar ANTES das outras)

### 2. **Criado info.php**
   - Arquivo simples para testar se PHP funciona
   - Mostra `phpinfo()` se funcionar

## 🛠️ Como Diagnosticar:

### Passo 1: Verificar se arquivos existem no servidor

**Via cPanel File Manager:**
1. Acesse cPanel → File Manager
2. Navegue até `public_html/api/`
3. Verifique se existem:
   - `index.php` ✅
   - `test.php` ✅
   - `test-route.php` ✅
   - `info.php` ✅
   - `.htaccess` ✅

**Se os arquivos não existem:**
- Faça upload deles para o servidor
- Certifique-se de que estão em `public_html/api/`

### Passo 2: Testar se PHP funciona

**Opção A: Via cPanel File Manager**
1. Crie um arquivo `test-simple.php` em `public_html/api/`:
   ```php
   <?php echo "PHP funciona!"; ?>
   ```
2. Acesse: `https://nerdparadise.com.br/api/test-simple.php`
3. Se aparecer "PHP funciona!" = PHP está funcionando ✅
4. Se aparecer 404 = Problema de roteamento/routing

**Opção B: Via SSH (se tiver acesso)**
```bash
cd public_html/api/
ls -la *.php
php test.php
```

### Passo 3: Verificar .htaccess

**Conteúdo correto do `api/.htaccess`:**

```apache
# Apache configuration for API
RewriteEngine On

# IMPORTANT: Allow direct access to existing PHP files (test scripts, etc)
# This rule must come FIRST before other rewrite rules
RewriteCond %{REQUEST_FILENAME} -f
RewriteCond %{REQUEST_FILENAME} \.php$
RewriteRule ^(.*)$ - [L]

# Handle OPTIONS requests for CORS
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ index.php [QSA,L]

# Redirect to index.php ONLY if file doesn't exist (but keep query string)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Enable CORS
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header set Access-Control-Allow-Credentials "true"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

**Verificar:**
- Arquivo existe em `public_html/api/.htaccess`?
- Permissão é 644?
- Conteúdo está correto?

### Passo 4: Testar acesso direto

Tente acessar:
1. `https://nerdparadise.com.br/api/info.php` → Deve mostrar `phpinfo()`
2. `https://nerdparadise.com.br/api/test-simple.php` → Deve mostrar "PHP funciona!"

**Resultados:**
- ✅ Funciona = PHP está OK, problema pode ser nos arquivos específicos
- ❌ 404 = Problema de roteamento ou arquivos não existem
- ❌ Erro PHP = Problema de código PHP

### Passo 5: Verificar permissões

**Via cPanel File Manager ou SSH:**

```bash
# Permissões corretas
chmod 644 api/.htaccess
chmod 644 api/*.php
chmod 755 api/
```

## 🚨 Soluções Alternativas:

### Solução 1: Desabilitar .htaccess temporariamente

**Para testar se .htaccess é o problema:**

1. Renomeie `api/.htaccess` para `api/.htaccess.bak`
2. Teste acessar `https://nerdparadise.com.br/api/test.php`
3. Se funcionar = problema estava no `.htaccess`
4. Se não funcionar = problema é outro (PHP não processa, arquivos não existem, etc)

### Solução 2: Usar index.php com parâmetro

Se não conseguir fazer funcionar arquivos diretos, pode usar:

```
https://nerdparadise.com.br/api/index.php?test=1
```

E modificar `index.php` para lidar com isso.

### Solução 3: Verificar configuração Hostinger

Algumas hospedagens têm configurações especiais:

1. **Verificar se mod_rewrite está habilitado**
   - Na Hostinger geralmente já vem habilitado
   - Pode verificar em cPanel → Apache Modules

2. **Verificar se PHP está habilitado**
   - cPanel → Select PHP Version
   - Certifique-se de que PHP está selecionado

3. **Verificar Error Logs**
   - cPanel → Error Logs
   - Procure por erros relacionados a `/api/`

## 📋 Checklist:

- [ ] Arquivos PHP existem em `public_html/api/`
- [ ] `.htaccess` existe em `public_html/api/`
- [ ] Conteúdo do `.htaccess` está correto
- [ ] Permissões corretas (644 para arquivos, 755 para pastas)
- [ ] Teste simples (`test-simple.php`) funciona?
- [ ] PHP está habilitado no servidor
- [ ] `mod_rewrite` está habilitado (geralmente sim na Hostinger)

## 🆘 Se ainda não funcionar:

1. **Crie um arquivo de teste mínimo:**
   ```php
   <?php
   echo "Teste: " . date('Y-m-d H:i:s');
   phpinfo();
   ?>
   ```
   Salve como `test-minimal.php` e tente acessar

2. **Verifique logs de erro:**
   - cPanel → Error Logs
   - Veja se há erros relacionados

3. **Entre em contato com suporte Hostinger:**
   - Pergunte se há alguma configuração especial para subpastas
   - Pergunte se há bloqueios para arquivos PHP em subpastas
   - Compartilhe o conteúdo do `.htaccess`

4. **Teste em subpasta diferente:**
   - Crie `public_html/test-api/test.php`
   - Veja se funciona lá
   - Isso ajuda a identificar se é problema específico da pasta `api/`
