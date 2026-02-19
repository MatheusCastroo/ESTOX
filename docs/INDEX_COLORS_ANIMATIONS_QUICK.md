# 🚀 Quick Reference - Cores e Animações index.html

## 🎨 Cores Principais

```css
--primary: #2563EB      /* Azul - botões, links */
--secondary: #0F172A   /* Azul escuro - títulos, footer */
--accent: #10B981      /* Verde - destaques, badges */
--bg: #F8FAFC         /* Cinza claro - background */
```

## 🌈 Gradientes

### Hero Section
```css
linear-gradient(135deg, #2563EB 0%, #0F172A 100%)
```

### Card Icons
```css
linear-gradient(135deg, #2563EB, #3B82F6)
```

### CTA Section
```css
linear-gradient(135deg, #2563EB 0%, #0F172A 100%)
```

## 🎬 Animações

### Fade In Up
```css
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}
```
**Duração**: 0.6s  
**Easing**: ease-out

## 🔄 Hover Effects

### Botões
- **Primary**: `scale(1.05)` + cor mais escura
- **Success**: `translateY(-2px)` + cor mais escura
- **Light**: `scale(1.05)` + sombra
- **Outline Light**: `scale(1.05)` + preenche branco

### Cards
- **Card Custom**: `translateY(-8px)` + sombra aumentada
- **Pricing Card**: `translateY(-8px)` + sombra aumentada

## ⚡ JavaScript Effects

### Navbar Scroll
- Scroll > 50px: adiciona `.scrolled`
- Muda para fundo escuro + texto branco

### Smooth Scroll
- Links `#` fazem scroll suave
- Offset: 80px (altura navbar)

## 📊 Tabela de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Primary | `#2563EB` | Botões, links |
| Secondary | `#0F172A` | Títulos, footer |
| Accent | `#10B981` | Destaques |
| Background | `#F8FAFC` | Fundo |
| Texto | `#1E293B` | Texto padrão |
| Texto Sec | `#64748B` | Subtítulos |
| WhatsApp | `#25d366` | Botão WhatsApp |

## 🎯 Transições Padrão

```css
transition: all 0.3s ease;
```

## 🔧 Customização Rápida

### Mudar Cor Primária
```css
:root { --primary: #SUA_COR; }
```

### Mudar Velocidade
```css
transition: all 0.2s ease;  /* Mais rápido */
transition: all 0.5s ease;  /* Mais lento */
```

---

**Documentação Completa**: `docs/INDEX_COLORS_ANIMATIONS.md`
