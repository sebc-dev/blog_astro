# Header Component - Modular TypeScript Architecture

## Overview

Ce dossier contient l'architecture modulaire refactorisée du composant Header. Le gros script inline (330+ lignes) a été divisé en modules TypeScript dédiés pour améliorer la maintenabilité, le typage, et les performances.

## Architecture

### Structure des Fichiers

```
src/components/header/
├── Header.astro              # Composant principal (templates HTML + styles)
├── header-client.ts          # Module principal coordonnateur
├── theme-manager.ts          # Gestion du thème clair/sombre
├── mobile-menu.ts            # Gestion du menu mobile
├── dropdown-manager.ts       # Gestion des dropdowns
├── scroll-effects.ts         # Effets de scroll sur le header
├── header-styles.ts          # Styles et configurations (existant)
├── types.ts                  # Types TypeScript (existant)
├── utils.ts                  # Utilitaires helper (existant)
└── README.md                 # Cette documentation
```

## Modules

### 🎨 `theme-manager.ts` - Gestion des Thèmes

**Responsabilités :**

- Gestion du localStorage pour la persistance
- Détection du thème système préféré
- Mise à jour des icônes de thème
- API publique pour contrôle externe

**Classes Principales :**

- `ThemeManager` : Classe principale de gestion
- `initThemeManager()` : Fonction d'initialisation

**Utilisation :**

```typescript
import { initThemeManager } from "./theme-manager";
const themeManager = initThemeManager();
console.log(themeManager.getCurrentTheme()); // 'light-blue' | 'dark-blue'
```

### 📱 `mobile-menu.ts` - Menu Mobile

**Responsabilités :**

- Ouverture/fermeture du menu mobile
- Gestion des overlays et échappement
- Contrôle du scroll de la page
- États ARIA pour l'accessibilité

**Classes Principales :**

- `MobileMenuManager` : Gestionnaire du menu mobile
- `initMobileMenuManager()` : Fonction d'initialisation

**Utilisation :**

```typescript
import { initMobileMenuManager } from "./mobile-menu";
const menuManager = initMobileMenuManager();
menuManager.open(); // Ouvre le menu
menuManager.close(); // Ferme le menu
```

### 🔽 `dropdown-manager.ts` - Dropdowns

**Responsabilités :**

- Gestion des dropdowns de navigation
- Fermeture automatique sur clic externe
- Support clavier (Escape)
- Exclusion mutuelle (un seul dropdown ouvert)

**Classes Principales :**

- `DropdownManager` : Gestionnaire des dropdowns
- `initDropdownManager()` : Fonction d'initialisation

**Utilisation :**

```typescript
import { initDropdownManager } from "./dropdown-manager";
const dropdownManager = initDropdownManager();
dropdownManager.closeAll(); // Ferme tous les dropdowns
```

### 🔄 `scroll-effects.ts` - Effets de Scroll

**Responsabilités :**

- Détection du scroll et seuils
- Application des classes CSS (`scrolled`)
- Optimisation des performances (throttling)
- Effet de backdrop-filter

**Classes Principales :**

- `ScrollEffectsManager` : Gestionnaire des effets de scroll
- `initScrollEffectsManager(threshold?: number)` : Fonction d'initialisation

**Utilisation :**

```typescript
import { initScrollEffectsManager } from "./scroll-effects";
const scrollManager = initScrollEffectsManager(50); // Seuil personnalisé
console.log(scrollManager.isScrolled()); // true/false
```

### 🎛️ `header-client.ts` - Coordinateur Principal

**Responsabilités :**

- Initialisation de tous les modules
- API unifiée d'accès aux managers
- Gestion des erreurs et logging
- Auto-initialisation sur chargement

**Classes Principales :**

- `HeaderClient` : Classe coordinatrice
- `initHeaderClient()` : Fonction d'initialisation
- `getHeaderClient()` : Accès à l'instance globale

**Utilisation :**

```typescript
import { getHeaderClient } from "./header-client";
const client = getHeaderClient();
const themeManager = client?.getThemeManager();
```

## Intégration dans Astro

### Remplacement du Script Inline

**Avant (script inline ~130 lignes) :**

```astro
<script is:inline>
  (() => {
    // 130+ lignes de JavaScript inline
  })();
</script>
```

**Après (import modulaire) :**

```astro
<script>
  import "./header-client";
</script>
```

### Avantages de la Refactorisation

1. **🏗️ Maintenabilité**

   - Code organisé par responsabilité
   - Modules indépendants et testables
   - API publique claire pour chaque module

2. **📝 TypeScript**

   - Typage strict pour toutes les interactions DOM
   - IntelliSense et autocomplétion
   - Détection d'erreurs à la compilation

3. **⚡ Performances**

   - Tree-shaking automatique par Vite
   - Cache navigateur pour les modules
   - Chargement asynchrone des modules

4. **🧪 Testabilité**

   - Modules isolés facilement mockables
   - API publique testable unitairement
   - Séparation des responsabilités

5. **🔧 Réutilisabilité**
   - Modules réutilisables dans d'autres composants
   - Configuration flexible via constructeurs
   - Extensibilité via héritage de classes

## Optimisations Build

### Bundle Size

- **Before** : ~130 lignes de script inline répété sur chaque page
- **After** : Module externe de 5.88 kB (gzipped: 1.67 kB) mis en cache

### Performance Metrics

```
📊 JS Bundle - Total: 5876B (Max: 20480B)
📊 Inline Scripts: 0 (Max: 5)
🎯 Gzipped: 1.67 kB
```

### Optimisations Astro

- Modules ES6 natifs (non-bloquants)
- Préloading automatique par Astro
- Tree-shaking des imports inutilisés
- Cache navigateur optimal

## Compatibilité

### Browsers Support

- ES6 Modules (tous navigateurs modernes)
- TypeScript compilé vers ES2020
- Support des classes et async/await

### Astro Integration

- Compatible Astro v5.8+
- Fonctionne avec le SSR et SSG
- Support des directives client:\* si nécessaire

## Debugging

### Console Logs

```javascript
// Production : messages de succès
Header client initialized successfully

// Développement : warnings détaillés
Mobile menu elements not found
No dropdown buttons found
No header elements found with class .header-critical
```

### Debug en Développement

```typescript
import { getHeaderClient } from "./header-client";

// Accès aux managers pour debugging
const client = getHeaderClient();
console.log("Theme:", client?.getThemeManager()?.getCurrentTheme());
console.log("Menu Open:", client?.getMobileMenuManager()?.getIsOpen());
console.log("Scrolled:", client?.getScrollEffectsManager()?.isScrolled());
```

## Migration et Rétrocompatibilité

La refactorisation maintient 100% de compatibilité fonctionnelle :

- ✅ Tous les sélecteurs CSS restent identiques
- ✅ Tous les attributs data-\* restent identiques
- ✅ Tous les tests E2E passent sans modification
- ✅ API publique disponible pour extensions futures

## Tests

### Coverage

- Tests unitaires : `src/test/header.test.ts` (16 tests)
- Tests d'intégration : `src/test/integration/` (38 tests)
- Tests E2E : `cypress/e2e/header-navigation.cy.js` (26 tests)
- Tests de build : `src/test/build-static.test.ts` (14 tests)

**Total : 94 tests couvrant toutes les fonctionnalités**

### Commandes de Test

```bash
# Tests header spécifiques
pnpm test src/test/header.test.ts

# Tests E2E header
pnpm test:e2e --spec cypress/e2e/header-navigation.cy.js

# Tous les tests
pnpm test
```
