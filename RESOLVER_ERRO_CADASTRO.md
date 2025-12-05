# 🔧 Resolver Erro de Cadastro

## Problema

Ao tentar cadastrar um novo cliente, aparece o erro:
```
Erro de conexão. Verifique se a API está rodando e tente novamente.
```

## ✅ Soluções Aplicadas

### 1. URLs da API Atualizadas

✅ **Todas as URLs foram atualizadas de `http://localhost/api` para `http://localhost/ESTOX/api`**

Arquivos atualizados:
- `html-version/assets/js/auth.js`
- `html-version/assets/js/catalog.js`
- `html-version/assets/js/dashboard.js`
- `html-version/assets/js/leads.js`
- `html-version/assets/js/new-vehicle.js`
- `html-version/assets/js/reports.js`
- `html-version/assets/js/settings.js`
- `html-version/assets/js/vehicle-detail.js`
- `html-version/assets/js/vehicles.js`
- `html-version/onboarding.html`

### 2. Tratamento de Erros Melhorado

✅ **Melhorado o tratamento de erros no `auth.js` para mostrar mensagens mais específicas**

Agora o código:
- Verifica se a resposta HTTP está OK antes de tentar parsear JSON
- Mostra mensagens de erro mais específicas
- Detecta erros de CORS e conexão separadamente

## 🔍 Verificações

### 1. Teste a API diretamente

Acesse no navegador:
```
http://localhost/ESTOX/api/test.php
```

Deve retornar JSON com informações da API.

### 2. Teste o endpoint de cadastro

Execute no terminal:
```bash
C:\xampp\php\php.exe testar-cadastro.php
```

Se funcionar, a API está OK e o problema é no frontend.

### 3. Verifique o Console do Navegador

1. Abra o DevTools (F12)
2. Vá na aba "Console"
3. Tente cadastrar um usuário
4. Veja se há erros de CORS ou rede

### 4. Verifique a Aba Network

1. Abra o DevTools (F12)
2. Vá na aba "Network"
3. Tente cadastrar um usuário
4. Veja a requisição para `/auth?action=register`
5. Verifique:
   - Status code (deve ser 200)
   - Headers de CORS
   - Resposta da API

## 🚀 Próximos Passos

### Opção 1: Usar URLs com /ESTOX (Atual)

✅ **Já configurado!** Todas as URLs foram atualizadas.

Teste novamente o cadastro. Se ainda não funcionar, verifique:
- Se o Apache está rodando
- Se acessa `http://localhost/ESTOX/api/test.php` no navegador
- Console do navegador para erros

### Opção 2: Configurar Virtual Host (Recomendado)

Para usar URLs limpas (`http://localhost/api`), configure um Virtual Host:

1. Siga o guia em: `CONFIGURAR_VIRTUAL_HOST.md`
2. Após configurar, reverta as URLs:
   ```bash
   # Edite os arquivos JS e altere:
   const API_URL = 'http://localhost/ESTOX/api';
   # Para:
   const API_URL = 'http://localhost/api';
   ```

## ⚠️ Problemas Comuns

### Erro de CORS

Se aparecer erro de CORS no console:

1. Verifique o arquivo `.env`:
   ```env
   CORS_ORIGINS=http://localhost:8080,http://localhost:3000
   ```

2. Verifique se o frontend está rodando na porta correta (8080)

3. Verifique os headers CORS na resposta da API (aba Network do DevTools)

### Erro 404

Se aparecer 404:

1. Verifique se está usando a URL correta: `http://localhost/ESTOX/api/auth?action=register`
2. Verifique se o Apache está rodando
3. Verifique se o arquivo `api/index.php` existe

### Erro de Conexão

Se aparecer erro de conexão:

1. Verifique se o Apache está rodando
2. Teste a API diretamente: `http://localhost/ESTOX/api/test.php`
3. Verifique o firewall do Windows
4. Verifique se não há proxy configurado no navegador

## 📝 Checklist

- [ ] Apache está rodando
- [ ] Arquivo `.env` existe e está configurado
- [ ] `http://localhost/ESTOX/api/test.php` funciona
- [ ] URLs nos arquivos JS estão corretas (`http://localhost/ESTOX/api`)
- [ ] Console do navegador não mostra erros de CORS
- [ ] Teste de cadastro via script PHP funciona

## 🔄 Se Ainda Não Funcionar

1. Abra o Console do navegador (F12)
2. Tente cadastrar um usuário
3. Copie a mensagem de erro completa
4. Verifique a aba Network e veja a requisição que falhou
5. Compartilhe essas informações para diagnóstico

