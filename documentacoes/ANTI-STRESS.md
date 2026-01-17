# 🛡️ Implementação Anti-Sobrecarga e Eliminação de ERR_CONNECTION_RESET

## 📋 Visão Geral

Este documento descreve todas as implementações realizadas para proteger o sistema ESTOX contra sobrecarga e eliminar erros `ERR_CONNECTION_RESET` durante testes de stress (k6).

## 🎯 Objetivos Alcançados

✅ Landing page 100% estática  
✅ Cache agressivo de assets  
✅ Rate limiting na API  
✅ Bloqueio de bots  
✅ Tratamento de erros controlado  
✅ Respostas HTTP válidas em todos os cenários  

---

## 1️⃣ Landing Page 100% Estática

### Status: ✅ IMPLEMENTADO

### Verificação

O arquivo `index.html` foi verificado e confirmado como 100% estático:

- ✅ Não executa PHP (arquivo `.html` puro)
- ✅ Não faz chamadas automáticas à API no carregamento
- ✅ Carrega apenas assets estáticos (CSS, JS, imagens)
- ✅ JavaScript apenas para interações do usuário (não executa automaticamente)

### Detalhes

- **Arquivo:** `index.html`
- **Tipo:** HTML puro (sem processamento server-side)
- **Assets:** CSS, JS, imagens (todos estáticos)
- **Chamadas à API:** Apenas quando usuário interage (ex: formulário de cadastro)

---

## 2️⃣ Cache de Assets

### Status: ✅ IMPLEMENTADO

### Localização

**Arquivo:** `.htaccess` (raiz do projeto)

### Headers Implementados

#### CSS e JavaScript
```
Cache-Control: public, max-age=2592000, immutable
```
- **Duração:** 30 dias (2.592.000 segundos)
- **Flag:** `immutable` (indica que o arquivo nunca muda)

#### Imagens
```
Cache-Control: public, max-age=31536000, immutable
```
- **Duração:** 1 ano (31.536.000 segundos)
- **Tipos:** JPG, JPEG, PNG, GIF, SVG, WEBP, ICO

#### Fontes
```
Cache-Control: public, max-age=31536000, immutable
```
- **Duração:** 1 ano
- **Tipos:** WOFF, WOFF2, TTF, OTF, EOT

#### HTML
```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```
- **HTML sempre recarregado** (garante conteúdo atualizado)

### Código Implementado

```apache
<IfModule mod_headers.c>
    # CSS files - cache for 30 days, immutable
    <FilesMatch "\.(css)$">
        Header set Cache-Control "public, max-age=2592000, immutable"
    </FilesMatch>
    
    # JavaScript files - cache for 30 days, immutable
    <FilesMatch "\.(js)$">
        Header set Cache-Control "public, max-age=2592000, immutable"
    </FilesMatch>
    
    # Images - cache for 1 year, immutable
    <FilesMatch "\.(jpg|jpeg|png|gif|svg|webp|ico)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    # Fonts - cache for 1 year, immutable
    <FilesMatch "\.(woff|woff2|ttf|otf|eot)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    # HTML files - no cache (always fresh)
    <FilesMatch "\.(html|htm)$">
        Header set Cache-Control "no-cache, no-store, must-revalidate"
        Header set Pragma "no-cache"
        Header set Expires "0"
    </FilesMatch>
</IfModule>
```

---

## 3️⃣ Rate Limiting na API

### Status: ✅ IMPLEMENTADO

### Localização

**Arquivo:** `api/classes/RateLimiter.php`

### Limites Configurados

#### Requisições Públicas (não autenticadas)
- **Limite:** 100 requisições por minuto
- **Janela:** 60 segundos
- **Aplicado a:** Endpoints públicos (ex: `/api/plans`, `/api/auth`)

#### Requisições Autenticadas
- **Limite:** 200 requisições por minuto
- **Janela:** 60 segundos
- **Aplicado a:** Endpoints que requerem token JWT

### Funcionamento

1. **Identificação do IP:** Captura IP do cliente (com suporte a proxies)
2. **Armazenamento:** Arquivos JSON temporários em `sys_get_temp_dir()/estox_rate_limit/`
3. **Verificação:** Conta requisições por IP dentro da janela de tempo
4. **Resposta:** Retorna HTTP 429 (Too Many Requests) quando limite excedido

### Headers de Resposta

Quando rate limit é aplicado, os seguintes headers são retornados:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200
Retry-After: 45
```

### Resposta JSON (HTTP 429)

```json
{
  "success": false,
  "error": "Muitas requisições. Limite de 100 requisições por minuto excedido.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 45
}
```

### Integração

**Arquivo:** `api/index.php`

O rate limiting é aplicado **antes** de qualquer processamento:

```php
// Check if authenticated (has Authorization header)
$headers = getallheaders();
$hasAuth = isset($headers['Authorization']) && !empty($headers['Authorization']);

// Apply rate limiting
Middleware::rateLimit($hasAuth);
```

---

## 4️⃣ Bloqueio de Bots Simples

### Status: ✅ IMPLEMENTADO

### Localização

**Arquivo:** `api/classes/Middleware.php` (método `blockBots()`)

### Verificações Implementadas

1. **User-Agent vazio:** Bloqueado (HTTP 403)
2. **User-Agent muito curto:** Bloqueado (menos de 3 caracteres)
3. **curl sem headers apropriados:** Bloqueado (requer header `Accept`)
4. **Padrões suspeitos:** Bloqueados

### Resposta (HTTP 403)

```json
{
  "success": false,
  "error": "Cliente não autorizado"
}
```

### Integração

**Arquivo:** `api/index.php`

O bloqueio de bots é aplicado **antes** do rate limiting:

```php
// Block suspicious bots before any processing
Middleware::blockBots();
```

---

## 5️⃣ Tratamento de Erros Controlado

### Status: ✅ IMPLEMENTADO

### Melhorias na Classe Response

**Arquivo:** `api/classes/Response.php`

#### Novos Métodos

- `tooManyRequests()` - HTTP 429
- `serviceUnavailable()` - HTTP 503

#### Melhorias no Método `json()`

- Verifica se headers já foram enviados
- Tratamento de falha no `json_encode()`
- Sempre retorna JSON válido

### Error Handler Global

**Arquivo:** `api/index.php`

#### Shutdown Function

Captura erros fatais e garante resposta JSON:

```php
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode([
            'success' => false,
            'error' => 'Erro interno do servidor'
        ]);
    }
});
```

#### Error Handler

Trata erros não-fatais sem quebrar execução:

```php
set_error_handler(function($severity, $message, $file, $line) {
    if (error_reporting() & $severity) {
        error_log("PHP Error: $message in $file on line $line");
    }
    return true;
}, E_WARNING | E_NOTICE);
```

### Garantias

✅ Nunca encerra conexão sem resposta  
✅ Sempre retorna JSON válido  
✅ Status HTTP sempre definido  
✅ Headers sempre enviados antes do conteúdo  

---

## 6️⃣ Separação de Tráfego Público e API

### Status: ✅ IMPLEMENTADO

### Estrutura

- **Páginas Públicas:** `/` (index.html), `/cadastro.html`, `/login.html`
  - Não fazem chamadas à API no carregamento
  - Totalmente estáticas

- **API:** `/api/*`
  - Acesso apenas quando necessário
  - Validação JWT antes de lógica pesada
  - Rate limiting aplicado

### Endpoints Públicos (sem autenticação)

- `GET /api/plans` - Lista de planos (com rate limiting)
- `POST /api/auth?action=register` - Registro (com rate limiting)
- `POST /api/auth?action=login` - Login (com rate limiting)

### Endpoints Protegidos (requer autenticação)

- `GET /api/stores` - Loja do usuário
- `GET /api/vehicles` - Veículos
- `GET /api/dashboard` - Estatísticas
- Todos os endpoints POST/PUT/DELETE

---

## 📊 Testes com k6

### Script de Teste Recomendado

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp-up
    { duration: '1m', target: 100 },   // Stress
    { duration: '30s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% das requisições < 500ms
    http_req_failed: ['rate<0.01'],    // Taxa de erro < 1%
  },
};

const API_URL = 'http://seu-dominio.com.br/api';

export default function() {
  // Teste endpoint público
  let response = http.get(`${API_URL}/plans`);
  
  check(response, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
    'has rate limit headers': (r) => r.headers['X-RateLimit-Limit'] !== undefined,
  });
  
  sleep(1);
}
```

### Resultados Esperados

✅ **Site permanece online**  
✅ **API responde com 429 quando necessário**  
✅ **Nenhum ERR_CONNECTION_RESET**  
✅ **Sem queda do servidor**  
✅ **Respostas HTTP válidas (200, 429, 403, 500)**  

### Métricas Esperadas

- **Taxa de sucesso (200):** ~70-90% (dependendo do volume)
- **Taxa de rate limit (429):** ~10-30% (durante stress)
- **Taxa de erro (500):** < 1%
- **ERR_CONNECTION_RESET:** 0%

---

## 📁 Arquivos Modificados/Criados

### Arquivos Criados

1. `api/classes/RateLimiter.php` - Classe de rate limiting
2. `documentacoes/ANTI-STRESS.md` - Esta documentação

### Arquivos Modificados

1. `api/classes/Middleware.php` - Adicionado `blockBots()` e `rateLimit()`
2. `api/classes/Response.php` - Adicionado `tooManyRequests()` e `serviceUnavailable()`
3. `api/index.php` - Integrado rate limiting, bloqueio de bots e error handlers
4. `.htaccess` - Adicionado cache headers para assets

---

## 🔍 Como Verificar

### 1. Verificar Cache de Assets

```bash
curl -I http://seu-dominio.com.br/assets/css/style.css
```

**Esperado:**
```
Cache-Control: public, max-age=2592000, immutable
```

### 2. Verificar Rate Limiting

```bash
# Fazer muitas requisições rapidamente
for i in {1..150}; do
  curl -I http://seu-dominio.com.br/api/plans
done
```

**Esperado:** Após 100 requisições, retornar HTTP 429

### 3. Verificar Bloqueio de Bots

```bash
curl -H "User-Agent: " http://seu-dominio.com.br/api/plans
```

**Esperado:** HTTP 403

### 4. Teste de Stress Completo

```bash
k6 run stress-test.js
```

---

## ⚠️ Notas Importantes

1. **Rate Limiting:** Os arquivos de cache são armazenados em `sys_get_temp_dir()/estox_rate_limit/`. Certifique-se de que o diretório tem permissões de escrita.

2. **Cleanup:** O rate limiter faz cleanup automático de arquivos antigos (10% de chance a cada requisição para evitar overhead).

3. **IP Detection:** O sistema tenta detectar o IP real mesmo atrás de proxies, mas pode haver falsos positivos em alguns casos.

4. **Limites Customizáveis:** Os limites podem ser ajustados em `api/classes/RateLimiter.php`:

```php
private static $publicLimits = [
    'window' => 60,        // segundos
    'max_requests' => 100  // requisições
];
```

---

## ✅ Checklist de Implementação

- [x] Landing page 100% estática
- [x] Cache de assets (CSS, JS, imagens, fontes)
- [x] Rate limiting na API
- [x] Bloqueio de bots
- [x] Tratamento de erros controlado
- [x] Error handler global
- [x] Separação de tráfego público/API
- [x] Documentação completa

---

## 🎯 Conclusão

Todas as proteções foram implementadas com sucesso. O sistema está protegido contra sobrecarga e não deve mais apresentar `ERR_CONNECTION_RESET` durante testes de stress.

O sistema responde adequadamente com:
- **HTTP 200** - Requisições bem-sucedidas
- **HTTP 429** - Rate limit excedido
- **HTTP 403** - Bot bloqueado
- **HTTP 500** - Erro interno (com JSON válido)

Nenhuma requisição deve resultar em conexão resetada ou servidor offline.




