import { getCollection } from "astro:content";
import type { ArticleLanguageContext } from "./types";
import { analyzeLanguageContextPure, isArticlePage, detectArticleLanguage, extractArticleSlug } from "./article-utils";
import { getLangFromUrl } from "../../i18n/utils";

/**
 * Types d'erreur pour une gestion granulaire
 */
enum CollectionErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  PERMISSION_ERROR = "PERMISSION_ERROR", 
  CONTENT_ERROR = "CONTENT_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

/**
 * Détermine le type d'erreur basé sur les propriétés de l'erreur
 */
function categorizeError(error: unknown): CollectionErrorType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    // Erreurs réseau/connexion
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      error.name === 'NetworkError' ||
      error.name === 'TimeoutError'
    ) {
      return CollectionErrorType.NETWORK_ERROR;
    }
    
    // Erreurs de permissions/accès
    if (
      message.includes('permission') ||
      message.includes('access') ||
      message.includes('unauthorized') ||
      stack.includes('permission denied')
    ) {
      return CollectionErrorType.PERMISSION_ERROR;
    }
    
    // Erreurs de contenu/structure
    if (
      message.includes('content') ||
      message.includes('parse') ||
      message.includes('schema')
    ) {
      return CollectionErrorType.CONTENT_ERROR;
    }
  }
  
  return CollectionErrorType.UNKNOWN_ERROR;
}

/**
 * Crée un contexte de fallback sécurisé pour les pages d'articles
 * Préserve la détection de langue et les informations de base même sans données d'articles
 */
function createArticleFallbackContext(url: URL): ArticleLanguageContext {
  const detectedLang = detectArticleLanguage(url);
  const articleSlug = extractArticleSlug(url);
  
  return {
    isArticlePage: true,
    detectedLang: detectedLang || getLangFromUrl(url),
    articleSlug: articleSlug || undefined,
    // translationMapping est omis délibérément car non fiable sans données
  };
}

/**
 * Analyse le contexte linguistique d'une page avec récupération des données Astro Content
 * Wrapper server-side qui utilise getCollection()
 * @param url - URL courante
 * @returns Contexte linguistique avec toutes les informations nécessaires
 */
export async function analyzeLanguageContext(url: URL): Promise<ArticleLanguageContext> {
  try {
    // Récupérer tous les articles
    const allPosts = await getCollection("blog");
    
    // Utiliser la logique pure avec les données complètes
    return analyzeLanguageContextPure(url, allPosts);
    
  } catch (error) {
    const errorType = categorizeError(error);
    const isArticle = isArticlePage(url);
    
    console.error(`Erreur lors de la récupération des articles [${errorType}]:`, error);
    
    // Gestion conditionnelle selon le type d'erreur et le contexte
    switch (errorType) {
      case CollectionErrorType.NETWORK_ERROR:
        console.warn("Problème réseau détecté - utilisation du cache local si disponible");
        // Pour les erreurs réseau, on pourrait implémenter un cache en futur
        break;
        
      case CollectionErrorType.PERMISSION_ERROR:
        console.error("Erreur de permissions - vérifier la configuration Astro Content");
        break;
        
      case CollectionErrorType.CONTENT_ERROR:
        console.warn("Erreur de structure de contenu - vérifier le schema des articles");
        break;
      default:
        console.error("Erreur inconnue lors de l'accès aux articles");
        break;
    }
    
    // Fallback conditionnel selon le type de page
    if (isArticle) {
      // Pour les pages d'articles : fallback sécurisé qui préserve la détection de langue
      console.warn("Page d'article détectée - utilisation du fallback sécurisé sans mapping de traductions");
      return createArticleFallbackContext(url);
    } else {
      // Pour les pages normales : utilisation de la logique pure sans données d'articles
      console.info("Page normale détectée - utilisation du fallback standard");
      return analyzeLanguageContextPure(url);
    }
  }
} 