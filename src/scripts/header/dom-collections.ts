/**
 * Collections First-Class selon la Callisthénie règle 4
 * Encapsule les collections d'éléments DOM avec comportements spécifiques
 * @module dom-collections
 * @see {@link https://github.com/thoughtworks/object-calisthenics#4-first-class-collections|Object Calisthenics Rule 4}
 */

import { querySelectorAll, getElementById } from "../utils/dom.js";
import { CssSelector, ElementId } from "./value-objects.js";

/**
 * Collection d'éléments cliquables avec gestion d'événements unifiée
 */
/**
 * Collection d'éléments cliquables avec gestion unifiée des événements
 * @class ClickableElements
 */
export class ClickableElements {
  private readonly elements: NodeListOf<HTMLElement>;

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
    this.elements.forEach((element) => {
      element.addEventListener("click", handler);
    });
  }

  /**
   * Détache un gestionnaire d'événements click de tous les éléments
   * @param {function} handler - Le gestionnaire d'événements à détacher
   */
  public unbindClickHandler(handler: (event: MouseEvent) => void): void {
    this.elements.forEach((element) => {
      element.removeEventListener("click", handler);
    });
  }

  public getCount(): number {
    return this.elements.length;
  }
}

/**
 * Collection d'éléments de navigation avec mise à jour de texte
 */
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

  public getCount(): number {
    return this.links.length;
  }
}

/**
 * Collection d'indicateurs de langue avec mise à jour synchronisée
 */
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

  public getCount(): number {
    return this.indicators.length;
  }
}
