# Couverture de Tests - Module Header

## Value Objects (`value-objects.ts`)

### Language

- `constructor` - Validation du code de langue
- `fromString` - Conversion string vers Language
- `getCode` - Récupération du code
- `getDisplayText` - Formatage du texte d'affichage
- `isFrench/isEnglish` - Vérification de la langue
- `equals` - Comparaison d'instances

### ElementId & CssSelector

- `constructor` - Validation des valeurs vides
- `getValue` - Récupération de la valeur
- `equals` - Comparaison d'instances

## Utilitaires DOM (`dom.ts`)

### Méthodes Critiques

- `getElementById` - Récupération typée d'éléments
- `querySelectorAll` - Sélection multiple typée
- `addClass/removeClass` - Manipulation des classes
- `toggleClass` - Bascule de classes avec force
- `hasClass` - Vérification de présence de classe
- `setBodyOverflow` - Contrôle du débordement

## Collections DOM (`dom-collections.ts`)

### ClickableElements

- `bindClickHandler` - Attachement des handlers
- `unbindClickHandler` - Détachement des handlers
- `getCount` - Comptage des éléments

### NavigationLinks

- `updateTexts` - Mise à jour des textes selon la langue

### LanguageIndicators

- `updateAll` - Mise à jour synchronisée des indicateurs

## Gestionnaires Principaux

### LanguageManager (`language.ts`)

- `updateLanguage` - Changement de langue
- `loadSavedLanguage` - Chargement depuis localStorage
- `handleLanguageClick` - Gestion des clics
- `getCurrentLanguage` - État actuel

### ScrollHandler (`scroll-handler.ts`)

- `handleScroll` - Logique de scroll
- `destroy` - Nettoyage des ressources

### MobileMenu (`mobile-menu.ts`)

- `open/close` - États du menu
- `handleToggle` - Gestion de la checkbox
- `handleOverlayClick` - Gestion de l'overlay

### ThemeManager (`theme.ts`)

- `syncThemeToggles` - Synchronisation des toggles
- `handleDesktopChange/handleMobileChange` - Synchronisation croisée
- `isDarkTheme` - Détection du thème
- `setupThemeObserver` - Observation des changements

### HeaderManager (`index.ts`)

- `initializeHeader` - Initialisation globale
- `getHeaderManager` - Singleton pattern
- `destroy` - Nettoyage complet

## Priorités de Test

1. **Haute Priorité**

   - Value Objects (validation, immutabilité)
   - Utilitaires DOM (manipulation critique du DOM)
   - Gestionnaires d'état (langue, thème)

2. **Priorité Moyenne**

   - Collections DOM (gestion des événements)
   - Synchronisation des composants

3. **Basse Priorité**
   - Getters simples
   - Méthodes de commodité

## Notes Importantes

- Privilégier les tests unitaires isolés
- Mocker les dépendances DOM
- Tester les edge cases pour la validation
- Vérifier la gestion des erreurs
- Assurer la cohérence des états
