# ✅ Checklist de Deploy na Hostinger

Use este checklist para garantir que tudo está configurado corretamente.

## 📦 Pré-Deploy (Local)

- [ ] Executar `build_for_production.bat` (Windows) ou `build_for_production.sh` (Linux/Mac)
- [ ] Verificar se a pasta `.next` foi criada
- [ ] Testar build localmente: `npm start`
- [ ] Verificar se não há erros no console

## 📤 Upload para Hostinger

- [ ] Upload da pasta `api/` completa
- [ ] Upload da pasta `.next/` completa
- [ ] Upload da pasta `app/` completa
- [ ] Upload da pasta `components/` completa
- [ ] Upload da pasta `lib/` completa
- [ ] Upload da pasta `public/` completa
- [ ] Upload da pasta `hooks/` completa (se existir)
- [ ] Upload do arquivo `.htaccess` (raiz)
- [ ] Upload do arquivo `api/.htaccess`
- [ ] Upload do arquivo `package.json`
- [ ] Upload do arquivo `next.config.mjs`
- [ ] Upload do arquivo `tsconfig.json`
- [ ] Upload do arquivo `server.js`
- [ ] Upload de outros arquivos de configuração

## ⚙️ Configuração no hPanel

### Node.js
- [ ] Criar aplicação Node.js no hPanel
- [ ] Configurar Node.js Version (18.x ou superior)
- [ ] Configurar Application Mode: Production
- [ ] Configurar Application Root: `public_html`
- [ ] Configurar Application Startup File: `server.js` (ou vazio)
- [ ] Configurar Application URL: `/`

### Banco de Dados
- [ ] Verificar se o banco de dados foi criado
- [ ] Verificar credenciais do banco (usuário, senha, nome)
- [ ] Importar estrutura SQL (scripts/)
- [ ] Verificar se `api/config/database.php` está correto

### Arquivos
- [ ] Criar arquivo `.env` no servidor
- [ ] Configurar `NEXT_PUBLIC_API_URL` no `.env`
- [ ] Verificar permissões dos arquivos (755 para pastas, 644 para arquivos)

## 🔧 Pós-Upload

- [ ] Conectar via SSH (se disponível)
- [ ] Navegar até `public_html`
- [ ] Executar `npm install --production`
- [ ] Verificar se não há erros na instalação
- [ ] Iniciar aplicação Node.js no hPanel

## ✅ Testes

- [ ] Acessar `https://seudominio.com` - Landing page carrega?
- [ ] Acessar `https://seudominio.com/login` - Página de login carrega?
- [ ] Acessar `https://seudominio.com/api/plans` - API responde?
- [ ] Testar cadastro de usuário
- [ ] Testar login
- [ ] Testar dashboard (após login)
- [ ] Testar catálogo público
- [ ] Verificar se imagens carregam
- [ ] Verificar se CSS/JS carregam
- [ ] Testar dark mode
- [ ] Testar responsividade (mobile)

## 🔒 Segurança

- [ ] Verificar se `.env` NÃO está no Git
- [ ] Verificar se senhas do banco estão seguras
- [ ] Verificar se SSL/HTTPS está configurado
- [ ] Verificar headers de segurança no `.htaccess`

## 📊 Monitoramento

- [ ] Verificar logs do PHP no hPanel
- [ ] Verificar logs do Node.js no hPanel
- [ ] Configurar alertas (se disponível)
- [ ] Fazer backup do banco de dados

## 🐛 Troubleshooting

Se algo não funcionar:

- [ ] Verificar logs de erro
- [ ] Verificar se todas as pastas foram enviadas
- [ ] Verificar se `.htaccess` está presente
- [ ] Verificar se Node.js está rodando
- [ ] Verificar se as dependências foram instaladas
- [ ] Verificar se o `.env` está configurado
- [ ] Verificar permissões de arquivos

## 📝 Notas

Anote aqui qualquer configuração especial ou problema encontrado:

```
Data do Deploy: ___________
Domínio: ___________
Versão Node.js: ___________
Observações:




```

---

**Status Final:** ⬜ Pendente | ⬜ Em Progresso | ⬜ Concluído
