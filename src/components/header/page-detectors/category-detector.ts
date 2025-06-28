import type { Languages } from "../../../i18n/ui";
import type { PageDetector, CategoryPageInfo, PageType } from "./types";

/**
 * Détecteur spécialisé pour les pages de catégories
 */
export class CategoryDetector implements PageDetector {
  readonly pageType: PageType = "category";

  /**
   * Extrait les segments de chemin d'une URL
   * @param url - URL à analyser
   * @returns Tableau des segments de chemin filtrés (sans segments vides)
   */
  private getPathSegments(url: URL): string[] {
    return url.pathname
      .split("/")
      .filter((segment) => segment !== "");
  }

  /**
   * Détecte si l'URL correspond à une page de catégorie
   * @param url - URL courante
   * @returns true si c'est une page de catégorie
   */
  isPageType(url: URL): boolean {
    const pathSegments = this.getPathSegments(url);

    // Pour les URLs en anglais: /category/[category-name]
    if (pathSegments.length === 2 && pathSegments[0] === "category") {
      return true;
    }

    // Pour les URLs en français: /fr/categorie/[category-name]
    if (
      pathSegments.length === 3 &&
      pathSegments[0] === "fr" &&
      pathSegments[1] === "categorie"
    ) {
      return true;
    }

    return false;
  }

  /**
   * Extrait les informations de la catégorie depuis l'URL
   * @param url - URL courante d'une page de catégorie
   * @returns Informations de la catégorie ou null
   */
  extractPageInfo(url: URL): CategoryPageInfo | null {
    if (!this.isPageType(url)) {
      return null;
    }

    const detectedLang = this.detectLanguage(url);
    const category = this.extractCategoryFromUrl(url);

    if (!category) {
      return null;
    }

    return {
      pageType: "category",
      detectedLang,
      category,
    };
  }

  /**
   * Détecte la langue d'une page de catégorie
   * @param url - URL courante
   * @returns La langue détectée ou null si pas une page de catégorie
   */
  detectLanguage(url: URL): Languages | null {
    if (!this.isPageType(url)) {
      return null;
    }

    const pathSegments = this.getPathSegments(url);

    // URLs françaises commencent par /fr/
    if (pathSegments[0] === "fr") {
      return "fr";
    }

    // URLs anglaises sont sans préfixe
    return "en";
  }

  /**
   * Extrait le nom de la catégorie depuis l'URL
   * @param url - URL courante d'une page de catégorie
   * @returns Le nom de catégorie normalisé ou null
   */
  private extractCategoryFromUrl(url: URL): string | null {
    if (!this.isPageType(url)) {
      return null;
    }

    const pathSegments = this.getPathSegments(url);

    // Pour les URLs en anglais: /category/[category-name]
    if (pathSegments.length === 2 && pathSegments[0] === "category") {
      return pathSegments[1];
    }

    // Pour les URLs en français: /fr/categorie/[category-name]
    if (
      pathSegments.length === 3 &&
      pathSegments[0] === "fr" &&
      pathSegments[1] === "categorie"
    ) {
      return pathSegments[2];
    }

    return null;
  }
} 