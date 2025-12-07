# 🚨 Diagnóstico Rápido - Erro de Conexão com API

## ⚡ Teste Rápido (5 minutos)

### Passo 1: Verificar se XAMPP está rodando

✅ Apache está verde?
✅ MySQL está verde?

Se não, inicie ambos no Painel de Controle do XAMPP.

### Passo 2: Testar a API

Abra no navegador:
```
http://localhost/api/test.php
```

**Resultado esperado:** JSON com informações da API

### Passo 3: Verificar banco de dados

1. Acesse: `http://localhost/phpmyadmin`
2. Verifique se o banco `estox` existe
3. Se não existir:
   - Clique em "Novo"
   - Nome: `estox`
   - Colação: `utf8mb4_unicode_ci`
   - Clique em "Criar"

### Passo 4: Verificar arquivo `.env`

O arquivo deve estar em: `C:\xampp\htdocs\ESTOX\.env`

**Criar rapidamente:**
1. Abra o Bloco de Notas
2. Cole este conteúdo:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=estox
DB_USER=root
DB_PASSWORD=

JWT_SECRET=3f8a9b2c7d4e1f6a5b8c9d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a
CORS_ORIGINS=http://localhost:8080,http://localhost:3000
```

3. Salve como `.env` (com o ponto no início!)
4. Local: `C:\xampp\htdocs\ESTOX\.env`

### Passo 5: Testar endpoint de planos

```
http://localhost/api/plans
```

**Resultado esperado:** JSON com os planos ou mensagem de erro da API (não erro 404)

## 🔍 O que cada erro significa

### Erro 404 (Not Found)
- ❌ A API não está configurada corretamente
- ✅ Solução: Verifique se o `.htaccess` está na pasta `api/`

### Erro 500 (Internal Server Error)
- ❌ Erro no PHP ou configuração
- ✅ Solução: Verifique o arquivo `.env` e o banco de dados

### Erro de CORS
- ❌ O frontend não pode fazer requisições
- ✅ Solução: Adicione `http://localhost:8080` no CORS_ORIGINS do `.env`

### Erro de Conexão
- ❌ A API não está acessível
- ✅ Solução: Verifique se o Apache está rodando

## 📝 Checklist Final

Antes de testar o cadastro novamente:

- [ ] XAMPP Apache está rodando
- [ ] XAMPP MySQL está rodando
- [ ] Banco `estox` existe no phpMyAdmin
- [ ] Arquivo `.env` existe na raiz do projeto
- [ ] `http://localhost/api/test.php` retorna JSON
- [ ] `http://localhost/api/plans` retorna JSON ou erro da API

## ✅ Testar Cadastro

1. Acesse: `http://localhost:8080/cadastro.html`
2. Preencha o formulário
3. Abra o Console do Navegador (F12)
4. Clique em "Criar conta"
5. Veja se há erros no console

## 💡 Dica

Se ainda der erro, compartilhe:
- A resposta de `http://localhost/api/test.php`
- A mensagem de erro do console do navegador





