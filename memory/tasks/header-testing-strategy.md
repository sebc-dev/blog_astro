# Stratégie de Test - Composant Header.astro

## Vue d'ensemble du composant

Le composant `Header.astro` est un composant critique d'un **site statique** qui combine :

- Navigation responsive (desktop/mobile) générée au build-time
- Internationalisation (i18n) avec URLs statiques multilingues
- Theme toggle (dark/light mode) via JavaScript minimal côté client
- Optimisations de performance statique (CSS critique inline, preload)
- Interactions JavaScript minimales (<3KB selon les règles d'optimisation)

## Architecture de Test Recommandée

### Principe de Test pour Sites Statiques Astro

Le composant `Header.astro` est **pré-généré au build-time** avec interactions JavaScript minimales côté client, nécessitant une approche de test adaptée aux sites statiques :

1. **Build-time Logic** → Tests Unitaires (Transformation des données)
2. **Static HTML Generation** → Tests de Build/Génération
3. **Client-side Interactions** → Tests End-to-End (JavaScript minimal)

---

## ✅ TESTS UNITAIRES (PHASE 1 TERMINÉE)

### 1. Fonctions Utilitaires i18n

**Fichiers testés** : `src/i18n/utils.ts` via `src/test/i18n.test.ts`

#### Tests completés :

- [x] ✅ `getLangFromUrl()` - Extraction correcte de la langue depuis l'URL (4 tests)
- [x] ✅ `useTranslations()` - Récupération des traductions par clé avec fallback (5 tests)
- [x] ✅ `useTranslatedPath()` - Génération des chemins traduits (5 tests)
- [x] ✅ `getPathWithoutLang()` - Suppression du préfixe de langue (4 tests)

**Note** : Tests utilitaires i18n dans `i18n.test.ts` pour éviter duplication avec Header

```typescript
// Exemples de tests unitaires
describe("i18n utils", () => {
  test("getLangFromUrl returns correct language", () => {
    expect(getLangFromUrl(new URL("https://site.com/fr/about"))).toBe("fr");
    expect(getLangFromUrl(new URL("https://site.com/about"))).toBe("en");
  });

  test("useTranslatedPath generates correct paths", () => {
    const translatePath = useTranslatedPath("fr");
    expect(translatePath("/about")).toBe("/fr/about");
  });
});
```

### 2. Logique de Transformation des Données Header

**Fichier** : `src/test/header.test.ts` - Tests spécifiques au composant Header

#### Tests completés :

- [x] ✅ **Navigation Links Mapping** - Transformation `navLinks` avec traductions (4 tests)
  - Mapping liens anglais/français avec traductions correctes
  - Détection état actif des liens de navigation
  - Intégration complète utilitaires i18n
- [x] ✅ **Language URLs Generation** - Génération URLs avec métadonnées (4 tests)
  - URLs correctes pour chaque langue (en/fr)
  - Gestion page d'accueil et chemins complexes
  - Validation structure complète (url, isActive, label, flag)
- [x] ✅ **CSS Critical Generation** - Génération CSS critique < 1KB (5 tests)
  - CSS valide avec styles responsive et dark mode
  - Validation seuil performance 1KB
  - États visuels complets (.header-critical, .scrolled)

```typescript
describe("Header data transformations", () => {
  test("translatedNavLinks maps correctly", () => {
    const result = mapNavLinks(navLinks, lang, translatePath, currentUrl);
    expect(result[0]).toHaveProperty("href", "/fr/about");
    expect(result[0]).toHaveProperty("label", "À propos");
    expect(result[0]).toHaveProperty("isActive", true);
  });
});
```

### 3. Refactorisation et Optimisation

**Accomplissements** : Évitement des doublons et optimisation des tests

#### Actions réalisées :

- [x] ✅ **Analyse des doublons** - Identification redondances avec `i18n.test.ts`
- [x] ✅ **Refactorisation tests** - Suppression 10 tests dupliqués
- [x] ✅ **Tests focalisés** - 13 tests Header spécifiques vs 23 initiaux
- [x] ✅ **Couverture maintenue** - 86.98% globale, 100% i18n sans perte

```typescript
describe("Critical CSS generation", () => {
  test("generates valid CSS under 1KB", () => {
    const css = generateCriticalCSS();
    expect(css.length).toBeLessThan(1024);
    expect(css).toContain(".header-critical");
  });
});
```

---

## 🏗️ TESTS DE BUILD/GÉNÉRATION STATIQUE

### 1. Génération HTML Statique

**Scope** : Fichiers HTML générés par Astro build

#### Tests prioritaires :

- [ ] **Multi-page Generation** - Pages générées pour chaque langue (/, /fr/)
- [ ] **HTML Structure** - Structure HTML correcte dans chaque page générée
- [ ] **Navigation Links** - Liens de navigation corrects dans HTML statique
- [ ] **Language-specific Content** - Contenu traduit présent dans chaque version

```typescript
describe("Static HTML generation", () => {
  test("generates correct pages for each language", async () => {
    const enHTML = await fs.readFile("dist/index.html", "utf-8");
    const frHTML = await fs.readFile("dist/fr/index.html", "utf-8");

    expect(enHTML).toContain("English");
    expect(frHTML).toContain("Français");
  });

  test("includes navigation in static HTML", async () => {
    const html = await fs.readFile("dist/index.html", "utf-8");
    expect(html).toContain("<nav");
    expect(html).toContain("aria-label");
  });
});
```

### 2. Build-time i18n Processing

**Scope** : Traitement des traductions au moment du build

#### Tests prioritaires :

- [ ] **Translation Resolution** - Toutes les clés traduites dans chaque langue
- [ ] **URL Path Generation** - URLs multilingues générées correctement
- [ ] **Fallback Handling** - Gestion des traductions manquantes au build
- [ ] **Hreflang Generation** - Links SEO multilingues dans chaque page

### 3. Asset Optimization

**Scope** : Optimisation des ressources statiques

#### Tests prioritaires :

- [ ] **CSS Critical Inline** - CSS critique intégré dans HTML
- [ ] **JavaScript Bundle Size** - Bundle JS < 3KB dans build final
- [ ] **Preload Links** - Liens de preload générés dans HTML
- [ ] **Static Asset Paths** - Chemins d'assets corrects post-build

```typescript
describe("Asset optimization", () => {
  test("CSS is inlined and under 1KB", async () => {
    const html = await fs.readFile("dist/index.html", "utf-8");
    const inlineCSS = html.match(/<style is:inline>(.*?)<\/style>/s)?.[1];

    expect(inlineCSS).toBeDefined();
    expect(inlineCSS!.length).toBeLessThan(1024);
  });

  test("JavaScript bundle is under 3KB", async () => {
    const jsFiles = await glob("dist/**/*.js");
    const totalSize = jsFiles.reduce((acc, file) => {
      return acc + fs.statSync(file).size;
    }, 0);

    expect(totalSize).toBeLessThan(3 * 1024);
  });
});
```

### 4. SEO et Performance Statique

**Scope** : Éléments SEO et performance dans HTML généré

#### Tests prioritaires :

- [ ] **Meta Tags** - Meta tags corrects dans chaque page
- [ ] **Structured Data** - Données structurées générées
- [ ] **Accessibility Attributes** - Attributs d'accessibilité complets
- [ ] **Performance Hints** - Hints de performance (preload, prefetch)

---

## 🌐 TESTS END-TO-END (Site Statique)

### 1. Navigation Statique

**Scope** : Navigation entre pages statiques pré-générées

#### Tests prioritaires :

- [ ] **Static Page Navigation** - Navigation entre pages statiques
- [ ] **Mobile Menu Interaction** - Menu hamburger et navigation mobile
- [ ] **Logo Navigation** - Retour à l'accueil via logo statique
- [ ] **Active State Detection** - Mise en évidence de la page active

```typescript
describe("Static Navigation E2E", () => {
  test("navigates between static pages", async ({ page }) => {
    await page.goto("/");
    await page.click("text=About");
    expect(page.url()).toContain("/about");

    // Vérifier que la page statique s'est chargée
    await page.waitForLoadState("networkidle");
    expect(page.locator('.nav-link[aria-current="page"]')).toContainText(
      "About",
    );
  });
});
```

### 2. Changement de Langue Statique

**Scope** : Navigation entre versions linguistiques statiques

#### Tests prioritaires :

- [ ] **Language Dropdown** - Ouverture/fermeture du sélecteur
- [ ] **Static Language Switch** - Navigation vers pages statiques traduites
- [ ] **URL Structure** - URLs multilingues statiques correctes
- [ ] **Content Translation** - Contenu traduit dans pages statiques

```typescript
describe("Static Language switching E2E", () => {
  test("navigates to static translated pages", async ({ page }) => {
    await page.goto("/about");
    await page.click('[data-dropdown="lang-desktop"]');
    await page.click("text=Français");

    // Navigation vers page statique française
    expect(page.url()).toContain("/fr/about");
    await page.waitForLoadState("networkidle");

    // Vérifier le contenu statique traduit
    expect(page.locator("nav")).toContainText("Accueil");
  });
});
```

### 3. Theme Toggle

**Scope** : Changement de thème dark/light

#### Tests prioritaires :

- [ ] **Theme Toggle Desktop** - Bouton theme toggle sur desktop
- [ ] **Theme Toggle Mobile** - Bouton theme toggle sur mobile
- [ ] **Theme Persistence** - Persistance du thème choisi
- [ ] **Sync Between Toggles** - Synchronisation desktop/mobile

### 4. Menu Mobile

**Scope** : Interactions spécifiques au mobile

#### Tests prioritaires :

- [ ] **Menu Open/Close** - Ouverture/fermeture du menu hamburger
- [ ] **Menu Navigation** - Navigation via le menu mobile
- [ ] **Overlay Interaction** - Fermeture via overlay
- [ ] **Escape Key** - Fermeture via touche Escape

```typescript
describe("Mobile menu E2E", () => {
  test("opens and closes mobile menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await page.click("#mobile-menu-toggle");
    expect(page.locator("#mobile-menu")).toBeVisible();

    await page.press("body", "Escape");
    expect(page.locator("#mobile-menu")).toBeHidden();
  });
});
```

### 5. Accessibilité Dynamique

**Scope** : Accessibilité clavier et lecteurs d'écran

#### Tests prioritaires :

- [ ] **Keyboard Navigation** - Navigation complète au clavier
- [ ] **Focus Management** - Gestion du focus lors des interactions
- [ ] **Screen Reader** - Annonces correctes pour lecteurs d'écran
- [ ] **ARIA Live Regions** - Mise à jour des régions live

### 6. Performance Site Statique

**Scope** : Métriques de performance pour site statique

#### Tests prioritaires :

- [ ] **Static Site Loading** - Chargement ultra-rapide des pages statiques
- [ ] **JavaScript Bundle** - < 3KB total (selon règles)
- [ ] **CSS Critical** - < 1KB inline (selon règles)
- [ ] **Lighthouse Score** - Performance 98+, Accessibility 100 (sites statiques)

```typescript
describe("Static Site Performance E2E", () => {
  test("static pages load under performance thresholds", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    // Sites statiques doivent être très rapides
    expect(loadTime).toBeLessThan(500); // < 500ms pour page statique

    // Vérifier l'absence de JavaScript inutile
    const jsFiles = await page.evaluate(() =>
      Array.from(document.scripts).map((s) => s.src),
    );
    expect(jsFiles.length).toBeLessThan(3); // Minimal JS pour site statique
  });
});
```

---

## 🎯 PLAN D'IMPLÉMENTATION

### ✅ Phase 1 : Tests Unitaires (TERMINÉE)

**Durée réelle** : 1 jour

- [x] ✅ Setup environnement de test Vitest avec seuils de couverture
- [x] ✅ Tests spécifiques Header (évitement doublons avec i18n.test.ts)
- [x] ✅ Tests transformation des données de navigation
- [x] ✅ Tests CSS critique generation < 1KB
- [x] ✅ Tests génération URLs de langue avec métadonnées

**📊 Résultats obtenus** :

- **13 tests Header spécifiques** (sans doublons i18n)
- **70 tests totaux** dans le projet
- **86.98% couverture globale** ✅
- **100% couverture utilitaires i18n** ✅
- **CSS critique validé < 1KB** ✅
- **Aucune régression** ✅

### ✅ Phase 2 : Tests de Build Statique - Étape 1 (TERMINÉE)

**Durée réelle** : 1 jour

- [x] ✅ Setup tests post-build (`src/test/build-static.test.ts`)
- [x] ✅ Configuration multilingue corrigée (page FR + MainLayout dynamique)
- [x] ✅ Tests génération HTML multilingue (6 tests validés)
- [x] ✅ Tests traitement i18n au build-time
- [x] ✅ Validation structure HTML et navigation statique

**📊 Résultats Étape 1** :

- **6 tests build statique** validés ✅
- **Génération multilingue** : `/index.html` + `/fr/index.html` ✅
- **Structure HTML correcte** dans les deux langues ✅
- **Navigation i18n statique** fonctionnelle ✅
- **URLs multilingues** selon config Astro ✅
- **Liens hreflang SEO** générés automatiquement ✅

**📊 Résultats Étape 2** :

- **8 tests optimisation assets** validés ✅
- **CSS critique inline** : **668B** ✅ (< 1KB seuil)
- **Bundle JavaScript** : **0B** ✅ (site statique optimal)
- **Liens prefetch/preload** : Présents et fonctionnels ✅
- **Meta tags optimisés** : `viewport`, `charset`, `generator`, SVG favicon ✅
- **HTML optimisé** : **31KB** ✅ (< 50KB seuil)
- **Performance globale** : Tous seuils respectés ✅

### ✅ Phase 2 - Étape 2 : Optimisation Assets (TERMINÉE)

**Durée réelle** : 1 jour

- [x] ✅ Tests optimisation CSS critique inline
- [x] ✅ Tests taille bundle JavaScript < 3KB
- [x] ✅ Tests preload/prefetch links et performance assets
- [x] ✅ Tests conformité métriques selon règles Astro statique

### Phase 3 : Tests E2E Sites Statiques (Priorité Moyenne)

**Durée estimée** : 2-3 jours

- [ ] Setup Cypress pour site statique
- [ ] Tests navigation entre pages statiques
- [ ] Tests interactions JavaScript minimales
- [ ] Tests performance site statique

### Phase 4 : CI/CD Statique (Priorité Basse)

**Durée estimée** : 1 jour

- [ ] Intégration build + tests dans CI
- [ ] Validation performance sites statiques
- [ ] Tests de régression sur build
- [ ] Déploiement automatisé site statique

---

## 📊 MÉTRIQUES DE SUCCÈS

### ✅ Couverture de Code (ATTEINTE)

- **Utilitaires i18n** : 100% ✅ _(47 tests dans i18n.test.ts)_
- **Logique Header** : 100% ✅ _(13 tests spécifiques)_
- **Global projet** : 86.98% ✅ _(> seuil 80%)_

### ✅ Performance (Selon règles d'optimisation - VALIDÉE)

- **CSS critique Header** : < 1KB ✅ _(validé via tests)_
- **Tests optimisés** : 13 vs 23 initiaux ✅ _(43% réduction doublons)_
- **Couverture maintenue** : 86.98% ✅ _(aucune perte)_

### Accessibilité

- **WCAG 2.1 AA** : Conformité complète
- **Tests clavier** : 100% des interactions
- **Lecteurs d'écran** : Support complet

---

## 🔧 CONFIGURATION TECHNIQUE

### Vitest (Tests Unitaires + Build)

```typescript
// vitest.config.ts - Adapté pour site statique
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      reporter: ["text", "html"],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    // Tests post-build pour sites statiques
    testTimeout: 10000, // Plus de temps pour tests de build
  },
});
```

### Cypress (Tests E2E Site Statique)

```typescript
// cypress.config.js - Optimisé pour site statique
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4321", // Serveur de preview statique
    supportFile: "cypress/support/e2e.ts",
    video: false,
    screenshotOnRunFailure: true,
    // Configuration spéciale pour sites statiques
    waitForAnimations: false,
    animationDistanceThreshold: 0,
    defaultCommandTimeout: 3000, // Plus court pour sites statiques
  },
});
```

### Configuration Build Testing

```typescript
// tests/build.config.ts - Tests post-build
export default {
  buildDir: "dist",
  languages: ["en", "fr"],
  maxBundleSize: 3 * 1024, // 3KB max JS
  maxCSSSize: 1 * 1024, // 1KB max CSS critique
  requiredPages: ["/", "/about", "/fr/", "/fr/about"],
};
```

---

## 📝 NOTES ET CONSIDÉRATIONS

### Spécificités Site Statique Astro

- **Génération statique** : Toute la logique traitée au build-time
- **Island Architecture** : JavaScript minimal pour interactivité uniquement
- **Build-time Processing** : 95% de la logique testée via tests de build
- **Pré-génération multilingue** : URLs et contenu générés pour chaque langue

### Contraintes Performance Site Statique

- Respecter les règles d'optimisation : CSS < 1KB, JS < 3KB
- Tests de build automatisés pour validation taille bundles
- Performance sites statiques : chargement < 500ms
- Validation Lighthouse automatisée sur pages statiques

### Accessibilité Statique

- Tests d'accessibilité sur HTML généré statiquement
- Validation WCAG 2.1 AA dans build final
- Attributs ARIA pré-générés au build-time
- Tests de navigation clavier sur site statique

---

**Statut** : ✅ Phase 1 TERMINÉE - ✅ Phase 2 TERMINÉE (Étapes 1&2) - Phase 3 PRÊTE
**Dernière mise à jour** : Décembre 2024
**Responsable** : Équipe de développement

---

## 🎉 BILAN PHASE 1 (TERMINÉE)

### ✅ Accomplissements

- **13 tests Header spécifiques** créés et validés
- **70 tests totaux** dans le projet (aucune régression)
- **86.98% couverture globale** maintenue
- **100% couverture utilitaires i18n**
- **Refactorisation réussie** : suppression 10 doublons
- **CSS critique < 1KB** validé automatiquement
- **Pipeline de tests optimisé** et prêt pour CI/CD

### 📈 Métriques Atteintes

- Seuils de couverture : **80%** → **86.98%** ✅
- Tests focalisés : **23** → **13** (mais plus pertinents)
- Performance validée : CSS Header < 1KB ✅
- Aucune perte de couverture lors refactorisation ✅

---

## 🎉 BILAN PHASE 2 - ÉTAPE 1 (TERMINÉE)

### ✅ Accomplissements

- **Fichier de tests créé** : `src/test/build-static.test.ts`
- **Configuration i18n corrigée** : Page française + MainLayout dynamique
- **6 tests build statique validés** : Génération HTML + traitement i18n
- **Génération multilingue fonctionnelle** : Build produit `/index.html` + `/fr/index.html`
- **Structure HTML statique conforme** : Navigation, ARIA, hreflang automatiques
- **Problème résolu** : Astro génère maintenant les deux versions linguistiques

### 📈 Métriques Atteintes Étape 1

- Tests de build : **6/6 validés** ✅
- Génération multilingue : **Fonctionnelle** ✅
- Structure HTML : **Conforme dans les 2 langues** ✅
- URLs i18n : **Selon config Astro** (`/` + `/fr/`) ✅
- Liens hreflang SEO : **Générés automatiquement** ✅
- Navigation statique : **Traduite et fonctionnelle** ✅

### 🚀 Prêt pour Phase 3

La Phase 2 (complète) étant terminée avec succès, nous passons maintenant à la **Phase 3 : Tests E2E Sites Statiques** qui se concentrera sur les tests end-to-end des interactions utilisateur sur le site statique généré.

---

## 📌 RÉSUMÉ ADAPTÉ SITE STATIQUE

### Changements Principaux vs Site Dynamique :

1. **Tests de Build** remplacent Tests d'Intégration classiques

   - Focus sur génération HTML statique multilingue
   - Validation des assets optimisés post-build
   - Tests de structure et SEO dans fichiers générés

2. **Tests E2E simplifiés** pour site statique

   - Navigation entre pages pré-générées
   - Interactions JavaScript minimales uniquement
   - Performance ultra-rapide attendue (< 500ms)

3. **Pipeline CI/CD orienté build statique**
   - Build → Tests post-build → Déploiement
   - Validation automatique des seuils de performance
   - Tests de régression sur génération statique

### Avantages Site Statique pour les Tests :

- **Performance prévisible** : Pas de variabilité serveur
- **Tests plus rapides** : HTML pré-généré, pas de rendu dynamique
- **Fiabilité accrue** : Moins de points de défaillance
- **Debugging simplifié** : Analyse directe des fichiers générés
