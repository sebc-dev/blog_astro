/**
 * Gestion du scroll pour le header
 * @module scroll-handler
 * @see {@link https://en.wikipedia.org/wiki/SOLID|SOLID Principles}
 */

import { getElementById, addClass, removeClass } from "../utils/dom.js";

/**
 * Gestionnaire de défilement pour le header
 * Gère l'opacité du header en fonction de la position de défilement
 * @class ScrollHandler
 */
export class ScrollHandler {
  private header: HTMLElement | null;
  private lastScrollY: number = 0;
  private readonly threshold: number = 100;

  /**
   * Crée une nouvelle instance du gestionnaire de défilement
   * @param {string} [headerId="main-header"] - L'ID de l'élément header à gérer
   */
  constructor(headerId: string = "main-header") {
    this.header = getElementById(headerId);
    this.bindEvents();
  }

  /**
   * Configure les gestionnaires d'événements de défilement
   * @private
   */
  private bindEvents(): void {
    window.addEventListener("scroll", this.handleScroll.bind(this), {
      passive: true,
    });
  }

  /**
   * Gère l'événement de défilement
   * Ajuste l'opacité du header en fonction de la position de défilement
   * @private
   */
  private handleScroll(): void {
    if (!this.header) return;

    const currentScrollY = window.scrollY;

    if (currentScrollY > this.threshold) {
      // Scroll vers le bas : header transparent
      removeClass(this.header, "bg-base-100/95");
      addClass(this.header, "bg-base-100/60", "border-transparent");
    } else {
      // En haut de page : header opaque
      removeClass(this.header, "bg-base-100/60", "border-transparent");
      addClass(this.header, "bg-base-100/95");
    }

    this.lastScrollY = currentScrollY;
  }

  /**
   * Nettoie les ressources en supprimant les gestionnaires d'événements
   * @public
   */
  public destroy(): void {
    window.removeEventListener("scroll", this.handleScroll.bind(this));
  }
}
