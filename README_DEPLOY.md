# 🚀 Deploy na Hostinger - Guia Rápido

## ⚡ Passos Rápidos

### 1. Build Local
```bash
# Windows
build_for_production.bat

# Linux/Mac
bash build_for_production.sh
```

### 2. Upload para Hostinger
Faça upload de TODAS as pastas e arquivos para `public_html/`

**Estrutura mínima:**
- ✅ `api/` (pasta completa)
- ✅ `.next/` (pasta do build)
- ✅ `app/`, `components/`, `lib/`, `public/`, etc.
- ✅ `.htaccess` (raiz e dentro de `api/`)
- ✅ `package.json`, `next.config.mjs`, etc.

### 3. Configurar no hPanel

#### 3.1 Node.js App
1. hPanel → **Avançado** → **Node.js**
2. Criar nova aplicação:
   - **Node.js Version:** 18.x ou superior
   - **Application Mode:** Production
   - **Application Root:** `public_html`
   - **Application Startup File:** `server.js` (ou deixe vazio)
   - **Application URL:** `/`

#### 3.2 Instalar Dependências (SSH)
```bash
cd public_html
npm install --production
```

#### 3.3 Criar .env
Crie arquivo `.env` na raiz:
```env
NEXT_PUBLIC_API_URL=https://seudominio.com/api/index.php
```

#### 3.4 Iniciar Aplicação
No hPanel → Node.js → **Iniciar**

### 4. Verificar
- ✅ `https://seudominio.com` - Landing page
- ✅ `https://seudominio.com/api/plans` - API funcionando

## 🔧 Configurações Importantes

### Banco de Dados
O arquivo `api/config/database.php` detecta automaticamente o ambiente e usa as credenciais corretas da Hostinger.

### URLs
- API: `/api/index.php` (relativa)
- Frontend: `/` (raiz)

### Permissões
```bash
chmod 755 api/
chmod 644 api/.htaccess
chmod 644 .htaccess
```

## ❌ Problemas Comuns

### Erro 500
- Verifique logs do PHP no hPanel
- Verifique se `.htaccess` está presente
- Verifique permissões

### API não funciona
- Verifique `api/.htaccess`
- Teste: `https://seudominio.com/api/index.php`

### Next.js não carrega
- Verifique se Node.js está rodando
- Verifique logs do Node.js no hPanel
- Verifique se o build foi feito corretamente

## 📚 Documentação Completa
Veja `DEPLOY_HOSTINGER.md` para guia detalhado.
