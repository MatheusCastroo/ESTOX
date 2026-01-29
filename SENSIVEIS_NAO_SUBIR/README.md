# ⚠️ ARQUIVOS SENSÍVEIS - NÃO SUBIR PARA PRODUÇÃO

Esta pasta contém arquivos com informações sensíveis que **NÃO DEVEM** ser enviados para o servidor Hostinger.

## 📋 Lista de Arquivos Sensíveis

### 🔐 Arquivos com Credenciais

1. **ACESSO_ADMIN_FIXO.txt** (raiz)
   - Contém: Email e senha padrão do admin
   - **NÃO SUBIR** - Contém credenciais de acesso

2. **ENV_HOSTINGER.txt** (raiz)
   - Contém: Credenciais do banco de dados (DB_PASSWORD, DB_USER, etc)
   - **NÃO SUBIR** - Contém senhas e configurações sensíveis

3. **acesso-admin.md** (raiz)
   - Contém: Documentação com credenciais de acesso
   - **NÃO SUBIR** - Contém informações sensíveis

### 🛠️ Scripts de Configuração (remover após uso)

4. **criar-admin.php** (raiz)
   - Script para criar usuário admin
   - **NÃO SUBIR** - Pode ser usado para criar admins não autorizados
   - **Ação**: Execute localmente, depois delete ou mova para esta pasta

5. **criar-env-hostinger.php** (raiz)
   - Script para criar arquivo .env com credenciais
   - **NÃO SUBIR** - Expõe credenciais do banco
   - **Ação**: Execute uma vez no servidor, depois delete

6. **api/criar-env.php**
   - Script similar para criar .env
   - **NÃO SUBIR** - Pode expor credenciais

7. **api/atualizar-env-hostinger.php**
   - Script para atualizar .env
   - **NÃO SUBIR** - Pode modificar configurações sensíveis

### 🧪 Arquivos de Teste/Debug (remover em produção)

8. **api/info.php**
   - Exibe phpinfo() com informações do servidor
   - **NÃO SUBIR** - Expõe informações do sistema
   - **Ação**: Use apenas para debug local, delete após

9. **api/test.php**
   - Arquivo de teste
   - **NÃO SUBIR** - Pode expor informações

10. **api/test-auth.php**
    - Teste de autenticação
    - **NÃO SUBIR** - Pode expor tokens/testes

11. **api/test-env.php**
    - Teste de variáveis de ambiente
    - **NÃO SUBIR** - Pode expor configurações

12. **api/test-route.php**
    - Teste de rotas
    - **NÃO SUBIR** - Pode expor estrutura da API

13. **api/test-simple.php**
    - Teste simples
    - **NÃO SUBIR** - Arquivo de teste

14. **api/debug-route.php**
    - Debug de rotas
    - **NÃO SUBIR** - Pode expor informações de debug

15. **verificar-api.php** (raiz)
    - Script de verificação da API
    - **NÃO SUBIR** - Pode expor informações

16. **testar-cadastro.php** (raiz)
    - Script de teste de cadastro
    - **NÃO SUBIR** - Arquivo de teste

17. **diagnostico-planos.php** (raiz)
    - Script de diagnóstico
    - **NÃO SUBIR** - Pode expor informações do sistema

18. **atualizar-urls-api.php** (raiz)
    - Script para atualizar URLs
    - **NÃO SUBIR** - Pode modificar configurações

19. **test-api.html** (raiz)
    - Página HTML de teste
    - **NÃO SUBIR** - Arquivo de teste

## ✅ Checklist Antes de Fazer Upload

Antes de fazer upload para a Hostinger, verifique:

- [ ] Nenhum arquivo desta pasta foi incluído no upload
- [ ] `criar-admin.php` foi removido (ou está apenas local)
- [ ] `criar-env-hostinger.php` foi removido após uso
- [ ] Todos os arquivos `test-*.php` foram removidos
- [ ] `api/info.php` foi removido
- [ ] Arquivos `.env` não foram incluídos (devem estar apenas no servidor)
- [ ] Nenhum arquivo com credenciais foi incluído

## 🔒 Arquivos que DEVEM estar no servidor

- ✅ `api/.env` (criado manualmente no servidor, não via upload)
- ✅ Todos os arquivos `.php` da API (exceto os listados acima)
- ✅ Todos os arquivos `.html` (exceto test-api.html)
- ✅ Todos os arquivos `.js`, `.css`, imagens, etc.

## 📝 Notas Importantes

1. **Arquivo .env**: O arquivo `.env` deve ser criado **diretamente no servidor** usando o conteúdo de `ENV_HOSTINGER.txt`, mas **nunca fazer upload do arquivo .txt**.

2. **Scripts de setup**: Execute `criar-env-hostinger.php` e `criar-admin.php` **uma vez** no servidor via navegador, depois **delete imediatamente**.

3. **Segurança**: Nunca commite arquivos sensíveis no Git. Use `.gitignore` para excluir:
   - `*.env`
   - `*credencial*`
   - `*senha*`
   - `test-*.php`
   - `criar-*.php`

## 🚨 Em caso de vazamento

Se algum arquivo sensível foi enviado acidentalmente:

1. Delete imediatamente do servidor
2. Altere todas as senhas/credenciais expostas
3. Revise logs de acesso do servidor
4. Atualize o JWT_SECRET no .env

---

**Última atualização**: Dezembro 2024
