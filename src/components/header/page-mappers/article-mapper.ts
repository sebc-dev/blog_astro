import { generateLanguageUrlsForArticle } from "../../../i18n/utils";
import type { UrlMapper, PageInfo, PageType } from "../page-detectors/types";

/**
 * Mapper d'URLs pour les pages d'articles
 */
export class ArticleMapper implements UrlMapper {
  readonly pageType: PageType = "article";

  /**
   * Crée le mapping des URLs entre les langues pour les articles
   * @param pageInfo - Informations de la page d'article
   * @param additionalData - Données supplémentaires (mapping de traductions)
   * @returns Mapping des URLs par langue ou null
   */
  createUrlMapping(
    pageInfo: PageInfo,
    additionalData?: Record<string, unknown>,
  ): Record<string, string> | null {
    if (pageInfo.pageType !== "article" || !pageInfo.slug || !pageInfo.detectedLang) {
      return null;
    }

    // Vérifier si nous avons les données de traduction
    const translationMapping = additionalData?.translationMapping;
    if (!translationMapping || typeof translationMapping !== 'object') {
      return null;
    }    
    if (!translationMapping) {
      return null;
    }

    // Utiliser la fonction existante pour générer les URLs d'articles
    const articlePath = `/blog/${pageInfo.slug}`;
    const result = generateLanguageUrlsForArticle(
      articlePath,
      pageInfo.detectedLang,
      translationMapping as Record<string, string | null>,
    );

    // Convertir le format de retour pour correspondre à notre interface
    const urlMapping: Record<string, string> = {};
    Object.entries(result).forEach(([lang, data]) => {
      urlMapping[lang] = data.url;
    });

    return urlMapping;
  }
} 