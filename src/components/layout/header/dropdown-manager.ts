/**
 * Dropdown Manager Module
 * Handles dropdown menu functionality
 */

import type { Destroyable, EventCleanup } from "./types";

export class DropdownManager implements Destroyable {
  private dropdownButtons: HTMLElement[] = [];
  private eventCleanups: EventCleanup[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
    const buttons = document.querySelectorAll<HTMLElement>("[data-dropdown]");
    this.dropdownButtons = Array.from(buttons);

    if (!this.dropdownButtons.length) {
      console.warn("No dropdown buttons found");
      return;
    }

    this.bindEventListeners();
  }

  private bindEventListeners(): void {
    // Dropdown button clicks
    this.dropdownButtons.forEach((btn) => {
      const clickHandler = (e: Event) => {
        e.preventDefault();
        this.toggleDropdown(btn);
      };
      btn.addEventListener("click", clickHandler);
      this.eventCleanups.push(() => btn.removeEventListener("click", clickHandler));
    });

    // Close dropdowns on outside click
    const outsideClickHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.(".dropdown")) {
        this.closeAllDropdowns();
      }
    };
    document.addEventListener("click", outsideClickHandler);
    this.eventCleanups.push(() => document.removeEventListener("click", outsideClickHandler));

    // Close dropdowns on Escape key
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.closeAllDropdowns();
      }
    };
    document.addEventListener("keydown", escapeHandler);
    this.eventCleanups.push(() => document.removeEventListener("keydown", escapeHandler));
  }

  private toggleDropdown(button: HTMLElement): void {
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    // Close all other dropdowns first
    this.closeAllDropdowns();

    // Toggle current dropdown if it wasn't expanded
    if (!isExpanded) {
      button.setAttribute("aria-expanded", "true");
    }
  }

  private closeAllDropdowns(): void {
    this.dropdownButtons.forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
    });
  }

  private closeDropdown(button: HTMLElement): void {
    button.setAttribute("aria-expanded", "false");
  }

  private openDropdown(button: HTMLElement): void {
    // Close others first
    this.closeAllDropdowns();
    button.setAttribute("aria-expanded", "true");
  }

  /**
   * Find a dropdown button by selector using hybrid approach:
   * 1. Check cached buttons first (performance)
   * 2. Fallback to DOM query for dynamic elements
   */
  private findButton(selector: string): HTMLElement | null {
    // Try cache first for performance
    const cachedButton = this.dropdownButtons.find(btn => btn.matches(selector));
    if (cachedButton) return cachedButton;
    
    // Fallback to DOM search for dynamic elements
    return document.querySelector<HTMLElement>(selector);
  }

  // Public API
  public closeAll(): void {
    this.closeAllDropdowns();
  }

  public close(selector: string): void {
    const button = this.findButton(selector);
    if (button) {
      this.closeDropdown(button);
    }
  }

  public open(selector: string): void {
    const button = this.findButton(selector);
    if (button) {
      this.openDropdown(button);
    }
  }

  public toggle(selector: string): void {
    const button = this.findButton(selector);
    if (button) {
      this.toggleDropdown(button);
    }
  }

  /**
   * Add a dynamic dropdown button that was added after initialization
   * @param element - The dropdown button element to add
   */
  public addDynamicDropdown(element: HTMLElement): void {
    if (!this.dropdownButtons.includes(element)) {
      this.dropdownButtons.push(element);
      // Bind click event for the new element
      const clickHandler = (e: Event) => {
        e.preventDefault();
        this.toggleDropdown(element);
      };
      element.addEventListener("click", clickHandler);
      this.eventCleanups.push(() => element.removeEventListener("click", clickHandler));
    }
  }

  /**
   * Refresh the dropdown buttons list to include any newly added elements
   */
  public refreshDropdowns(): void {
    // Clean up existing listeners
    this.eventCleanups.forEach(cleanup => cleanup());
    this.eventCleanups = [];
    
    // Re-scan for all dropdown buttons
    const buttons = document.querySelectorAll<HTMLElement>("[data-dropdown]");
    this.dropdownButtons = Array.from(buttons);
    
    // Re-bind event listeners
    this.bindEventListeners();
  }

  /**
   * Clean up all event listeners and resources
   */
  public destroy(): void {
    this.eventCleanups.forEach(cleanup => cleanup());
    this.eventCleanups = [];
    
    // Close all dropdowns and clear references
    this.closeAllDropdowns();
    this.dropdownButtons = [];
  }
}

// Auto-initialize when loaded as a module
let dropdownManager: DropdownManager | null = null;

export function initDropdownManager(): DropdownManager {
  if (!dropdownManager) {
    dropdownManager = new DropdownManager();
  }
  return dropdownManager;
}

export function destroyDropdownManager(): void {
  if (dropdownManager) {
    dropdownManager.destroy();
    dropdownManager = null;
  }
}
