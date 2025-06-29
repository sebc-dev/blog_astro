import type { Languages } from "@/i18n/ui";
import { getLangFromUrl } from "@/i18n/utils";
import type { PageDetector, NormalPageInfo, PageType } from "./types";

/**
 * Détecteur pour les pages normales (toutes les pages qui ne sont ni articles ni catégories)
 */
export class NormalDetector implements PageDetector {
  readonly pageType: PageType = "normal";

  /**
   * Détecte si l'URL correspond à une page normale
   * Ce détecteur sert de fallback - il accepte toutes les URLs
   * @param _url - URL courante (non utilisée car fallback)
   * @returns toujours true (fallback)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isPageType(_url: URL): boolean {
    // Le détecteur normal accepte toutes les pages
    // Il sera utilisé en dernier si aucun autre détecteur ne correspond
    return true;
  }

  /**
   * Extrait les informations de la page normale depuis l'URL
   * @param url - URL courante
   * @returns Informations de base de la page
   */
  extractPageInfo(url: URL): NormalPageInfo | null {
    const detectedLang = this.detectLanguage(url);

    return {
      pageType: "normal",
      detectedLang,
    };
  }

  /**
   * Détecte la langue d'une page normale
   * @param url - URL courante
   * @returns La langue détectée depuis l'URL
   */
  detectLanguage(url: URL): Languages | null {
    return getLangFromUrl(url);
  }
} 