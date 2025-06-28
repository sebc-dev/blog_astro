import type { CollectionEntry } from "astro:content";
import {
  getLangFromUrl,
  getPathWithoutLang,
  getSupportedLanguages,
  generateLanguageUrls,
  generateLanguageUrlsForArticle,
  getLanguageName,
  getLanguageFlag,
} from "../../i18n/utils";
import type { Languages } from "../../i18n/ui";
import type {
  ArticleLanguageContext,
  LanguageUrls,
  HreflangLink,
} from "./types";

// Import du nouveau système générique
import { pageDetectionManager } from "./page-utils";

// Type pour les articles de blog
type BlogPost = CollectionEntry<"blog">;

/**
 * Extrait le slug d'un article en retirant le préfixe de langue de manière robuste
 * @param fullSlug - Slug complet avec préfixe de langue (ex: "en/article-slug")
 * @param language - Code de langue à retirer
 * @returns Le slug sans préfixe de langue ou null si le format est invalide
 */
export function extractSlugWithoutLanguagePrefix(
  fullSlug: string,
  language: string,
): string | null {
  if (!fullSlug || !language) {
    return null;
  }

  // Utiliser une regex pour matcher précisément le préfixe de langue au début
  // Pattern: ^{language}/ suivi du reste du slug
  const languagePrefixPattern = new RegExp(`^${escapeRegExp(language)}/(.+)$`);
  const match = languagePrefixPattern.exec(fullSlug);

  return match?.[1] ?? null;
}

/**
 * Échappe les caractères spéciaux pour utilisation dans une regex
 * @param string - Chaîne à échapper
 * @returns Chaîne avec caractères spéciaux échappés
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Détecte si l'URL courante correspond à une page d'article
 * @deprecated Utiliser pageDetectionManager.detectPage() avec le nouveau système
 * @param url - URL courante
 * @returns true si c'est une page d'article, false sinon
 */
export function isArticlePage(url: URL): boolean {
  const currentPath = getPathWithoutLang(url);
  return currentPath.startsWith("/blog/");
}

/**
 * Détecte la langue à partir d'une URL d'article
 * @deprecated Utiliser ArticleDetector directement
 * @param url - URL courante
 * @returns La langue détectée ou null si non trouvée
 */
export function detectArticleLanguage(url: URL): Languages | null {
  const detection = pageDetectionManager.detectPage(url);
  if (detection?.pageInfo.pageType === "article") {
    return detection.pageInfo.detectedLang;
  }
  return null;
}

/**
 * Extrait le slug d'un article depuis l'URL
 * @deprecated Utiliser ArticleDetector directement
 * @param url - URL courante
 * @returns Le slug de l'article ou null si non trouvé
 */
export function extractArticleSlug(url: URL): string | null {
  const detection = pageDetectionManager.detectPage(url);
  if (detection?.pageInfo.pageType === "article") {
    return detection.pageInfo.slug ?? null;
  }
  return null;
}

/**
 * Vérifie si l'URL correspond à une page de catégorie
 * @deprecated Utiliser CategoryDetector directement
 * @param url - URL courante
 * @returns true si c'est une page de catégorie
 */
export function isCategoryPage(url: URL): boolean {
  const detection = pageDetectionManager.detectPage(url);
  return detection?.pageInfo.pageType === "category";
}

/**
 * Extrait le nom de la catégorie depuis l'URL
 * @deprecated Utiliser CategoryDetector directement
 * @param url - URL courante d'une page de catégorie
 * @returns Le nom de catégorie normalisé ou null
 */
export function extractCategoryFromUrl(url: URL): string | null {
  const detection = pageDetectionManager.detectPage(url);
  if (detection?.pageInfo.pageType === "category") {
    return detection.pageInfo.category ?? null;
  }
  return null;
}

/**
 * Détecte la langue d'une page de catégorie
 * @deprecated Utiliser CategoryDetector directement
 * @param url - URL courante
 * @returns La langue détectée ou null si pas une page de catégorie
 */
export function detectCategoryLanguage(url: URL): Languages | null {
  const detection = pageDetectionManager.detectPage(url);
  if (detection?.pageInfo.pageType === "category") {
    return detection.pageInfo.detectedLang;
  }
  return null;
}

/**
 * Crée un mapping des catégories entre les langues
 * @deprecated Utiliser CategoryMapper directement
 * @param urlCategoryName - Nom de catégorie normalisé depuis l'URL
 * @param sourceLang - Langue source
 * @param currentUrl - URL courante nécessaire pour le mapping
 * @returns Mapping des URLs de catégories par langue ou null si pas trouvé
 */
export function createCategoryUrlMapping(
  urlCategoryName: string,
  sourceLang: Languages,
  currentUrl: URL,
): Record<string, string> | null {
  // Simuler une PageInfo pour utiliser le nouveau système
  const pageInfo = {
    pageType: "category" as const,
    detectedLang: sourceLang,
    category: urlCategoryName,
  };

  return pageDetectionManager.createUrlMapping(pageInfo, currentUrl);
}

/**
 * Crée un mapping des traductions disponibles pour un article
 * Version pure qui accepte les données en paramètre pour faciliter les tests
 * @param currentUrl - URL courante
 * @param allPosts - Tous les articles de blog
 * @returns Mapping des traductions ou undefined si erreur
 */
export function createArticleTranslationMappingPure(
  currentUrl: URL,
  allPosts: BlogPost[],
): Record<Languages, string | null> | undefined {
  // Validation des paramètres d'entrée
  if (!currentUrl || !(currentUrl instanceof URL)) {
    console.warn(
      "createArticleTranslationMappingPure: currentUrl doit être un objet URL valide",
    );
    return undefined;
  }

  if (!Array.isArray(allPosts) || allPosts.length === 0) {
    console.warn(
      "createArticleTranslationMappingPure: allPosts doit être un tableau non vide",
    );
    return undefined;
  }

  try {
    const currentPath = getPathWithoutLang(currentUrl);
    const pathSegments = currentPath
      .split("/")
      .filter((segment) => segment !== "");

    if (pathSegments.length >= 3 && pathSegments[0] === "blog") {
      const articleLang = pathSegments[1];
      const articleSlug = pathSegments.slice(2).join("/");

      // Le slug dans Astro inclut le préfixe de langue (ex: "en/rest-api-best-practices-guide")
      const fullSlug = `${articleLang}/${articleSlug}`;

      // Récupérer l'article correspondant
      const currentPost = allPosts.find((post) => post.slug === fullSlug);

      if (currentPost) {
        const currentTranslationId = currentPost.data.translationId;

        // Créer un mapping des traductions disponibles
        const translationMapping = {} as Record<Languages, string | null>;

        // Trouver tous les articles avec le même translationId
        const relatedPosts = allPosts.filter(
          (post) => post.data.translationId === currentTranslationId,
        );

        // Initialiser et remplir en une seule passe
        const supportedLanguages = getSupportedLanguages();
        supportedLanguages.forEach((lang) => {
          translationMapping[lang] = null;
        });

        relatedPosts.forEach((post) => {
          const postLang = post.data.lang as Languages;
          // Extraire juste le nom du fichier sans le préfixe de langue de manière robuste
          const slug = extractSlugWithoutLanguagePrefix(post.slug, postLang);
          translationMapping[postLang] = slug;
        });

        return translationMapping;
      }
    }
  } catch (error) {
    console.error("Error fetching the article:", error);
  }

  return undefined;
}

/**
 * Analyse le contexte linguistique d'une page (article ou page normale)
 * Version synchrone pour la compatibilité avec les tests existants
 * @param url - URL courante
 * @param allPosts - Tous les articles de blog (optionnel)
 * @returns Contexte linguistique avec toutes les informations nécessaires
 */
export function analyzeLanguageContextPure(
  url: URL,
  allPosts?: BlogPost[],
): ArticleLanguageContext {
  // Utiliser le nouveau système de détection
  const detection = pageDetectionManager.detectPage(url);
  
  if (!detection) {
    // Fallback pour les pages non détectées
    return {
      isArticlePage: false,
      detectedLang: getLangFromUrl(url),
      isCategoryPage: false,
    };
  }

  const { pageInfo } = detection;

  if (pageInfo.pageType === "article") {
    // Logique pour les articles
    const translationMapping = allPosts
      ? createArticleTranslationMappingPure(url, allPosts)
      : undefined;

    return {
      isArticlePage: true,
      detectedLang: pageInfo.detectedLang,
      articleSlug: pageInfo.slug,
      translationMapping,
      isCategoryPage: false,
    };
  } else if (pageInfo.pageType === "category") {
    // Logique pour les catégories
    const categoryUrlMapping = pageDetectionManager.createUrlMapping(pageInfo, url);

    return {
      isArticlePage: false,
      detectedLang: pageInfo.detectedLang,
      isCategoryPage: true,
      categorySlug: pageInfo.category,
      categoryUrlMapping: categoryUrlMapping || undefined,
    };
  } else {
    // Pages normales
    return {
      isArticlePage: false,
      detectedLang: pageInfo.detectedLang,
      isCategoryPage: false,
    };
  }
}

/**
 * Génère les URLs de langue appropriées selon le type de page
 * @param context - Contexte linguistique analysé
 * @param currentUrl - URL courante
 * @returns URLs de langue générées
 */
export function generateContextualLanguageUrls(
  context: ArticleLanguageContext,
  currentUrl: URL,
): LanguageUrls {
  const currentPath = getPathWithoutLang(currentUrl);
  const lang = context.detectedLang ?? getLangFromUrl(currentUrl);

  if (
    context.isArticlePage &&
    context.translationMapping &&
    context.articleSlug
  ) {
    // Pour les articles, utiliser le format /blog/{slug} sans langue
    const articlePath = `/blog/${context.articleSlug}`;
    return generateLanguageUrlsForArticle(
      articlePath,
      lang,
      context.translationMapping,
    );
  } else if (
    context.isCategoryPage &&
    context.categoryUrlMapping
  ) {
    // Pour les pages de catégories, utiliser le mapping prédéfini
    const supportedLanguages = getSupportedLanguages();
    const result = {} as LanguageUrls;
    
    for (const targetLang of supportedLanguages) {
      const url = context.categoryUrlMapping[targetLang] || "/";
      
      result[targetLang] = {
        url,
        isActive: lang === targetLang,
        label: getLanguageName(targetLang),
        flag: getLanguageFlag(targetLang),
      };
    }
    
    return result;
  } else {
    // Pour les pages normales
    return generateLanguageUrls(currentPath, lang);
  }
}

/**
 * Génère les liens hreflang à partir des URLs de langue
 * @param languageUrls - URLs de langue générées
 * @returns Tableau de liens hreflang
 */
export function generateHreflangLinks(
  languageUrls: LanguageUrls,
): HreflangLink[] {
  return Object.entries(languageUrls).map(([langCode, data]) => ({
    hreflang: langCode,
    href: data.url,
  }));
}
