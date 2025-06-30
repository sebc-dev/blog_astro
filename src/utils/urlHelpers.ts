/**
 * URL localization utilities for building internationalized URLs
 */

/**
 * Builds a localized URL for categories, tags, and other content types
 * @param basePath - The base path (e.g., "category", "tag")
 * @param lang - The language code ("en" or "fr")
 * @param normalizedValue - The normalized value to append to the URL
 * @returns The localized URL string
 */
export function buildLocalizedUrl(basePath: string, lang: string, normalizedValue: string | null): string {
  if (!normalizedValue) return "#";
  
  if (lang === "fr") {
    const frBasePath = basePath === "category" ? "categorie" : basePath;
    return `/fr/${frBasePath}/${normalizedValue}`;
  }
  
  return `/${basePath}/${normalizedValue}`;
} 