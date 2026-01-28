# 🔐 Guia de Acesso ao Painel Administrativo - ESTOX

Este guia explica passo a passo como configurar e acessar o painel administrativo do sistema ESTOX.

> **🌐 Domínio de Produção:** `estocx.com.br`  
> **🔧 Desenvolvimento Local:** `http://localhost/ESTOX`  
> 
> Todas as instruções incluem URLs tanto para desenvolvimento local (XAMPP) quanto para produção (Hostinger).

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração Inicial (Uma Vez)](#configuração-inicial-uma-vez)
3. [Acesso ao Painel Admin](#acesso-ao-painel-admin)
4. [Personalizar Credenciais](#personalizar-credenciais)
5. [Solução de Problemas](#solução-de-problemas)
6. [Segurança](#segurança)

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de que:

- ✅ O XAMPP está instalado e rodando (Apache + MySQL)
- ✅ O banco de dados `estox` foi criado
- ✅ As tabelas do sistema foram criadas (script `001-create-tables.sql`)
- ✅ O arquivo `.env` está configurado na pasta `api/`

---

## 🚀 Configuração Inicial (Uma Vez)

Esta etapa precisa ser executada **apenas uma vez** para configurar o acesso administrativo.

### Passo 1: Executar o Script de Configuração

Abra seu navegador e acesse:

**Para desenvolvimento local (XAMPP):**
```
http://localhost/ESTOX/criar-admin.php
```

**Para produção (Hostinger):**
```
https://estocx.com.br/criar-admin.php
```

**Ou com www:**
```
https://www.estocx.com.br/criar-admin.php
```

### Passo 2: Aguardar a Execução

O script irá automaticamente:

1. ✅ Verificar se a coluna `role` existe na tabela `users`
2. ✅ Adicionar a coluna `role` se não existir
3. ✅ Criar o usuário administrador
4. ✅ Configurar as permissões de acesso

### Passo 3: Anotar as Credenciais

Após a execução, o script exibirá uma página com:

- **Email do admin**: `admin@estox.com` (padrão)
- **Senha do admin**: `admin123` (padrão)

⚠️ **IMPORTANTE**: Anote essas credenciais, você precisará delas para fazer login!

---

## 🔑 Acesso ao Painel Admin

Agora que o usuário admin foi criado, siga estes passos:

### Passo 1: Acessar a Página de Login

Abra seu navegador e acesse:

**Para desenvolvimento local (XAMPP):**
```
http://localhost/ESTOX/login.html
```

**Para produção (Hostinger):**
```
https://estocx.com.br/login.html
```

**Ou com www:**
```
https://www.estocx.com.br/login.html
```

### Passo 2: Fazer Login

Na página de login, informe:

- **Email**: `admin@estox.com` (ou o email que você configurou)
- **Senha**: `admin123` (ou a senha que você configurou)

Clique no botão **"Entrar"**.

### Passo 3: Acessar o Painel Admin

Após fazer login com sucesso, você será redirecionado automaticamente para o dashboard.

Para acessar o painel administrativo, digite na barra de endereços:

**Para desenvolvimento local (XAMPP):**
```
http://localhost/ESTOX/admin-panel.html
```

**Para produção (Hostinger):**
```
https://estocx.com.br/admin-panel.html
```

**Ou com www:**
```
https://www.estocx.com.br/admin-panel.html
```

### Passo 4: Validar Acesso

O sistema irá automaticamente:

- ✅ Verificar se você está autenticado (tem token válido)
- ✅ Verificar se seu usuário tem `role = 'admin'`
- ✅ Exibir o painel administrativo

Se você não for admin ou não estiver autenticado, será redirecionado para a página de login.

---

## ⚙️ Personalizar Credenciais

Se você quiser usar credenciais diferentes das padrão, pode personalizar ao executar o script.

### Opção 1: Via URL

Ao acessar `criar-admin.php`, adicione os parâmetros na URL:

**Para desenvolvimento local (XAMPP):**
```
http://localhost/ESTOX/criar-admin.php?email=seu@email.com&password=suasenha&name=Seu Nome
```

**Para produção (Hostinger):**
```
https://estocx.com.br/criar-admin.php?email=seu@email.com&password=suasenha&name=Seu Nome
```

**Exemplo local:**
```
http://localhost/ESTOX/criar-admin.php?email=admin@minhaempresa.com&password=MinhaSenh@Segura123&name=João Silva
```

**Exemplo produção:**
```
https://estocx.com.br/criar-admin.php?email=admin@minhaempresa.com&password=MinhaSenh@Segura123&name=João Silva
```

### Opção 2: Editar o Arquivo (Avançado)

Se preferir, você pode editar o arquivo `criar-admin.php` diretamente:

1. Abra o arquivo `criar-admin.php` em um editor de texto
2. Procure pelas linhas:
   ```php
   $adminEmail = $_GET['email'] ?? 'admin@estox.com';
   $adminPassword = $_GET['password'] ?? 'admin123';
   $adminName = $_GET['name'] ?? 'Administrador';
   ```
3. Altere os valores padrão:
   ```php
   $adminEmail = $_GET['email'] ?? 'seu@email.com';
   $adminPassword = $_GET['password'] ?? 'SuASenhaAqui';
   $adminName = $_GET['name'] ?? 'Seu Nome';
   ```
4. Salve o arquivo e execute novamente

---

## 🔧 Solução de Problemas

### Problema 1: "Token não encontrado" ou redirecionamento para login

**Solução:**
1. Certifique-se de que você fez login primeiro em `login.html`
2. Verifique se o token foi salvo (pressione F12 no navegador, vá em "Console" e digite):
   ```javascript
   console.log(localStorage.getItem('token'));
   ```
   Se retornar `null`, faça login novamente.

### Problema 2: "Acesso negado. Apenas administradores podem acessar"

**Causa:** Seu usuário não tem `role = 'admin'` no banco de dados.

**Solução:**

**Para desenvolvimento local:**
1. Acesse o phpMyAdmin: `http://localhost/phpmyadmin`

**Para produção (Hostinger):**
1. Acesse o phpMyAdmin através do painel Hostinger ou: `https://estocx.com.br/phpmyadmin`
2. Selecione o banco `estox`
3. Vá na tabela `users`
4. Encontre seu usuário e verifique a coluna `role`
5. Se não for `admin`, execute este SQL:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'seu@email.com';
   ```

### Problema 3: Erro ao executar `criar-admin.php`

**Erro:** "Database connection failed"

**Solução:**
1. Verifique se o arquivo `.env` existe na pasta `api/`
2. Verifique se as credenciais do banco estão corretas no `.env`
3. Teste a conexão acessando:
   - **Local**: `http://localhost/ESTOX/api/test.php` (se existir)
   - **Produção**: `https://estocx.com.br/api/test.php` (se existir)

**Erro:** "A coluna 'role' não existe"

**Solução:**
Execute manualmente o script SQL:
1. Acesse o phpMyAdmin
2. Selecione o banco `estox`
3. Vá na aba "SQL"
4. Execute:
   ```sql
   ALTER TABLE users 
     ADD COLUMN role VARCHAR(20) DEFAULT 'user' COMMENT 'Role: user, admin' AFTER name;
   
   ALTER TABLE users 
     ADD INDEX idx_users_role (role);
   
   UPDATE users SET role = 'user' WHERE role IS NULL OR role = '';
   ```

### Problema 4: Não consigo acessar `admin-panel.html` mesmo após login

**Solução:**
1. Verifique se você fez login como usuário admin
2. Verifique se o token não expirou (tokens expiram em 24 horas por padrão)
3. Faça logout e login novamente
4. Verifique no console do navegador (F12) se há erros de JavaScript

---

## 🔒 Segurança

### Boas Práticas

1. **Altere a senha padrão imediatamente**
   - Após o primeiro acesso, altere a senha do admin
   - Use uma senha forte (mínimo 8 caracteres, com letras, números e símbolos)

2. **Delete o arquivo `criar-admin.php` após configurar**
   - Por segurança, delete este arquivo após criar o usuário admin
   - Ele não é necessário após a configuração inicial

3. **Não compartilhe as credenciais**
   - Mantenha as credenciais do admin em local seguro
   - Não as compartilhe via email ou mensagens não criptografadas

4. **Use HTTPS em produção**
   - Se estiver em servidor de produção (Hostinger, etc.), use HTTPS
   - Certifique-se de que o certificado SSL está ativo

### Recuperação de Senha

Se você esquecer a senha do admin:

1. Acesse o phpMyAdmin
2. Selecione o banco `estox`
3. Vá na tabela `users`
4. Encontre o usuário admin
5. Gere um novo hash de senha usando este código PHP:
   ```php
   <?php
   echo password_hash('NovaSenhaAqui', PASSWORD_BCRYPT);
   ?>
   ```
6. Atualize a coluna `password` do usuário admin com o hash gerado

---

## 📝 Resumo Rápido

### Desenvolvimento Local (XAMPP)

**Para configurar (uma vez):**
1. Acesse: `http://localhost/ESTOX/criar-admin.php`
2. Anote as credenciais exibidas

**Para acessar o painel admin:**
1. Acesse: `http://localhost/ESTOX/login.html`
2. Faça login com as credenciais
3. Acesse: `http://localhost/ESTOX/admin-panel.html`

### Produção (Hostinger - estocx.com.br)

**Para configurar (uma vez):**
1. Acesse: `https://estocx.com.br/criar-admin.php`
2. Anote as credenciais exibidas

**Para acessar o painel admin:**
1. Acesse: `https://estocx.com.br/login.html`
2. Faça login com as credenciais
3. Acesse: `https://estocx.com.br/admin-panel.html`

**Credenciais padrão:**
- Email: `admin@estox.com`
- Senha: `admin123`

---

## 📞 Suporte

Se você encontrar problemas que não foram resolvidos neste guia:

1. Verifique os logs de erro do PHP
2. Verifique o console do navegador (F12)
3. Verifique a conexão com o banco de dados
4. Consulte a documentação completa: `documentacoes/ADMIN_PANEL_IMPLEMENTATION.md`

---

**Última atualização:** Dezembro 2024  
**Versão:** 1.0.0

