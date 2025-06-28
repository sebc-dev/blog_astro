# Header Component - Architecture Générique

## 🏗️ Vue d'ensemble

Le composant Header utilise maintenant une **architecture modulaire et extensible** pour gérer la détection de pages et le changement de langue. Cette architecture permet d'ajouter facilement de nouveaux types de pages sans modifier le code existant.

## 📁 Structure des Dossiers

```
src/components/header/
├── page-detectors/           # Détecteurs de pages modulaires
│   ├── types.ts             # Types et interfaces communes
│   ├── article-detector.ts  # Détecteur pour les articles
│   ├── category-detector.ts # Détecteur pour les catégories
│   └── normal-detector.ts   # Détecteur fallback pour pages normales
├── page-mappers/            # Mappers d'URLs par type de page
│   ├── article-mapper.ts    # Mapping URLs articles
│   ├── category-mapper.ts   # Mapping URLs catégories
│   └── normal-mapper.ts     # Mapping URLs pages normales
├── page-utils.ts            # Orchestrateur principal
├── article-utils.ts         # Fonctions de compatibilité (deprecated)
├── Header.astro             # Composant principal
└── README.md               # Cette documentation
```

## 🔧 Fonctionnement

### 1. Système de Détection de Pages

Le système utilise le **pattern Strategy** pour détecter le type de page :

```typescript
// Chaque détecteur implémente PageDetector
interface PageDetector {
  isPageType(url: URL): boolean;        // Détecte le type
  extractPageInfo(url: URL): PageInfo;  // Extrait les infos
  detectLanguage(url: URL): Languages;  // Détecte la langue
  readonly pageType: PageType;          // Type géré
}
```

### 2. Système de Mapping d'URLs

Chaque type de page a son propre mapper :

```typescript
interface UrlMapper {
  readonly pageType: PageType;
  createUrlMapping(pageInfo: PageInfo): Record<string, string> | null;
}
```

### 3. Gestionnaire Principal

Le `PageDetectionManager` orchestre les détecteurs et mappers :

```typescript
const pageDetectionManager = new PageDetectionManager();

// Détection automatique
const detection = pageDetectionManager.detectPage(url);

// Génération du mapping
const urlMapping = pageDetectionManager.createUrlMapping(pageInfo);
```

## 🚀 Utilisation

### Pour les Développeurs Header

```typescript
import { pageDetectionManager } from './page-utils';

// Dans Header.astro
const detection = pageDetectionManager.detectPage(url);
const urlMapping = pageDetectionManager.createUrlMapping(detection.pageInfo);
```

### Compatibilité avec l'Ancien Système

Les fonctions existantes restent disponibles mais sont **deprecated** :

```typescript
// ❌ Ancien système (deprecated)
const isArticle = isArticlePage(url);
const isCategory = isCategoryPage(url);

// ✅ Nouveau système (recommandé)
const detection = pageDetectionManager.detectPage(url);
const isArticle = detection.pageType === "article";
const isCategory = detection.pageType === "category";
```

## 🔥 Avantages de la Nouvelle Architecture

### ✅ **Extensibilité**
- Ajout de nouveaux types de pages en créant un détecteur + mapper
- Aucune modification du code existant nécessaire
- Architecture prête pour les pages produits, utilisateurs, etc.

### ✅ **Maintenabilité**
- Séparation claire des responsabilités
- Code modulaire et testable
- Interface commune pour tous les types

### ✅ **Performance**
- Détection optimisée avec arrêt au premier match
- Pas de regex complexes répétées
- Cache possible au niveau du gestionnaire

### ✅ **Robustesse**
- Système de fallback intégré
- Gestion d'erreurs centralisée
- Types TypeScript stricts

## 🆕 Ajouter un Nouveau Type de Page

### Étape 1 : Créer le Détecteur

```typescript
// src/components/header/page-detectors/product-detector.ts
export class ProductDetector implements PageDetector {
  readonly pageType: PageType = "product";
  
  isPageType(url: URL): boolean {
    return url.pathname.startsWith("/product/");
  }
  
  extractPageInfo(url: URL): PageInfo | null {
    // Logique d'extraction spécifique
  }
  
  detectLanguage(url: URL): Languages | null {
    // Logique de détection de langue
  }
}
```

### Étape 2 : Créer le Mapper

```typescript
// src/components/header/page-mappers/product-mapper.ts
export class ProductMapper implements UrlMapper {
  readonly pageType: PageType = "product";
  
  createUrlMapping(pageInfo: PageInfo): Record<string, string> | null {
    // Logique de mapping spécifique
  }
}
```

### Étape 3 : Enregistrer dans le Gestionnaire

```typescript
// src/components/header/page-utils.ts
constructor() {
  this.detectors = [
    new ArticleDetector(),
    new CategoryDetector(),
    new ProductDetector(), // ← Nouveau détecteur
    new NormalDetector(),
  ];

  this.mappers = new Map([
    ["article", new ArticleMapper()],
    ["category", new CategoryMapper()],
    ["product", new ProductMapper()], // ← Nouveau mapper
    ["normal", new NormalMapper()],
  ]);
}
```

### Étape 4 : Mettre à Jour les Types

```typescript
// src/components/header/page-detectors/types.ts
export type PageType = "article" | "category" | "product" | "normal";
```

## 🧪 Tests

### Structure de Tests Recommandée

```typescript
describe("ProductDetector", () => {
  it("should detect product pages", () => {
    const detector = new ProductDetector();
    const url = new URL("http://localhost/product/laptop-gaming");
    expect(detector.isPageType(url)).toBe(true);
  });
});

describe("ProductMapper", () => {
  it("should create correct URL mapping", () => {
    const mapper = new ProductMapper();
    const pageInfo = { pageType: "product", productSlug: "laptop" };
    const mapping = mapper.createUrlMapping(pageInfo);
    expect(mapping.en).toBe("/product/laptop");
    expect(mapping.fr).toBe("/fr/produit/laptop");
  });
});
```

## 🔄 Migration depuis l'Ancien Système

### Remplacement Progressif

1. **Phase 1** : Nouveau système en parallèle (✅ **Terminé**)
2. **Phase 2** : Marquage des anciennes fonctions comme deprecated (✅ **Terminé**)
3. **Phase 3** : Migration progressive des utilisateurs
4. **Phase 4** : Suppression de l'ancien système

### Guide de Migration

```typescript
// Avant
const context = analyzeLanguageContextPure(url, allPosts);
if (context.isArticlePage) {
  // logique article
} else if (context.isCategoryPage) {
  // logique catégorie
}

// Après
const detection = pageDetectionManager.detectPage(url);
switch (detection.pageType) {
  case "article":
    // logique article
    break;
  case "category":
    // logique catégorie
    break;
  default:
    // logique normale
}
```

## 📋 Checklist pour Nouveaux Types

- [ ] Créer le détecteur avec tests unitaires
- [ ] Créer le mapper avec tests unitaires  
- [ ] Ajouter le type dans `PageType`
- [ ] Enregistrer dans `PageDetectionManager`
- [ ] Ajouter tests d'intégration
- [ ] Ajouter tests end-to-end si nécessaire
- [ ] Mettre à jour cette documentation

## 🔗 Liens Utiles

- [Types et Interfaces](./page-detectors/types.ts)
- [Gestionnaire Principal](./page-utils.ts)
- [Tests d'Exemple](../../test/components/header-article-utils.test.ts)
- [Tests E2E](../../../cypress/e2e/category-page.cy.js)
