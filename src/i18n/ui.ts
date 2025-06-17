/**
 * Dictionnaires de traduction centralisés pour l'interface utilisateur
 * Langue par défaut : Anglais (en)
 * Langues supportées : Anglais (en), Français (fr)
 */

export const ui = {
  en: {  // LANGUE PAR DÉFAUT
    // Navigation
    'nav.home': 'Home',
    'nav.main': 'Main navigation',
    'nav.articles': 'Articles',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.services': 'Services',
    'nav.resources': 'Resources',
    // Blog
    'blog.read': 'Read',
    'blog.readMore': 'Read more',
    'blog.publishedOn': 'Published on',
    'blog.author': 'Author',
    'blog.backToBlog': 'Back to Blog',
    'blog.relatedPosts': 'Related Posts',
    'blog.noPostsFound': 'No posts found',
    'blog.searchPlaceholder': 'Search articles...',
    
    // Latest Articles Section
    'latestArticles.title': 'Latest Articles',
    'latestArticles.subtitle': 'Discover our latest insights on web development, modern frameworks and best practices.',
    'latestArticles.noArticles': 'No articles available',
    'latestArticles.noArticlesDesc': 'Articles will be available soon in this language.',
    'latestArticles.viewAll': 'View all articles',
    
    // Categories
    'category.framework': 'Framework',
    'category.language': 'Language',
    'category.performance': 'Performance',
    'category.styling': 'Styling',
    'category.backend': 'Backend',
    'category.article': 'Article',
    
    // Tags
    'tag.guide': 'Guide',
    'tag.optimization': 'Optimization',
    'tag.bestPractices': 'Best Practices',
    'tag.comparison': 'Comparison',
    
    // Interface générale
    'languageSwitcher.label': 'Switch language',
    'languageSwitcher.current': 'Current language',
    'theme.toggle': 'Toggle theme',
    'theme.light': 'Light mode',
    'theme.dark': 'Dark mode',
    
    // Dates et formatage
    'date.format': 'MMMM d, yyyy',
    'date.publishedOn': 'Published on {date}',
    'date.updatedOn': 'Updated on {date}',
    
    // Messages et états
    'loading': 'Loading...',
    'error.pageNotFound': 'Page not found',
    'error.goHome': 'Go to homepage',
    'error.tryAgain': 'Try again',
    
    // Footer
    'footer.allRightsReserved': 'All rights reserved',
    'footer.builtWith': 'Built with',
    
    // SEO et métadonnées
    'meta.description.home': 'Welcome to our blog - Discover articles about web development, technology and more',
    'meta.description.blog': 'Latest articles and tutorials about web development, programming and technology',
    'meta.description.about': 'Learn more about our team and our mission',
    'meta.description.contact': 'Get in touch with us',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.main': 'Navigation principale',
    'nav.articles': 'Articles',
    'nav.blog': 'Blog',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.services': 'Services',
    'nav.resources': 'Ressources',
    
    // Blog
    'blog.read': 'Lire',
    'blog.readMore': 'Lire la suite',
    'blog.publishedOn': 'Publié le',
    'blog.author': 'Auteur',
    'blog.backToBlog': 'Retour au Blog',
    'blog.relatedPosts': 'Articles similaires',
    'blog.noPostsFound': 'Aucun article trouvé',
    'blog.searchPlaceholder': 'Rechercher des articles...',
    
    // Latest Articles Section
    'latestArticles.title': 'Derniers Articles',
    'latestArticles.subtitle': 'Découvrez nos dernières réflexions sur le développement web, les frameworks modernes et les meilleures pratiques.',
    'latestArticles.noArticles': 'Aucun article disponible',
    'latestArticles.noArticlesDesc': 'Les articles seront bientôt disponibles dans cette langue.',
    'latestArticles.viewAll': 'Voir tous les articles',
    
    // Categories
    'category.framework': 'Framework',
    'category.language': 'Langage',
    'category.performance': 'Performance',
    'category.styling': 'Style',
    'category.backend': 'Backend',
    'category.article': 'Article',
    
    // Tags
    'tag.guide': 'Guide',
    'tag.optimization': 'Optimisation',
    'tag.bestPractices': 'Bonnes Pratiques',
    'tag.comparison': 'Comparaison',
    
    // Interface générale
    'languageSwitcher.label': 'Changer de langue',
    'languageSwitcher.current': 'Langue actuelle',
    'theme.toggle': 'Basculer le thème',
    'theme.light': 'Mode clair',
    'theme.dark': 'Mode sombre',
    
    // Dates et formatage
    'date.format': 'd MMMM yyyy',
    'date.publishedOn': 'Publié le {date}',
    'date.updatedOn': 'Mis à jour le {date}',
    
    // Messages et états
    'loading': 'Chargement...',
    'error.pageNotFound': 'Page non trouvée',
    'error.goHome': 'Aller à l\'accueil',
    'error.tryAgain': 'Réessayer',
    
    // Footer
    'footer.allRightsReserved': 'Tous droits réservés',
    'footer.builtWith': 'Créé avec',
    
    // SEO et métadonnées
    'meta.description.home': 'Bienvenue sur notre blog - Découvrez des articles sur le développement web, la technologie et plus',
    'meta.description.blog': 'Derniers articles et tutoriels sur le développement web, la programmation et la technologie',
    'meta.description.about': 'En savoir plus sur notre équipe et notre mission',
    'meta.description.contact': 'Contactez-nous',
  },
} as const;

export const defaultLang = 'en'; // ANGLAIS par défaut

/**
 * Type helper pour les clés de traduction
 */
export type UIKeys = keyof typeof ui['en'];

/**
 * Type helper pour les langues supportées
 */
export type Languages = keyof typeof ui; 