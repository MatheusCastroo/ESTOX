# Configuração para Hostinger - AutoStock

## ✅ Configuração Automática

O sistema agora detecta **automaticamente** se está rodando em produção (Hostinger) ou desenvolvimento (localhost).

### Como Funciona

O arquivo `assets/js/config.js` detecta automaticamente o ambiente:

```javascript
// Se NÃO for localhost → usa o domínio atual
// Se for localhost → usa http://localhost/ESTOX/api
```

### Para Hostinger

**Nada precisa ser alterado!** O sistema detectará automaticamente seu domínio e usará:
```
https://seudominio.com/api
```

## 📋 Arquivos Atualizados

Todos os arquivos JavaScript agora usam a configuração centralizada:

- ✅ `assets/js/config.js` - Configuração central (detecção automática)
- ✅ `assets/js/dashboard.js` - Usa API_URL do config.js
- ✅ `assets/js/settings.js` - Usa API_URL do config.js
- ✅ `assets/js/leads.js` - Usa API_URL do config.js
- ✅ `assets/js/reports.js` - Usa API_URL do config.js
- ✅ `assets/js/loja.js` - Usa API_URL do config.js
- ✅ `onboarding.html` - Usa API_URL do config.js

## 🚀 Deploy na Hostinger

### 1. Estrutura de Pastas

```
public_html/
├── index.html
├── login.html
├── cadastro.html
├── [outros arquivos HTML]
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── config.js (já configurado!)
│       ├── auth.js
│       ├── dashboard.js
│       └── [outros arquivos JS]
├── public/
│   └── [imagens]
└── api/
    └── [arquivos da API PHP]
```

### 2. Configuração da API

Certifique-se de que a pasta `api/` está acessível em:
```
https://seudominio.com/api
```

### 3. Verificação

Após fazer upload, abra o console do navegador (F12) e verifique:
```javascript
// Deve mostrar:
API_URL configurada: https://seudominio.com/api
```

## 🔧 Configuração Manual (Opcional)

Se precisar forçar uma URL específica, edite `assets/js/config.js`:

```javascript
// Para forçar produção:
window.API_URL = 'https://seudominio.com/api';

// Para forçar desenvolvimento local:
window.API_URL = 'http://localhost/ESTOX/api';
```

## ✅ Testes

Após o deploy, teste:

1. ✅ Abrir o site e verificar console (sem erros)
2. ✅ Tentar fazer login
3. ✅ Acessar dashboard
4. ✅ Testar cadastro de veículos
5. ✅ Verificar se a API responde

## 📝 Notas Importantes

- O sistema detecta automaticamente o ambiente
- Não é necessário alterar nada ao fazer upload
- Funciona tanto em produção quanto em desenvolvimento
- Todos os arquivos JS usam a mesma configuração central

## ⚠️ Troubleshooting

### Erro: "API_URL não está definido"

Verifique se `config.js` está sendo carregado antes dos outros arquivos JS:

```html
<script src="assets/js/config.js"></script>
<script src="assets/js/auth.js"></script>
```

### API não funciona

1. Verifique se a pasta `api/` está no lugar correto
2. Verifique as permissões dos arquivos
3. Teste acessando diretamente: `https://seudominio.com/api/test.php`

### CORS Error

Configure o arquivo `.env` da API para incluir seu domínio:
```
CORS_ORIGINS=https://seudominio.com
```

