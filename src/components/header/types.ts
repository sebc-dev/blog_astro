/**
 * Types TypeScript pour le composant Header
 */

import type { UIKeys } from "../../i18n/ui";
import type { Languages } from "../../i18n/ui";

// === TYPES POUR LA NAVIGATION ===
export interface NavLink {
  href: string;
  key: UIKeys;
}

export interface TranslatedNavLink {
  href: string;
  label: string;
  isActive: boolean;
}

// === TYPES POUR LES THÈMES ===
export type Theme = "light-blue" | "dark-blue";

export interface ThemeConfig {
  light: Theme;
  dark: Theme;
}

// === TYPES POUR LES LANGUES ===
export type SupportedLanguage = "en" | "fr";

// === TYPES POUR LES ARTICLES ===
export interface ArticleTranslationMapping {
  [key: string]: string | null;
}

export interface ArticleLanguageContext {
  isArticlePage: boolean;
  detectedLang: Languages | null;
  translationMapping?: Record<Languages, string | null>;
  articleSlug?: string;
}

export interface LanguageUrlData {
  url: string;
  label: string;
  flag: string;
  isActive: boolean;
}

export type LanguageUrls = Record<Languages, LanguageUrlData>;

export interface HreflangLink {
  hreflang: string;
  href: string;
}

// === TYPES POUR LES ÉLÉMENTS DOM ===
export interface HeaderElements {
  menu: HTMLElement | null;
  menuToggle: HTMLButtonElement | null;
  overlay: HTMLElement | null;
  closeBtn: HTMLElement | null;
  dropdownButtons: NodeListOf<Element>;
  themeButtons: NodeListOf<Element>;
}

// === TYPES POUR LES PROPS DU COMPOSANT ===
export interface HeaderProps {
  siteName?: string;
  navLinks?: NavLink[];
}

// === TYPES POUR LES ÉVÉNEMENTS ===
export interface MenuEventHandlers {
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export interface ThemeEventHandlers {
  toggle: () => void;
  apply: (theme: Theme) => void;
  updateIcons: (theme: Theme) => void;
}

// === TYPES POUR LA CONFIGURATION ===
export interface HeaderConfig {
  animationDuration: number;
  scrollThreshold: number;
  themes: ThemeConfig;
  defaultSiteName: string;
}

// === TYPES POUR LES UTILITAIRES ===
export type TranslatePathFunction = (path: string) => string;

export type UseTranslationsFunction = (key: UIKeys) => string;

// === TYPES POUR LES ERREURS ===
export interface HeaderError extends Error {
  context?: string;
  element?: string;
}

// === TYPES POUR LE RETOUR DE prepareHeaderData ===
export interface HeaderData {
  lang: Languages;
  languageContext: ArticleLanguageContext;
  t: UseTranslationsFunction;
  translatePath: TranslatePathFunction;
  translatedNavLinks: TranslatedNavLink[];
  languageUrls: LanguageUrls;
  hreflangLinks: HreflangLink[];
  usingLanguageFallback: boolean;
}
