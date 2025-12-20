# Frontend Principal - AutoStock (HTML/CSS/JavaScript)

Esta é a versão **principal** do frontend do projeto AutoStock, desenvolvida com HTML puro, CSS e JavaScript (Bootstrap 5). Esta é a versão de produção que deve ser utilizada.

## ✅ Páginas Criadas

### Públicas
- ✅ `index.html` - Landing page completa com hero, features, pricing e CTA
- ✅ `login.html` - Página de login
- ✅ `cadastro.html` - Página de cadastro
- ✅ `cadastro-sucesso.html` - Confirmação de cadastro
- ✅ `esqueci-senha.html` - Recuperação de senha
- ✅ `loja.html` - Landing page pública da loja (catálogo de veículos)
- ✅ `veiculo-detalhe.html` - Detalhes do veículo (público)

### Dashboard (Autenticadas)
- ✅ `dashboard.html` - Dashboard principal com estatísticas
- ✅ `onboarding.html` - Configuração inicial da loja
- ✅ `veiculos.html` - Lista de veículos
- ✅ `veiculos-novo.html` - Cadastro de novo veículo
- ✅ `leads.html` - Lista de leads
- ✅ `relatorios.html` - Relatórios e estatísticas
- ✅ `configuracoes.html` - Configurações da loja

## Estrutura

```
html-version/
├── index.html              # Landing page
├── login.html              # Login
├── cadastro.html           # Cadastro
├── cadastro-sucesso.html   # Sucesso no cadastro
├── esqueci-senha.html      # Recuperação de senha
├── onboarding.html         # Configuração inicial
├── dashboard.html          # Dashboard
├── veiculos.html           # Lista de veículos
├── veiculos-novo.html      # Novo veículo
├── veiculo-detalhe.html    # Detalhes (público)
├── loja.html               # Landing page pública da loja
├── leads.html              # Leads
├── relatorios.html         # Relatórios
├── configuracoes.html      # Configurações
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos customizados
│   ├── js/
│   │   ├── main.js         # JavaScript principal
│   │   ├── auth.js         # Autenticação
│   │   ├── dashboard.js    # Dashboard
│   │   ├── vehicles.js     # Veículos
│   │   ├── new-vehicle.js  # Novo veículo
│   │   ├── vehicle-detail.js # Detalhes do veículo
│   │   ├── loja.js         # Landing page pública da loja
│   │   ├── leads.js        # Leads
│   │   ├── reports.js      # Relatórios
│   │   └── settings.js     # Configurações
│   └── images/             # Pasta para imagens
└── README.md               # Este arquivo
```

## Características

- ✅ Bootstrap 5.3.2
- ✅ Bootstrap Icons
- ✅ Design responsivo
- ✅ Integração completa com API PHP
- ✅ Autenticação JWT
- ✅ Todas as páginas do projeto original
- ✅ Footer completo
- ✅ Features detalhadas
- ✅ Pricing completo
- ✅ Não interfere no projeto Next.js

## Como Usar

1. **Configurar API URL**
   
   Edite os arquivos JavaScript em `assets/js/` e altere a constante `API_URL`:
   ```javascript
   const API_URL = 'http://localhost/api'; // Sua URL da API
   ```

2. **Adicionar Imagens**
   
   Coloque as imagens na pasta `assets/images/` e atualize as referências nos arquivos HTML.

3. **Servir os Arquivos**
   
   ```bash
   cd html-version
   php -S localhost:8080
   ```
   
   Ou use qualquer servidor web estático.

4. **Acessar no Navegador**
   
   Abra `http://localhost:8080` no seu navegador.

## Integração com API

A versão HTML se comunica com a API PHP através de requisições fetch. Certifique-se de:

1. Configurar CORS na API PHP para permitir requisições do frontend
2. Configurar a URL correta da API nos arquivos JavaScript
3. Ter o token JWT salvo no localStorage após login

## Personalização

### Cores

Edite as variáveis CSS em `assets/css/style.css`:
```css
:root {
    --primary-color: #0D47A1;
    --secondary-color: #1A73E8;
    --text-color: #424242;
}
```

## Notas

- **Esta é a versão principal do frontend**
- Todos os arquivos estão na pasta `html-version/`
- Você pode servir esta versão em qualquer servidor web estático
- A integração com a API PHP é feita via JavaScript (fetch API)
- 100% das páginas do projeto foram implementadas
- O projeto Next.js ainda está disponível, mas esta versão HTML é a principal

## Suporte

Para dúvidas ou problemas, consulte a documentação da API PHP em `api/README.md`.