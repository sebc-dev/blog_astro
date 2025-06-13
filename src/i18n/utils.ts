/**
 * Utilitaires i18n pour la gestion des traductions et du routage multilingue
 */

import { ui, defaultLang, type UIKeys, type Languages } from './ui';

/**
 * Détecte la langue à partir de l'URL
 * @param url - URL de la page courante
 * @returns Code de langue (ex: 'en', 'fr') ou langue par défaut
 */
export function getLangFromUrl(url: URL): Languages {
  const [, lang] = url.pathname.split('/');
  
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
      console.warn(`Translation missing for key "${key}" in language "${lang}". Using fallback from "${defaultLang}".`);
      return fallback;
    }
    
    // Si même le fallback n'existe pas, retourne la clé elle-même
    console.error(`Translation missing for key "${key}" in both "${lang}" and fallback "${defaultLang}".`);
    return key;
  };
}

/**
 * Hook de gestion des chemins traduits
 * @param lang - Langue actuelle
 * @returns Fonction pour traduire les chemins selon la langue
 */
export function useTranslatedPath(lang: Languages) {
  return function translatePath(path: string, targetLang: Languages = lang): string {
    // Pour l'anglais (langue par défaut), pas de préfixe
    if (targetLang === 'en') {
      return path;
    }
    
    // Pour les autres langues, ajouter le préfixe de langue
    // Éviter le double slash si le path commence déjà par /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${targetLang}${cleanPath}`;
  };
}

/**
 * Génère les liens hreflang pour le SEO multilingue
 * @param currentPath - Chemin de la page courante (sans le préfixe de langue)
 * @param baseUrl - URL de base du site
 * @returns Array d'objets avec hreflang et href
 */
export function getHreflangLinks(currentPath: string, baseUrl: string = '') {
  const cleanPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
  
  return Object.keys(ui).map((lang) => {
    const langCode = lang as Languages;
    const href = langCode === 'en' 
      ? `${baseUrl}${cleanPath}` 
      : `${baseUrl}/${langCode}${cleanPath}`;
    
    return {
      hreflang: langCode,
      href: href
    };
  });
}

/**
 * Extrait le chemin de la page sans le préfixe de langue
 * @param url - URL complète
 * @returns Chemin sans préfixe de langue
 */
export function getPathWithoutLang(url: URL): string {
  const [, maybeLang, ...rest] = url.pathname.split('/');
  
  // Si le premier segment est une langue connue, on l'ignore
  if (maybeLang && maybeLang in ui) {
    return `/${rest.join('/')}`;
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
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Obtient le nom de la langue dans sa propre langue (autonym)
 * @param lang - Code de langue
 * @returns Nom de la langue
 */
export function getLanguageName(lang: Languages): string {
  const names: Record<Languages, string> = {
    en: 'English',
    fr: 'Français'
  };
  
  return names[lang] || lang;
}

/**
 * Obtient l'emoji du drapeau pour une langue
 * @param lang - Code de langue
 * @returns Emoji du drapeau
 */
export function getLanguageFlag(lang: Languages): string {
  const flags: Record<Languages, string> = {
    en: '🇺🇸',
    fr: '🇫🇷'
  };
  
  return flags[lang] || '🌐';
} 