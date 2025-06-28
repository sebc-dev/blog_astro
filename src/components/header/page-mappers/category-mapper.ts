import type { Languages } from "../../../i18n/ui";
import { getCategoryTranslations } from "../../../i18n/category-translations";
import { getSupportedLanguages } from "../../../i18n/utils";
import { normalizeCategoryForUrl, denormalizeCategoryFromUrl } from "../../../lib/article/category-utils";
import type { UrlMapper, PageInfo, PageType } from "../page-detectors/types";

/**
 * Mapper d'URLs pour les pages de catégories
 */
export class CategoryMapper implements UrlMapper {
  readonly pageType: PageType = "category";

  /**
   * Crée le mapping des URLs entre les langues pour les catégories
   * @param pageInfo - Informations de la page de catégorie
   * @returns Mapping des URLs par langue ou null
   */
  createUrlMapping(pageInfo: PageInfo): Record<string, string> | null {
    if (pageInfo.pageType !== "category" || !pageInfo.category || !pageInfo.detectedLang) {
      return null;
    }

    return this.createCategoryUrlMapping(pageInfo.category, pageInfo.detectedLang);
  }

  /**
   * Crée un mapping des catégories entre les langues
   * Utilise les traductions de catégories pour mapper les URLs normalisées
   * @param urlCategoryName - Nom de catégorie normalisé depuis l'URL
   * @param sourceLang - Langue source
   * @returns Mapping des URLs de catégories par langue ou null si pas trouvé
   */
  private createCategoryUrlMapping(
    urlCategoryName: string,
    sourceLang: Languages,
  ): Record<string, string> | null {
    // Récupérer les traductions pour la langue source
    const sourceTranslations = getCategoryTranslations(sourceLang);
    const sourceCategories = Object.values(sourceTranslations);

    // Trouver la catégorie correspondante dans la langue source
    const sourceCategory = denormalizeCategoryFromUrl(urlCategoryName, sourceCategories);
    
    if (!sourceCategory) {
      console.warn(`Category "${urlCategoryName}" not found in ${sourceLang} translations`);
      return null;
    }

    // Trouver la clé de traduction correspondante
    const categoryKey = Object.entries(sourceTranslations).find(
      ([, value]) => value === sourceCategory
    )?.[0];

    if (!categoryKey) {
      console.warn(`Category key for "${sourceCategory}" not found`);
      return null;
    }

    // Créer le mapping pour toutes les langues
    const mapping: Record<string, string> = {};
    
    const supportedLanguages = getSupportedLanguages();
    
    for (const lang of supportedLanguages) {
      const translations = getCategoryTranslations(lang);
      const categoryName = translations[categoryKey as keyof typeof translations];
      
      if (categoryName) {
        const normalizedName = normalizeCategoryForUrl(categoryName);
        
        // Générer l'URL complète selon la langue
        if (lang === 'en') {
          mapping[lang] = `/category/${normalizedName}`;
        } else {
          mapping[lang] = `/fr/categorie/${normalizedName}`;
        }
      }
    }

    return mapping;
  }
} 