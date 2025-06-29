import type { CollectionEntry } from "astro:content";
import type { Languages } from "@/i18n/ui";
import { getLangFromUrl } from "@/i18n/utils";

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
  NormalPageInfo,
  UrlMapper
} from "./page-detectors/types";
import { isArticlePageInfo } from "./page-detectors/types";

// Import des mappers
import { ArticleMapper } from "./page-mappers/article-mapper";
import { CategoryMapper } from "./page-mappers/category-mapper";
import { NormalMapper } from "./page-mappers/normal-mapper";

// Import des fonctions existantes pour la compatibilité
import { createArticleTranslationMappingPure } from "./article-utils";

/**
 * Gestionnaire principal du système de détection de pages générique
 */
export class PageDetectionManager {
  private readonly detectors: PageDetector[];
  private readonly mappers: Map<PageType, UrlMapper>;

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
   * @param currentUrl - URL courante pour extraction du chemin
   * @param additionalData - Données supplémentaires (pour les articles)
   * @returns Mapping des URLs ou null
   */
  createUrlMapping(
    pageInfo: PageInfo,
    currentUrl: URL,
    additionalData?: Record<string, unknown>
  ): Record<string, string> | null {
    const mapper = this.mappers.get(pageInfo.pageType);
    if (!mapper) {
      return null;
    }

    // Enrichir additionalData avec l'URL courante pour tous les mappers
    const enrichedData = {
      ...additionalData,
      currentUrl,
    };

    return mapper.createUrlMapping(pageInfo, enrichedData);
  }

  /**
   * Analyse complète d'une page avec génération du mapping
   * @param url - URL courante
   * @param allPosts - Articles de blog (optionnel pour les articles)
   * @returns Informations complètes de la page
   */
  analyzePage(
    url: URL,
    allPosts?: CollectionEntry<"blog">[]
  ): ExtendedPageInfo | null {
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
        urlMapping = this.createUrlMapping(detection.pageInfo, url, additionalData);
      }
    }

    // Pour les autres types de pages
    urlMapping ??= this.createUrlMapping(detection.pageInfo, url);

    // Créer l'objet étendu basé sur le type de page
    let enrichedPageInfo: ExtendedPageInfo;

    switch (detection.pageInfo.pageType) {
      case "category":
        enrichedPageInfo = {
          ...detection.pageInfo,
          urlMapping,
          usingFallback: false,
        } as CategoryPageInfoExtended;
        break;
      
      case "normal":
        enrichedPageInfo = {
          ...detection.pageInfo,
          urlMapping,
          usingFallback: true,
        } as NormalPageInfoExtended;
        break;
      
      case "article":
        enrichedPageInfo = {
          ...detection.pageInfo,
          translationMapping: additionalData?.translationMapping as Record<Languages, string | null> | undefined,
          urlMapping,
          usingFallback: false,
        } as ArticlePageInfoExtended;
        break;
      
      default:
        return null;
    }

    return enrichedPageInfo;
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
export function analyzeLanguageContextUnified(
  url: URL,
  allPosts?: CollectionEntry<"blog">[]
): UnifiedLanguageContext {
  const pageInfo = pageDetectionManager.analyzePage(url, allPosts);
  
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