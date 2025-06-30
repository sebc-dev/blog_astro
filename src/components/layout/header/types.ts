/**
 * Types TypeScript pour le composant Header
 */

import type { UIKeys, Languages, CountryFlag } from "@/i18n/ui";

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

// === TYPES POUR LES DRAPEAUX ===
// CountryFlag type is now imported from @/i18n/ui
export type { CountryFlag };

// === TYPES POUR LES ARTICLES ===
export type ArticleTranslationMapping = Record<Languages, string | null>;

export interface ArticleLanguageContext {
  readonly isArticlePage: boolean;
  readonly detectedLang: Languages | null;
  readonly articleSlug?: string;
  readonly translationMapping?: Record<Languages, string | null>;
  
  // Nouveaux champs pour les pages de catégories
  readonly isCategoryPage?: boolean;
  readonly categorySlug?: string;
  readonly categoryUrlMapping?: Record<string, string>;
  
  // Nouveaux champs pour les pages de tags
  readonly isTagPage?: boolean;
  readonly tagSlug?: string;
  readonly tagUrlMapping?: Record<string, string>;
}

export interface LanguageUrlData {
  url: string;
  label: string;
  flag: CountryFlag;
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
  readonly lang: Languages;
  readonly languageContext: ArticleLanguageContext;
  readonly t: UseTranslationsFunction;
  readonly translatePath: TranslatePathFunction;
  readonly translatedNavLinks: TranslatedNavLink[];
  readonly languageUrls: LanguageUrls;
  readonly hreflangLinks: HreflangLink[];
  readonly usingLanguageFallback: boolean;
}
