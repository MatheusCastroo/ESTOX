# 🔧 Diagnóstico de Erro 404 na API

## ❌ Problema:

Erro 404 ao tentar cadastrar no site. A API não está respondendo corretamente.

## 🔍 Verificações:

### 1. Testar se a API está acessível

Acesse no navegador:
- `https://nerdparadise.com.br/api/test.php`
- `https://nerdparadise.com.br/api/test-auth.php`

**Deve retornar JSON**, não erro 404.

### 2. Testar endpoint de cadastro diretamente

Abra o console do navegador (F12) e execute:

```javascript
fetch('https://nerdparadise.com.br/api/auth?action=register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'teste@example.com',
        password: 'senha123',
        name: 'Teste'
    })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Resultados possíveis:**
- ✅ Retorna JSON com `success: true` = API funcionando
- ❌ 404 = Endpoint não encontrado (problema de routing)
- ❌ CORS Error = Problema de CORS
- ❌ 500 = Erro interno (ver logs)

### 3. Verificar estrutura de pastas

Certifique-se de que existe:

```
public_html/
└── api/
    ├── index.php ✅
    ├── .htaccess ✅
    ├── endpoints/
    │   └── auth.php ✅
    ├── classes/
    │   ├── Auth.php ✅
    │   ├── Database.php ✅
    │   ├── Response.php ✅
    │   └── Middleware.php ✅
    └── config/
        ├── database.php ✅
        ├── config.php ✅
        └── load-env.php ✅
```

### 4. Verificar .htaccess

O arquivo `api/.htaccess` deve existir e conter:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

### 5. Verificar mod_rewrite

O módulo `mod_rewrite` do Apache deve estar habilitado. Na Hostinger geralmente já vem habilitado.

## 🛠️ Soluções:

### Solução 1: Verificar se .htaccess está sendo processado

Crie um arquivo `api/test-rewrite.php`:

```php
<?php
echo "Rewrite está funcionando!";
```

Acesse: `https://nerdparadise.com.br/api/test-rewrite`

- Se aparecer "Rewrite está funcionando!" = .htaccess funciona
- Se aparecer 404 = .htaccess não está sendo processado

### Solução 2: Verificar permissões

```bash
# .htaccess deve ter permissão 644
chmod 644 api/.htaccess

# index.php deve ter permissão 644
chmod 644 api/index.php
```

### Solução 3: Testar roteamento manualmente

Crie `api/test-route.php`:

```php
<?php
echo "REQUEST_URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME'] . "\n";
echo "QUERY_STRING: " . ($_SERVER['QUERY_STRING'] ?? 'não definido') . "\n";
```

Acesse: `https://nerdparadise.com.br/api/test-route?action=register`

### Solução 4: Verificar logs de erro

No cPanel da Hostinger:
1. Acesse **Error Logs**
2. Procure por erros relacionados a `/api/auth`
3. Veja mensagens de erro detalhadas

## ✅ Checklist:

- [ ] Arquivo `api/.htaccess` existe e tem conteúdo correto
- [ ] Arquivo `api/index.php` existe
- [ ] Arquivo `api/endpoints/auth.php` existe
- [ ] Teste `/api/test.php` retorna JSON (não 404)
- [ ] Teste `/api/test-auth.php` retorna JSON (não 404)
- [ ] Permissões corretas (644 para arquivos)
- [ ] Console do navegador mostra URL completa da requisição
- [ ] Erro 404 aparece na aba Network do console

## 📝 Informações para Debug:

Quando você tentar cadastrar, abra o console (F12) → aba **Network** e verifique:

1. **Qual URL está sendo chamada?**
   - Deve ser: `https://nerdparadise.com.br/api/auth?action=register`
   - Se for diferente, problema no `config.js`

2. **Qual o status da resposta?**
   - 404 = Endpoint não encontrado
   - 405 = Método não permitido
   - 500 = Erro interno (ver logs)

3. **Qual a resposta?**
   - Clique na requisição → aba Response
   - Veja o que a API retornou

## 🆘 Se ainda não funcionar:

Compartilhe:
1. O resultado de `https://nerdparadise.com.br/api/test.php`
2. O resultado de `https://nerdparadise.com.br/api/test-auth.php`
3. A URL exata que aparece no console Network
4. A mensagem de erro completa do console
