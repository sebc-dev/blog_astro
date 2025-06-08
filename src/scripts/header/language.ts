/**
 * Gestion du changement de langue - Respecte les principes SOLID et Callisthénie
 * @module language-manager
 * @see {@link https://github.com/thoughtworks/object-calisthenics|Object Calisthenics}
 */

import { Language, ElementId, CssSelector } from "./value-objects.js";
import {
  ClickableElements,
  NavigationLinks,
  LanguageIndicators,
} from "./dom-collections.js";

/**
 * Gestionnaire principal de la langue pour l'application
 * @class LanguageManager
 */
export class LanguageManager {
  /** La langue actuellement sélectionnée */
  private currentLanguage: Language;
  /** Les contrôles de langue de l'interface */
  private readonly languageControls: LanguageControls;

  /**
   * Crée une nouvelle instance du gestionnaire de langue
   * Initialise la langue par défaut et configure les événements
   */
  constructor() {
    this.currentLanguage = Language.defaultLanguage();
    this.languageControls = new LanguageControls();

    this.loadSavedLanguage();
    this.bindEvents();
  }

  /**
   * Configure les gestionnaires d'événements pour les changements de langue
   * @private
   */
  private bindEvents(): void {
    this.languageControls.bindClickHandlers(
      this.handleLanguageClick.bind(this),
    );
  }

  /**
   * Gère le clic sur une option de langue
   * @param {MouseEvent} event - L'événement de clic
   * @private
   */
  private handleLanguageClick(event: MouseEvent): void {
    event.preventDefault();
    const target = event.target as HTMLElement;
    const langCode = target.dataset.lang;

    if (!langCode) return;

    const language = Language.fromString(langCode);
    if (language) {
      this.updateLanguage(language);
    }
  }

  /**
   * Charge la langue sauvegardée depuis le localStorage
   * @private
   */
  private loadSavedLanguage(): void {
    const savedLangCode = localStorage.getItem("preferred-language");
    if (savedLangCode) {
      const language = Language.fromString(savedLangCode);
      if (language) {
        this.updateLanguage(language);
      }
    }
  }

  /**
   * Met à jour la langue de l'application
   * @param {Language} language - La nouvelle langue à utiliser
   */
  public updateLanguage(language: Language): void {
    this.currentLanguage = language;
    this.languageControls.updateDisplay(language);
    this.saveToStorage(language);
  }

  /**
   * Sauvegarde la langue dans le localStorage
   * @param {Language} language - La langue à sauvegarder
   * @private
   */
  private saveToStorage(language: Language): void {
    localStorage.setItem("preferred-language", language.getCode());
  }

  /**
   * Retourne la langue actuellement sélectionnée
   * @returns {Language} La langue courante
   */
  public getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Nettoie les ressources utilisées par le gestionnaire
   */
  public destroy(): void {
    this.languageControls.destroy();
  }
}

/**
 * Encapsule tous les contrôles de langue pour respecter Callisthénie règle 8 (max 2 variables)
 * @class LanguageControls
 * @private
 * @see {@link https://github.com/thoughtworks/object-calisthenics#8-no-classes-with-more-than-two-instance-variables|Object Calisthenics Rule 8}
 */
class LanguageControls {
  private readonly clickableElements: ClickableElements;
  private readonly uiElements: LanguageUIElements;

  constructor() {
    this.clickableElements = new ClickableElements(
      new CssSelector(".lang-option, .mobile-lang-option"),
    );
    this.uiElements = new LanguageUIElements();
  }

  /**
   * Attache les gestionnaires de clic aux éléments de langue
   * @param {function} handler - Le gestionnaire d'événements à attacher
   */
  public bindClickHandlers(handler: (event: MouseEvent) => void): void {
    this.clickableElements.bindClickHandler(handler);
  }

  /**
   * Met à jour l'affichage de tous les éléments de langue
   * @param {Language} language - La langue à afficher
   */
  public updateDisplay(language: Language): void {
    this.uiElements.updateAll(language);
  }

  public destroy(): void {
    // Les handlers sont automatiquement nettoyés par ClickableElements
  }
}

/**
 * Encapsule les éléments UI pour l'affichage de la langue
 * @class LanguageUIElements
 * @private
 */
class LanguageUIElements {
  private readonly indicators: LanguageIndicators;
  private readonly navigationLinks: NavigationLinks;

  constructor() {
    this.indicators = new LanguageIndicators([
      new ElementId("current-lang"),
      new ElementId("mobile-current-lang"),
    ]);
    this.navigationLinks = new NavigationLinks(
      new CssSelector(".nav-link, .mobile-nav-link"),
    );
  }

  /**
   * Met à jour tous les éléments d'interface avec la nouvelle langue
   * @param {Language} language - La langue à afficher
   */
  public updateAll(language: Language): void {
    this.indicators.updateAll(language.getDisplayText());
    this.navigationLinks.updateTexts(language.isFrench());
  }
}
