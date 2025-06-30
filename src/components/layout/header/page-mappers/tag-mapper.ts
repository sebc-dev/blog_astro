import type { PageInfo, UrlMapper } from "../page-detectors/types";
import { isTagPageInfo } from "../page-detectors/types";
import { normalizeTagForUrl } from "@/lib/article/tag-utils";
import { getTagTranslations } from "@/i18n/tag-translations";

/**
 * Mapper d'URLs pour les pages de tags
 * Crée les URLs correspondantes dans toutes les langues
 */
export class TagMapper implements UrlMapper {
  readonly pageType = "tag" as const;

  createUrlMapping(pageInfo: PageInfo): Record<string, string> | null {
    if (!isTagPageInfo(pageInfo)) {
      return null;
    }

    const currentTag = pageInfo.tag;
    
    // Obtenir les traductions pour les deux langues
    const englishTranslations = getTagTranslations("en");
    const frenchTranslations = getTagTranslations("fr");
    
    // Trouver le tag dans les traductions anglaises et françaises
    let englishTag: string | null = null;
    let frenchTag: string | null = null;
    
    // Chercher dans les traductions anglaises
    for (const [key, value] of Object.entries(englishTranslations)) {
      if (value === currentTag) {
        englishTag = value;
        frenchTag = frenchTranslations[key as keyof typeof frenchTranslations];
        break;
      }
    }
    
    // Si pas trouvé, chercher dans les traductions françaises
    if (!englishTag) {
      for (const [key, value] of Object.entries(frenchTranslations)) {
        if (value === currentTag) {
          frenchTag = value;
          englishTag = englishTranslations[key as keyof typeof englishTranslations];
          break;
        }
      }
    }
    
    // Fallback si le tag n'est pas trouvé dans les traductions
    if (!englishTag || !frenchTag) {
      console.warn(`Tag "${currentTag}" not found in translations, using normalized version`);
      const normalizedTag = normalizeTagForUrl(currentTag);
      return {
        en: `/tag/${normalizedTag}`,
        fr: `/fr/tag/${normalizedTag}`,
      };
    }

    return {
      en: `/tag/${normalizeTagForUrl(englishTag)}`,
      fr: `/fr/tag/${normalizeTagForUrl(frenchTag)}`,
    };
  }
}
