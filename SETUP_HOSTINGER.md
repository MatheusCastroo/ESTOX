# Setup Completo - Hostinger - nerdparadise.com.br

## 📋 Informações do Servidor

- **Domínio**: nerdparadise.com.br
- **Banco de Dados**: u507824066_estox
- **Usuário MySQL**: u507824066_estox_user
- **Senha MySQL**: Estox7204.

## 🔧 Configuração

### 1. Arquivo .env

**Opção A - Script Automático (Recomendado):**

1. Faça upload do arquivo `criar-env-hostinger.php` para a raiz do projeto
2. Acesse via navegador: `https://nerdparadise.com.br/criar-env-hostinger.php`
3. O arquivo `.env` será criado automaticamente
4. **DELETE o arquivo `criar-env-hostinger.php` após usar!**

**Opção B - Manual:**

Crie um arquivo `.env` na pasta `api/` ou na raiz com o conteúdo de `ENV_HOSTINGER.txt`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u507824066_estox
DB_USER=u507824066_estox_user
DB_PASSWORD=Estox7204.

JWT_SECRET=change-this-to-a-very-secure-random-string-in-production

CORS_ORIGINS=https://nerdparadise.com.br,https://www.nerdparadise.com.br
```

**⚠️ IMPORTANTE**: 
- Altere o `JWT_SECRET` para uma chave segura e única (use gerador online ou PHP: `bin2hex(random_bytes(32))`)
- Não compartilhe este arquivo publicamente
- Configure permissões: `chmod 644 .env`

### 2. Estrutura de Pastas na Hostinger

```
public_html/
├── index.html
├── login.html
├── cadastro.html
├── [outros arquivos HTML]
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── config.js (já configurado automaticamente!)
│       ├── auth.js
│       └── [outros arquivos JS]
├── public/
│   └── [imagens]
├── api/
│   ├── index.php
│   ├── .env (criar com as credenciais acima)
│   ├── .htaccess
│   └── [outros arquivos da API]
└── .env (opcional, se preferir na raiz)
```

### 3. Configuração do Banco de Dados

#### Via phpMyAdmin da Hostinger:

1. Acesse o phpMyAdmin pelo painel da Hostinger
2. Selecione o banco: `u507824066_estox`
3. Importe o arquivo SQL: `scripts/001-create-tables.sql`
4. Verifique se todas as tabelas foram criadas

#### Ou via linha de comando (SSH):

```bash
mysql -u u507824066_estox_user -p'Estox7204.' u507824066_estox < scripts/001-create-tables.sql
```

### 4. Permissões de Arquivos

Configure as permissões corretas:

```bash
# Arquivos
chmod 644 *.php
chmod 644 *.html
chmod 644 .env

# Pastas
chmod 755 api/
chmod 755 assets/
chmod 755 public/
```

### 5. Verificação

#### Teste da API:

Acesse: `https://nerdparadise.com.br/api/test.php`

Deve retornar:
```json
{
  "status": "ok",
  "message": "API funcionando corretamente"
}
```

#### Teste do Frontend:

1. Abra: `https://nerdparadise.com.br/index.html`
2. Abra o console do navegador (F12)
3. Verifique se aparece: `API_URL configurada: https://nerdparadise.com.br/api`

### 6. URLs Importantes

- **Site Principal**: https://nerdparadise.com.br/index.html
- **API Base**: https://nerdparadise.com.br/api
- **Login**: https://nerdparadise.com.br/login.html
- **Dashboard**: https://nerdparadise.com.br/dashboard.html

### 7. Configuração de Segurança

#### JWT Secret

Gere uma chave segura para produção:

```php
<?php
echo bin2hex(random_bytes(32));
?>
```

Use o resultado no `.env` como `JWT_SECRET`.

#### .htaccess de Segurança

O arquivo `api/.htaccess` já está configurado com:
- CORS habilitado
- Headers de segurança
- Redirecionamento para index.php

### 8. Troubleshooting

#### Erro de Conexão com Banco:

1. Verifique se as credenciais estão corretas no `.env`
2. Verifique se o banco existe no phpMyAdmin
3. Teste a conexão manualmente

#### Erro 404 na API:

1. Verifique se o `.htaccess` está no lugar correto
2. Verifique se o mod_rewrite está habilitado
3. Verifique se o arquivo `api/index.php` existe

#### CORS Error:

1. Verifique se o domínio está no `CORS_ORIGINS` do `.env`
2. Verifique se o `.htaccess` está configurado corretamente
3. Limpe o cache do navegador

### 9. Checklist de Deploy

- [ ] Arquivo `.env` criado com credenciais corretas
- [ ] Banco de dados importado (tabelas criadas)
- [ ] Arquivo `.htaccess` na pasta `api/`
- [ ] Permissões de arquivos configuradas
- [ ] JWT_SECRET alterado para uma chave segura
- [ ] Teste da API funcionando (`/api/test.php`)
- [ ] Frontend carregando corretamente
- [ ] Console do navegador sem erros
- [ ] Login funcionando
- [ ] Dashboard acessível

### 10. Backup

⚠️ **IMPORTANTE**: Configure backups regulares:

1. Backup do banco de dados (via phpMyAdmin ou cron)
2. Backup dos arquivos (via FTP ou cPanel)

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs de erro do PHP (via cPanel)
2. Verifique o console do navegador (F12)
3. Teste a API diretamente no navegador
4. Verifique se todas as dependências estão instaladas



