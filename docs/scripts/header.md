# Modules Header - Documentation

Cette refactorisation extrait toute la logique TypeScript du composant `Header.astro` dans des modules séparés et réutilisables.

## 🏗️ Architecture

```
src/scripts/
├── header/
│   ├── index.ts          # Point d'entrée principal (HeaderManager)
│   ├── scroll-handler.ts # Gestion du scroll et transparence
│   ├── mobile-menu.ts    # Menu mobile avec overlay
│   ├── language.ts       # Gestion multilingue FR/EN
│   └── theme.ts          # Synchronisation thème clair/sombre
└── utils/
    └── dom.ts            # Utilitaires DOM type-safe
```

## 📚 Utilisation

### Auto-initialisation

Les modules s'initialisent automatiquement au chargement du DOM :

```typescript
// Dans Header.astro
import { initializeHeader } from "../scripts/header/index.js";
```

### Accès programmatique

Pour interagir avec les gestionnaires :

```typescript
import { getHeaderManager } from "../scripts/header/index.js";

const headerManager = getHeaderManager();

if (headerManager) {
  // Accès aux gestionnaires individuels
  const mobileMenu = headerManager.getMobileMenu();
  const languageManager = headerManager.getLanguageManager();
  const themeManager = headerManager.getThemeManager();
  const scrollHandler = headerManager.getScrollHandler();

  // Exemples d'usage
  mobileMenu.close();
  languageManager.updateLanguage("en");
  console.log(themeManager.isDarkTheme());
}
```

### Import direct des modules

Pour usage dans d'autres composants :

```typescript
import { LanguageManager } from "../scripts/header/language.js";
import { ThemeManager } from "../scripts/header/theme.js";

const langManager = new LanguageManager();
const themeManager = new ThemeManager();
```

## ✅ Avantages de cette refactorisation

1. **Séparation des responsabilités** : Chaque module a une responsabilité unique
2. **Réutilisabilité** : Les modules peuvent être utilisés dans d'autres composants
3. **Testabilité** : Chaque module peut être testé unitairement
4. **Type Safety** : TypeScript strict avec utilitaires DOM type-safe
5. **Maintenabilité** : Code plus facile à maintenir et déboguer
6. **Performance** : Event listeners optimisés avec cleanup approprié

## 🧪 Tests recommandés

Avec Vitest, vous pouvez maintenant tester chaque module :

```typescript
// tests/header/language-manager.test.ts
import { describe, it, expect } from "vitest";
import { LanguageManager } from "../../src/scripts/header/language.js";

describe("LanguageManager", () => {
  it("should update language correctly", () => {
    const manager = new LanguageManager();
    manager.updateLanguage("en");
    expect(manager.getCurrentLanguage()).toBe("en");
  });
});
```
