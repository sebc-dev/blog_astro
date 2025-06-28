import { generateLanguageUrls } from "../../../i18n/utils";
import { getPathWithoutLang } from "../../../i18n/utils";
import type { UrlMapper, PageInfo, PageType } from "../page-detectors/types";

/**
 * Mapper d'URLs pour les pages normales
 */
export class NormalMapper implements UrlMapper {
  readonly pageType: PageType = "normal";

  /**
   * Crée le mapping des URLs entre les langues pour les pages normales
   * @param pageInfo - Informations de la page normale
   * @param additionalData - Données supplémentaires contenant l'URL courante
   * @returns Mapping des URLs par langue
   */
  createUrlMapping(pageInfo: PageInfo, additionalData?: Record<string, unknown>): Record<string, string> | null {
    if (!pageInfo) {
      return null;
    }
    if (pageInfo.pageType !== "normal" || !pageInfo.detectedLang) {
      return null;
    }

    // Extraire l'URL courante depuis additionalData ou utiliser "/" comme fallback
    let currentPath = "/";
    
    if (additionalData?.currentUrl && additionalData.currentUrl instanceof URL) {
      // Extraire le chemin sans le préfixe de langue pour les pages normales
      currentPath = getPathWithoutLang(additionalData.currentUrl);
    }
    
    const result = generateLanguageUrls(currentPath, pageInfo.detectedLang);
    
    // Convertir le format de retour pour correspondre à notre interface
    const urlMapping: Record<string, string> = {};
    Object.entries(result).forEach(([lang, data]) => {
      urlMapping[lang] = data.url;
    });

    return urlMapping;
  }
} 