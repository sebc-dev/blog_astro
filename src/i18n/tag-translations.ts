import type { TagTranslations } from "@/lib/article/tag-utils";

/**
 * Centralized tag translations for all supported languages
 * This ensures consistency and avoids duplication across the application
 */
export const tagTranslations = {
  en: {
    guide: "Guide",
    optimization: "Optimization",
    bestPractices: "Best Practices",
    comparison: "Comparison",
  } as TagTranslations,

  fr: {
    guide: "Guide",
    optimization: "Optimisation",
    bestPractices: "Bonnes Pratiques",
    comparison: "Comparaison",
  }
} satisfies Record<"en" | "fr", TagTranslations>;

/**
 * Get tag translations for a specific language
 * @param lang - The language code (en | fr)
 * @returns The tag translations for the specified language
 */
export function getTagTranslations(
  lang: "en" | "fr",
): TagTranslations {
  return tagTranslations[lang];
}