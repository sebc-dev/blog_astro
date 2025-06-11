/**
 * Collections First-Class
 * Encapsule les collections d'éléments DOM avec comportements spécifiques
 * @module dom-collections
 */

import { querySelectorAll, getElementById } from "../utils/dom.js";
import { CssSelector, ElementId } from "./value-objects.js";

/**
 * Collection d'éléments cliquables avec gestion unifiée des événements
 * @class ClickableElements
 */
export class ClickableElements {
  private readonly elements: NodeListOf<HTMLElement>;
  private abortController: AbortController | null = null;

  /**
   * Crée une nouvelle collection d'éléments cliquables
   * @param {CssSelector} selector - Le sélecteur CSS pour trouver les éléments
   */
  constructor(selector: CssSelector) {
    this.elements = querySelectorAll<HTMLElement>(selector.getValue());
  }

  /**
   * Attache un gestionnaire d'événements click à tous les éléments
   * @param {function} handler - Le gestionnaire d'événements à attacher
   */
  public bindClickHandler(handler: (event: MouseEvent) => void): void {
    // Créer un nouveau AbortController si nécessaire
    this.abortController ??= new AbortController();

    const signal = this.abortController.signal;

    this.elements.forEach((element) => {
      element.addEventListener("click", handler, { signal });
    });
  }

  /**
   * Nettoie automatiquement tous les event listeners associés
   * @public
   */
  public destroy(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Retourne le nombre d'éléments dans la collection
   * @returns {number} Le nombre d'éléments
   */
  public getCount(): number {
    return this.elements.length;
  }
}

/**
 * Collection de liens de navigation avec mise à jour des textes
 * @class NavigationLinks
 */
export class NavigationLinks {
  private readonly links: NodeListOf<HTMLElement>;

  /**
   * Crée une nouvelle collection de liens de navigation
   * @param {CssSelector} selector - Le sélecteur CSS pour trouver les liens
   */
  constructor(selector: CssSelector) {
    this.links = querySelectorAll<HTMLElement>(selector.getValue());
  }

  //TODO : A changer quand on passera à i18n
  /**
   * Met à jour les textes des liens selon la langue
   * @param {boolean} isFrench - true pour le français, false pour l'anglais
   */
  public updateTexts(isFrench: boolean): void {
    this.links.forEach((link) => {
      const text = isFrench
        ? link.getAttribute("data-fr")
        : link.getAttribute("data-en");

      if (text) {
        link.textContent = text;
      }
    });
  }

  /**
   * Nettoie les ressources (aucune ressource à nettoyer pour cette classe)
   * @public
   */
  public destroy(): void {
    // Aucun event listener à nettoyer pour cette classe
  }

  /**
   * Retourne le nombre de liens dans la collection
   * @returns {number} Le nombre de liens de navigation
   */
  public getCount(): number {
    return this.links.length;
  }
}

/**
 * Collection d'indicateurs de langue avec mise à jour synchronisée
 * @class LanguageIndicators
 */
export class LanguageIndicators {
  private readonly indicators: HTMLElement[];

  /**
   * Crée une nouvelle collection d'indicateurs de langue
   * @param {ElementId[]} indicatorIds - Les identifiants des éléments indicateurs
   */
  constructor(indicatorIds: ElementId[]) {
    this.indicators = indicatorIds
      .map((id) => getElementById(id.getValue()))
      .filter((element): element is HTMLElement => element !== null);
  }

  /**
   * Met à jour le texte de tous les indicateurs
   * @param {string} displayText - Le texte à afficher
   */
  public updateAll(displayText: string): void {
    this.indicators.forEach((indicator) => {
      indicator.textContent = displayText;
    });
  }

  /**
   * Nettoie les ressources (aucune ressource à nettoyer pour cette classe)
   * @public
   */
  public destroy(): void {
    // Aucun event listener à nettoyer pour cette classe
  }

  /**
   * Retourne le nombre d'indicateurs dans la collection
   * @returns {number} Le nombre d'indicateurs de langue
   */
  public getCount(): number {
    return this.indicators.length;
  }
}

/**
 * Collection de boutons dropdown avec gestion des attributs ARIA pour l'accessibilité
 * @class DropdownButtons
 */
export class DropdownButtons {
  private readonly buttons: HTMLElement[];
  private abortController: AbortController | null = null;

  /**
   * Crée une nouvelle collection de boutons dropdown
   * @param {CssSelector} selector - Le sélecteur CSS pour trouver les boutons
   */
  constructor(selector: CssSelector) {
    this.buttons = Array.from(
      querySelectorAll<HTMLElement>(selector.getValue()),
    );
  }

  /**
   * Met à jour l'état aria-expanded d'un bouton spécifique
   * @param {string} buttonSelector - Le sélecteur pour identifier le bouton spécifique
   * @param {boolean} isExpanded - L'état d'expansion du dropdown
   */
  public setAriaExpanded(buttonSelector: string, isExpanded: boolean): void {
    const button = this.buttons.find((btn) => btn.matches(buttonSelector));
    if (button) {
      button.setAttribute("aria-expanded", isExpanded.toString());
    }
  }

  /**
   * Met à jour l'état aria-expanded de tous les boutons
   * @param {boolean} isExpanded - L'état d'expansion des dropdowns
   */
  public setAllAriaExpanded(isExpanded: boolean): void {
    this.buttons.forEach((button) => {
      button.setAttribute("aria-expanded", isExpanded.toString());
    });
  }

  /**
   * Attache des gestionnaires d'événements pour gérer automatiquement aria-expanded
   * Configure les événements click, keydown et blur pour gérer l'ouverture/fermeture des dropdowns
   * et maintenir l'accessibilité ARIA
   */
  public bindAriaHandlers(): void {
    // Créer un nouveau AbortController
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    this.buttons.forEach((button) => {
      // Gérer l'ouverture au focus et clic
      button.addEventListener(
        "click",
        () => {
          this.toggleAriaExpanded(button);
        },
        { signal },
      );

      button.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.toggleAriaExpanded(button);
          }
        },
        { signal },
      );

      // Gérer la fermeture au blur (avec délai pour permettre la sélection)
      button.addEventListener(
        "blur",
        () => {
          setTimeout(() => {
            const dropdown = button.closest(".dropdown");
            if (dropdown && !dropdown.matches(":focus-within")) {
              button.setAttribute("aria-expanded", "false");
            }
          }, 150);
        },
        { signal },
      );
    });

    // Fermer tous les dropdowns quand on clique ailleurs
    const globalClickHandler = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dropdown")) {
        this.setAllAriaExpanded(false);
      }
    };
    document.addEventListener("click", globalClickHandler, { signal });
  }

  /**
   * Bascule l'état aria-expanded d'un bouton
   * Ferme tous les autres dropdowns avant de basculer l'état du bouton courant
   * @param {HTMLElement} button - Le bouton à basculer
   * @private
   */
  private toggleAriaExpanded(button: HTMLElement): void {
    const currentState = button.getAttribute("aria-expanded") === "true";

    // Fermer tous les autres dropdowns
    this.setAllAriaExpanded(false);

    // Basculer le dropdown courant
    button.setAttribute("aria-expanded", (!currentState).toString());
  }

  /**
   * Nettoie automatiquement tous les event listeners pour éviter les fuites mémoire
   * Cette méthode doit être appelée quand l'instance n'est plus nécessaire
   */
  public cleanup(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Retourne le nombre de boutons dans la collection
   * @returns {number} Le nombre de boutons dropdown
   */
  public getCount(): number {
    return this.buttons.length;
  }
}
