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
  private toggleButton: HTMLButtonElement | null;
  private overlay: HTMLElement | null;
  private content: HTMLElement | null;
  private navLinks: NodeListOf<HTMLElement>;
  private isOpen: boolean = false;

  /**
   * Crée une nouvelle instance du gestionnaire de menu mobile
   * Initialise les références aux éléments DOM et configure les événements
   */
  constructor() {
    this.toggleButton = getElementById<HTMLButtonElement>("mobile-menu-toggle");
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
    // Toggle sur clic du bouton
    this.toggleButton?.addEventListener("click", this.handleToggle.bind(this));

    // Fermeture sur clic overlay
    this.overlay?.addEventListener("click", this.handleOverlayClick.bind(this));

    // Fermeture sur clic des liens de navigation
    this.navLinks.forEach((link) => {
      link.addEventListener("click", this.close.bind(this));
    });

    // Fermeture sur touche Échap
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  /**
   * Gère le clic sur le bouton hamburger
   * @param {Event} event - L'événement de clic
   * @private
   */
  private handleToggle(event: Event): void {
    event.preventDefault();
    this.toggle(!this.isOpen);
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
   * Gère les événements clavier
   * @param {KeyboardEvent} event - L'événement clavier
   * @private
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.isOpen) {
      this.close();
    }
  }

  /**
   * Bascule l'état du menu
   * @param {boolean} show - true pour ouvrir, false pour fermer
   * @private
   */
  private toggle(show: boolean): void {
    this.isOpen = show;
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
    this.isOpen = true;
    removeClass(this.overlay, "opacity-0", "pointer-events-none");
    removeClass(this.content, "translate-x-full");
    addClass(document.body, "mobile-menu-open");
    addClass(this.toggleButton, "menu-open");
    setBodyOverflow(true);
  }

  /**
   * Ferme le menu mobile (implémentation interne)
   * @private
   */
  private closeMenu(): void {
    this.isOpen = false;
    addClass(this.overlay, "opacity-0", "pointer-events-none");
    addClass(this.content, "translate-x-full");
    removeClass(document.body, "mobile-menu-open");
    removeClass(this.toggleButton, "menu-open");
    setBodyOverflow(false);
  }

  /**
   * Ferme le menu mobile
   * @public
   */
  public close(): void {
    this.closeMenu();
  }

  /**
   * Nettoie les ressources en supprimant les gestionnaires d'événements
   * @public
   */
  public destroy(): void {
    this.toggleButton?.removeEventListener(
      "click",
      this.handleToggle.bind(this),
    );
    this.overlay?.removeEventListener(
      "click",
      this.handleOverlayClick.bind(this),
    );
    this.navLinks.forEach((link) => {
      link.removeEventListener("click", this.close.bind(this));
    });
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }
}
