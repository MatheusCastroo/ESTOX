# 🔐 Credenciais do Banco de Dados

## 🏠 Localhost (Desenvolvimento - XAMPP)

**Configuração Automática:**
- **Host:** `localhost`
- **Porta:** `3306`
- **Database:** `estox`
- **Usuário:** `root`
- **Senha:** *(vazia - sem senha)*

O sistema detecta automaticamente que está em localhost e usa essas credenciais.

## 🌐 Produção (Hostinger)

**Credenciais Atuais:**
- **Host:** `localhost` (Hostinger usa localhost para conexão DB)
- **Porta:** `3306`
- **Database:** `u193499788_estocx`
- **Usuário:** `u193499788_estocx`
- **Senha:** `Estocx1522023!`

O sistema detecta automaticamente que está em produção e usa essas credenciais.

## 📝 Credenciais Antigas (Substituídas)

As seguintes credenciais antigas são automaticamente substituídas:
- Database: `u507824066_estox` → `u193499788_estocx`
- User: `u507824066_estox_user` → `u193499788_estocx`
- Password: `Estox7204.` → `Estocx1522023!`

## ⚙️ Configuração Manual (Opcional)

Se precisar sobrescrever as credenciais, crie um arquivo `.env` na pasta `api/`:

### Para Localhost:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=estox
DB_USER=root
DB_PASSWORD=
```

### Para Produção:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u193499788_estocx
DB_USER=u193499788_estocx
DB_PASSWORD=Estocx1522023!
```

## 🔍 Como Verificar

Acesse: `http://localhost/ESTOX/api/test-db-connection.php`

Este arquivo mostra:
- Ambiente detectado (Localhost ou Produção)
- Credenciais sendo usadas
- Status da conexão

## ⚠️ Importante

- **NÃO** commite o arquivo `.env` no Git
- As credenciais são detectadas automaticamente
- Em localhost, a senha é **SEMPRE vazia**
- Em produção, usa as credenciais da Hostinger automaticamente
