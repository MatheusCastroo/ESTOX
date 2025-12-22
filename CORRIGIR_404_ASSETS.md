# 🔧 Corrigir Erros 404 para CSS e JS no Cadastro

## ❌ Problema:

Ao acessar `cadastro.html`, os seguintes arquivos retornam 404:
- `assets/css/style.css`
- `assets/js/config.js`
- `assets/js/auth.js`

## ✅ Correções Aplicadas:

### 1. **CSS Inline de Fallback**
- Adicionado CSS crítico inline no `<head>` do `cadastro.html`
- Garante que a página funcione mesmo se o CSS externo não carregar

### 2. **Carregamento de Scripts com Tratamento de Erro**
- Scripts agora são carregados dinamicamente com tratamento de erros
- Mensagens de erro no console se os arquivos não carregarem

### 3. **Verificação de Arquivos**

Certifique-se de que os seguintes arquivos existem no servidor:

```
public_html/
├── cadastro.html ✅
├── assets/
│   ├── css/
│   │   └── style.css ✅
│   └── js/
│       ├── config.js ✅
│       └── auth.js ✅
```

## 🔍 Diagnóstico:

### Passo 1: Verificar se os arquivos existem

Acesse diretamente no navegador:
1. `https://nerdparadise.com.br/assets/css/style.css`
2. `https://nerdparadise.com.br/assets/js/config.js`
3. `https://nerdparadise.com.br/assets/js/auth.js`

**Resultados:**
- ✅ Retorna o conteúdo do arquivo = arquivo existe
- ❌ 404 = arquivo não está no servidor

### Passo 2: Verificar estrutura de pastas

No cPanel File Manager, verifique:
```
public_html/
├── cadastro.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── config.js
│       └── auth.js
```

### Passo 3: Verificar permissões

Certifique-se de que:
- Pastas têm permissão **755**
- Arquivos têm permissão **644**

```bash
# No servidor (via SSH ou cPanel)
chmod 755 assets/
chmod 755 assets/css/
chmod 755 assets/js/
chmod 644 assets/css/style.css
chmod 644 assets/js/config.js
chmod 644 assets/js/auth.js
```

## 🛠️ Soluções:

### Solução 1: Reenviar arquivos para o servidor

Se os arquivos não existem, faça upload deles:
1. Acesse cPanel → File Manager
2. Navegue até `public_html/`
3. Certifique-se de que a pasta `assets/` existe
4. Faça upload dos arquivos CSS e JS

### Solução 2: Verificar caminhos relativos vs absolutos

Se os arquivos existem mas ainda dão 404, pode ser problema de caminho.

**Atual (relativo):**
```html
<link rel="stylesheet" href="assets/css/style.css">
```

**Alternativa (absoluto):**
```html
<link rel="stylesheet" href="/assets/css/style.css">
```

O `/` no início indica raiz do domínio.

### Solução 3: Usar caminhos absolutos completos

```html
<link rel="stylesheet" href="https://nerdparadise.com.br/assets/css/style.css">
<script src="https://nerdparadise.com.br/assets/js/config.js"></script>
<script src="https://nerdparadise.com.br/assets/js/auth.js"></script>
```

## 📋 Checklist:

- [ ] Arquivo `assets/css/style.css` existe no servidor
- [ ] Arquivo `assets/js/config.js` existe no servidor
- [ ] Arquivo `assets/js/auth.js` existe no servidor
- [ ] Permissões corretas (755 para pastas, 644 para arquivos)
- [ ] Teste direto no navegador retorna o conteúdo (não 404)
- [ ] Console do navegador mostra erros específicos

## 🆘 Se ainda não funcionar:

1. **Verifique o console do navegador (F12)**
   - Veja a URL exata que está sendo carregada
   - Compare com o caminho real no servidor

2. **Verifique se há redirecionamentos**
   - Alguns servidores redirecionam automaticamente
   - Verifique configurações no `.htaccess` da raiz

3. **Teste com caminhos absolutos**
   - Altere temporariamente para `/assets/css/style.css`
   - Veja se resolve

4. **Verifique logs de erro**
   - cPanel → Error Logs
   - Procure por erros relacionados a `assets/`
