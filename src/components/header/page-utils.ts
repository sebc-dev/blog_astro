import type { CollectionEntry } from "astro:content";
import type { Languages } from "../../i18n/ui";
import { getLangFromUrl } from "../../i18n/utils";

// Import des détecteurs
import { ArticleDetector } from "./page-detectors/article-detector";
import { CategoryDetector } from "./page-detectors/category-detector";
import { NormalDetector } from "./page-detectors/normal-detector";
import type { 
  PageDetector, 
  PageDetectionResult, 
  PageInfo, 
  PageType,
  ArticlePageInfo,
  CategoryPageInfo,
  NormalPageInfo
} from "./page-detectors/types";
import { isArticlePageInfo } from "./page-detectors/types";

// Import des mappers
import { ArticleMapper } from "./page-mappers/article-mapper";
import { CategoryMapper } from "./page-mappers/category-mapper";
import { NormalMapper } from "./page-mappers/normal-mapper";
import type { UrlMapper } from "./page-detectors/types";

// Import des fonctions existantes pour la compatibilité
import { createArticleTranslationMappingPure } from "./article-utils";

/**
 * Gestionnaire principal du système de détection de pages générique
 */
export class PageDetectionManager {
  private detectors: PageDetector[];
  private mappers: Map<PageType, UrlMapper>;

  constructor() {
    // Initialiser les détecteurs dans l'ordre de priorité
    // Le NormalDetector doit être en dernier car il accepte tout
    this.detectors = [
      new ArticleDetector(),
      new CategoryDetector(),
      new NormalDetector(), // Fallback en dernier
    ];

    // Initialiser les mappers
    this.mappers = new Map([
      ["article", new ArticleMapper()],
      ["category", new CategoryMapper()],
      ["normal", new NormalMapper()],
    ]);
  }

  /**
   * Détecte le type de page et extrait les informations
   * @param url - URL courante
   * @returns Résultat de la détection ou null
   */
  detectPage(url: URL): PageDetectionResult | null {
    for (const detector of this.detectors) {
      if (detector.isPageType(url)) {
        const pageInfo = detector.extractPageInfo(url);
        if (pageInfo) {
          return {
            pageType: detector.pageType,
            detector,
            pageInfo,
          };
        }
      }
    }

    return null;
  }

  /**
   * Crée le mapping des URLs pour une page détectée
   * @param pageInfo - Informations de la page
   * @param additionalData - Données supplémentaires (pour les articles)
   * @returns Mapping des URLs ou null
   */
  createUrlMapping(
    pageInfo: PageInfo, 
    additionalData?: Record<string, unknown>
  ): Record<string, string> | null {
    const mapper = this.mappers.get(pageInfo.pageType);
    if (!mapper) {
      console.warn(`No mapper found for page type: ${pageInfo.pageType}`);
      return null;
    }

    return mapper.createUrlMapping(pageInfo, additionalData);
  }

  /**
   * Analyse complète d'une page avec génération du mapping
   * @param url - URL courante
   * @param allPosts - Articles de blog (optionnel pour les articles)
   * @returns Informations complètes de la page
   */
  async analyzePage(
    url: URL,
    allPosts?: CollectionEntry<"blog">[]
  ): Promise<ExtendedPageInfo | null> {
    const detection = this.detectPage(url);
    if (!detection) {
      return null;
    }

    let urlMapping: Record<string, string> | null = null;
    let additionalData: Record<string, unknown> | undefined;

    // Pour les articles, nous avons besoin des données de traduction
    if (isArticlePageInfo(detection.pageInfo) && allPosts) {
      const translationMapping = createArticleTranslationMappingPure(url, allPosts);
      if (translationMapping) {
        additionalData = { translationMapping };
        urlMapping = this.createUrlMapping(detection.pageInfo, additionalData);
        
        // Enrichir les informations de l'article avec le mapping de traduction
        const enrichedPageInfo: ArticlePageInfoExtended = {
          ...detection.pageInfo,
          translationMapping,
          urlMapping,
          usingFallback: false,
        };
        
        return enrichedPageInfo;
      }
    }

    // Pour les autres types de pages
    urlMapping = this.createUrlMapping(detection.pageInfo);

    // Créer l'objet étendu basé sur le type de page
    switch (detection.pageInfo.pageType) {
      case "category":
        return {
          ...detection.pageInfo,
          urlMapping,
          usingFallback: false,
        } as CategoryPageInfoExtended;
      
      case "normal":
        return {
          ...detection.pageInfo,
          urlMapping,
          usingFallback: true,
        } as NormalPageInfoExtended;
      
      case "article":
        return {
          ...detection.pageInfo,
          urlMapping,
          usingFallback: false,
        } as ArticlePageInfoExtended;
      
      default:
        return null;
    }
  }
}

/**
 * Interfaces étendues avec discriminated unions
 */
export interface ArticlePageInfoExtended extends ArticlePageInfo {
  readonly urlMapping: Record<string, string> | null;
  readonly usingFallback: false;
}

export interface CategoryPageInfoExtended extends CategoryPageInfo {
  readonly urlMapping: Record<string, string> | null;
  readonly usingFallback: false;
}

export interface NormalPageInfoExtended extends NormalPageInfo {
  readonly urlMapping: Record<string, string> | null;
  readonly usingFallback: true;
}

/**
 * Union discriminée des informations étendues de page
 */
export type ExtendedPageInfo = ArticlePageInfoExtended | CategoryPageInfoExtended | NormalPageInfoExtended;

/**
 * Contexte linguistique unifié (compatible avec l'ancien système)
 */
export interface UnifiedLanguageContext {
  readonly isArticlePage: boolean;
  readonly detectedLang: Languages | null;
  readonly articleSlug?: string;
  readonly translationMapping?: Record<Languages, string | null>;
  readonly isCategoryPage?: boolean;
  readonly categorySlug?: string;
  readonly categoryUrlMapping?: Record<string, string>;
  readonly pageType: PageType;
  readonly urlMapping?: Record<string, string> | null;
}

/**
 * Instance singleton du gestionnaire de détection
 */
export const pageDetectionManager = new PageDetectionManager();

/**
 * Fonction utilitaire pour analyser le contexte linguistique (compatible avec l'ancien système)
 * @param url - URL courante
 * @param allPosts - Articles de blog (optionnel)
 * @returns Contexte linguistique unifié
 */
export async function analyzeLanguageContextUnified(
  url: URL,
  allPosts?: CollectionEntry<"blog">[]
): Promise<UnifiedLanguageContext> {
  const pageInfo = await pageDetectionManager.analyzePage(url, allPosts);
  
  if (!pageInfo) {
    // Fallback vers la détection basique
    return {
      isArticlePage: false,
      detectedLang: getLangFromUrl(url),
      pageType: "normal",
      isCategoryPage: false,
    };
  }

  // Utiliser les type guards pour un accès type-safe
  switch (pageInfo.pageType) {
    case "article":
      return {
        isArticlePage: true,
        detectedLang: pageInfo.detectedLang,
        articleSlug: pageInfo.slug,
        translationMapping: pageInfo.translationMapping,
        isCategoryPage: false,
        pageType: pageInfo.pageType,
        urlMapping: pageInfo.urlMapping,
      };
    
    case "category":
      return {
        isArticlePage: false,
        detectedLang: pageInfo.detectedLang,
        isCategoryPage: true,
        categorySlug: pageInfo.category,
        categoryUrlMapping: pageInfo.urlMapping || undefined,
        pageType: pageInfo.pageType,
        urlMapping: pageInfo.urlMapping,
      };
    
    case "normal":
      return {
        isArticlePage: false,
        detectedLang: pageInfo.detectedLang,
        isCategoryPage: false,
        pageType: pageInfo.pageType,
        urlMapping: pageInfo.urlMapping,
      };
    
    default:
      // TypeScript exhaustiveness check - this should never happen
      return {
        isArticlePage: false,
        detectedLang: getLangFromUrl(url),
        pageType: "normal" as const,
        isCategoryPage: false,
      };
  }
}

/**
 * TYPE SAFETY IMPROVEMENT DEMONSTRATION
 * 
 * BEFORE (Unsafe - could cause runtime errors):
 * ```typescript
 * translationMapping: pageInfo.pageType === "article" 
 *   ? (pageInfo as Record<string, unknown>).translationMapping as Record<Languages, string | null> | undefined
 *   : undefined,
 * ```
 * 
 * AFTER (Type-safe with discriminated unions):
 * ```typescript
 * switch (pageInfo.pageType) {
 *   case "article":
 *     // TypeScript knows this is ArticlePageInfo
 *     return {
 *       translationMapping: pageInfo.translationMapping, // ✅ Type-safe access
 *       // ...
 *     };
 *   case "category":
 *     // TypeScript knows this is CategoryPageInfo  
 *     return {
 *       categorySlug: pageInfo.category, // ✅ Type-safe access
 *       // ...
 *     };
 * }
 * ```
 * 
 * BENEFITS:
 * - ✅ Compile-time type checking
 * - ✅ IntelliSense support
 * - ✅ Prevents runtime errors from accessing undefined properties
 * - ✅ Self-documenting code through types
 * - ✅ Exhaustiveness checking in switch statements
 */ 