import type { Languages } from "@/i18n/ui";

/**
 * Types de pages supportées par le système de détection
 */
export type PageType = "article" | "category" | "tag" | "normal";

/**
 * Interface générique pour les détecteurs de pages
 */
export interface PageDetector {
  /**
   * Détecte si l'URL correspond à ce type de page
   */
  isPageType(url: URL): boolean;
  
  /**
   * Extrait les informations spécifiques de la page depuis l'URL
   */
  extractPageInfo(url: URL): PageInfo | null;
  
  /**
   * Détecte la langue de la page
   */
  detectLanguage(url: URL): Languages | null;
  
  /**
   * Type de page géré par ce détecteur
   */
  readonly pageType: PageType;
}

/**
 * Informations de base pour toutes les pages
 */
export interface BasePageInfo {
  readonly detectedLang: Languages | null;
}

/**
 * Informations spécifiques aux pages d'articles
 */
export interface ArticlePageInfo extends BasePageInfo {
  readonly pageType: "article";
  readonly slug: string;
  readonly translationMapping?: Record<Languages, string | null>;
}

/**
 * Informations spécifiques aux pages de catégories
 */
export interface CategoryPageInfo extends BasePageInfo {
  readonly pageType: "category";
  readonly category: string;
}

/**
 * Informations spécifiques aux pages de tags
 */
export interface TagPageInfo extends BasePageInfo {
  readonly pageType: "tag";
  readonly tag: string;
}

/**
 * Informations spécifiques aux pages normales
 */
export interface NormalPageInfo extends BasePageInfo {
  readonly pageType: "normal";
}

/**
 * Union discriminée des informations de page
 */
export type PageInfo = ArticlePageInfo | CategoryPageInfo | TagPageInfo | NormalPageInfo;

/**
 * Type guards pour les types de pages
 */
export function isArticlePageInfo(pageInfo: PageInfo): pageInfo is ArticlePageInfo {
  return pageInfo.pageType === "article";
}

export function isCategoryPageInfo(pageInfo: PageInfo): pageInfo is CategoryPageInfo {
  return pageInfo.pageType === "category";
}

export function isTagPageInfo(pageInfo: PageInfo): pageInfo is TagPageInfo {
  return pageInfo.pageType === "tag";
}

export function isNormalPageInfo(pageInfo: PageInfo): pageInfo is NormalPageInfo {
  return pageInfo.pageType === "normal";
}

/**
 * Résultat de la détection d'une page
 */
export interface PageDetectionResult {
  readonly pageType: PageType;
  readonly detector: PageDetector;
  readonly pageInfo: PageInfo;
}

/**
 * Interface pour les mappers d'URLs
 */
export interface UrlMapper {
  /**
   * Type de page géré par ce mapper
   */
  readonly pageType: PageType;
  
  /**
   * Crée le mapping des URLs entre les langues pour ce type de page
   */
  createUrlMapping(pageInfo: PageInfo, additionalData?: Record<string, unknown>): Record<string, string> | null;
}

/**
 * Configuration pour le système de détection générique
 */
export interface PageDetectionConfig {
  detectors: PageDetector[];
  mappers: UrlMapper[];
} 