/**
 * Dropdown Manager Module
 * Handles dropdown menu functionality
 */

export class DropdownManager {
  private dropdownButtons: NodeListOf<HTMLElement> | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    this.dropdownButtons = document.querySelectorAll('[data-dropdown]');
    
    if (!this.dropdownButtons.length) {
      console.warn('No dropdown buttons found');
      return;
    }

    this.bindEventListeners();
  }

  private bindEventListeners(): void {
    if (!this.dropdownButtons) return;

    // Dropdown button clicks
    this.dropdownButtons.forEach(btn => {
      btn.addEventListener('click', (e: Event) => {
        e.preventDefault();
        this.toggleDropdown(btn);
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.('.dropdown')) {
        this.closeAllDropdowns();
      }
    });

    // Close dropdowns on Escape key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeAllDropdowns();
      }
    });
  }

  private toggleDropdown(button: HTMLElement): void {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    
    // Close all other dropdowns first
    this.closeAllDropdowns();
    
    // Toggle current dropdown if it wasn't expanded
    if (!isExpanded) {
      button.setAttribute('aria-expanded', 'true');
    }
  }

  private closeAllDropdowns(): void {
    if (!this.dropdownButtons) return;
    
    this.dropdownButtons.forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  private closeDropdown(button: HTMLElement): void {
    button.setAttribute('aria-expanded', 'false');
  }

  private openDropdown(button: HTMLElement): void {
    // Close others first
    this.closeAllDropdowns();
    button.setAttribute('aria-expanded', 'true');
  }

  // Public API
  public closeAll(): void {
    this.closeAllDropdowns();
  }

  public close(selector: string): void {
    const button = document.querySelector<HTMLElement>(selector);
    if (button) {
      this.closeDropdown(button);
    }
  }

  public open(selector: string): void {
    const button = document.querySelector<HTMLElement>(selector);
    if (button) {
      this.openDropdown(button);
    }
  }

  public toggle(selector: string): void {
    const button = document.querySelector<HTMLElement>(selector);
    if (button) {
      this.toggleDropdown(button);
    }
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