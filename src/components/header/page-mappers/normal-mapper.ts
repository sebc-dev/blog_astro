import { generateLanguageUrls } from "../../../i18n/utils";
import type { UrlMapper, PageInfo, PageType } from "../page-detectors/types";

/**
 * Mapper d'URLs pour les pages normales
 */
export class NormalMapper implements UrlMapper {
  readonly pageType: PageType = "normal";

  /**
   * Crée le mapping des URLs entre les langues pour les pages normales
   * @param pageInfo - Informations de la page normale
   * @returns Mapping des URLs par langue
   */
  createUrlMapping(pageInfo: PageInfo): Record<string, string> | null {
    if (!pageInfo) {
      return null;
    }
    if (pageInfo.pageType !== "normal" || !pageInfo.detectedLang) {
      return null;
    }

    // Pour les pages normales, on utilise la logique standard de traduction de chemins
    // On récupère le chemin sans langue depuis l'URL actuelle
    // Note: Dans un vrai scénario, nous devrions avoir accès à l'URL courante
    // Pour l'instant, nous utilisons un chemin par défaut
    const currentPath = "/"; // Chemin par défaut pour les pages normales
    
    const result = generateLanguageUrls(currentPath, pageInfo.detectedLang);
    
    // Convertir le format de retour pour correspondre à notre interface
    const urlMapping: Record<string, string> = {};
    Object.entries(result).forEach(([lang, data]) => {
      urlMapping[lang] = data.url;
    });

    return urlMapping;
  }
} 