# 🔐 Acesso ao Painel Admin - Implementação Atual

**Documentação da implementação atual do painel administrativo do ESTOX**

---

## 📋 Resumo Executivo

### ✅ O que está implementado:

1. **Sistema de Autenticação**
   - Login via JWT Token
   - Validação de role (admin/user)
   - Redirecionamento automático baseado em role

2. **Painel Administrativo**
   - Interface web completa (`admin-panel.html`)
   - Gestão de assinaturas
   - Filtros e busca avançada
   - Ações administrativas (renovar, suspender, cancelar, etc.)

3. **Segurança**
   - Validação de token antes de renderizar conteúdo
   - Verificação de role admin obrigatória
   - Redirecionamento automático se não autorizado

---

## 🔗 Links de Acesso

### Desenvolvimento Local (XAMPP)

**Página de Login:**
```
http://localhost/ESTOX/login.html
```

**Painel Admin (após login):**
```
http://localhost/ESTOX/admin-panel.html
```

**Script de Criação de Admin:**
```
http://localhost/ESTOX/criar-admin.php
```

### Produção (Hostinger)

**Página de Login:**
```
https://estocx.com.br/login.html
ou
https://www.estocx.com.br/login.html
```

**Painel Admin (após login):**
```
https://estocx.com.br/admin-panel.html
ou
https://www.estocx.com.br/admin-panel.html
```

**Script de Criação de Admin:**
```
https://estocx.com.br/criar-admin.php
ou
https://www.estocx.com.br/criar-admin.php
```

---

## 👤 Credenciais Padrão

### Usuário Admin Padrão

**Email:** `admin@estocx.com`  
**Senha:** `admin123`

⚠️ **IMPORTANTE:** Estas são credenciais padrão. Altere a senha após o primeiro acesso por segurança!

### Personalizar Credenciais

Você pode criar um admin com credenciais personalizadas acessando:

**Local:**
```
http://localhost/ESTOX/criar-admin.php?email=seu@email.com&password=suasenha&name=Seu Nome
```

**Produção:**
```
https://estocx.com.br/criar-admin.php?email=seu@email.com&password=suasenha&name=Seu Nome
```

---

## 🚀 Como Acessar o Painel Admin

### Passo 1: Criar Usuário Admin (Primeira Vez)

1. Acesse o script de criação:
   - **Local:** `http://localhost/ESTOX/criar-admin.php`
   - **Produção:** `https://estocx.com.br/criar-admin.php`

2. O script irá:
   - ✅ Verificar se a coluna `role` existe na tabela `users`
   - ✅ Adicionar a coluna `role` se não existir
   - ✅ Criar o usuário administrador
   - ✅ Exibir as credenciais de acesso

3. Anote as credenciais exibidas na tela

### Passo 2: Fazer Login

1. Acesse a página de login:
   - **Local:** `http://localhost/ESTOX/login.html`
   - **Produção:** `https://estocx.com.br/login.html`

2. Informe as credenciais:
   - **Email:** `admin@estocx.com` (ou o email configurado)
   - **Senha:** `admin123` (ou a senha configurada)

3. Clique em **"Entrar"**

4. O sistema irá:
   - ✅ Validar as credenciais
   - ✅ Gerar um token JWT
   - ✅ Salvar o token no `localStorage`
   - ✅ Verificar o role do usuário
   - ✅ Redirecionar automaticamente:
     - Se `role = 'admin'` → `admin-panel.html`
     - Se `role = 'user'` → `configuracoes.html`

### Passo 3: Acessar o Painel Admin

Após fazer login como admin, você será redirecionado automaticamente para o painel admin.

**Ou acesse diretamente:**
- **Local:** `http://localhost/ESTOX/admin-panel.html`
- **Produção:** `https://estocx.com.br/admin-panel.html`

O sistema irá:
- ✅ Verificar se há token válido no `localStorage`
- ✅ Validar o token com a API (`GET /api/auth`)
- ✅ Verificar se o usuário tem `role = 'admin'`
- ✅ Exibir o painel administrativo

Se não for admin ou não estiver autenticado, será redirecionado para `login.html`.

---

## 🔧 Configuração Técnica

### API URL

A URL da API é detectada automaticamente pelo arquivo `assets/js/config.js`:

**Desenvolvimento Local:**
```javascript
window.API_URL = 'http://localhost/ESTOCX/api';
```

**Produção (Hostinger):**
```javascript
window.API_URL = protocol + '//' + hostname + '/api';
// Exemplo: https://estocx.com.br/api
```

### Endpoints da API

**Autenticação:**
- `POST /api/auth?action=login` - Fazer login
- `GET /api/auth` - Validar token e obter dados do usuário

**Painel Admin:**
- `GET /api/admin/subscriptions` - Listar assinaturas
- `GET /api/admin/subscriptions?store_id={uuid}` - Detalhes de uma loja
- `PUT /api/admin/subscriptions` - Executar ações administrativas

### Estrutura de Arquivos

```
ESTOX/
├── login.html                    # Página de login
├── admin-panel.html              # Painel administrativo
├── criar-admin.php               # Script para criar usuário admin
├── assets/
│   ├── js/
│   │   ├── config.js            # Configuração da API URL
│   │   ├── auth.js              # Funções de autenticação
│   │   └── admin-panel.js       # Lógica do painel admin
│   └── css/
│       └── style.css            # Estilos customizados
└── api/
    ├── endpoints/
    │   ├── auth.php             # Endpoint de autenticação
    │   └── admin/
    │       └── subscriptions.php # Endpoint do painel admin
    └── classes/
        ├── Auth.php             # Classe de autenticação
        └── Middleware.php       # Validação de role admin
```

---

## 🔒 Segurança

### Validações Implementadas

1. **Frontend (`admin-panel.js`):**
   - ✅ Verifica token no `localStorage` antes de renderizar
   - ✅ Valida token com a API (`GET /api/auth`)
   - ✅ Verifica se `user.role === 'admin'`
   - ✅ Redireciona para login se não autorizado

2. **Backend (`api/endpoints/admin/subscriptions.php`):**
   - ✅ Valida token JWT
   - ✅ Verifica role admin via `Middleware::requireAdmin()`
   - ✅ Retorna 403 se não for admin

### Boas Práticas

1. **Altere a senha padrão** após o primeiro acesso
2. **Delete o arquivo `criar-admin.php`** após configurar (por segurança)
3. **Use HTTPS em produção** (já configurado)
4. **Não compartilhe tokens** ou credenciais
5. **Faça logout** após usar o painel

---

## 🐛 Solução de Problemas

### Problema: "Token não encontrado" ou redirecionamento para login

**Solução:**
1. Certifique-se de que você fez login primeiro em `login.html`
2. Verifique se o token foi salvo:
   - Abra o console do navegador (F12)
   - Digite: `console.log(localStorage.getItem('token'))`
   - Se retornar `null`, faça login novamente

### Problema: "Acesso negado. Apenas administradores podem acessar"

**Causa:** Seu usuário não tem `role = 'admin'` no banco de dados.

**Solução:**

1. Acesse o phpMyAdmin:
   - **Local:** `http://localhost/phpmyadmin`
   - **Produção:** Via painel Hostinger

2. Selecione o banco `estox`

3. Vá na tabela `users`

4. Encontre seu usuário e verifique a coluna `role`

5. Se não for `admin`, execute:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'seu@email.com';
   ```

6. Faça login novamente para obter novo token com role admin

### Problema: Erro ao executar `criar-admin.php`

**Erro:** "Database connection failed"

**Solução:**
1. Verifique se o arquivo `.env` existe em `api/`
2. Verifique se as credenciais do banco estão corretas no `.env`
3. Teste a conexão acessando: `http://localhost/ESTOX/api/test.php` (se existir)

**Erro:** "A coluna 'role' não existe"

**Solução:**
O script `criar-admin.php` adiciona automaticamente a coluna `role`. Se falhar, execute manualmente:

```sql
ALTER TABLE users 
  ADD COLUMN role VARCHAR(20) DEFAULT 'user' COMMENT 'Role: user, admin' AFTER name;

ALTER TABLE users 
  ADD INDEX idx_users_role (role);

UPDATE users SET role = 'user' WHERE role IS NULL OR role = '';
```

---

## 📝 Resumo Rápido

### Para Desenvolvimento Local:

1. **Criar admin:** `http://localhost/ESTOX/criar-admin.php`
2. **Login:** `http://localhost/ESTOX/login.html`
3. **Painel admin:** `http://localhost/ESTOX/admin-panel.html`
4. **Credenciais padrão:** `admin@estocx.com` / `admin123`

### Para Produção:

1. **Criar admin:** `https://estocx.com.br/criar-admin.php`
2. **Login:** `https://estocx.com.br/login.html`
3. **Painel admin:** `https://estocx.com.br/admin-panel.html`
4. **Credenciais padrão:** `admin@estocx.com` / `admin123`

---

## 📞 Informações Adicionais

- **Documentação completa:** `documentacoes/ADMIN_PANEL_IMPLEMENTATION.md`
- **Guia de acesso:** `acesso-admin.md`
- **Como acessar:** `documentacoes/COMO_ACESSAR_PAINEL_ADMIN.md`

---

**Última atualização:** Dezembro 2024  
**Versão:** 1.0.0

