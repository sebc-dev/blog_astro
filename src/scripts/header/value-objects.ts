/**
 * Value Objects pour encapsuler les primitives selon la Callisthénie règle 3
 * @module value-objects
 */

/**
 * Codes de langue supportés par l'application
 * @typedef {"fr" | "en"} LanguageCode
 */
export type LanguageCode = "fr" | "en";

/**
 * Value Object pour encapsuler le concept de langue
 * Garantit la validité du code de langue et fournit des méthodes utilitaires
 * @class Language
 */
export class Language {
  /**
   * Crée une nouvelle instance de Language
   * @param {LanguageCode} code - Le code de langue à encapsuler
   * @throws {Error} Si le code de langue n'est pas valide
   */
  constructor(private readonly code: LanguageCode) {
    if (!["fr", "en"].includes(code)) {
      throw new Error(`Code de langue invalide: ${code}`);
    }
  }

  /**
   * Retourne le code de langue
   * @returns {LanguageCode} Le code de langue encapsulé
   */
  public getCode(): LanguageCode {
    return this.code;
  }

  /**
   * Retourne le texte d'affichage de la langue (en majuscules)
   * @returns {string} Le code de langue en majuscules
   */
  public getDisplayText(): string {
    return this.code.toUpperCase();
  }

  /**
   * Vérifie si la langue est le français
   * @returns {boolean} true si la langue est le français
   */
  public isFrench(): boolean {
    return this.code === "fr";
  }

  /**
   * Vérifie si la langue est l'anglais
   * @returns {boolean} true si la langue est l'anglais
   */
  public isEnglish(): boolean {
    return this.code === "en";
  }

  /**
   * Compare cette langue avec une autre
   * @param {Language} other - L'autre langue à comparer
   * @returns {boolean} true si les langues sont identiques
   */
  public equals(other: Language): boolean {
    return this.code === other.code;
  }

  /**
   * Crée une instance de Language à partir d'une chaîne
   * @param {string} value - La chaîne à convertir
   * @returns {Language | null} Une instance de Language si la chaîne est valide, null sinon
   */
  public static fromString(value: string): Language | null {
    if (value === "fr" || value === "en") {
      return new Language(value);
    }
    return null;
  }

  /**
   * Retourne la langue par défaut (français)
   * @returns {Language} Une instance de Language avec le code "fr"
   */
  public static defaultLanguage(): Language {
    return new Language("fr");
  }
}

/**
 * Value Object pour encapsuler les identifiants d'éléments DOM
 * @class ElementId
 */
export class ElementId {
  /**
   * Crée une nouvelle instance de ElementId
   * @param {string} value - L'identifiant à encapsuler
   * @throws {Error} Si l'identifiant est vide ou ne contient que des espaces
   */
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("L'ID d'élément ne peut pas être vide");
    }
  }

  /**
   * Retourne l'identifiant encapsulé
   * @returns {string} L'identifiant
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compare cet identifiant avec un autre
   * @param {ElementId} other - L'autre identifiant à comparer
   * @returns {boolean} true si les identifiants sont identiques
   */
  public equals(other: ElementId): boolean {
    return this.value === other.value;
  }
}

/**
 * Value Object pour encapsuler les sélecteurs CSS
 * @class CssSelector
 */
export class CssSelector {
  /**
   * Crée une nouvelle instance de CssSelector
   * @param {string} value - Le sélecteur CSS à encapsuler
   * @throws {Error} Si le sélecteur est vide ou ne contient que des espaces
   */
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Le sélecteur CSS ne peut pas être vide");
    }
  }

  /**
   * Retourne le sélecteur CSS encapsulé
   * @returns {string} Le sélecteur CSS
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compare ce sélecteur avec un autre
   * @param {CssSelector} other - L'autre sélecteur à comparer
   * @returns {boolean} true si les sélecteurs sont identiques
   */
  public equals(other: CssSelector): boolean {
    return this.value === other.value;
  }
}
