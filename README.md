# Blog Personnel & Expérimentation IA

<a href="https://gitmoji.dev">
  <img
    src="https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square"
    alt="Gitmoji"
  />
</a>

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/sebc-dev/blog_astro?utm_source=oss&utm_medium=github&utm_campaign=sebc-dev%2Fblog_astro&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

Un blog personnel moderne construit avec Astro, TypeScript et Tailwind CSS, qui sert également de terrain d'expérimentation pour le **développement assisté par Intelligence Artificielle**.

## 🎯 Objectifs du Projet

### Blog Personnel
- Plateforme de publication d'articles techniques
- Support multilingue (français/anglais)
- Interface moderne et responsive
- Performance optimisée (Lighthouse 90+)

### Laboratoire d'Expérimentation IA
Ce projet explore les possibilités du développement moderne assisté par IA :

#### 🤖 Génération de Code
- **Cursor + Claude Sonnet** : Développement principal avec assistance IA contextuelle
- **Claude Code** : Génération de composants et logique métier
- Pair programming humain-IA pour l'architecture et l'implémentation

#### 🔍 Code Review Automatisé
- **CodeRabbit** : Analyse automatique des pull requests
- Détection de bugs, suggestions d'amélioration
- Validation des bonnes pratiques et patterns

#### 💡 Assistance Technique
- **Claude Desktop** : Questions techniques complexes, choix d'architecture
- **Gemini** : Recherches approfondies, alternatives technologiques
- Consultation IA pour les décisions de design et d'implémentation

## 🛠 Stack Technique

### Core
- **Astro v5.8+** - Framework web moderne
- **TypeScript** - Typage strict et sécurité
- **Tailwind CSS v4** - Styling utility-first
- **DaisyUI** - Composants pré-stylés

### Qualité & Tests
- **ESLint + Prettier** - Linting et formatage
- **Vitest** - Tests unitaires modernes
- **Cypress** - Tests end-to-end
- **PNPM** - Gestionnaire de paquets rapide

### Outils IA Intégrés
- **Cursor Rules** - Configuration personnalisée pour l'assistance IA
- **Règles de développement** - Guidelines pour la cohérence du code
- **Patterns documentés** - Bonnes pratiques émergentes du développement IA

## 🚀 Structure du Projet

```text
blog_astro/
├── .cursor/                 # Configuration Cursor & règles IA
│   └── rules/              # Règles personnalisées par domaine
├── src/
│   ├── components/         # Composants réutilisables
│   │   ├── layout/        # Header, Footer, Navigation
│   │   ├── ui/            # ArticleCard, Hero, etc.
│   │   └── meta/          # SEO, métadonnées
│   ├── content/           # Articles MDX multilingues
│   │   └── blog/          # Articles fr/ et en/
│   ├── pages/             # Routes Astro automatiques
│   ├── layouts/           # Templates de base
│   └── i18n/              # Internationalisation
├── tests/                 # Suite de tests complète
│   ├── unit/              # Tests unitaires
│   ├── integration/       # Tests d'intégration
│   └── e2e/               # Tests Cypress
└── memory/                # Documentation du processus IA
    ├── docs/              # Bonnes pratiques découvertes
    └── tasks/             # Stratégies de développement
```

## 🧞 Commandes

| Commande | Action |
|----------|--------|
| `pnpm install` | Installation des dépendances |
| `pnpm dev` | Serveur de développement (`localhost:4321`) |
| `pnpm build` | Build de production |
| `pnpm preview` | Aperçu du build local |
| `pnpm lint` | Linting avec correction automatique |
| `pnpm format` | Formatage Prettier |
| `pnpm test` | Suite de tests complète |
| `pnpm test:ui` | Interface graphique des tests |
| `pnpm test:e2e` | Tests end-to-end Cypress |
| `pnpm test:coverage` | Rapport de couverture de code |

## 🎨 Fonctionnalités

### Interface Utilisateur
- ✅ Design responsive et moderne
- ✅ Mode sombre/clair automatique
- ✅ Navigation intuitive avec breadcrumbs
- ✅ Table des matières interactive
- ✅ Pagination et filtres par catégorie

### Performance & SEO
- ✅ Optimisation Lighthouse 90+
- ✅ Métadonnées Open Graph complètes
- ✅ Support Twitter Cards
- ✅ Sitemap automatique
- ✅ Images optimisées

### Développement
- ✅ TypeScript strict
- ✅ Tests automatisés (174+ tests)
- ✅ CI/CD avec GitHub Actions
- ✅ Hot Module Replacement
- ✅ Déploiement automatique

## 🤖 Méthodologie IA

### Workflow de Développement
1. **Planification** - Consultation Claude/Gemini pour l'architecture
2. **Implémentation** - Pair programming avec Cursor + Claude
3. **Review** - Analyse automatique CodeRabbit
4. **Tests** - Génération assistée de cas de test
5. **Documentation** - Extraction automatique des patterns

### Règles Cursor Personnalisées
- **Focus opérationnel** - Distinction implémentation/debugging
- **Standards TypeScript** - Configuration stricte Astro
- **Patterns de test** - Robustesse cross-platform
- **Architecture modulaire** - Composants réutilisables

### Apprentissages Documentés
- Patterns émergents du développement IA
- Bonnes pratiques Cursor + Claude
- Stratégies de test assistées par IA
- Optimisations découvertes par l'IA

## 📈 Métriques & Résultats

### Performance
- **Lighthouse Score** : 90+ (Performance, Accessibilité, SEO)
- **Build Time** : ~15s pour 14 articles multilingues
- **Bundle Size** : Optimisé avec tree-shaking

### Qualité Code
- **Coverage** : 85%+ sur les composants critiques
- **Tests** : 174+ tests unitaires et d'intégration
- **Linting** : 0 erreur ESLint/TypeScript

### Expérimentation IA
- **Productivité** : Développement 3-4x plus rapide
- **Qualité** : Détection proactive de bugs par CodeRabbit
- **Apprentissage** : Documentation continue des patterns

## 🔗 Liens Utiles

- [Documentation Astro](https://docs.astro.build)
- [Guide TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Cursor Documentation](https://docs.cursor.com)

---

*Ce projet démontre le potentiel du développement assisté par IA tout en maintenant des standards élevés de qualité, performance et maintenabilité.*