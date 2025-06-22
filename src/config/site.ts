/**
 * Configuration centralisée du site
 * Gère les URLs, métadonnées et autres paramètres selon l'environnement
 */

interface SiteConfig {
  /** URL de base du site (sans slash final) */
  baseUrl: string;
  /** Nom du site */
  title: string;
  /** Description par défaut */
  description: string;
  /** Image Open Graph par défaut */
  defaultOgImage: string;
  /** Auteur du site */
  author: string;
  /** Configuration de l'organisation */
  organization: {
    /** Nom de l'organisation pour Schema.org */
    name: string;
    /** Type d'organisation Schema.org */
    type: 'Organization' | 'Person';
    /** URL de l'organisation */
    url: string;
  };
  /** Configuration social media */
  social: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

/**
 * Obtient l'URL de base selon l'environnement
 * Priorité : SITE_URL > ASTRO_SITE > URL par défaut
 */
function getBaseUrl(): string {
  // En priorité, utiliser SITE_URL si définie
  if (import.meta.env.SITE_URL) {
    return import.meta.env.SITE_URL.replace(/\/$/, '');
  }
  
  // Sinon, utiliser ASTRO_SITE (utilisée par Astro pour le sitemap)
  if (import.meta.env.ASTRO_SITE) {
    return import.meta.env.ASTRO_SITE.replace(/\/$/, '');
  }
  
  // URL par défaut pour le développement
  return 'https://sebc.dev';
}

/**
 * Configuration du site
 */
export const siteConfig: SiteConfig = {
  baseUrl: getBaseUrl(),
  title: 'sebc.dev',
  description: 'Blog de développement web moderne - Astro, TypeScript, et bonnes pratiques',
  defaultOgImage: '/assets/og-default.jpg',
  author: 'Sebastien',
  organization: {
    name: import.meta.env.SITE_ORGANIZATION_NAME || 'sebc.dev',
    type: (import.meta.env.SITE_ORGANIZATION_TYPE as 'Organization' | 'Person') || 'Organization',
    url: getBaseUrl(),
  },
  social: {
    github: import.meta.env.SITE_GITHUB,
    twitter: import.meta.env.SITE_TWITTER,
    linkedin: import.meta.env.SITE_LINKEDIN,
  },
};

/**
 * Utilitaires pour construire les URLs et métadonnées
 */
export const siteUtils = {
  /**
   * Construit une URL canonique complète
   */
  getCanonicalUrl(pathname: string): string {
    return new URL(pathname, siteConfig.baseUrl).href;
  },

  /**
   * Construit une URL absolue pour les assets
   */
  getAssetUrl(assetPath: string): string {
    return new URL(assetPath, siteConfig.baseUrl).href;
  },

  /**
   * Construit le titre complet de la page
   */
  getPageTitle(pageTitle?: string): string {
    return pageTitle && pageTitle.trim() ? `${pageTitle} | ${siteConfig.title}` : siteConfig.title;
  },

  /**
   * Génère un schéma JSON-LD pour un article de blog
   */
  generateBlogPostSchema(article: {
    title: string;
    description: string;
    image?: string;
    datePublished: string;
    author: string;
  }): object {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": article.title,
      "description": article.description,
      "image": article.image ? siteUtils.getAssetUrl(article.image) : undefined,
      "datePublished": article.datePublished,
      "author": {
        "@type": "Person",
        "name": article.author
      },
      "publisher": {
        "@type": siteConfig.organization.type,
        "name": siteConfig.organization.name,
        "url": siteConfig.organization.url
      }
    };
  },
};

/**
 * Configuration pour différents environnements
 */
export const envConfig = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  isPreview: import.meta.env.MODE === 'preview',
  
  /**
   * Indique si on est en mode debug (développement ou preview)
   * 
   * Retourne `true` si l'environnement est soit en développement (`dev`) 
   * soit en mode preview. Utile pour activer des fonctionnalités de debug,
   * des logs détaillés, ou des outils de développement qui ne doivent pas
   * être présents en production.
   * 
   * @returns {boolean} `true` en mode développement ou preview, `false` en production
   * @example
   * ```typescript
   * if (envConfig.isDebug) {
   *   console.log('Debug info:', someData);
   * }
   * ```
   */
  get isDebug() {
    return this.isDev || this.isPreview;
  },
}; 