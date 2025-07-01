/**
 * Theme Manager Module
 * Handles light/dark theme switching functionality
 */

import type { Destroyable, EventCleanup } from "./types";

export class ThemeManager implements Destroyable {
  private readonly storageKey = "theme";
  private readonly lightTheme = "light-blue";
  private readonly darkTheme = "dark-blue";
  private eventCleanups: EventCleanup[] = [];
  private currentTheme: string | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    this.setTheme(this.getTheme());
    this.bindEventListeners();
  }

  private getTheme(): string {
    // Use cached theme if available
    if (this.currentTheme) return this.currentTheme;

    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved === this.lightTheme || saved === this.darkTheme) {
        this.currentTheme = saved;
        return saved;
      }
    } catch (e) {
      console.warn('LocalStorage not available:', e);
    }

    const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches
      ? this.lightTheme
      : this.darkTheme;

    this.currentTheme = preferredTheme;
    return preferredTheme;
  }

  private setTheme(theme: string): void {
    this.currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
    
    this.updateThemeIcons(theme);
  }

  private updateThemeIcons(theme: string): void {
    const themeButtons = document.querySelectorAll<HTMLElement>(
      "[data-theme-toggle]",
    );

    themeButtons.forEach((btn) => {
      const lightIcon = btn.querySelector<HTMLElement>(".theme-light");
      const darkIcon = btn.querySelector<HTMLElement>(".theme-dark");

      if (lightIcon && darkIcon) {
        const isLight = theme === this.lightTheme;
        lightIcon.style.display = isLight ? "block" : "none";
        darkIcon.style.display = isLight ? "none" : "block";
      }
    });
  }

  private toggleTheme(): void {
    const current = this.currentTheme || this.getTheme();
    const newTheme =
      current === this.lightTheme ? this.darkTheme : this.lightTheme;
    this.setTheme(newTheme);
  }

  private bindEventListeners(): void {
    const themeButtons = document.querySelectorAll("[data-theme-toggle]");
    themeButtons.forEach((btn) => {
      const handler = () => this.toggleTheme();
      btn.addEventListener("click", handler);
      
      // Store cleanup function
      this.eventCleanups.push(() => btn.removeEventListener("click", handler));
    });
  }

  // Public API
  public getCurrentTheme(): string {
    return this.currentTheme || this.getTheme();
  }

  public setCurrentTheme(theme: string): void {
    if (theme === this.lightTheme || theme === this.darkTheme) {
      this.setTheme(theme);
    }
  }

  /**
   * Clean up all event listeners and resources
   */
  public destroy(): void {
    this.eventCleanups.forEach(cleanup => cleanup());
    this.eventCleanups = [];
    this.currentTheme = null;
  }
}

// Auto-initialize when loaded as a module
let themeManager: ThemeManager | null = null;

export function initThemeManager(): ThemeManager {
  if (!themeManager) {
    themeManager = new ThemeManager();
  }
  return themeManager;
}

export function destroyThemeManager(): void {
  if (themeManager) {
    themeManager.destroy();
    themeManager = null;
  }
}
