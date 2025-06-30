import type { Languages } from "@/i18n/ui";
import type { PageDetector, TagPageInfo } from "./types";
import { denormalizeTagFromUrl } from "@/lib/article/tag-utils";
import { getTagTranslations } from "@/i18n/tag-translations";

/**
 * Détecteur de pages de tags
 * Gère les URLs comme /tag/[tag] et /fr/tag/[tag]
 */
export class TagDetector implements PageDetector {
  readonly pageType = "tag" as const;

  isPageType(url: URL): boolean {
    const pathname = url.pathname;
    
    // Patterns possibles:
    // /tag/[tag-slug]
    // /fr/tag/[tag-slug]
    const tagPattern = /^\/(?:(fr)\/)?tag\/([^\/]+)$/;
    return tagPattern.test(pathname);
  }

  extractPageInfo(url: URL): TagPageInfo | null {
    if (!this.isPageType(url)) {
      return null;
    }

    const detectedLang = this.detectLanguage(url);
    const pathname = url.pathname;
    const tagPattern = /^\/(?:(fr)\/)?tag\/([^\/]+)$/;
    const match = pathname.match(tagPattern);

    if (!match) {
      return null;
    }

    const urlTagSlug = match[2];
    
    // Récupérer les traductions pour la langue détectée
    const lang = detectedLang || "en";
    const translations = getTagTranslations(lang);
    
    // Obtenir tous les tags disponibles pour cette langue
    const availableTags = Object.values(translations);
    
    // Dénormaliser le slug pour obtenir le vrai nom du tag
    const tag = denormalizeTagFromUrl(urlTagSlug, availableTags);
    
    if (!tag) {
      return null;
    }

    return {
      pageType: "tag",
      tag,
      detectedLang,
    };
  }

  detectLanguage(url: URL): Languages | null {
    const pathname = url.pathname;
    
    if (pathname.startsWith("/fr/")) {
      return "fr";
    }
    
    // Par défaut, considérer comme anglais si pas de préfixe
    if (pathname.startsWith("/tag/")) {
      return "en";
    }
    
    return null;
  }
}