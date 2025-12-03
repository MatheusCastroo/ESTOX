# 📁 Localização dos Arquivos MySQL

## ✅ Arquivos Convertidos para MySQL

### Scripts SQL (pasta `scripts/`)
Todos os scripts SQL já estão convertidos para MySQL e prontos para uso no phpMyAdmin:

- ✅ **`scripts/001-create-tables.sql`** - Cria todas as tabelas (MySQL)
- ✅ **`scripts/002-seed-plans.sql`** - Insere planos iniciais (MySQL)
- ✅ **`scripts/003-rls-policies.sql`** - Apenas documentação (não executa)
- ✅ **`scripts/004-create-users-table.sql`** - Já incluído no script 001

### Código PHP (pasta `api/`)
Todos os arquivos PHP estão configurados para MySQL:

- ✅ **`api/config/database.php`** - Configuração MySQL (porta 3306, usuário root)
- ✅ **`api/classes/Database.php`** - Conexão MySQL (DSN mysql:)
- ✅ **`api/endpoints/vehicles.php`** - Endpoints corrigidos para MySQL
- ✅ **`api/endpoints/leads.php`** - Endpoints corrigidos para MySQL

### Documentação
- ✅ **`MYSQL_SETUP.md`** - Guia completo de configuração para MySQL/phpMyAdmin

## 🚀 Como Usar

1. **Abra o phpMyAdmin**: `http://localhost/phpmyadmin`

2. **Crie o banco de dados**:
   - Nome: `estox`
   - Charset: `utf8mb4_unicode_ci`

3. **Execute os scripts SQL** (na ordem):
   - Abra `scripts/001-create-tables.sql`
   - Copie todo o conteúdo
   - Cole no phpMyAdmin e execute
   - Repita com `scripts/002-seed-plans.sql`

4. **Configure o `.env`** na raiz do projeto:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=estox
   DB_USER=root
   DB_PASSWORD=
   ```

## 📝 Estrutura de Pastas

```
ESTOX/
├── scripts/                    ← Scripts SQL MySQL (PRONTOS)
│   ├── 001-create-tables.sql  ✅ MySQL
│   ├── 002-seed-plans.sql     ✅ MySQL
│   ├── 003-rls-policies.sql   📄 Documentação
│   └── 004-create-users-table.sql
│
├── api/                        ← Código PHP MySQL (PRONTO)
│   ├── config/
│   │   └── database.php       ✅ MySQL
│   ├── classes/
│   │   └── Database.php       ✅ MySQL
│   └── endpoints/
│       ├── vehicles.php       ✅ MySQL
│       └── leads.php          ✅ MySQL
│
├── MYSQL_SETUP.md             ← Guia de configuração
└── LOCALIZACAO_ARQUIVOS.md    ← Este arquivo
```

Tudo está pronto para MySQL! 🎉

