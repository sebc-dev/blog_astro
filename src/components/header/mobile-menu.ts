/**
 * Mobile Menu Manager Module
 * Handles mobile menu opening/closing functionality
 */

export class MobileMenuManager {
  private menu: HTMLElement | null = null;
  private toggleButton: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private isOpen: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    this.menu = document.querySelector("#mobile-menu");
    this.toggleButton = document.querySelector("#mobile-menu-toggle");
    this.overlay = document.querySelector("[data-menu-overlay]");

    if (!this.menu || !this.toggleButton) {
      console.warn("Mobile menu elements not found");
      return;
    }

    this.bindEventListeners();
  }

  private bindEventListeners(): void {
    if (!this.toggleButton) return;

    // Toggle button click
    this.toggleButton.addEventListener("click", () => this.toggleMenu());

    // Overlay click to close
    this.overlay?.addEventListener("click", () => this.closeMenu());

    // Escape key to close
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.closeMenu();
      }
    });
  }

  private toggleMenu(): void {
    this.isOpen = !this.isOpen;
    this.updateMenuState();
  }

  private closeMenu(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.updateMenuState();
    }
  }

  private openMenu(): void {
    if (!this.isOpen) {
      this.isOpen = true;
      this.updateMenuState();
    }
  }

  private updateMenuState(): void {
    if (!this.menu || !this.toggleButton) return;

    // Update menu visibility
    this.menu.style.transform = this.isOpen
      ? "translateX(0)"
      : "translateX(100%)";

    // Update toggle button state
    this.toggleButton.setAttribute("aria-expanded", String(this.isOpen));
    this.toggleButton.classList.toggle("menu-open", this.isOpen);

    // Update body scroll
    document.body.style.overflow = this.isOpen ? "hidden" : "";
  }

  // Public API
  public getIsOpen(): boolean {
    return this.isOpen;
  }

  public open(): void {
    this.openMenu();
  }

  public close(): void {
    this.closeMenu();
  }

  public toggle(): void {
    this.toggleMenu();
  }
}

// Auto-initialize when loaded as a module
let mobileMenuManager: MobileMenuManager | null = null;

export function initMobileMenuManager(): MobileMenuManager {
  if (!mobileMenuManager) {
    mobileMenuManager = new MobileMenuManager();
  }
  return mobileMenuManager;
}
