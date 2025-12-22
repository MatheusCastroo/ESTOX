# 🔧 Como Corrigir Erro de Conexão com Banco de Dados

## ❌ Erro Comum:

```
Database connection failed: SQLSTATE[HY000] [1045] 
Access denied for user 'root'@'localhost' (using password: NO)
```

Este erro indica que o arquivo `.env` não está sendo encontrado ou carregado corretamente.

## ✅ Solução:

### Passo 1: Verificar se o arquivo .env existe

Acesse: `https://nerdparadise.com.br/api/test-env.php`

Este arquivo mostrará:
- Quais arquivos .env foram encontrados
- Quais variáveis de ambiente estão carregadas
- Se a conexão com o banco está funcionando

### Passo 2: Criar o arquivo .env

#### Opção A - Via Script (Recomendado):

1. Faça upload do arquivo `criar-env-hostinger.php` para a raiz
2. Acesse: `https://nerdparadise.com.br/criar-env-hostinger.php`
3. O arquivo `.env` será criado automaticamente em `api/.env`
4. **DELETE o arquivo `criar-env-hostinger.php` após usar**

#### Opção B - Manual:

1. Via FTP ou File Manager do cPanel, crie um arquivo chamado `.env` na pasta `api/`
2. Cole o seguinte conteúdo:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u507824066_estox
DB_USER=u507824066_estox_user
DB_PASSWORD=Estox7204.

JWT_SECRET=change-this-to-a-very-secure-random-string-in-production

CORS_ORIGINS=https://nerdparadise.com.br,https://www.nerdparadise.com.br
```

3. Salve o arquivo
4. Configure permissões: `644` (leitura para todos, escrita apenas para o dono)

### Passo 3: Verificar Permissões

O arquivo `.env` deve ter permissões `644`:

- Via cPanel File Manager: Clique com botão direito → Change Permissions → 644
- Via SSH: `chmod 644 api/.env`

### Passo 4: Verificar se está funcionando

Acesse: `https://nerdparadise.com.br/api/test-env.php`

Você deve ver:
- ✅ Arquivo .env encontrado
- ✅ Variáveis carregadas corretamente
- ✅ Conexão com banco de dados funcionando

### Passo 5: Testar Cadastro

Agora tente cadastrar novamente. O erro deve desaparecer.

## 🔍 Verificações Adicionais:

### Se ainda não funcionar:

1. **Verifique o caminho do arquivo .env**
   - Deve estar em: `public_html/api/.env`
   - Ou em: `public_html/.env`

2. **Verifique se não há espaços extras**
   - Linhas não devem ter espaços antes do `=`
   - Exemplo correto: `DB_HOST=localhost`
   - Exemplo errado: `DB_HOST = localhost` ou ` DB_HOST=localhost`

3. **Verifique se a senha não tem caracteres especiais problemáticos**
   - Se a senha tiver caracteres especiais, pode precisar de aspas
   - Exemplo: `DB_PASSWORD="Estox7204."`

4. **Verifique logs de erro do PHP**
   - Via cPanel → Error Logs
   - Procure por erros relacionados ao carregamento do .env

## 📋 Checklist:

- [ ] Arquivo `.env` criado em `api/.env` ou na raiz
- [ ] Conteúdo correto (sem espaços extras)
- [ ] Permissões corretas (644)
- [ ] Teste `test-env.php` mostra variáveis carregadas
- [ ] Teste `test.php` mostra conexão bem-sucedida
- [ ] Cadastro funcionando

## 🆘 Ainda com Problemas?

Se após todos esses passos ainda não funcionar:

1. Execute `test-env.php` e compartilhe o resultado
2. Verifique os logs de erro do PHP no cPanel
3. Teste a conexão manualmente via phpMyAdmin
4. Verifique se as credenciais estão corretas no painel da Hostinger

