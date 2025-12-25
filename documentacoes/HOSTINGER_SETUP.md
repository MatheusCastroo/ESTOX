# Guia de Deploy na Hostinger

## Estrutura de Pastas

Quando fazer upload para a Hostinger, a estrutura deve ser:

```
public_html/
├── index.html
├── login.html
├── cadastro.html
├── [outros arquivos HTML]
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── config.js
│   │   ├── auth.js
│   │   ├── main.js
│   │   └── [outros arquivos JS]
│   └── images/
├── public/
│   └── car-dealership-dashboard-interface-showing-vehicle.jpg
└── api/
    └── [arquivos da API PHP]
```

## Pontos Importantes

### 1. Caminhos Relativos
Todos os caminhos no `index.html` e outros arquivos HTML estão configurados como caminhos relativos:
- `assets/css/style.css` ✅
- `assets/js/main.js` ✅
- `public/imagem.jpg` ✅

### 2. Arquivo config.js
**IMPORTANTE**: Antes de fazer upload, você precisa atualizar o arquivo `assets/js/config.js` com a URL correta da API na Hostinger:

```javascript
const API_URL = 'https://seudominio.com/api';  // Altere para sua URL
```

### 3. Verificações Necessárias

#### Arquivos que devem existir:
- ✅ `assets/css/style.css`
- ✅ `assets/js/config.js`
- ✅ `assets/js/auth.js`
- ✅ `assets/js/main.js`
- ✅ `public/car-dealership-dashboard-interface-showing-vehicle.jpg`

#### Permissões (se necessário):
- Pastas: 755
- Arquivos: 644

### 4. Testes Após Upload

1. Abra o site e verifique o console do navegador (F12)
2. Verifique se não há erros 404 nos arquivos CSS/JS
3. Teste a imagem do hero section
4. Verifique se os links funcionam corretamente

### 5. Problemas Comuns

#### Erro 404 em CSS/JS:
- Verifique se a estrutura de pastas está correta
- Verifique se os caminhos estão relativos (sem `/` no início)

#### Imagens não carregam:
- Verifique se a pasta `public/` está na raiz
- Verifique permissões da pasta

#### API não funciona:
- Atualize `API_URL` no `config.js`
- Verifique se a pasta `api/` está no lugar correto
- Verifique permissões do arquivo `.htaccess` (se houver)

## Checklist Pré-Upload

- [ ] Atualizar `API_URL` em `assets/js/config.js`
- [ ] Verificar se todos os arquivos HTML carregam `config.js` antes de `auth.js`
- [ ] Verificar se a estrutura de pastas está correta
- [ ] Testar localmente antes de fazer upload
- [ ] Verificar se todas as imagens existem

## Notas

- O `index.html` não usa a API diretamente, então não precisa de autenticação
- A imagem do hero tem um fallback caso não carregue
- Todos os caminhos são relativos para funcionar em qualquer subpasta

