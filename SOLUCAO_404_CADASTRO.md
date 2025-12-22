# 🔧 Solução para Erro 404 no Cadastro

## ❌ Problema:

Erro 404 ao tentar cadastrar. A API não encontra o endpoint `/api/auth?action=register`.

## ✅ Correções Aplicadas:

### 1. **Roteamento Melhorado**
- Código de routing aprimorado para lidar melhor com diferentes configurações de servidor
- Tratamento melhorado de caminhos e query strings

### 2. **CORS Configurado**
- Headers CORS aplicados antes do routing
- OPTIONS requests tratados corretamente

### 3. **Arquivos de Diagnóstico Criados**
- `api/test-auth.php` - Testa se o endpoint auth está acessível
- `api/debug-route.php` - Mostra como o routing processa requisições
- `api/test-env.php` - Testa variáveis de ambiente

### 4. **Mensagens de Erro Melhoradas**
- Endpoint `/api/` agora retorna lista de endpoints disponíveis
- Mensagens de erro 404 incluem informações de debug

## 🔍 Como Diagnosticar:

### Passo 1: Testar se API está funcionando

Acesse no navegador:
1. `https://nerdparadise.com.br/api/test.php` → Deve retornar JSON
2. `https://nerdparadise.com.br/api/test-auth.php` → Deve retornar JSON
3. `https://nerdparadise.com.br/api/debug-route` → Mostra informações de routing

### Passo 2: Testar endpoint de auth

Acesse:
- `https://nerdparadise.com.br/api/auth` → Deve retornar mensagem de API ou erro específico

### Passo 3: Verificar no Console

Quando tentar cadastrar, abra o console (F12) → aba **Network** e verifique:

1. **Qual URL está sendo chamada?**
   - Deve ser: `https://nerdparadise.com.br/api/auth?action=register`
   - Se for diferente, problema no `config.js`

2. **Qual o status HTTP?**
   - 404 = Endpoint não encontrado
   - 405 = Método não permitido
   - 500 = Erro interno

3. **Qual a resposta?**
   - Clique na requisição → Response
   - Veja o JSON retornado

## 🛠️ Verificações no Servidor:

### 1. Verificar se .htaccess está funcionando

Se acessar `https://nerdparadise.com.br/api/test.php` retornar 404:
- Problema com `.htaccess`
- Verificar se `mod_rewrite` está habilitado
- Verificar permissões do `.htaccess` (644)

### 2. Verificar estrutura de arquivos

Certifique-se de que existe:

```
public_html/
└── api/
    ├── index.php ✅
    ├── .htaccess ✅
    ├── endpoints/
    │   └── auth.php ✅
    └── classes/
        ├── Auth.php ✅
        ├── Database.php ✅
        ├── Middleware.php ✅
        └── Response.php ✅
```

### 3. Verificar permissões

```bash
# Arquivos PHP
chmod 644 api/*.php
chmod 644 api/endpoints/*.php
chmod 644 api/classes/*.php

# .htaccess
chmod 644 api/.htaccess

# Pastas
chmod 755 api/
chmod 755 api/endpoints/
chmod 755 api/classes/
```

## 📋 Checklist:

- [ ] `api/index.php` existe
- [ ] `api/.htaccess` existe e tem conteúdo correto
- [ ] `api/endpoints/auth.php` existe
- [ ] Teste `/api/test.php` retorna JSON (não 404)
- [ ] Teste `/api/auth` retorna algo (não 404 puro)
- [ ] Console mostra URL correta da requisição
- [ ] Permissões corretas (644/755)

## 🆘 Se ainda não funcionar:

1. **Acesse**: `https://nerdparadise.com.br/api/debug-route`
2. **Compartilhe o resultado** para análise
3. **Verifique logs** no cPanel → Error Logs
4. **Teste diretamente** via curl ou Postman:
   ```bash
   curl -X POST https://nerdparadise.com.br/api/auth?action=register \
     -H "Content-Type: application/json" \
     -d '{"email":"teste@test.com","password":"123456","name":"Teste"}'
   ```
