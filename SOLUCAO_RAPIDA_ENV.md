# 🚀 Solução Rápida: Erro de Conexão com Banco de Dados

## ❌ Erro:
```
Database connection failed: SQLSTATE[HY000] [1045] 
Access denied for user 'root'@'localhost' (using password: NO)
```

**Causa:** O arquivo `.env` não existe ou não está sendo carregado.

## ✅ Solução Rápida (2 minutos):

### Opção 1: Via Script Automático (MAIS FÁCIL)

1. **Faça upload do arquivo** `api/criar-env.php` para o servidor (se ainda não fez)
2. **Acesse no navegador:** `https://nerdparadise.com.br/api/criar-env.php`
3. O arquivo `.env` será criado automaticamente
4. **DELETE o arquivo `criar-env.php` após usar** (segurança)

### Opção 2: Manualmente (se script não funcionar)

1. **Acesse cPanel → File Manager**
2. **Navegue até:** `public_html/api/`
3. **Crie um novo arquivo** chamado `.env` (com o ponto no início)
4. **Cole este conteúdo:**

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u507824066_estox
DB_USER=u507824066_estox_user
DB_PASSWORD=Estox7204.

JWT_SECRET=change-this-to-a-very-secure-random-string-in-production

CORS_ORIGINS=https://nerdparadise.com.br,https://www.nerdparadise.com.br
```

5. **Salve o arquivo**
6. **Configure permissões:** Clique com botão direito → Change Permissions → `644`

## ✅ Verificar se funcionou:

1. **Acesse:** `https://nerdparadise.com.br/api/test-env.php`
2. **Deve mostrar:**
   - ✅ Arquivo .env encontrado
   - ✅ Variáveis carregadas
   - ✅ Conexão com banco funcionando

3. **Teste o cadastro novamente** - o erro deve desaparecer!

## 📋 Checklist:

- [ ] Arquivo `.env` criado em `public_html/api/`
- [ ] Conteúdo correto (sem espaços extras antes do `=`)
- [ ] Permissões: `644`
- [ ] Teste `test-env.php` mostra conexão OK
- [ ] Cadastro funcionando

## 🆘 Se ainda não funcionar:

1. Verifique se o arquivo está em `public_html/api/.env` (não `public_html/.env`)
2. Verifique permissões (644)
3. Veja o resultado de `test-env.php` para diagnóstico
4. Verifique se as credenciais estão corretas no painel da Hostinger


