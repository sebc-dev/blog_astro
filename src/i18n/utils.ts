/**
 * Utilitaires i18n pour la gestion des traductions et du routage multilingue
 */

import { ui, defaultLang, type UIKeys, type Languages } from "@/i18n/ui";
import type { CountryFlag } from "@/components/layout/header/types";

/**
 * Détecte la langue à partir de l'URL
 * @param url - URL de la page courante
 * @returns Code de langue (ex: 'en', 'fr') ou langue par défaut
 */
export function getLangFromUrl(url: URL): Languages {
  const [, lang] = url.pathname.split("/");

  // Vérifie si la langue extraite existe dans nos dictionnaires
  if (lang && lang in ui) {
    return lang as Languages;
  }

  // Retourne la langue par défaut (anglais) si pas de préfixe ou langue inconnue
  return defaultLang as Languages;
}

/**
 * Hook de traduction - Retourne une fonction de traduction pour une langue donnée
 * @param lang - Code de langue
 * @returns Fonction de traduction avec fallback automatique
 */
export function useTranslations(lang: Languages) {
  return function t(key: UIKeys): string {
    // Essaie de récupérer la traduction dans la langue demandée
    const translation = ui[lang][key];

    // Si la traduction existe, la retourne
    if (translation) {
      return translation;
    }

    // Sinon, fallback sur la langue par défaut (anglais)
    const fallback = ui[defaultLang as Languages][key];
    if (fallback) {
      console.warn(
        `Translation missing for key "${key}" in language "${lang}". Using fallback from "${defaultLang}".`,
      );
      return fallback;
    }

    // Si même le fallback n'existe pas, retourne la clé elle-même
    console.error(
      `Translation missing for key "${key}" in both "${lang}" and fallback "${defaultLang}".`,
    );
    return key;
  };
}

/**
 * Hook de gestion des chemins traduits
 * @param lang - Langue actuelle
 * @returns Fonction pour traduire les chemins selon la langue
 */
export function useTranslatedPath(lang: Languages) {
  return function translatePath(
    path: string,
    targetLang: Languages = lang,
  ): string {
    // Pour l'anglais (langue par défaut), pas de préfixe
    if (targetLang === defaultLang) {
      return path;
    }

    // Pour les autres langues, ajouter le préfixe de langue
    // Éviter le double slash si le path commence déjà par /
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `/${targetLang}${cleanPath}`;
  };
}

/**
 * Génère les liens hreflang pour le SEO multilingue
 * @param currentPath - Chemin de la page courante (sans le préfixe de langue)
 * @param baseUrl - URL de base du site
 * @returns Array d'objets avec hreflang et href
 */
export function getHreflangLinks(currentPath: string, baseUrl = "") {
  const cleanPath = currentPath.startsWith("/")
    ? currentPath
    : `/${currentPath}`;

  return Object.keys(ui).map((lang) => {
    const langCode = lang as Languages;
    const href =
      langCode === "en"
        ? `${baseUrl}${cleanPath}`
        : `${baseUrl}/${langCode}${cleanPath}`;

    return {
      hreflang: langCode,
      href: href,
    };
  });
}

/**
 * Extrait le chemin de la page sans le préfixe de langue
 * @param url - URL complète
 * @returns Chemin sans préfixe de langue
 */
export function getPathWithoutLang(url: URL): string {
  const [, maybeLang, ...rest] = url.pathname.split("/");

  // Si le premier segment est une langue connue, on l'ignore
  if (maybeLang && maybeLang in ui) {
    return `/${rest.join("/")}`;
  }

  // Sinon, on retourne le chemin complet
  return url.pathname;
}

/**
 * Vérifie si une langue est supportée
 * @param lang - Code de langue à vérifier
 * @returns true si la langue est supportée
 */
export function isValidLang(lang: string): lang is Languages {
  return lang in ui;
}

/**
 * Obtient toutes les langues supportées
 * @returns Array des codes de langues supportées
 */
export function getSupportedLanguages(): Languages[] {
  return Object.keys(ui) as Languages[];
}

/**
 * Formate une date selon la locale de la langue
 * @param date - Date à formater
 * @param lang - Langue pour le formatage
 * @returns Date formatée selon la locale
 */
export function formatDate(date: Date, lang: Languages): string {
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Obtient le nom de la langue dans sa propre langue (autonym)
 * @param lang - Code de langue
 * @returns Nom de la langue
 */
export function getLanguageName(lang: Languages): string {
  const names: Record<Languages, string> = {
    en: "English",
    fr: "Français",
  };

  return names[lang] || lang;
}

/**
 * Obtient l'emoji du drapeau pour une langue
 * @param lang - Code de langue
 * @returns Emoji du drapeau
 */
export function getLanguageFlag(lang: Languages): CountryFlag {
  const flags: Record<Languages, CountryFlag> = {
    en: "🇺🇸",
    fr: "🇫🇷",
  };

  return flags[lang] || "🌐";
}

/**
 * Génère les URLs de langue pour le changement de langue
 * @param currentPath - Chemin actuel sans préfixe de langue
 * @param currentLang - Langue actuelle
 * @returns Objet avec les URLs de toutes les langues supportées
 */
export function generateLanguageUrls(
  currentPath: string,
  currentLang: Languages,
) {
  const supportedLanguages = getSupportedLanguages();

  return supportedLanguages.reduce(
    (acc, lang) => {
      const translatePathForLang = useTranslatedPath(lang);

      acc[lang] = {
        url: translatePathForLang(currentPath, lang),
        isActive: currentLang === lang,
        label: getLanguageName(lang),
        flag: getLanguageFlag(lang),
      };

      return acc;
    },
    {} as Record<
      Languages,
      {
        url: string;
        isActive: boolean;
        label: string;
        flag: CountryFlag;
      }
    >,
  );
}

/**
 * Type pour le résultat de génération d'URLs de langue
 */
type LanguageUrlsResult = Record<
  Languages,
  {
    url: string;
    isActive: boolean;
    label: string;
    flag: CountryFlag;
  }
>;

/**
 * Génère les URLs de langue pour les articles avec mapping de traductions pré-calculé
 * @param currentPath - Chemin actuel sans préfixe de langue
 * @param currentLang - Langue actuelle
 * @param translationMapping - Mapping des slugs par langue (optionnel)
 * @param pathPrefix - Préfixe de chemin pour les articles (par défaut: '/blog/')
 * @returns Objet avec les URLs de toutes les langues supportées
 */
export function generateLanguageUrlsForArticle(
  currentPath: string,
  currentLang: Languages,
  translationMapping?: Record<string, string | null>,
  pathPrefix = "/blog/",
): LanguageUrlsResult {
  const supportedLanguages = getSupportedLanguages();

  // Validation du translationMapping si fourni
  if (translationMapping) {
    const invalidKeys = Object.keys(translationMapping).filter(
      (key) => !isValidLang(key),
    );
    if (invalidKeys.length > 0) {
      throw new Error(
        `Invalid language keys in translationMapping: ${invalidKeys.join(", ")}. Valid languages are: ${supportedLanguages.join(", ")}`,
      );
    }
  }

  const result = {} as LanguageUrlsResult;

  // Normaliser le préfixe de chemin
  const normalizedPrefix = pathPrefix.endsWith("/")
    ? pathPrefix
    : `${pathPrefix}/`;

  for (const lang of supportedLanguages) {
    let targetUrl: string;

    // Si on a un mapping de traductions, utiliser le slug traduit pour toutes les langues
    if (translationMapping) {
      const translatedSlug = translationMapping[lang];
      if (translatedSlug) {
        // Pour les articles, générer l'URL selon le format Astro: {prefix}{lang}/{slug}
        targetUrl = `${normalizedPrefix}${lang}/${translatedSlug}`;
      } else {
        // Si pas de traduction trouvée, rediriger vers la page d'accueil de la langue cible
        const translatePathForLang = useTranslatedPath(lang);
        targetUrl = translatePathForLang("/", lang);
      }
    } else {
      // Fallback vers la logique normale si pas de mapping
      const translatePathForLang = useTranslatedPath(lang);
      targetUrl = translatePathForLang(currentPath, lang);
    }

    result[lang] = {
      url: targetUrl,
      isActive: currentLang === lang,
      label: getLanguageName(lang),
      flag: getLanguageFlag(lang),
    };
  }

  return result;
}
