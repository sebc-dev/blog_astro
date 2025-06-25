import type { CollectionEntry } from "astro:content";
import { 
  getLangFromUrl, 
  getPathWithoutLang, 
  isValidLang,
  getSupportedLanguages,
  generateLanguageUrls,
  generateLanguageUrlsForArticle,
} from "../../i18n/utils";
import type { Languages } from "../../i18n/ui";
import type { 
  ArticleLanguageContext, 
  LanguageUrls, 
  HreflangLink 
} from "./types";

// Type pour les articles de blog
type BlogPost = CollectionEntry<"blog">;

/**
 * Extrait le slug d'un article en retirant le préfixe de langue de manière robuste
 * @param fullSlug - Slug complet avec préfixe de langue (ex: "en/article-slug")
 * @param language - Code de langue à retirer
 * @returns Le slug sans préfixe de langue ou null si le format est invalide
 */
export function extractSlugWithoutLanguagePrefix(fullSlug: string, language: string): string | null {
  if (!fullSlug || !language) {
    return null;
  }
  
  // Utiliser une regex pour matcher précisément le préfixe de langue au début
  // Pattern: ^{language}/ suivi du reste du slug
  const languagePrefixPattern = new RegExp(`^${escapeRegExp(language)}/(.+)$`);
  const match = fullSlug.match(languagePrefixPattern);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

/**
 * Échappe les caractères spéciaux pour utilisation dans une regex
 * @param string - Chaîne à échapper
 * @returns Chaîne avec caractères spéciaux échappés
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Détecte si l'URL courante correspond à une page d'article
 * @param url - URL courante
 * @returns true si c'est une page d'article, false sinon
 */
export function isArticlePage(url: URL): boolean {
  const currentPath = getPathWithoutLang(url);
  return currentPath.startsWith("/blog/");
}

/**
 * Détecte la langue à partir d'une URL d'article
 * Format attendu: /blog/{lang}/{slug}
 * @param url - URL courante
 * @returns La langue détectée ou null si non trouvée
 */
export function detectArticleLanguage(url: URL): Languages | null {
  // Vérifier d'abord si c'est une page d'article pour éviter les faux positifs
  if (!isArticlePage(url)) {
    return null;
  }
  
  const pathSegments = url.pathname.split('/').filter(segment => segment !== '');
  
  if (pathSegments.length >= 2 && pathSegments[0] === 'blog') {
    const articleLang = pathSegments[1];
    if (isValidLang(articleLang)) {
      return articleLang as Languages;
    }
  }
  
  return null;
}

/**
 * Extrait le slug d'un article depuis l'URL
 * @param url - URL courante
 * @returns Le slug de l'article ou null si non trouvé
 */
export function extractArticleSlug(url: URL): string | null {
  // Vérifier d'abord si c'est une page d'article
  if (!isArticlePage(url)) {
    return null;
  }
  
  const currentPath = getPathWithoutLang(url);
  const pathSegments = currentPath.split('/').filter(segment => segment !== '');
  
  if (pathSegments.length >= 3 && pathSegments[0] === 'blog') {
    return pathSegments.slice(2).join('/');
  }
  
  return null;
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
  allPosts: BlogPost[]
): Record<Languages, string | null> | undefined {
  // Validation des paramètres d'entrée
  if (!currentUrl || !(currentUrl instanceof URL)) {
    console.warn("createArticleTranslationMappingPure: currentUrl doit être un objet URL valide");
    return undefined;
  }
  
  if (!Array.isArray(allPosts) || allPosts.length === 0) {
    console.warn("createArticleTranslationMappingPure: allPosts doit être un tableau non vide");
    return undefined;
  }
  
  try {
    const currentPath = getPathWithoutLang(currentUrl);
    const pathSegments = currentPath.split('/').filter(segment => segment !== '');
    
    if (pathSegments.length >= 3 && pathSegments[0] === 'blog') {
      const articleLang = pathSegments[1];
      const articleSlug = pathSegments.slice(2).join('/');
      
      // Le slug dans Astro inclut le préfixe de langue (ex: "en/rest-api-best-practices-guide")
      const fullSlug = `${articleLang}/${articleSlug}`;
      
      // Récupérer l'article correspondant
      const currentPost = allPosts.find(post => post.slug === fullSlug);
      
      if (currentPost) {
        const currentTranslationId = currentPost.data.translationId;
        
        // Créer un mapping des traductions disponibles
        const translationMapping = {} as Record<Languages, string | null>;
        
        // Trouver tous les articles avec le même translationId
        const relatedPosts = allPosts.filter(post => 
          post.data.translationId === currentTranslationId
        );
        
        // Initialiser toutes les langues supportées à null
        getSupportedLanguages().forEach(lang => {
          translationMapping[lang] = null;
        });
        
        // Remplir avec les slugs trouvés
        relatedPosts.forEach(post => {
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
 * Version pure qui accepte les données en paramètre pour faciliter les tests
 * @param url - URL courante
 * @param allPosts - Tous les articles de blog (optionnel)
 * @returns Contexte linguistique avec toutes les informations nécessaires
 */
export function analyzeLanguageContextPure(url: URL, allPosts?: BlogPost[]): ArticleLanguageContext {
  const isArticle = isArticlePage(url);
  
  if (!isArticle) {
    return {
      isArticlePage: false,
      detectedLang: getLangFromUrl(url),
    };
  }
  
  const detectedLang = detectArticleLanguage(url);
  const articleSlug = extractArticleSlug(url);
  
  if (!detectedLang) {
    return {
      isArticlePage: true,
      detectedLang: getLangFromUrl(url),
      articleSlug: articleSlug || undefined,
    };
  }
  
  let translationMapping: Record<Languages, string | null> | undefined;
  
  if (allPosts) {
    translationMapping = createArticleTranslationMappingPure(url, allPosts);
  }
  
  return {
    isArticlePage: true,
    detectedLang,
    translationMapping,
    articleSlug: articleSlug || undefined,
  };
}

/**
 * Génère les URLs de langue appropriées selon le type de page
 * @param context - Contexte linguistique analysé
 * @param currentUrl - URL courante
 * @returns URLs de langue générées
 */
export function generateContextualLanguageUrls(
  context: ArticleLanguageContext,
  currentUrl: URL
): LanguageUrls {
  const currentPath = getPathWithoutLang(currentUrl);
  const lang = context.detectedLang || getLangFromUrl(currentUrl);
  
  if (context.isArticlePage && context.translationMapping && context.articleSlug) {
    // Pour les articles, utiliser le format /blog/{slug} sans langue
    const articlePath = `/blog/${context.articleSlug}`;
    return generateLanguageUrlsForArticle(articlePath, lang, context.translationMapping);
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
export function generateHreflangLinks(languageUrls: LanguageUrls): HreflangLink[] {
  return Object.entries(languageUrls).map(([langCode, data]) => ({
    hreflang: langCode,
    href: data.url,
  }));
} 