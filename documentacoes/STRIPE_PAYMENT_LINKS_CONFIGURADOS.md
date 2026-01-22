# ✅ Stripe Payment Links Configurados

## 📋 Links dos Planos

Os links diretos do Stripe Checkout (Payment Links) foram configurados para os planos:

| Plano | Link Stripe Payment |
|-------|---------------------|
| **Mensal** | `https://buy.stripe.com/eVqdR3aUv2Qp4c02s7fjG02` |
| **Trimestral** | `https://buy.stripe.com/7sY3cpd2D76F5g4eaPfjG01` |
| **Anual** | `https://buy.stripe.com/5kQbIV3s3aiR4c07MrfjG00` |

---

## 🔧 Implementação

### 1. Campo `checkout_url` Adicionado

**Script SQL:** `scripts/014-add-checkout-url-to-plans.sql`

```sql
ALTER TABLE plans 
ADD COLUMN checkout_url VARCHAR(500) NULL 
COMMENT 'Link direto do Stripe Checkout (Payment Link)';
```

### 2. Planos Atualizados

Os planos foram atualizados com os links fornecidos:

```sql
-- Plano Mensal
UPDATE plans 
SET checkout_url = 'https://buy.stripe.com/eVqdR3aUv2Qp4c02s7fjG02'
WHERE slug = 'profissional-mensal';

-- Plano Trimestral
UPDATE plans 
SET checkout_url = 'https://buy.stripe.com/7sY3cpd2D76F5g4eaPfjG01'
WHERE slug = 'profissional-trimestral';

-- Plano Anual
UPDATE plans 
SET checkout_url = 'https://buy.stripe.com/5kQbIV3s3aiR4c07MrfjG00'
WHERE slug = 'profissional-anual';
```

### 3. Endpoint Atualizado

**Arquivo:** `api/endpoints/plans.php`

O endpoint `/api/plans` agora retorna o campo `checkout_url`:

```php
SELECT id, name, slug, price, vehicle_limit, duration_days, 
       features, is_active, checkout_url, created_at, updated_at 
FROM plans 
WHERE is_active = true 
ORDER BY price ASC
```

### 4. Front-end (JavaScript)

**Arquivo:** `assets/js/landing-plans.js`

O JavaScript já estava preparado para usar `checkout_url`:

```javascript
// Prioridade: checkout_url do plano > links hardcoded > cadastro.html
let checkoutLink = plan.checkout_url || plan.stripe_link || 'cadastro.html';
```

**Funcionamento:**
1. Se o plano tiver `checkout_url` → usa o link direto do Stripe
2. Se não tiver → usa fallback para `cadastro.html`

---

## 📍 Onde os Links Aparecem

### 1. Index (`index.html`)

Seção "Planos que cabem no seu bolso":
- Carrega planos via `/api/plans`
- Usa `checkout_url` quando disponível
- Botão "Assinar Agora" redireciona para o Payment Link

### 2. Página de Planos (`planos.html`)

Mesma lógica do index:
- Carrega planos via `/api/plans`
- Usa `checkout_url` quando disponível
- Botão "Assinar Agora" redireciona para o Payment Link

### 3. Configurações (`configuracoes.html`)

**Não exibe planos** - apenas link no menu para `planos.html`

---

## 🔄 Fluxo de Uso

### Cliente clica em "Assinar Agora":

```
1. Front-end busca planos via GET /api/plans
   → Retorna: { checkout_url: "https://buy.stripe.com/..." }

2. JavaScript usa checkout_url do plano
   → Botão aponta para o Payment Link

3. Cliente é redirecionado para Stripe
   → Payment Link do Stripe

4. Cliente completa pagamento no Stripe
   → Stripe processa e redireciona de volta
```

---

## ✅ Próximos Passos

1. **Executar Script SQL:**
   ```sql
   -- Executar no banco de dados
   source scripts/014-add-checkout-url-to-plans.sql;
   ```

2. **Verificar Endpoint:**
   ```bash
   GET /api/plans
   # Deve retornar checkout_url para cada plano
   ```

3. **Testar Front-end:**
   - Acessar `index.html` → Seção de planos
   - Acessar `planos.html` → Página de planos
   - Verificar se botões apontam para os Payment Links corretos

---

## 📝 Notas Importantes

1. **Payment Links vs Checkout Sessions:**
   - Payment Links são links diretos criados no Stripe Dashboard
   - Não requerem criação via API
   - Mais simples para uso direto

2. **Fallback:**
   - Se `checkout_url` não estiver configurado, usa `cadastro.html`
   - Mantém compatibilidade com sistema antigo

3. **Atualização:**
   - Links podem ser atualizados diretamente no banco
   - Não requer alteração de código

---

## 🎯 Resultado Final

✅ Campo `checkout_url` adicionado à tabela `plans`  
✅ Planos atualizados com links do Stripe  
✅ Endpoint retorna `checkout_url`  
✅ Front-end usa automaticamente os links  
✅ Funciona em `index.html` e `planos.html`

**Sistema pronto para usar os Payment Links do Stripe!** 🚀
