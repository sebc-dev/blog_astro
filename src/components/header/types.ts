/**
 * Types TypeScript pour le composant Header
 */

import type { UIKeys } from "../../i18n/ui";

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
export type Theme = 'light-blue' | 'dark-blue';

export interface ThemeConfig {
  light: Theme;
  dark: Theme;
}

// === TYPES POUR LES LANGUES ===
export type SupportedLanguage = 'en' | 'fr';

export interface LanguageUrl {
  url: string;
  isActive: boolean;
  label: string;
  flag: string;
}

export interface LanguageUrls {
  en: LanguageUrl;
  fr: LanguageUrl;
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
