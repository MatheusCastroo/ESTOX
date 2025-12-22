# ESTOX - Gestão de Estoque de Veículos

Plataforma completa para gestão de estoque de veículos, desenvolvida com **HTML/CSS/JavaScript** como front-end principal e **PHP** como backend.

## 🚀 Stack Tecnológica

### Frontend (Principal)
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização e layout responsivo
- **Bootstrap 5.3.2** - Framework CSS responsivo
- **JavaScript (Vanilla)** - Interatividade e integração com API
- **Bootstrap Icons** - Ícones

### Backend
- **PHP 7.4+** - Linguagem backend
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação e autorização
- **REST API** - Arquitetura de API

## 📁 Estrutura do Projeto

```
ESTOX/
├── html-version/          # Frontend principal (HTML/CSS/JS)
│   ├── index.html         # Landing page
│   ├── login.html         # Login
│   ├── cadastro.html      # Cadastro
│   ├── dashboard.html     # Dashboard
│   ├── assets/            # Assets (CSS, JS, imagens)
│   └── ...
├── api/                   # Backend PHP
│   ├── endpoints/         # Endpoints da API
│   ├── classes/           # Classes PHP
│   ├── config/            # Configurações
│   └── ...
└── public/                # Imagens e recursos públicos
```

## 🎯 Funcionalidades

### Públicas
- ✅ Landing page completa com hero, features e pricing
- ✅ Catálogo público de veículos
- ✅ Detalhes do veículo
- ✅ Login e cadastro
- ✅ Recuperação de senha

### Dashboard (Autenticadas)
- ✅ Dashboard com estatísticas
- ✅ Gestão de veículos (CRUD completo)
- ✅ Gestão de leads
- ✅ Relatórios e estatísticas
- ✅ Configurações da loja
- ✅ Onboarding inicial

## 🛠️ Instalação e Configuração

### Pré-requisitos

- PHP 7.4 ou superior
- PostgreSQL 12 ou superior
- Servidor web (Apache/Nginx) ou PHP built-in server
- Node.js (opcional, apenas se quiser usar a versão Next.js)

### 1. Backend (API PHP)

1. Navegue até a pasta `api/`:
   ```bash
   cd api
   ```

2. Instale as dependências do Composer:
   ```bash
   composer install
   ```

3. Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=estox
   DB_USER=postgres
   DB_PASSWORD=sua_senha
   
   JWT_SECRET=seu-secret-key-muito-seguro-aqui
   CORS_ORIGINS=http://localhost:8080
   ```

4. Execute os scripts SQL para criar o banco de dados:
   ```bash
   psql -U postgres -d estox -f ../scripts/001-create-tables.sql
   psql -U postgres -d estox -f ../scripts/002-seed-plans.sql
   psql -U postgres -d estox -f ../scripts/003-rls-policies.sql
   psql -U postgres -d estox -f ../scripts/004-create-users-table.sql
   ```

5. Configure o servidor web para apontar para a pasta `api/`.

### 2. Frontend (HTML)

1. Navegue até a pasta `html-version/`:
   ```bash
   cd html-version
   ```

2. Configure a URL da API nos arquivos JavaScript em `assets/js/`:
   ```javascript
   const API_URL = 'http://localhost/api'; // Ajuste conforme necessário
   ```

3. Servir os arquivos estáticos:

   **Opção 1: PHP Built-in Server**
   ```bash
   php -S localhost:8080
   ```

   **Opção 2: Servidor Web**
   Configure Apache/Nginx para servir os arquivos da pasta `html-version/`

4. Acesse no navegador:
   ```
   http://localhost:8080
   ```

## 🔧 Configuração da API

### CORS

Certifique-se de configurar o CORS na API para permitir requisições do frontend. Edite `api/config/config.php`:

```php
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### Autenticação

A autenticação é feita via JWT. Após o login bem-sucedido, o token é armazenado no `localStorage` do navegador e enviado em todas as requisições subsequentes.

## 📖 Documentação

- [Documentação da API](./api/README.md)
- [Documentação do Frontend HTML](./html-version/README.md)
- [Guia de Integração](./api/FRONTEND_INTEGRATION.md)

## 🎨 Design

O frontend foi desenvolvido com Bootstrap 5, seguindo um design moderno e responsivo. As cores principais são:
- **Primária**: #0D47A1 (Azul escuro)
- **Secundária**: #1A73E8 (Azul claro)
- **Texto**: #424242 (Cinza escuro)

## 📝 Notas

- O projeto original Next.js ainda está disponível, mas a versão HTML é a principal
- Todas as páginas estão disponíveis em HTML puro
- A integração com a API PHP é completa via JavaScript (fetch API)
- O projeto é 100% responsivo e funciona em todos os dispositivos

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para dúvidas ou problemas:
- Consulte a documentação da API: `api/README.md`
- Consulte a documentação do Frontend: `html-version/README.md`

---

**Desenvolvido com ❤️ para revendedores de veículos**






