/**
 * Dictionnaires de traduction centralisés pour l'interface utilisateur
 * Langue par défaut : Anglais (en)
 * Langues supportées : Anglais (en), Français (fr)
 */

// === TYPES POUR LES DRAPEAUX ===
/**
 * Union type for country flags used in language switching
 * Includes emoji flags for supported languages and generic fallback
 */
export type CountryFlag =
  | "🇺🇸" // United States (English)
  | "🇫🇷" // France (French)
  | "🌐"; // Generic/fallback flag

export const ui = {
  en: {
    // LANGUE PAR DÉFAUT
    // Navigation
    "nav.home": "Home",
    "nav.main": "Main navigation",
    "nav.articles": "Articles",
    "nav.blog": "Blog",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.services": "Services",
    "nav.resources": "Resources",
    "nav.ressources": "Resources",
    // Blog
    "blog.read": "Read",
    "blog.readMore": "Read more",
    "blog.publishedOn": "Published on",
    "blog.backToBlog": "Back to Blog",
    "blog.relatedPosts": "Related Posts",
    "blog.noPostsFound": "No posts found",
    "blog.searchPlaceholder": "Search articles...",
    "blog.readingTime": "read",

    // Latest Articles Section
    "latestArticles.title": "Latest Articles",
    "latestArticles.subtitle":
      "Discover our latest insights on web development, modern frameworks and best practices.",
    "latestArticles.noArticles": "No articles available",
    "latestArticles.noArticlesDesc":
      "Articles will be available soon in this language.",
    "latestArticles.viewAll": "View all articles",

    // Categories
    "category.framework": "Framework",
    "category.language": "Language",
    "category.performance": "Performance",
    "category.styling": "Styling",
    "category.backend": "Backend",
    "category.article": "Article",

    // Tags
    "tag.guide": "Guide",
    "tag.optimization": "Optimization",
    "tag.bestPractices": "Best Practices",
    "tag.comparison": "Comparison",

    // Category pages
    "category.page.title": "Articles in category: {category}",
    "category.page.subtitle":
      "Discover all our articles in the {category} category",
    "category.page.noArticles": "No articles found",
    "category.page.noArticlesDesc":
      "No articles have been published in this category yet.",
    "category.page.backToHome": "Back to home",
    "category.page.allCategories": "All categories",

    // Tag pages
    "tag.page.title": "Articles with tag: {tag}",
    "tag.page.subtitle":
      "Discover all our articles with the {tag} tag",
    "tag.page.noArticles": "No articles found",
    "tag.page.noArticlesDesc":
      "No articles have been published with this tag yet.",
    "tag.page.backToHome": "Back to home",
    "tag.page.allTags": "All tags",

    // Sorting
    "sort.label": "Sort by",
    "sort.dateDesc": "Most recent",
    "sort.dateAsc": "Oldest first",
    "sort.titleAsc": "Title A-Z",
    "sort.titleDesc": "Title Z-A",
    "sort.readingTimeAsc": "Shortest read",
    "sort.readingTimeDesc": "Longest read",

    // Interface générale
    "languageSwitcher.label": "Switch language",
    "languageSwitcher.current": "Current language",
    "theme.toggle": "Toggle theme",
    "theme.light": "Light mode",
    "theme.dark": "Dark mode",

    // Dates et formatage
    "date.format": "MMMM d, yyyy",
    "date.publishedOn": "Published on {date}",
    "date.updatedOn": "Updated on {date}",

    // Messages et états
    loading: "Loading...",
    "error.pageNotFound": "Page not found",
    "error.goHome": "Go to homepage",
    "error.tryAgain": "Try again",

    // Footer
    "footer.allRightsReserved": "All rights reserved",
    "footer.builtWith": "Built with",

    // SEO et métadonnées
    "meta.description.home":
      "Welcome to our blog - Discover articles about web development, technology and more",
    "meta.description.blog":
      "Latest articles and tutorials about web development, programming and technology",
    "meta.description.about": "Learn more about our team and our mission",
    "meta.description.contact": "Get in touch with us",

    // Titres de pages
    "page.title.home": "Home",
    "page.title.blog": "Blog",
    "page.title.about": "About",
    "page.title.contact": "Contact",
    "page.title.articles": "Articles",
    "page.title.notFound": "Page Not Found",
  },
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.main": "Navigation principale",
    "nav.articles": "Articles",
    "nav.blog": "Blog",
    "nav.about": "À propos",
    "nav.contact": "Contact",
    "nav.services": "Services",
    "nav.resources": "Ressources",
    "nav.ressources": "Ressources",

    // Blog
    "blog.read": "Lire",
    "blog.readMore": "Lire la suite",
    "blog.publishedOn": "Publié le",
    "blog.backToBlog": "Retour au Blog",
    "blog.relatedPosts": "Articles similaires",
    "blog.noPostsFound": "Aucun article trouvé",
    "blog.searchPlaceholder": "Rechercher des articles...",
    "blog.readingTime": "de lecture",

    // Latest Articles Section
    "latestArticles.title": "Derniers Articles",
    "latestArticles.subtitle":
      "Découvrez nos dernières réflexions sur le développement web, les frameworks modernes et les meilleures pratiques.",
    "latestArticles.noArticles": "Aucun article disponible",
    "latestArticles.noArticlesDesc":
      "Les articles seront bientôt disponibles dans cette langue.",
    "latestArticles.viewAll": "Voir tous les articles",

    // Categories
    "category.framework": "Framework",
    "category.language": "Langage",
    "category.performance": "Performance",
    "category.styling": "Style",
    "category.backend": "Backend",
    "category.article": "Article",

    // Tags
    "tag.guide": "Guide",
    "tag.optimization": "Optimisation",
    "tag.bestPractices": "Bonnes Pratiques",
    "tag.comparison": "Comparaison",

    // Category pages
    "category.page.title": "Articles dans la catégorie : {category}",
    "category.page.subtitle":
      "Découvrez tous nos articles dans la catégorie {category}",
    "category.page.noArticles": "Aucun article trouvé",
    "category.page.noArticlesDesc":
      "Aucun article n'a encore été publié dans cette catégorie.",
    "category.page.backToHome": "Retour à l'accueil",
    "category.page.allCategories": "Toutes les catégories",

    // Tag pages
    "tag.page.title": "Articles avec le tag : {tag}",
    "tag.page.subtitle":
      "Découvrez tous nos articles avec le tag {tag}",
    "tag.page.noArticles": "Aucun article trouvé",
    "tag.page.noArticlesDesc":
      "Aucun article n'a encore été publié avec ce tag.",
    "tag.page.backToHome": "Retour à l'accueil",
    "tag.page.allTags": "Tous les tags",

    // Sorting
    "sort.label": "Trier par",
    "sort.dateDesc": "Plus récent",
    "sort.dateAsc": "Plus ancien",
    "sort.titleAsc": "Titre A-Z",
    "sort.titleDesc": "Titre Z-A",
    "sort.readingTimeAsc": "Lecture rapide",
    "sort.readingTimeDesc": "Lecture longue",

    // Interface générale
    "languageSwitcher.label": "Changer de langue",
    "languageSwitcher.current": "Langue actuelle",
    "theme.toggle": "Basculer le thème",
    "theme.light": "Mode clair",
    "theme.dark": "Mode sombre",

    // Dates et formatage
    "date.format": "d MMMM yyyy",
    "date.publishedOn": "Publié le {date}",
    "date.updatedOn": "Mis à jour le {date}",

    // Messages et états
    loading: "Chargement...",
    "error.pageNotFound": "Page non trouvée",
    "error.goHome": "Aller à l'accueil",
    "error.tryAgain": "Réessayer",

    // Footer
    "footer.allRightsReserved": "Tous droits réservés",
    "footer.builtWith": "Créé avec",

    // SEO et métadonnées
    "meta.description.home":
      "Bienvenue sur notre blog - Découvrez des articles sur le développement web, la technologie et plus",
    "meta.description.blog":
      "Derniers articles et tutoriels sur le développement web, la programmation et la technologie",
    "meta.description.about":
      "En savoir plus sur notre équipe et notre mission",
    "meta.description.contact": "Contactez-nous",

    // Titres de pages
    "page.title.home": "Accueil",
    "page.title.blog": "Blog",
    "page.title.about": "À propos",
    "page.title.contact": "Contact",
    "page.title.articles": "Articles",
    "page.title.notFound": "Page Non Trouvée",
  },
} as const;

export const defaultLang = "en"; // ANGLAIS par défaut

/**
 * Type helper pour les clés de traduction
 */
export type UIKeys = keyof (typeof ui)["en"];

/**
 * Type helper pour les langues supportées
 */
export type Languages = keyof typeof ui;
