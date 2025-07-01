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

  // Public API
  public closeAll(): void {
    this.closeAllDropdowns();
  }

  public close(selector: string): void {
    const button = this.dropdownButtons.find(btn => btn.matches(selector));
    if (button) {
      this.closeDropdown(button);
    }
  }

  public open(selector: string): void {
    const button = this.dropdownButtons.find(btn => btn.matches(selector));
    if (button) {
      this.openDropdown(button);
    }
  }

  public toggle(selector: string): void {
    const button = this.dropdownButtons.find(btn => btn.matches(selector));
    if (button) {
      this.toggleDropdown(button);
    }
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
