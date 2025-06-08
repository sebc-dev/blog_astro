/**
 * Point d'entrée principal pour la gestion du Header
 * Orchestre tous les modules : scroll, menu mobile, langue et thème
 * @module header
 * @see {@link ScrollHandler}
 * @see {@link MobileMenu}
 * @see {@link LanguageManager}
 * @see {@link ThemeManager}
 */

import { ScrollHandler } from "./scroll-handler.js";
import { MobileMenu } from "./mobile-menu.js";
import { LanguageManager } from "./language.js";
import { ThemeManager } from "./theme.js";

/**
 * Gestionnaire principal du header
 * Coordonne tous les sous-modules du header
 * @class HeaderManager
 */
export class HeaderManager {
  private scrollHandler: ScrollHandler;
  private mobileMenu: MobileMenu;
  private languageManager: LanguageManager;
  private themeManager: ThemeManager;

  /**
   * Crée une nouvelle instance du gestionnaire principal
   * Initialise tous les sous-modules
   */
  constructor() {
    this.scrollHandler = new ScrollHandler();
    this.mobileMenu = new MobileMenu();
    this.languageManager = new LanguageManager();
    this.themeManager = new ThemeManager();
  }

  /**
   * Retourne le gestionnaire de défilement
   * @returns {ScrollHandler} Le gestionnaire de défilement
   */
  public getScrollHandler(): ScrollHandler {
    return this.scrollHandler;
  }

  /**
   * Retourne le gestionnaire du menu mobile
   * @returns {MobileMenu} Le gestionnaire du menu mobile
   */
  public getMobileMenu(): MobileMenu {
    return this.mobileMenu;
  }

  /**
   * Retourne le gestionnaire de langue
   * @returns {LanguageManager} Le gestionnaire de langue
   */
  public getLanguageManager(): LanguageManager {
    return this.languageManager;
  }

  /**
   * Retourne le gestionnaire de thème
   * @returns {ThemeManager} Le gestionnaire de thème
   */
  public getThemeManager(): ThemeManager {
    return this.themeManager;
  }

  /**
   * Nettoie les ressources de tous les gestionnaires
   * @public
   */
  public destroy(): void {
    this.scrollHandler.destroy();
    this.mobileMenu.destroy();
    this.languageManager.destroy();
    this.themeManager.destroy();
  }
}

/**
 * Instance globale du HeaderManager
 * Initialisée automatiquement au chargement du DOM
 * @type {HeaderManager | null}
 */
let headerManagerInstance: HeaderManager | null = null;

/**
 * Initialise le HeaderManager
 * @returns {HeaderManager} L'instance du HeaderManager
 */
export function initializeHeader(): HeaderManager {
  if (headerManagerInstance) {
    headerManagerInstance.destroy();
  }

  headerManagerInstance = new HeaderManager();
  return headerManagerInstance;
}

/**
 * Retourne l'instance courante du HeaderManager
 * @returns {HeaderManager | null} L'instance courante ou null si non initialisée
 */
export function getHeaderManager(): HeaderManager | null {
  return headerManagerInstance;
}

/**
 * Auto-initialisation au chargement du DOM
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeHeader();
});

// Exports pour usage externe
export { ScrollHandler } from "./scroll-handler.js";
export { MobileMenu } from "./mobile-menu.js";
export { LanguageManager } from "./language.js";
export { ThemeManager } from "./theme.js";
export { Language, type LanguageCode } from "./value-objects.js";
