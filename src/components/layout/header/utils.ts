import {
  useTranslations,
  useTranslatedPath,
  getLangFromUrl,
} from "@/i18n/utils";
import type { Languages } from "@/i18n/ui";
import type {
  NavLink,
  TranslatedNavLink,
  TranslatePathFunction,
  HeaderData,
} from "./types";
import {
  generateContextualLanguageUrls,
  generateHreflangLinks,
} from "./article-utils";
import { analyzeLanguageContext } from "./server-utils";

/**
 * Transforms navigation links with translations and active state detection
 * @param navLinks - Array of navigation links
 * @param lang - Current language ('en' or 'fr')
 * @param translatePath - Function to translate paths for the current language
 * @param currentUrl - Current URL object for active state detection
 * @returns Array of translated navigation links with active state
 */
export function mapNavLinks(
  navLinks: NavLink[],
  lang: Languages,
  translatePath: TranslatePathFunction,
  currentUrl: URL,
): TranslatedNavLink[] {
  const t = useTranslations(lang);

  return navLinks.map((link) => {
    const translated = translatePath(link.href);
    return {
      href: translated,
      label: t(link.key),
      isActive: currentUrl.pathname === translated,
    };
  });
}

/**
 * Prépare toutes les données nécessaires pour le header
 * @param currentUrl - URL courante
 * @param navLinks - Liens de navigation
 * @returns Objet avec toutes les données du header
 */
export async function prepareHeaderData(
  currentUrl: URL,
  navLinks: NavLink[],
): Promise<HeaderData> {
  // Analyser le contexte linguistique
  const languageContext = await analyzeLanguageContext(currentUrl);

  // Utiliser la langue détectée ou fallback vers getLangFromUrl qui ne peut jamais échouer
  const lang = languageContext.detectedLang ?? getLangFromUrl(currentUrl);

  // Log pour debugging si on utilise le fallback
  if (!languageContext.detectedLang) {
    console.warn(
      `Language detection failed for URL: ${currentUrl.pathname}. Using fallback: ${lang}`,
    );
  }

  // Préparer les traductions et navigation
  const t = useTranslations(lang);
  const translatePath = useTranslatedPath(lang);
  const translatedNavLinks = mapNavLinks(
    navLinks,
    lang,
    translatePath,
    currentUrl,
  );

  // Générer les URLs de langue
  const languageUrls = generateContextualLanguageUrls(
    languageContext,
    currentUrl,
  );

  // Générer les liens hreflang
  const hreflangLinks = generateHreflangLinks(languageUrls);

  return {
    lang,
    languageContext,
    t,
    translatePath,
    translatedNavLinks,
    languageUrls,
    hreflangLinks,
    // Ajouter un flag pour indiquer si on a utilisé le fallback
    usingLanguageFallback: !languageContext.detectedLang,
  };
}
