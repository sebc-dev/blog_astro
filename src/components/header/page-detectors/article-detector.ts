import type { Languages } from "../../../i18n/ui";
import { getPathWithoutLang, isValidLang } from "../../../i18n/utils";
import type { PageDetector, ArticlePageInfo, PageType } from "./types";

/**
 * Détecteur spécialisé pour les pages d'articles
 */
export class ArticleDetector implements PageDetector {
  readonly pageType: PageType = "article";

  /**
   * Détecte si l'URL correspond à une page d'article
   * @param url - URL courante
   * @returns true si c'est une page d'article
   */
  isPageType(url: URL): boolean {
    const currentPath = getPathWithoutLang(url);
    return currentPath.startsWith("/blog/");
  }

  /**
   * Extrait les informations de l'article depuis l'URL
   * @param url - URL courante d'une page d'article
   * @returns Informations de l'article ou null
   */
  extractPageInfo(url: URL): ArticlePageInfo | null {
    if (!this.isPageType(url)) {
      return null;
    }

    const detectedLang = this.detectLanguage(url);
    const slug = this.extractArticleSlug(url);

    if (!slug) {
      return null;
    }

    return {
      pageType: "article",
      detectedLang,
      slug,
    };
  }

  /**
   * Détecte la langue à partir d'une URL d'article
   * Format attendu: /blog/{lang}/{slug}
   * @param url - URL courante
   * @returns La langue détectée ou null si non trouvée
   */
  detectLanguage(url: URL): Languages | null {
    if (!this.isPageType(url)) {
      return null;
    }

    const pathSegments = url.pathname
      .split("/")
      .filter((segment) => segment !== "");

    if (pathSegments.length >= 2 && pathSegments[0] === "blog") {
      const articleLang = pathSegments[1];
      if (isValidLang(articleLang)) {
        return articleLang as Languages;
      }
    }

    return null;
  }

  /**
   * Extrait le slug d'un article depuis l'URL
   * @param url - URL courante
   * @returns Le slug de l'article ou null si non trouvé
   */
  private extractArticleSlug(url: URL): string | null {
    if (!this.isPageType(url)) {
      return null;
    }

    const currentPath = getPathWithoutLang(url);
    const pathSegments = currentPath
      .split("/")
      .filter((segment) => segment !== "");

    if (pathSegments.length >= 3 && pathSegments[0] === "blog") {
      return pathSegments.slice(2).join("/");
    }

    return null;
  }
} 