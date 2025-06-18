# Convention des Sélecteurs Data-Cy

Ce document décrit les conventions utilisées pour les sélecteurs `data-cy` dans les tests E2E Cypress de ce projet.

## Philosophie

Les sélecteurs `data-cy` offrent plusieurs avantages par rapport aux sélecteurs CSS classiques :
- **Stabilité** : Indépendants des changements de styles et classes CSS
- **Performance** : Plus rapides que les sélecteurs complexes
- **Lisibilité** : Intention claire dans les tests
- **Maintenance** : Plus facile à maintenir lors des refactorings

## Convention de Nommage

### Format Général
```
data-cy="element-type-context-modifier"
```

### Éléments Principaux de Layout

| Sélecteur | Description |
|-----------|-------------|
| `app-body` | Body principal de l'application |
| `grid-background` | Grille de fond décorative |
| `main-content` | Contenu principal de la page |

### Header et Navigation

#### Desktop
| Sélecteur | Description |
|-----------|-------------|
| `header-desktop` | Header desktop |
| `navbar-desktop` | Barre de navigation desktop |
| `logo-desktop` | Logo en version desktop |
| `nav-desktop` | Navigation principale desktop |
| `nav-links-desktop` | Container des liens de navigation desktop |
| `nav-link-{path}` | Lien de navigation spécifique (ex: `nav-link-articles`) |
| `controls-desktop` | Zone des contrôles (langue, thème) desktop |
| `language-selector-desktop` | Sélecteur de langue desktop |
| `language-toggle-desktop` | Bouton toggle de langue desktop |
| `language-menu-desktop` | Menu déroulant des langues desktop |
| `language-option-{lang}-desktop` | Option de langue spécifique (ex: `language-option-fr-desktop`) |
| `theme-toggle-desktop` | Bouton de basculement de thème desktop |

#### Mobile
| Sélecteur | Description |
|-----------|-------------|
| `header-mobile` | Header mobile |
| `navbar-mobile` | Barre de navigation mobile |
| `logo-mobile` | Logo en version mobile |
| `menu-toggle-mobile` | Bouton d'ouverture du menu mobile |
| `mobile-menu` | Menu mobile complet |
| `mobile-menu-overlay` | Overlay sombre du menu mobile |
| `mobile-menu-content` | Contenu du menu mobile |
| `nav-mobile` | Navigation principale mobile |
| `nav-links-mobile` | Container des liens de navigation mobile |
| `nav-link-{path}-mobile` | Lien de navigation mobile spécifique |
| `controls-mobile` | Zone des contrôles mobile |
| `language-selector-mobile` | Sélecteur de langue mobile |
| `language-options-mobile` | Container des options de langue mobile |
| `language-option-{lang}-mobile` | Option de langue mobile spécifique |
| `theme-selector-mobile` | Container du sélecteur de thème mobile |
| `theme-toggle-mobile` | Bouton de thème mobile |

### Articles et Contenu

#### Section Articles
| Sélecteur | Description |
|-----------|-------------|
| `latest-articles-section` | Section des derniers articles |
| `articles-container` | Container principal des articles |
| `articles-layout` | Layout des articles |
| `hero-section` | Section de l'article héro |
| `grid-section-desktop` | Grille d'articles desktop |
| `grid-section-mobile` | Grille d'articles mobile |
| `articles-grid-desktop` | Grille d'articles desktop |
| `articles-grid-mobile` | Grille d'articles mobile |
| `no-articles` | Message quand aucun article |
| `view-all-section` | Section "voir tous les articles" |
| `view-all-button` | Bouton "voir tous les articles" |

#### Article Card
| Sélecteur | Description |
|-----------|-------------|
| `article-card` | Carte d'article (avec `data-article-slug="{slug}"`) |
| `article-image` | Image de l'article |
| `article-content` | Contenu de la carte |
| `article-metadata` | Métadonnées (catégorie, tag, date) |
| `article-category` | Badge de catégorie |
| `article-tag` | Badge de tag |
| `article-date` | Date de publication |
| `article-title` | Titre de l'article |
| `article-title-link` | Lien du titre |
| `article-description` | Description/extrait |
| `article-footer` | Footer de la carte |
| `article-reading-time` | Temps de lecture |
| `article-read-button` | Bouton "lire" |

#### Article Hero
| Sélecteur | Description |
|-----------|-------------|
| `article-hero` | Article en format héro (avec `data-article-slug="{slug}"`) |
| `hero-image` | Image du héro |
| `hero-content` | Contenu du héro |
| `hero-metadata` | Métadonnées du héro |
| `hero-category` | Catégorie du héro |
| `hero-tag` | Tag du héro |
| `hero-date` | Date du héro |
| `hero-title` | Titre du héro |
| `hero-title-link` | Lien du titre héro |
| `hero-description` | Description du héro |
| `hero-footer` | Footer du héro |
| `hero-author-info` | Informations auteur |
| `hero-author` | Nom de l'auteur |
| `hero-reading-time` | Temps de lecture héro |
| `hero-read-button` | Bouton "lire plus" héro |

## Utilisation dans les Tests

### Sélection Simple
```javascript
cy.get('[data-cy="header-desktop"]').should('be.visible');
```

### Sélection avec Attribut Spécifique
```javascript
cy.get('[data-cy="article-card"][data-article-slug="mon-article"]');
```

### Sélection par Préfixe
```javascript
cy.get('[data-cy^="nav-link-"]'); // Tous les liens de navigation
cy.get('[data-cy^="language-option-"]'); // Toutes les options de langue
```

### Dans un Contexte Spécifique
```javascript
cy.get('[data-cy="article-card"]').first().within(() => {
  cy.get('[data-cy="article-title"]').should('be.visible');
  cy.get('[data-cy="article-read-button"]').click();
});
```

## Bonnes Pratiques

### ✅ À Faire
- Utiliser des noms descriptifs et cohérents
- Préfixer par le type d'élément (`article-`, `nav-`, `theme-`)
- Inclure le contexte (`-desktop`, `-mobile`)
- Utiliser des tirets pour séparer les mots
- Ajouter des attributs de données supplémentaires quand pertinent (`data-article-slug`)

### ❌ À Éviter
- Utiliser des sélecteurs CSS de classes ou d'IDs dans les tests E2E
- Créer des sélecteurs trop spécifiques
- Utiliser des underscores (`_`) au lieu de tirets (`-`)
- Oublier le contexte responsive (`-desktop` vs `-mobile`)

## Maintenance

### Ajout de Nouveaux Sélecteurs
1. Suivre la convention de nommage
2. Ajouter la documentation dans ce fichier
3. Mettre à jour les tests correspondants
4. Vérifier la cohérence avec les sélecteurs existants

### Modification de Sélecteurs Existants
1. Mettre à jour tous les tests utilisant l'ancien sélecteur
2. Mettre à jour cette documentation
3. Tester l'ensemble de la suite E2E

## Tests Couverts

### Tests Responsives
- `article-responsive.cy.js` - Tests de comportement responsive des articles
- `grid-background.cy.js` - Tests de la grille de fond
- `header-navigation.cy.js` - Tests de navigation et header

### Couverture
- ✅ Layout principal (body, main, grid-background)
- ✅ Header desktop/mobile complet
- ✅ Navigation et contrôles
- ✅ Articles (cards et hero)
- ✅ Sections d'articles
- ✅ Métadonnées et interactions

## Scripts Utiles

### Recherche de Sélecteurs
```bash
# Trouver tous les data-cy dans les composants
grep -r "data-cy" src/components/

# Trouver tous les data-cy dans les tests
grep -r "data-cy" cypress/e2e/
```

### Vérification de Cohérence
```bash
# Vérifier que tous les sélecteurs utilisés dans les tests existent dans les composants
# (script personnalisé recommandé)
``` 