import type { CategoryTranslations } from "../scripts/category-utils";

/**
 * Centralized category translations for all supported languages
 * This ensures consistency and avoids duplication across the application
 */
export const categoryTranslations = {
  en: {
    framework: "Framework",
    language: "Language", 
    performance: "Performance",
    styling: "Styling",
    backend: "Backend",
    article: "Article"
  } as CategoryTranslations,
  
  fr: {
    framework: "Framework",
    language: "Langage",
    performance: "Performance", 
    styling: "Style",
    backend: "Backend",
    article: "Article"
  } as CategoryTranslations
} as const;

/**
 * Get category translations for a specific language
 * @param lang - The language code (en | fr)
 * @returns The category translations for the specified language
 */
export function getCategoryTranslations(lang: "en" | "fr"): CategoryTranslations {
  return categoryTranslations[lang];
} 