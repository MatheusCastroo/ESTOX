# 🚀 Guia de Deploy na Hostinger

Este guia explica como fazer o deploy do Estocx na Hostinger.

## 📋 Pré-requisitos

1. Conta na Hostinger com acesso ao painel hPanel
2. Domínio configurado
3. Banco de dados MySQL criado no painel
4. Node.js instalado localmente (para build)

## 📦 Passo 1: Preparar o Build Local

### 1.1 Instalar dependências
```bash
npm install
# ou
pnpm install
```

### 1.2 Criar arquivo .env
Copie o `.env.example` e crie um `.env` com suas configurações:

```env
NEXT_PUBLIC_API_URL=https://seudominio.com/api/index.php
```

**Importante:** Substitua `seudominio.com` pelo seu domínio real.

### 1.3 Fazer build do Next.js
```bash
npm run build
```

Isso criará a pasta `.next` com os arquivos otimizados.

## 📤 Passo 2: Upload para Hostinger

### 2.1 Estrutura de Pastas na Hostinger

A estrutura recomendada é:

```
public_html/
├── api/              # API PHP
│   ├── index.php
│   ├── classes/
│   ├── endpoints/
│   └── .htaccess
├── .next/            # Build do Next.js (standalone)
├── public/           # Arquivos estáticos
├── node_modules/     # Dependências (opcional, pode instalar no servidor)
├── package.json
├── next.config.mjs
├── .htaccess         # Configuração do Apache
└── server.js         # Servidor Node.js (se usar standalone)
```

### 2.2 Upload via FTP/SFTP

1. Conecte-se ao servidor via FileZilla ou similar
2. Navegue até `public_html` (ou o diretório do seu domínio)
3. Faça upload de TODOS os arquivos do projeto

**Arquivos importantes:**
- ✅ Toda a pasta `api/`
- ✅ Toda a pasta `.next/` (do build)
- ✅ Toda a pasta `public/`
- ✅ `package.json`
- ✅ `next.config.mjs`
- ✅ `.htaccess` (raiz e dentro de `api/`)
- ✅ `tsconfig.json`
- ✅ `tailwind.config.js` (se existir)

## ⚙️ Passo 3: Configuração no Servidor

### 3.1 Configurar Node.js na Hostinger

1. Acesse o **hPanel**
2. Vá em **Avançado** > **Node.js**
3. Selecione seu domínio
4. Configure:
   - **Node.js Version:** 18.x ou superior
   - **Application Mode:** Production
   - **Application Root:** `public_html`
   - **Application URL:** `/` (ou subdiretório se necessário)
   - **Application Startup File:** `server.js` (se usar standalone) ou deixe vazio

### 3.2 Instalar Dependências no Servidor

Via SSH ou Terminal do hPanel:

```bash
cd public_html
npm install --production
```

### 3.3 Configurar Banco de Dados

O arquivo `api/config/database.php` já detecta automaticamente se está em produção ou desenvolvimento.

**Verifique:**
- Nome do banco de dados
- Usuário do banco
- Senha do banco

Essas informações estão no painel da Hostinger em **Bancos de Dados MySQL**.

### 3.4 Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto no servidor:

```env
NEXT_PUBLIC_API_URL=https://seudominio.com/api/index.php
```

**Importante:** O arquivo `.env` NÃO deve ser commitado no Git por questões de segurança.

## 🔧 Passo 4: Configuração do Apache

O arquivo `.htaccess` já está configurado, mas verifique:

1. **mod_rewrite** está habilitado
2. **mod_headers** está habilitado (para CORS)
3. O arquivo `.htaccess` está na raiz

### 4.1 Verificar Permissões

```bash
chmod 644 .htaccess
chmod 755 api/
chmod 644 api/.htaccess
```

## 🗄️ Passo 5: Banco de Dados

### 5.1 Importar Estrutura

1. Acesse **phpMyAdmin** no hPanel
2. Selecione seu banco de dados
3. Importe os arquivos SQL da pasta `scripts/` na ordem:
   - `001-create-database.sql`
   - `002-create-tables.sql`
   - etc.

### 5.2 Verificar Credenciais

O arquivo `api/config/database.php` detecta automaticamente o ambiente e usa as credenciais corretas.

## 🚀 Passo 6: Iniciar Aplicação

### Opção A: Usando Node.js App no hPanel

1. No hPanel, vá em **Node.js**
2. Clique em **Iniciar** na sua aplicação
3. A URL será algo como: `https://seudominio.com`

### Opção B: Usando PM2 (via SSH)

```bash
pm2 start npm --name "estocx" -- start
pm2 save
pm2 startup
```

## ✅ Passo 7: Verificação

1. Acesse `https://seudominio.com`
2. Verifique se a landing page carrega
3. Teste o login/cadastro
4. Verifique se a API está respondendo: `https://seudominio.com/api/plans`

## 🔍 Troubleshooting

### Erro 500
- Verifique logs de erro do PHP
- Verifique permissões de arquivos
- Verifique se o `.htaccess` está correto

### API não responde
- Verifique se `api/.htaccess` está presente
- Verifique se `mod_rewrite` está habilitado
- Teste acessando diretamente: `https://seudominio.com/api/index.php`

### Next.js não carrega
- Verifique se o build foi feito corretamente
- Verifique se Node.js está rodando
- Verifique logs do Node.js no hPanel

### Erro de CORS
- Verifique se `api/.htaccess` tem as configurações de CORS
- Verifique se o domínio está correto no `.env`

## 📝 Notas Importantes

1. **SSL/HTTPS:** Configure SSL no hPanel para usar HTTPS
2. **Backup:** Faça backup regular do banco de dados
3. **Atualizações:** Sempre teste em desenvolvimento antes de atualizar produção
4. **Logs:** Monitore os logs regularmente

## 🔐 Segurança

1. Não commite o arquivo `.env` no Git
2. Use senhas fortes para o banco de dados
3. Mantenha as dependências atualizadas
4. Configure firewall se necessário

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs no hPanel
2. Verifique a documentação da Hostinger
3. Entre em contato com o suporte da Hostinger

---

**Última atualização:** 2024
