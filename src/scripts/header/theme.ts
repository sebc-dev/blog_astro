/**
 * Gestion du thème clair/sombre
 * @module theme-manager
 * @see {@link https://en.wikipedia.org/wiki/SOLID|SOLID Principles}
 */

import { getElementById } from "../utils/dom.js";

/**
 * Gestionnaire du thème clair/sombre
 * Gère la synchronisation des toggles et l'état du thème
 * @class ThemeManager
 */
export class ThemeManager {
  private readonly desktopToggle: HTMLInputElement | null;
  private readonly mobileToggle: HTMLInputElement | null;
  private observer: MutationObserver | null = null;
  private readonly abortController: AbortController;

  /**
   * Crée une nouvelle instance du gestionnaire de thème
   * Initialise les toggles et configure les événements
   */
  constructor() {
    this.abortController = new AbortController();
    this.desktopToggle = getElementById<HTMLInputElement>("theme-toggle");
    this.mobileToggle = getElementById<HTMLInputElement>("mobile-theme-toggle");

    this.syncThemeToggles();
    this.bindEvents();
    this.setupThemeObserver();
  }

  /**
   * Configure les gestionnaires d'événements pour les toggles
   * @private
   */
  private bindEvents(): void {
    const signal = this.abortController.signal;

    // Synchronisation desktop vers mobile
    this.desktopToggle?.addEventListener(
      "change",
      this.handleDesktopChange.bind(this),
      { signal },
    );

    // Synchronisation mobile vers desktop
    this.mobileToggle?.addEventListener(
      "change",
      this.handleMobileChange.bind(this),
      { signal },
    );
  }

  /**
   * Gère le changement du toggle desktop
   * @param {Event} event - L'événement de changement
   * @private
   */
  private handleDesktopChange(event: Event): void {
    const desktopToggle = event.target as HTMLInputElement;
    if (this.mobileToggle) {
      this.mobileToggle.checked = desktopToggle.checked;
    }
  }

  /**
   * Gère le changement du toggle mobile
   * @param {Event} event - L'événement de changement
   * @private
   */
  private handleMobileChange(event: Event): void {
    const mobileToggle = event.target as HTMLInputElement;
    if (this.desktopToggle) {
      this.desktopToggle.checked = mobileToggle.checked;
    }
  }

  /**
   * Synchronise l'état des toggles avec le thème actuel
   * @private
   */
  private syncThemeToggles(): void {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";

    if (this.desktopToggle) {
      this.desktopToggle.checked = isDark;
    }
    if (this.mobileToggle) {
      this.mobileToggle.checked = isDark;
    }
  }

  /**
   * Configure l'observateur de mutations pour le thème
   * @private
   */
  private setupThemeObserver(): void {
    // Observer les changements de thème pour synchroniser les toggles
    this.observer = new MutationObserver(() => {
      this.syncThemeToggles();
    });

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  /**
   * Force la synchronisation des toggles avec le thème actuel
   * @public
   */
  public sync(): void {
    this.syncThemeToggles();
  }

  /**
   * Vérifie si le thème sombre est actif
   * @returns {boolean} true si le thème sombre est actif
   * @public
   */
  public isDarkTheme(): boolean {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  /**
   * Nettoie les ressources en supprimant les gestionnaires d'événements et l'observateur
   * @public
   */
  public destroy(): void {
    // Supprime automatiquement tous les event listeners associés à ce controller
    this.abortController.abort();
    this.observer?.disconnect();
  }
}
