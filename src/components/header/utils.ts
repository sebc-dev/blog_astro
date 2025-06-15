import { useTranslations } from "../../i18n/utils";
import type { UIKeys } from "../../i18n/ui";

export interface NavLink {
  href: string;
  key: UIKeys;
}

export interface TranslatedNavLink {
  href: string;
  label: string;
  isActive: boolean;
}

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
  lang: "en" | "fr",
  translatePath: (path: string) => string,
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
 * Generates language switch URLs for the header language selector
 * @param currentPath - Current path without language prefix
 * @param lang - Current language
 * @returns Object with language URLs and metadata
 */
export function generateLanguageUrls(currentPath: string, lang: "en" | "fr") {
  if (!currentPath.startsWith("/")) currentPath = `/${currentPath}`;
  return {
    en: {
      url: currentPath,
      isActive: lang === "en",
      label: "English",
      flag: "🇺🇸",
    },
    fr: {
      url: currentPath.startsWith("/fr") ? currentPath : `/fr${currentPath}`,
      isActive: lang === "fr",
      label: "Français",
      flag: "🇫🇷",
    },
  };
}
