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
    
    // Chercher le tag en une seule itération sur les clés de traduction
    for (const key of Object.keys(englishTranslations)) {
      const englishValue = englishTranslations[key as keyof typeof englishTranslations];
      const frenchValue = frenchTranslations[key as keyof typeof frenchTranslations];
      
      if (englishValue === currentTag) {
        englishTag = englishValue;
        frenchTag = frenchValue;
        break;
      } else if (frenchValue === currentTag) {
        englishTag = englishValue;
        frenchTag = frenchValue;
        break;
      }
    }
    
    // Fallback si le tag n'est pas trouvé dans les traductions
    if (!englishTag || !frenchTag) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Tag "${currentTag}" not found in translations, using normalized version`);
      }
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
