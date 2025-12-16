# 📝 Como Configurar o Arquivo .env

O arquivo `.env` contém as configurações sensíveis do projeto (banco de dados, JWT secret, etc.).

## ✅ Verificação do Passo 3

O Passo 3 do `MYSQL_SETUP.md` está **CORRETO**, mas aqui estão as opções mais detalhadas:

## 🚀 Opções para Criar o .env

### Opção 1: Script Automático (Mais Fácil) ⭐

Execute este comando na raiz do projeto:

```bash
php criar-env.php
```

O script irá:
- ✅ Criar o arquivo `.env` automaticamente
- ✅ Gerar uma chave JWT segura
- ✅ Configurar todas as variáveis

### Opção 2: Criar Manualmente

1. **Crie um arquivo chamado `.env`** na raiz do projeto:
   - Localização: `C:\xampp\htdocs\ESTOX\.env`
   - Mesmo nível que as pastas `api/`, `scripts/`, `html-version/`

2. **Copie e cole este conteúdo:**

```env
# ESTOX - Configuração do Banco de Dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=estox
DB_USER=root
DB_PASSWORD=

# JWT Secret - Chave secreta para tokens JWT
# IMPORTANTE: Gere uma chave única e segura!
# Para gerar: php -r "echo bin2hex(random_bytes(32));"
JWT_SECRET=3f8a9b2c7d4e1f6a5b8c9d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a

# CORS Origins - URLs permitidas (separadas por vírgula, SEM espaços)
CORS_ORIGINS=http://localhost:8080,http://localhost:3000
```

## 🔧 Ajustes Necessários

### 1. Senha do Banco de Dados

Se você configurou senha para o MySQL no XAMPP:

```env
DB_PASSWORD=sua_senha_aqui
```

Se não tem senha (padrão XAMPP):

```env
DB_PASSWORD=
```

### 2. Gerar Chave JWT Segura

**IMPORTANTE:** A chave JWT deve ser única e segura. Para gerar uma nova:

**No Windows (PowerShell):**
```powershell
cd C:\xampp\php
.\php.exe -r "echo bin2hex(random_bytes(32));"
```

**Ou use um gerador online:** https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx

Depois substitua o valor de `JWT_SECRET` no arquivo `.env`.

### 3. URLs do CORS

Se você está usando o frontend HTML na porta 8080:

```env
CORS_ORIGINS=http://localhost:8080
```

Se usar múltiplas URLs (separadas por vírgula):

```env
CORS_ORIGINS=http://localhost:8080,http://localhost:3000,http://127.0.0.1:8080
```

**IMPORTANTE:** Não coloque espaços após as vírgulas!

## ✅ Verificação

Após criar o arquivo `.env`, verifique:

1. ✅ O arquivo está na raiz: `C:\xampp\htdocs\ESTOX\.env`
2. ✅ Todas as variáveis estão configuradas
3. ✅ A chave JWT foi gerada (não deixe o valor padrão em produção)
4. ✅ O CORS_ORIGINS corresponde às URLs do seu frontend

## 📍 Localização do Arquivo

```
ESTOX/
├── .env              ← AQUI (raiz do projeto)
├── api/
├── scripts/
├── html-version/
└── ...
```

## ⚠️ Importante

- **NUNCA** faça commit do arquivo `.env` no Git (ele já está no .gitignore)
- **NUNCA** compartilhe sua chave JWT
- **SEMPRE** use uma chave JWT diferente em produção

## 🧪 Testar a Configuração

Após criar o `.env`, teste se está funcionando:

1. Acesse: `http://localhost/api/plans`
2. Deve retornar JSON com os planos

Se der erro, verifique:
- MySQL está rodando no XAMPP
- O banco `estox` foi criado
- As credenciais no `.env` estão corretas








