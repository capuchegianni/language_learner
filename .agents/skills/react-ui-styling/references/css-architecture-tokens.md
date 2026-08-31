# CSS Architecture, Tokens & Glassmorphism Guidelines

This reference provides exact CSS variables, button styles, badges, input controls, and animation recipes for the frontend design system.

---

## 1. Complete Design Token Palette

```css
:root {
  /* Color Palettes */
  --bg-dark: #0b0f19;
  --bg-darker: #060911;
  --bg-card: rgba(17, 24, 39, 0.75);
  --bg-card-hover: rgba(31, 41, 55, 0.85);
  --bg-glass-input: rgba(15, 23, 42, 0.6);

  /* Accents */
  --accent-primary: #6366f1;
  --accent-hover: #4f46e5;
  --accent-glow: rgba(99, 102, 241, 0.25);
  --accent-success: #10b981;
  --accent-warning: #f59e0b;
  --accent-danger: #ef4444;

  /* Typography */
  --font-main: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-korean: 'Noto Sans KR', sans-serif;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;

  /* Borders & Glass */
  --border-card: rgba(255, 255, 255, 0.08);
  --border-card-hover: rgba(99, 102, 241, 0.4);
  --border-input: rgba(255, 255, 255, 0.12);
  --border-focus: #6366f1;
  --glass-blur: blur(16px);
  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;
}
```

---

## 2. Reusable UI Element Recipes

### Standard Button Styles
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-main);
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  outline: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  color: #ffffff;
  box-shadow: 0 4px 14px var(--accent-glow);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border-color: var(--border-card);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

### Pill / Badge Styles
```css
.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
}

.pill-success {
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-success);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.pill-warning {
  background: rgba(245, 158, 11, 0.15);
  color: var(--accent-warning);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.pill-danger {
  background: rgba(239, 68, 68, 0.15);
  color: var(--accent-danger);
  border: 1px solid rgba(239, 68, 68, 0.3);
}
```

---

## 3. Micro-Animations

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
  }
  50% {
    box-shadow: 0 0 25px rgba(99, 102, 241, 0.5);
  }
}

.pulse-active {
  animation: pulseGlow 2s infinite ease-in-out;
}
```
