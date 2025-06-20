/**
 * Theme Manager Module
 * Handles light/dark theme switching functionality
 */

export class ThemeManager {
  private readonly storageKey = "theme";
  private readonly lightTheme = "light-blue";
  private readonly darkTheme = "dark-blue";

  constructor() {
    this.init();
  }

  private init(): void {
    this.setTheme(this.getTheme());
    this.bindEventListeners();
  }

  private getTheme(): string {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === this.lightTheme || saved === this.darkTheme) {
      return saved;
    }

    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? this.lightTheme
      : this.darkTheme;
  }

  private setTheme(theme: string): void {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(this.storageKey, theme);
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
    const current = document.documentElement.getAttribute("data-theme");
    const newTheme =
      current === this.lightTheme ? this.darkTheme : this.lightTheme;
    this.setTheme(newTheme);
  }

  private bindEventListeners(): void {
    const themeButtons = document.querySelectorAll("[data-theme-toggle]");
    themeButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.toggleTheme());
    });
  }

  // Public API
  public getCurrentTheme(): string {
    return (
      document.documentElement.getAttribute("data-theme") || this.getTheme()
    );
  }

  public setCurrentTheme(theme: string): void {
    if (theme === this.lightTheme || theme === this.darkTheme) {
      this.setTheme(theme);
    }
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
