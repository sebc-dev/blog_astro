/**
 * Gestion du menu mobile
 * @module mobile-menu
 * @see {@link https://en.wikipedia.org/wiki/SOLID|SOLID Principles}
 */

import {
  getElementById,
  addClass,
  removeClass,
  setBodyOverflow,
  querySelectorAll,
} from "../utils/dom.js";

/**
 * Gestionnaire du menu mobile
 * Gère l'ouverture/fermeture et les animations du menu mobile
 * @class MobileMenu
 */
export class MobileMenu {
  private checkbox: HTMLInputElement | null;
  private overlay: HTMLElement | null;
  private content: HTMLElement | null;
  private navLinks: NodeListOf<HTMLElement>;

  /**
   * Crée une nouvelle instance du gestionnaire de menu mobile
   * Initialise les références aux éléments DOM et configure les événements
   */
  constructor() {
    this.checkbox = getElementById<HTMLInputElement>("mobile-menu");
    this.overlay = getElementById("mobile-overlay");
    this.content = getElementById("mobile-menu-content");
    this.navLinks = querySelectorAll<HTMLElement>(".mobile-nav-link");

    this.bindEvents();
  }

  /**
   * Configure les gestionnaires d'événements pour le menu mobile
   * @private
   */
  private bindEvents(): void {
    // Toggle sur changement du checkbox
    this.checkbox?.addEventListener("change", this.handleToggle.bind(this));

    // Fermeture sur clic overlay
    this.overlay?.addEventListener("click", this.handleOverlayClick.bind(this));

    // Fermeture sur clic des liens de navigation
    this.navLinks.forEach((link) => {
      link.addEventListener("click", this.close.bind(this));
    });
  }

  /**
   * Gère le changement d'état de la checkbox du menu
   * @param {Event} event - L'événement de changement
   * @private
   */
  private handleToggle(event: Event): void {
    const checkbox = event.currentTarget as HTMLInputElement;
    this.toggle(checkbox.checked);
  }

  /**
   * Gère le clic sur l'overlay du menu
   * @param {MouseEvent} event - L'événement de clic
   * @private
   */
  private handleOverlayClick(event: MouseEvent): void {
    if (event.target === this.overlay) {
      this.close();
    }
  }

  /**
   * Bascule l'état du menu
   * @param {boolean} show - true pour ouvrir, false pour fermer
   * @private
   */
  private toggle(show: boolean): void {
    if (show) {
      this.open();
    } else {
      this.closeMenu();
    }
  }

  /**
   * Ouvre le menu mobile
   * @public
   */
  public open(): void {
    removeClass(this.overlay, "opacity-0", "pointer-events-none");
    removeClass(this.content, "translate-x-full");
    setBodyOverflow(true);
  }

  /**
   * Ferme le menu mobile (implémentation interne)
   * @private
   */
  private closeMenu(): void {
    addClass(this.overlay, "opacity-0", "pointer-events-none");
    addClass(this.content, "translate-x-full");
    setBodyOverflow(false);
  }

  /**
   * Ferme le menu mobile et réinitialise la checkbox
   * @public
   */
  public close(): void {
    if (this.checkbox) {
      this.checkbox.checked = false;
    }
    this.closeMenu();
  }

  /**
   * Nettoie les ressources en supprimant les gestionnaires d'événements
   * @public
   */
  public destroy(): void {
    this.checkbox?.removeEventListener("change", this.handleToggle.bind(this));
    this.overlay?.removeEventListener(
      "click",
      this.handleOverlayClick.bind(this),
    );
    this.navLinks.forEach((link) => {
      link.removeEventListener("click", this.close.bind(this));
    });
  }
}
