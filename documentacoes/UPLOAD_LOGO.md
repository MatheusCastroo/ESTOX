# 📸 Documentação: Sistema de Upload de Logo

## 📋 Visão Geral

O sistema de upload de logo permite que os usuários façam upload da logo da sua loja através da página de configurações. A logo é convertida para base64 e armazenada diretamente no banco de dados no campo `logo_url` da tabela `stores`.

## 🔄 Fluxo Completo

### 1. **Interface do Usuário** (`configuracoes.html`)

```html
<input type="file" id="logo" accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg">
```

- Campo de input de arquivo oculto
- Botão "Enviar Logo" que aciona o input
- Preview da logo (220px × 66px)
- Botão "Remover Logo" (aparece quando há logo)

### 2. **Seleção do Arquivo**

Quando o usuário seleciona um arquivo:

1. Event listener detecta mudança no input (`change` event)
2. Chama `handleLogoUpload(file, inputElement)`

### 3. **Validação** (`validateLogoSize`)

```javascript
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
```

**Validações aplicadas:**
- ✅ **Tamanho máximo**: 2MB
- ❌ **Formato**: Não há validação de formato (aceita qualquer tipo de arquivo)
- ❌ **Dimensões**: Não há validação de resolução ou proporção

**Se a validação falhar:**
- Exibe mensagem de erro: "O arquivo é muito grande. Tamanho máximo: 2MB."
- Limpa o input
- Interrompe o processo

### 4. **Conversão para Base64** (`fileToBase64`)

```javascript
const reader = new FileReader();
reader.readAsDataURL(file);
// Resultado: "data:image/png;base64,iVBORw0KGgoAAAANS..."
```

**Processo:**
- Usa `FileReader.readAsDataURL()` para converter o arquivo
- Resultado é uma string base64 com prefixo `data:image/[tipo];base64,`
- Armazena em `logoUrl` (variável global)
- Armazena o arquivo original em `logoFile` (variável global)

### 5. **Preview da Imagem** (`showLogoPreview`)

**Funcionalidades:**
- Exibe preview da imagem antes de salvar
- Valida se é base64 ou URL HTTP
- Tenta corrigir padding de base64 se necessário
- Trata erros de carregamento

**Validações de preview:**
- Verifica se URL começa com `data:image/` (base64) ou `http://`/`https://` (URL externa)
- Tenta adicionar prefixo `data:image/png;base64,` se faltar
- Corrige padding base64 automaticamente (adiciona `=` se necessário)

### 6. **Salvamento** (`saveSettings`)

Quando o formulário é submetido:

```javascript
if (logoFile) {
    // Novo arquivo selecionado
    const base64Logo = await fileToBase64(logoFile);
    storeData.logo_url = base64Logo;
} else if (logoUrl && logoUrl.startsWith('http')) {
    // URL externa existente
    storeData.logo_url = logoUrl;
} else if (!logoUrl) {
    // Logo foi removida
    storeData.logo_url = null;
}
```

**Request para API:**
```http
PUT /api/stores
Content-Type: application/json
Authorization: Bearer [token]

{
  "name": "...",
  "logo_url": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  ...
}
```

### 7. **Backend - API** (`api/endpoints/stores.php`)

**Endpoint:** `PUT /api/stores`

**Processo:**
1. Valida autenticação (JWT token)
2. Verifica se usuário possui loja
3. Atualiza campo `logo_url` na tabela `stores`
4. Retorna loja atualizada

```php
$updateData = [];
$allowedFields = ['name', 'slug', ..., 'logo_url'];

foreach ($allowedFields as $field) {
    if (isset($data[$field])) {
        $updateData[$field] = $data[$field];
    }
}

$updatedStore = $db->update('stores', $updateData, 'id = :id', ['id' => $store['id']]);
```

### 8. **Carregamento ao Abrir Página** (`loadStoreSettings`)

Quando a página é carregada:

1. Faz requisição `GET /api/stores`
2. Recebe dados da loja incluindo `logo_url`
3. Valida se base64 está completa (verifica padding)
4. Chama `showLogoPreview(store.logo_url)` após 100ms

**Validação de base64 ao carregar:**
```javascript
if (logoStr.startsWith('data:image/')) {
    const base64Part = logoStr.split(',')[1];
    const padding = base64Part.length % 4;
    // Verifica se padding está correto
}
```

## 🗄️ Estrutura de Dados

### Banco de Dados

**Tabela:** `stores`

**Campo:** `logo_url`

**Tipo:** `MEDIUMTEXT` (recomendado) ou `TEXT` (pode truncar imagens grandes)

**Limites:**
- `TEXT`: ~65KB (pode truncar imagens base64 de 2MB)
- `MEDIUMTEXT`: ~16MB (recomendado)

**Script de migração:**
```sql
-- scripts/003-alter-logo-url-to-mediumtext.sql
ALTER TABLE stores MODIFY COLUMN logo_url MEDIUMTEXT;
```

### Formato dos Dados

**Base64 (recomendado):**
```
data:image/png;base64,iVBORw0KGgoAAAANS...
```

**URL Externa (alternativa):**
```
https://exemplo.com/logo.png
```

## 🔧 Funções Principais

### `handleLogoUpload(file, inputElement)`

**Responsabilidade:** Processa upload do arquivo selecionado

**Fluxo:**
1. Valida tamanho do arquivo
2. Converte para base64 usando `FileReader`
3. Armazena em variáveis globais (`logoFile`, `logoUrl`)
4. Exibe preview

**Parâmetros:**
- `file`: Objeto File do input
- `inputElement`: Elemento HTML do input

### `validateLogoSize(file)`

**Responsabilidade:** Valida tamanho do arquivo

**Retorna:**
```javascript
{ valid: true } // ou
{ valid: false, error: "Mensagem de erro" }
```

### `showLogoPreview(url)`

**Responsabilidade:** Exibe preview da logo

**Funcionalidades:**
- Valida formato (base64 ou URL)
- Tenta corrigir padding base64
- Trata erros de carregamento
- Exibe/esconde preview e botão remover

**Tratamento de erros:**
- Base64 corrompida: "A imagem pode estar corrompida"
- Base64 incompleta: "A imagem pode estar incompleta. Tente fazer upload novamente"
- URL inválida: "Formato de URL da logo inválido"
- URL inacessível: "Erro ao carregar a imagem da logo. Verifique se a URL está acessível"

### `fileToBase64(file)`

**Responsabilidade:** Converte arquivo para base64

**Retorna:** Promise que resolve com string base64

### `removeLogo()`

**Responsabilidade:** Remove logo selecionada

**Ações:**
- Limpa `logoFile` e `logoUrl`
- Limpa input
- Esconde preview
- Esconde botão remover

### `saveSettings(e)`

**Responsabilidade:** Salva configurações incluindo logo

**Fluxo:**
1. Prepara dados do formulário
2. Se há `logoFile`, converte para base64
3. Se há `logoUrl` HTTP, mantém URL
4. Se não há logo, envia `null`
5. Faz requisição PUT para API
6. Exibe mensagem de sucesso/erro

## ⚠️ Tratamento de Erros

### Erros de Validação

| Erro | Causa | Solução |
|------|-------|---------|
| "O arquivo é muito grande. Tamanho máximo: 2MB." | Arquivo > 2MB | Reduzir tamanho da imagem |
| "Erro ao ler arquivo de imagem" | Arquivo corrompido | Tentar outro arquivo |
| "A imagem pode estar corrompida" | Base64 inválida | Fazer upload novamente |
| "A imagem pode estar incompleta" | Base64 truncada no banco | Verificar tipo do campo (deve ser MEDIUMTEXT) |
| "Formato de URL da logo inválido" | URL não é base64 nem HTTP | Verificar formato da URL |

### Correções Automáticas

1. **Padding Base64:** Tenta adicionar `=` automaticamente se faltar
2. **Prefix Base64:** Adiciona `data:image/png;base64,` se faltar
3. **Timeout de Carregamento:** Usa delay de 10ms antes de definir `src` da imagem

## 📊 Variáveis Globais

```javascript
let logoFile = null;  // Arquivo original selecionado
let logoUrl = null;    // URL base64 ou HTTP da logo
```

## 🔐 Segurança

### Validações Implementadas

- ✅ Tamanho máximo: 2MB
- ✅ Autenticação JWT obrigatória
- ✅ Isolamento de dados (usuário só acessa sua própria loja)

### Validações NÃO Implementadas

- ❌ Tipo MIME do arquivo
- ❌ Dimensões da imagem
- ❌ Proporção da imagem
- ❌ Validação de conteúdo (arquivo pode não ser imagem)

## 🚀 Melhorias Futuras

1. **Upload para servidor de arquivos:**
   - Salvar arquivo físico em vez de base64
   - Retornar URL do arquivo
   - Reduzir tamanho no banco de dados

2. **Validação de formato:**
   - Verificar tipo MIME real do arquivo
   - Validar extensão do arquivo

3. **Otimização de imagem:**
   - Comprimir imagem antes de salvar
   - Redimensionar automaticamente
   - Converter para formato otimizado (WebP)

4. **Validação de dimensões:**
   - Validar resolução mínima
   - Validar proporção recomendada

## 📝 Exemplo de Uso

### HTML
```html
<input type="file" id="logo" accept=".svg,.png,.jpg,.jpeg">
<button onclick="document.getElementById('logo').click()">Enviar Logo</button>
<div id="logoPreview" style="display: none;">
    <img id="logoPreviewImg" src="" alt="Logo Preview">
</div>
<button id="removeLogoBtn" onclick="removeLogo()" style="display: none;">Remover</button>
<div id="logoError" class="alert alert-danger d-none"></div>
```

### JavaScript
```javascript
// O upload é automático quando o arquivo é selecionado
// O salvamento acontece ao submeter o formulário
document.getElementById('settingsForm').addEventListener('submit', saveSettings);
```

## 🔍 Debug

### Console Logs

O sistema gera logs no console para debug:

```javascript
console.log('Logo image loaded successfully');
console.warn('Base64 string may be truncated or incomplete');
console.error('Error loading logo image. URL length:', cleanUrl.length);
console.error('Is Base64:', isBase64, 'Is HTTP URL:', isHttpUrl);
```

### Verificar no Banco

```sql
SELECT 
    id, 
    name, 
    LENGTH(logo_url) as logo_size,
    LEFT(logo_url, 50) as logo_preview
FROM stores 
WHERE logo_url IS NOT NULL;
```

## 📚 Arquivos Relacionados

- `assets/js/settings.js` - Lógica principal do upload
- `configuracoes.html` - Interface do usuário
- `api/endpoints/stores.php` - Endpoint da API
- `scripts/003-alter-logo-url-to-mediumtext.sql` - Script de migração
- `assets/css/style.css` - Estilos do preview

## ✅ Checklist de Implementação

- [x] Validação de tamanho (2MB)
- [x] Conversão para base64
- [x] Preview da imagem
- [x] Salvamento no banco de dados
- [x] Carregamento ao abrir página
- [x] Remoção de logo
- [x] Tratamento de erros
- [x] Correção automática de padding base64
- [ ] Validação de formato de arquivo
- [ ] Validação de dimensões
- [ ] Upload para servidor de arquivos







