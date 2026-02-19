# 📁 Estrutura para Upload na Hostinger

## Arquivos e Pastas para Upload

### ✅ OBRIGATÓRIO - Upload Completo

```
public_html/
├── api/                          # ✅ PASTA COMPLETA
│   ├── classes/
│   ├── config/
│   │   ├── database.php
│   │   └── config.php
│   ├── endpoints/
│   ├── scripts/
│   ├── index.php
│   └── .htaccess
│
├── .next/                        # ✅ PASTA COMPLETA (do build)
│   ├── standalone/
│   └── static/
│
├── public/                       # ✅ PASTA COMPLETA
│   ├── imageReal.png
│   └── (outros arquivos)
│
├── app/                          # ✅ PASTA COMPLETA
│   ├── (auth)/
│   ├── catalogo/
│   ├── dashboard/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                   # ✅ PASTA COMPLETA
│   ├── catalog/
│   ├── dashboard/
│   ├── landing/
│   ├── ui/
│   └── theme-provider.tsx
│
├── lib/                          # ✅ PASTA COMPLETA
│   ├── api/
│   └── utils.ts
│
├── hooks/                        # ✅ PASTA COMPLETA
│
├── styles/                       # ✅ PASTA COMPLETA (se existir)
│
├── .htaccess                     # ✅ ARQUIVO
├── package.json                  # ✅ ARQUIVO
├── next.config.mjs               # ✅ ARQUIVO
├── tsconfig.json                 # ✅ ARQUIVO
├── tailwind.config.js            # ✅ ARQUIVO (se existir)
└── .env                          # ✅ ARQUIVO (criar no servidor)
```

### ❌ NÃO UPLOADAR

```
node_modules/         # Instalar no servidor
.git/                 # Controle de versão
.env.local           # Variáveis locais
.next/cache/         # Cache (será gerado)
*.log                # Logs
.DS_Store            # Arquivos do sistema
```

## 📋 Checklist de Upload

- [ ] Upload da pasta `api/` completa
- [ ] Upload da pasta `.next/` completa (do build)
- [ ] Upload da pasta `public/` completa
- [ ] Upload da pasta `app/` completa
- [ ] Upload da pasta `components/` completa
- [ ] Upload da pasta `lib/` completa
- [ ] Upload da pasta `hooks/` completa
- [ ] Upload do arquivo `.htaccess` (raiz)
- [ ] Upload do arquivo `package.json`
- [ ] Upload do arquivo `next.config.mjs`
- [ ] Upload do arquivo `tsconfig.json`
- [ ] Criar arquivo `.env` no servidor
- [ ] Configurar permissões (755 para pastas, 644 para arquivos)

## 🔧 Após Upload

1. Instalar dependências: `npm install --production`
2. Configurar Node.js no hPanel
3. Iniciar aplicação
4. Testar acesso
