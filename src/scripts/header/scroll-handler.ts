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
  private desktopHeader: HTMLElement | null;
  private mobileHeader: HTMLElement | null;
  private lastScrollY: number = 0;
  private readonly threshold: number = 100;
  private boundHandleScroll: (event: Event) => void;

  /**
   * Crée une nouvelle instance du gestionnaire de défilement
   * Gère les headers desktop et mobile
   */
  constructor() {
    this.desktopHeader = getElementById("desktop-header");
    this.mobileHeader = getElementById("mobile-header");
    this.boundHandleScroll = this.handleScroll.bind(this);
    this.bindEvents();
  }

  /**
   * Configure les gestionnaires d'événements de défilement
   * @private
   */
  private bindEvents(): void {
    window.addEventListener("scroll", this.boundHandleScroll, {
      passive: true,
    });
  }

  /**
   * Gère l'événement de défilement
   * Ajuste l'opacité des headers en fonction de la position de défilement
   * @private
   */
  private handleScroll(): void {
    const currentScrollY = window.scrollY;

    // Appliquer les changements aux deux headers
    [this.desktopHeader, this.mobileHeader].forEach((header) => {
      if (!header) return;

      if (currentScrollY > this.threshold) {
        // Scroll vers le bas : header transparent
        removeClass(header, "bg-base-100/95");
        addClass(header, "bg-base-100/60", "border-transparent");
      } else {
        // En haut de page : header opaque
        removeClass(header, "bg-base-100/60", "border-transparent");
        addClass(header, "bg-base-100/95");
      }
    });

    this.lastScrollY = currentScrollY;
  }

  /**
   * Nettoie les ressources en supprimant les gestionnaires d'événements
   * @public
   */
  public destroy(): void {
    window.removeEventListener("scroll", this.boundHandleScroll);
  }
}
