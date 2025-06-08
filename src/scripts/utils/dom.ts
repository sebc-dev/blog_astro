/**
 * Utilitaires DOM type-safe pour l'application
 * @module dom-utils
 */

/**
 * Récupère un élément du DOM par son ID avec typage fort
 * @template T Type d'élément HTML attendu, par défaut HTMLElement
 * @param {string} id - L'identifiant de l'élément à récupérer
 * @returns {T | null} L'élément trouvé ou null si non trouvé
 * @example
 * const button = getElementById<HTMLButtonElement>("submit-btn");
 * if (button) {
 *   button.disabled = true;
 * }
 */
export function getElementById<T extends HTMLElement = HTMLElement>(
  id: string,
): T | null {
  return document.getElementById(id) as T | null;
}

/**
 * Sélectionne tous les éléments correspondant au sélecteur CSS avec typage fort
 * @template T Type d'élément HTML attendu, par défaut Element
 * @param {string} selector - Le sélecteur CSS
 * @returns {NodeListOf<T>} Liste des éléments trouvés
 * @example
 * const buttons = querySelectorAll<HTMLButtonElement>(".action-btn");
 * buttons.forEach(btn => btn.disabled = true);
 */
export function querySelectorAll<T extends Element = Element>(
  selector: string,
): NodeListOf<T> {
  return document.querySelectorAll<T>(selector);
}

/**
 * Ajoute une ou plusieurs classes CSS à un élément
 * @param {Element | null} element - L'élément à modifier
 * @param {...string} classes - Les classes CSS à ajouter
 * @example
 * addClass(element, "active", "visible");
 */
export function addClass(element: Element | null, ...classes: string[]): void {
  element?.classList.add(...classes);
}

/**
 * Retire une ou plusieurs classes CSS d'un élément
 * @param {Element | null} element - L'élément à modifier
 * @param {...string} classes - Les classes CSS à retirer
 * @example
 * removeClass(element, "active", "visible");
 */
export function removeClass(
  element: Element | null,
  ...classes: string[]
): void {
  element?.classList.remove(...classes);
}

/**
 * Bascule une classe CSS sur un élément
 * @param {Element | null} element - L'élément à modifier
 * @param {string} className - La classe CSS à basculer
 * @param {boolean} [force] - Force l'ajout (true) ou le retrait (false) de la classe
 * @example
 * toggleClass(element, "active"); // Bascule
 * toggleClass(element, "visible", true); // Force l'ajout
 */
export function toggleClass(
  element: Element | null,
  className: string,
  force?: boolean,
): void {
  if (force !== undefined) {
    element?.classList.toggle(className, force);
  } else {
    element?.classList.toggle(className);
  }
}

/**
 * Vérifie si un élément possède une classe CSS
 * @param {Element | null} element - L'élément à vérifier
 * @param {string} className - La classe CSS à rechercher
 * @returns {boolean} true si l'élément possède la classe, false sinon
 * @example
 * if (hasClass(element, "active")) {
 *   // ...
 * }
 */
export function hasClass(element: Element | null, className: string): boolean {
  return element?.classList.contains(className) ?? false;
}

/**
 * Contrôle le débordement du body
 * @param {boolean} hidden - true pour cacher le débordement, false pour le montrer
 * @example
 * setBodyOverflow(true); // Cache le débordement (utile pour les modales)
 * setBodyOverflow(false); // Restaure le débordement
 */
export function setBodyOverflow(hidden: boolean): void {
  toggleClass(document.body, "overflow-hidden", hidden);
}
