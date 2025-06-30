import { getCollection } from "astro:content";
import type { ArticleLanguageContext } from "./types";
import { analyzeLanguageContextPure } from "./article-utils";
import {
  analyzeLanguageContextUnified,
  pageDetectionManager,
} from "./page-utils";
import { getLangFromUrl, getPathWithoutLang } from "@/i18n/utils";

/**
 * Types d'erreur pour une gestion granulaire
 */
enum CollectionErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  PERMISSION_ERROR = "PERMISSION_ERROR",
  CONTENT_ERROR = "CONTENT_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Détermine le type d'erreur basé sur les propriétés de l'erreur
 */
function categorizeError(error: unknown): CollectionErrorType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() ?? "";

    // Erreurs réseau/connexion
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("timeout") ||
      error.name === "NetworkError" ||
      error.name === "TimeoutError"
    ) {
      return CollectionErrorType.NETWORK_ERROR;
    }

    // Erreurs de permissions/accès
    if (
      message.includes("permission") ||
      message.includes("access") ||
      message.includes("unauthorized") ||
      stack.includes("permission denied")
    ) {
      return CollectionErrorType.PERMISSION_ERROR;
    }

    // Erreurs de contenu/structure
    if (
      message.includes("content") ||
      message.includes("parse") ||
      message.includes("schema")
    ) {
      return CollectionErrorType.CONTENT_ERROR;
    }
  }

  return CollectionErrorType.UNKNOWN_ERROR;
}

/**
 * Crée un contexte de fallback sécurisé pour les pages d'articles
 * Préserve la détection de langue et les informations de base même sans données d'articles
 * GARANTIT toujours isArticlePage: true puisque appelée uniquement pour les pages d'articles détectées
 */
function createArticleFallbackContext(url: URL): ArticleLanguageContext {
  const detection = pageDetectionManager.detectPage(url);

  // Si la détection fonctionne et confirme une page d'article avec toutes les propriétés
  if (detection?.pageInfo.pageType === "article" && detection.pageInfo.slug) {
    return {
      isArticlePage: true,
      detectedLang: detection.pageInfo.detectedLang ?? getLangFromUrl(url),
      articleSlug: detection.pageInfo.slug,
      isCategoryPage: false,
      isTagPage: false,
      // translationMapping est omis délibérément car non fiable sans données
    };
  }

  // Fallback : extraction manuelle depuis l'URL pour garantir un contexte d'article valide
  // Cette fonction est appelée seulement pour les pages d'articles déjà détectées au niveau supérieur
  const fallbackSlug = extractArticleSlugFromUrl(url);
  const fallbackLang = getLangFromUrl(url);

  console.warn(
    `Détection détaillée d'article échouée, fallback manuel pour ${url.pathname}`,
    { extractedSlug: fallbackSlug, extractedLang: fallbackLang },
  );

  return {
    isArticlePage: true, // TOUJOURS true car fonction appelée seulement pour articles détectés
    detectedLang: fallbackLang,
    articleSlug: fallbackSlug ?? undefined,
    isCategoryPage: false,
    isTagPage: false,
    // translationMapping omis car non fiable sans données d'articles
  };
}

/**
 * Extrait le slug d'article directement depuis l'URL (fallback manuel)
 * Réplique exactement la logique de l'ArticleDetector en cas d'échec de détection
 * @param url - URL courante
 * @returns Le slug de l'article ou null si extraction impossible
 */
function extractArticleSlugFromUrl(url: URL): string | null {
  try {
    // Reproduire exactement la logique de l'ArticleDetector
    // 1. Utiliser getPathWithoutLang comme fait l'ArticleDetector
    const currentPath = getPathWithoutLang(url);

    // 2. Vérifier que c'est bien une page blog
    if (!currentPath.startsWith("/blog/")) {
      return null;
    }

    // 3. Extraire et filtrer les segments (même logique que l'ArticleDetector)
    const pathSegments = currentPath
      .split("/")
      .filter((segment: string) => segment !== "");

    // 4. Vérifier la structure et extraire le slug (même logique que l'ArticleDetector)
    if (pathSegments.length >= 3 && pathSegments[0] === "blog") {
      return pathSegments.slice(2).join("/");
    }

    return null;
  } catch (error) {
    console.warn("Échec d'extraction manuelle du slug d'article:", error);
    return null;
  }
}

/**
 * Analyse le contexte linguistique d'une page avec récupération des données Astro Content
 * Wrapper server-side qui utilise getCollection()
 * @param url - URL courante
 * @returns Contexte linguistique avec toutes les informations nécessaires
 */
export async function analyzeLanguageContext(
  url: URL,
): Promise<ArticleLanguageContext> {
  try {
    // Récupérer tous les articles
    const allPosts = await getCollection("blog");

    // Utiliser le nouveau système unifié
    const unifiedContext = analyzeLanguageContextUnified(url, allPosts);

    // Convertir vers l'ancien format pour la compatibilité
    return {
      isArticlePage: unifiedContext.isArticlePage,
      detectedLang: unifiedContext.detectedLang,
      articleSlug: unifiedContext.articleSlug,
      translationMapping: unifiedContext.translationMapping,
      isCategoryPage: unifiedContext.isCategoryPage,
      categorySlug: unifiedContext.categorySlug,
      categoryUrlMapping: unifiedContext.categoryUrlMapping,
      isTagPage: unifiedContext.isTagPage,
      tagSlug: unifiedContext.tagSlug,
      tagUrlMapping: unifiedContext.tagUrlMapping,
    };
  } catch (error) {
    const errorType = categorizeError(error);
    const detection = pageDetectionManager.detectPage(url);
    const isArticle = detection?.pageInfo.pageType === "article";

    console.error(
      `Erreur lors de la récupération des articles [${errorType}]:`,
      error,
    );

    // Gestion conditionnelle selon le type d'erreur et le contexte
    switch (errorType) {
      case CollectionErrorType.NETWORK_ERROR:
        console.warn(
          "Problème réseau détecté - utilisation du cache local si disponible",
        );
        // Pour les erreurs réseau, on pourrait implémenter un cache en futur
        break;

      case CollectionErrorType.PERMISSION_ERROR:
        console.error(
          "Erreur de permissions - vérifier la configuration Astro Content",
        );
        break;

      case CollectionErrorType.CONTENT_ERROR:
        console.warn(
          "Erreur de structure de contenu - vérifier le schema des articles",
        );
        break;
      default:
        console.error("Erreur inconnue lors de l'accès aux articles");
        break;
    }

    // Fallback conditionnel selon le type de page
    if (isArticle) {
      // Pour les pages d'articles : fallback sécurisé qui préserve la détection de langue
      console.warn(
        "Page d'article détectée - utilisation du fallback sécurisé sans mapping de traductions",
      );
      return createArticleFallbackContext(url);
    } else {
      // Pour les pages normales : utilisation de la logique pure sans données d'articles
      console.info("Page normale détectée - utilisation du fallback standard");
      return analyzeLanguageContextPure(url);
    }
  }
}
