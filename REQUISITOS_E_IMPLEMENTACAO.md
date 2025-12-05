# 📋 Requisitos e Implementação - Projeto ESTOX

Este documento descreve tudo que foi implementado e os requisitos necessários para o projeto funcionar.

## 🗄️ 1. Banco de Dados MySQL

### Requisitos do Banco

**Tipo:** MySQL 5.7+ ou MariaDB 10.2+
**Servidor:** phpMyAdmin (XAMPP)
**Porta:** 3306
**Usuário padrão:** root
**Senha padrão:** (vazio)

### Banco de Dados

- **Nome:** `estox`
- **Charset:** `utf8mb4_unicode_ci`
- **Collation:** `utf8mb4_unicode_ci`

### Estrutura das Tabelas

#### 1. `users` - Usuários do Sistema
```sql
- id: CHAR(36) PRIMARY KEY (UUID)
- email: VARCHAR(255) UNIQUE NOT NULL
- password: VARCHAR(255) NOT NULL
- name: VARCHAR(255)
- created_at: TIMESTAMP
```

#### 2. `plans` - Planos de Assinatura
```sql
- id: CHAR(36) PRIMARY KEY
- name: VARCHAR(50) NOT NULL
- slug: VARCHAR(50) UNIQUE NOT NULL
- price: DECIMAL(10, 2) NOT NULL
- vehicle_limit: INTEGER NOT NULL
- features: JSON DEFAULT '[]'
- is_active: BOOLEAN DEFAULT true
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Planos padrão:**
- Básico - R$ 99.90/mês - 20 veículos
- Profissional - R$ 199.90/mês - 50 veículos
- Enterprise - R$ 399.90/mês - Ilimitado (-1)

#### 3. `stores` - Lojas/Concessionárias
```sql
- id: CHAR(36) PRIMARY KEY
- user_id: CHAR(36) FOREIGN KEY → users(id)
- plan_id: CHAR(36) FOREIGN KEY → plans(id)
- name: VARCHAR(255) NOT NULL
- slug: VARCHAR(100) UNIQUE NOT NULL
- logo_url: TEXT
- phone: VARCHAR(20)
- whatsapp: VARCHAR(20)
- email: VARCHAR(255)
- address: TEXT
- city: VARCHAR(100)
- state: VARCHAR(2)
- description: TEXT
- is_active: BOOLEAN DEFAULT true
- subscription_status: VARCHAR(20) DEFAULT 'trial'
- subscription_ends_at: TIMESTAMP NULL
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 4. `vehicles` - Veículos
```sql
- id: CHAR(36) PRIMARY KEY
- store_id: CHAR(36) FOREIGN KEY → stores(id)
- brand: VARCHAR(100) NOT NULL
- model: VARCHAR(255) NOT NULL
- year: INTEGER NOT NULL
- mileage: INTEGER DEFAULT 0
- price: DECIMAL(12, 2) NOT NULL
- fuel: VARCHAR(50)
- transmission: VARCHAR(50)
- color: VARCHAR(50)
- description: TEXT
- features: JSON DEFAULT '[]'
- images: JSON DEFAULT '[]'
- status: VARCHAR(20) DEFAULT 'available' CHECK (available, reserved, sold)
- views: INTEGER DEFAULT 0
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 5. `leads` - Leads/Interessados
```sql
- id: CHAR(36) PRIMARY KEY
- store_id: CHAR(36) FOREIGN KEY → stores(id)
- vehicle_id: CHAR(36) FOREIGN KEY → vehicles(id) NULL
- name: VARCHAR(255) NOT NULL
- phone: VARCHAR(20)
- email: VARCHAR(255)
- message: TEXT
- source: VARCHAR(20) DEFAULT 'whatsapp' CHECK (whatsapp, phone, email, form)
- status: VARCHAR(20) DEFAULT 'new' CHECK (new, contacted, negotiating, converted, lost)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 6. `vehicle_views` - Estatísticas de Visualização
```sql
- id: CHAR(36) PRIMARY KEY
- vehicle_id: CHAR(36) FOREIGN KEY → vehicles(id)
- store_id: CHAR(36) FOREIGN KEY → stores(id)
- viewed_at: TIMESTAMP
- ip_address: VARCHAR(45)
- user_agent: TEXT
```

#### 7. `notification_settings` - Configurações de Notificação
```sql
- id: CHAR(36) PRIMARY KEY
- store_id: CHAR(36) UNIQUE FOREIGN KEY → stores(id)
- new_lead_email: BOOLEAN DEFAULT true
- weekly_report: BOOLEAN DEFAULT true
- platform_updates: BOOLEAN DEFAULT false
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Scripts SQL

Localização: `scripts/`

1. **001-create-tables.sql** - Cria todas as tabelas
2. **002-seed-plans.sql** - Insere os planos iniciais
3. **003-rls-policies.sql** - Documentação (não executa no MySQL)
4. **004-create-users-table.sql** - Já incluído no script 001

### Índices Criados

- `idx_plans_slug` - plans(slug)
- `idx_plans_active` - plans(is_active)
- `idx_users_email` - users(email)
- `idx_stores_slug` - stores(slug)
- `idx_stores_user_id` - stores(user_id)
- `idx_stores_active` - stores(is_active)
- `idx_vehicles_store_id` - vehicles(store_id)
- `idx_vehicles_status` - vehicles(status)
- `idx_vehicles_brand` - vehicles(brand)
- `idx_leads_store_id` - leads(store_id)
- `idx_leads_vehicle_id` - leads(vehicle_id)
- `idx_leads_status` - leads(status)
- `idx_vehicle_views_vehicle_id` - vehicle_views(vehicle_id)
- `idx_vehicle_views_store_id` - vehicle_views(store_id)

---

## ⚙️ 2. Configuração do Ambiente

### Arquivo `.env`

**Localização:** `C:\xampp\htdocs\ESTOX\.env` (raiz do projeto)

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=estox
DB_USER=root
DB_PASSWORD=

JWT_SECRET=sua-chave-jwt-segura-64-caracteres
CORS_ORIGINS=http://localhost:8080,http://localhost:3000
```

**Variáveis:**
- `DB_HOST` - Host do banco (padrão: localhost)
- `DB_PORT` - Porta MySQL (padrão: 3306)
- `DB_NAME` - Nome do banco (estox)
- `DB_USER` - Usuário MySQL (padrão XAMPP: root)
- `DB_PASSWORD` - Senha MySQL (padrão XAMPP: vazio)
- `JWT_SECRET` - Chave secreta para tokens JWT (64 caracteres hex)
- `CORS_ORIGINS` - URLs permitidas, separadas por vírgula

### Requisitos PHP

**Versão:** PHP 7.4 ou superior

**Extensões necessárias:**
- `pdo`
- `pdo_mysql`
- `json`
- `mbstring`

**Verificar no php.ini:**
```ini
extension=pdo_mysql
extension=mbstring
```

### Requisitos do Servidor

**XAMPP:**
- Apache (servidor web)
- MySQL (banco de dados)
- PHP (linguagem)

**Portas:**
- Apache: 80 (http://localhost)
- MySQL: 3306
- Frontend HTML: 8080 (opcional)

---

## 🔧 3. API Backend (PHP)

### Estrutura da API

**Localização:** `api/`

```
api/
├── classes/
│   ├── Auth.php          # Autenticação e JWT
│   ├── Database.php      # Conexão MySQL
│   ├── JWT.php           # Geração/validação de tokens
│   ├── Middleware.php    # CORS e autenticação
│   └── Response.php      # Formatação de respostas
├── config/
│   ├── config.php        # Configurações gerais
│   ├── database.php      # Configuração do banco
│   └── load-env.php      # Carregador de .env
├── endpoints/
│   ├── auth.php          # POST /api/auth?action=register|login
│   ├── stores.php        # CRUD de lojas
│   ├── vehicles.php      # CRUD de veículos
│   ├── leads.php         # CRUD de leads
│   ├── dashboard.php     # Estatísticas do dashboard
│   ├── plans.php         # Listar planos
│   └── notifications.php # Configurações de notificação
├── index.php             # Roteador principal
└── .htaccess            # Regras de reescrita
```

### Endpoints da API

#### Autenticação

**POST** `/api/auth?action=register`
- Criar nova conta
- Body: `{ email, password, name }`
- Retorna: `{ user, token }`

**POST** `/api/auth?action=login`
- Fazer login
- Body: `{ email, password }`
- Retorna: `{ user, token }`

**GET** `/api/auth`
- Obter usuário atual
- Header: `Authorization: Bearer {token}`

#### Lojas

**GET** `/api/stores`
- Obter loja do usuário logado

**POST** `/api/stores`
- Criar nova loja
- Body: `{ name, slug, phone, email, city, state, plan_slug }`

**PUT** `/api/stores`
- Atualizar loja

**GET** `/api/stores?check_slug=slug`
- Verificar disponibilidade de slug

#### Veículos

**GET** `/api/vehicles`
- Listar veículos da loja (autenticado)

**GET** `/api/vehicles?id={uuid}`
- Obter veículo específico

**POST** `/api/vehicles`
- Criar veículo

**PUT** `/api/vehicles?id={uuid}`
- Atualizar veículo

**DELETE** `/api/vehicles?id={uuid}`
- Excluir veículo

**GET** `/api/vehicles?public=true&store_slug={slug}`
- Listar veículos públicos (catálogo)

**GET** `/api/vehicles?public=true&store_slug={slug}&vehicle_id={uuid}`
- Obter veículo público

#### Leads

**GET** `/api/leads`
- Listar leads da loja

**GET** `/api/leads?stats=true`
- Obter estatísticas de leads

**PUT** `/api/leads?id={uuid}`
- Atualizar status do lead

**DELETE** `/api/leads?id={uuid}`
- Excluir lead

**POST** `/api/leads?public=true`
- Criar lead público (catálogo)

#### Dashboard

**GET** `/api/dashboard?action=stats`
- Estatísticas gerais

**GET** `/api/dashboard?action=top-vehicles`
- Veículos mais visualizados

**GET** `/api/dashboard?action=monthly-stats`
- Estatísticas mensais

#### Planos

**GET** `/api/plans`
- Listar planos disponíveis

#### Notificações

**GET** `/api/notifications`
- Obter configurações

**PUT** `/api/notifications`
- Atualizar configurações

### Formato de Resposta

**Sucesso:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Mensagem opcional"
}
```

**Erro:**
```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

### Autenticação

**Tipo:** JWT (JSON Web Token)

**Header necessário:**
```
Authorization: Bearer {token}
```

**Token salvo em:** `localStorage.getItem('token')`

### CORS

**Configurado para:**
- `http://localhost:8080` (Frontend HTML)
- `http://localhost:3000` (Frontend Next.js)

**Headers permitidos:**
- `Content-Type`
- `Authorization`

**Métodos permitidos:**
- GET, POST, PUT, DELETE, OPTIONS

---

## 🎨 4. Frontend HTML

### Estrutura

**Localização:** `html-version/`

```
html-version/
├── assets/
│   ├── css/
│   │   └── style.css      # Estilos customizados
│   └── js/
│       ├── main.js        # JavaScript principal
│       ├── auth.js        # Autenticação
│       ├── dashboard.js   # Dashboard
│       ├── vehicles.js    # Gestão de veículos
│       ├── new-vehicle.js # Novo veículo
│       ├── vehicle-detail.js # Detalhes
│       ├── catalog.js     # Catálogo público
│       ├── leads.js       # Leads
│       ├── reports.js     # Relatórios
│       └── settings.js    # Configurações
├── index.html             # Landing page
├── login.html             # Login
├── cadastro.html          # Cadastro
├── cadastro-sucesso.html  # Sucesso
├── esqueci-senha.html     # Recuperação
├── onboarding.html        # Configuração inicial
├── dashboard.html         # Dashboard
├── veiculos.html          # Lista de veículos
├── veiculos-novo.html     # Novo veículo
├── veiculo-detalhe.html   # Detalhes (público)
├── catalogo.html          # Catálogo público
├── leads.html             # Leads
├── relatorios.html        # Relatórios
└── configuracoes.html     # Configurações
```

### Dependências Frontend

**CSS:**
- Bootstrap 5.3.2
- Bootstrap Icons 1.11.1

**JavaScript:**
- Bootstrap 5.3.2 (JS)
- API Custom (fetch)

### Configuração da API no Frontend

**Arquivo:** `html-version/assets/js/auth.js` (e outros)

```javascript
const API_URL = 'http://localhost/api';
```

**Alterar se necessário:**
- Se a API estiver em outra porta
- Se estiver em produção

### Recursos Implementados

#### 1. Autenticação
- Login com email/senha
- Registro de nova conta
- Recuperação de senha (UI)
- Logout
- Proteção de rotas

#### 2. Landing Page
- Hero section
- Features
- Planos de preços
- CTA
- Footer

#### 3. Dashboard
- Estatísticas gerais
- Veículos recentes
- Leads recentes
- Gráficos (preparado)

#### 4. Gestão de Veículos
- Listar veículos
- Criar veículo
- Editar veículo
- Excluir veículo
- Filtros e busca
- Upload de imagens (preparado)

#### 5. Catálogo Público
- Lista de veículos
- Detalhes do veículo
- Filtros
- Contato via WhatsApp

#### 6. Leads
- Listar leads
- Atualizar status
- Estatísticas
- Filtros

#### 7. Configurações
- Dados da loja
- Notificações
- Integração WhatsApp

### Botão WhatsApp Flutuante

**Localização:** Todas as páginas HTML

**Posição:** Canto inferior direito (fixo)

**Link:** `https://wa.me/5544988611075`

**Características:**
- Cor verde WhatsApp (#25D366)
- Animação de pulso
- Hover com escala
- Responsivo
- Z-index: 1000

**CSS:** `html-version/assets/css/style.css`
- Classe: `.whatsapp-float`

---

## 🔐 5. Segurança

### JWT (JSON Web Tokens)

**Algoritmo:** HS256
**Expiração:** 24 horas (86400 segundos)
**Chave:** Configurada no `.env` (JWT_SECRET)

**Geração:**
- Ao fazer login
- Ao criar conta

**Armazenamento:**
- `localStorage.setItem('token', token)`

**Uso:**
- Header: `Authorization: Bearer {token}`

### Validação

- Token verificado em todas as rotas protegidas
- Redirecionamento para login se inválido
- Expiração automática após 24h

### CORS

**Configuração:**
- Permite apenas origens configuradas
- Headers específicos permitidos
- Credenciais habilitadas

**Desenvolvimento:**
- Aceita localhost em qualquer porta
- Facilita desenvolvimento local

---

## 📦 6. Dependências e Requisitos

### Backend (PHP)

**Sem dependências externas (Composer):**
- Classes PHP nativas
- PDO para MySQL
- Funções padrão PHP

**Extensões PHP necessárias:**
- `pdo`
- `pdo_mysql`
- `json`
- `mbstring`

### Frontend (HTML)

**CDN (online):**
- Bootstrap 5.3.2 CSS
- Bootstrap 5.3.2 JS
- Bootstrap Icons 1.11.1

**Local:**
- CSS customizado
- JavaScript customizado

---

## 🚀 7. Instalação e Configuração

### Passo 1: Configurar Banco de Dados

1. Iniciar XAMPP (Apache + MySQL)
2. Acessar phpMyAdmin: `http://localhost/phpmyadmin`
3. Criar banco `estox` com charset `utf8mb4_unicode_ci`
4. Executar scripts SQL:
   - `scripts/001-create-tables.sql`
   - `scripts/002-seed-plans.sql`

### Passo 2: Configurar Variáveis de Ambiente

1. Criar arquivo `.env` na raiz do projeto
2. Configurar credenciais do banco
3. Gerar chave JWT
4. Configurar CORS_ORIGINS

### Passo 3: Configurar API

1. Verificar extensões PHP
2. Testar API: `http://localhost/api/test.php`
3. Verificar CORS

### Passo 4: Configurar Frontend

1. Ajustar API_URL nos arquivos JS
2. Servir arquivos HTML
3. Testar conexão com API

---

## 📝 8. Funcionalidades Implementadas

### ✅ Implementado

1. **Sistema de Autenticação**
   - Registro de usuários
   - Login/Logout
   - Tokens JWT
   - Proteção de rotas

2. **Gestão de Lojas**
   - Criação de loja
   - Edição de dados
   - Verificação de slug

3. **Gestão de Veículos**
   - CRUD completo
   - Upload de imagens (preparado)
   - Status (disponível, reservado, vendido)
   - Filtros e busca

4. **Catálogo Público**
   - Lista de veículos
   - Detalhes do veículo
   - Filtros avançados
   - Contato direto

5. **Sistema de Leads**
   - Criação de leads
   - Gestão de status
   - Estatísticas
   - Filtros

6. **Dashboard**
   - Estatísticas gerais
   - Veículos recentes
   - Leads recentes
   - Preparado para gráficos

7. **Planos de Assinatura**
   - Sistema de planos
   - Limites por plano
   - Seed de dados

8. **Interface**
   - Design responsivo
   - Bootstrap 5
   - Botão WhatsApp flutuante
   - Navegação intuitiva

### 🔄 Preparado (estrutura pronta)

1. Upload de imagens
2. Gráficos e relatórios
3. Sistema de notificações
4. Integração com email
5. Pagamentos (estrutura de planos)

---

## 🔄 9. Fluxo de Dados

### Registro de Usuário

1. Usuário preenche formulário
2. Frontend envia: `POST /api/auth?action=register`
3. API cria usuário no banco
4. API gera token JWT
5. Token salvo no localStorage
6. Redireciona para onboarding

### Login

1. Usuário preenche email/senha
2. Frontend envia: `POST /api/auth?action=login`
3. API valida credenciais
4. API gera token JWT
5. Token salvo no localStorage
6. Redireciona para dashboard

### Criar Loja

1. Usuário preenche dados da loja
2. Frontend envia: `POST /api/stores`
3. API valida dados
4. API cria loja no banco
5. API cria configurações padrão
6. Retorna dados da loja

### Criar Veículo

1. Usuário preenche dados do veículo
2. Frontend envia: `POST /api/vehicles`
3. API valida permissões
4. API cria veículo no banco
5. Retorna dados do veículo

---

## 🧪 10. Testes e Diagnóstico

### Arquivo de Teste

**Localização:** `api/test.php`

**Acessar:** `http://localhost/api/test.php`

**Mostra:**
- Status da API
- Versão do PHP
- Extensões instaladas
- Status do banco de dados
- Configurações do .env

### Endpoints de Teste

1. **Teste da API:**
   ```
   http://localhost/api/test.php
   ```

2. **Teste de Planos:**
   ```
   http://localhost/api/plans
   ```

3. **Teste no Console:**
   ```javascript
   fetch('http://localhost/api/test.php')
     .then(r => r.json())
     .then(console.log);
   ```

---

## 📚 11. Documentação Criada

1. **MYSQL_SETUP.md** - Guia completo MySQL
2. **CONFIGURAR_ENV.md** - Configuração do .env
3. **LOCALIZACAO_ARQUIVOS.md** - Onde estão os arquivos
4. **RESOLVER_ERRO_API.md** - Solução de problemas
5. **DIAGNOSTICO_RAPIDO.md** - Diagnóstico rápido
6. **REQUISITOS_E_IMPLEMENTACAO.md** - Este documento

---

## 🎯 12. Próximas Implementações Sugeridas

### Funcionalidades

1. **Upload de Imagens**
   - Sistema de upload
   - Redimensionamento
   - Storage local/S3

2. **Sistema de Pagamentos**
   - Integração gateway
   - Assinaturas
   - Faturas

3. **Email**
   - Notificações
   - Templates
   - Relatórios

4. **Relatórios Avançados**
   - Gráficos interativos
   - Exportação PDF/Excel
   - Filtros avançados

5. **Multi-idioma**
   - i18n
   - Seleção de idioma

6. **Temas**
   - Personalização visual
   - Cores da loja
   - Logo customizado

---

## 📞 12. Contatos e Suporte

### WhatsApp Suporte
- **Número:** 44988611075
- **Link:** https://wa.me/5544988611075
- **Botão flutuante:** Todas as páginas

### Estrutura de URLs

**Backend:**
- API: `http://localhost/api`
- Teste: `http://localhost/api/test.php`

**Frontend:**
- Landing: `http://localhost:8080/index.html`
- Login: `http://localhost:8080/login.html`
- Cadastro: `http://localhost:8080/cadastro.html`
- Dashboard: `http://localhost:8080/dashboard.html`

**Banco:**
- phpMyAdmin: `http://localhost/phpmyadmin`

---

## 📋 Checklist de Instalação

- [ ] XAMPP instalado e rodando
- [ ] Apache iniciado
- [ ] MySQL iniciado
- [ ] Banco `estox` criado
- [ ] Scripts SQL executados
- [ ] Arquivo `.env` configurado
- [ ] Extensões PHP habilitadas
- [ ] API testada (`/api/test.php`)
- [ ] Frontend configurado
- [ ] Teste de cadastro funcionando

---

Este documento contém todas as informações necessárias para entender e expandir o projeto ESTOX.


