/**
 * Mobile Menu Manager Module
 * Handles mobile menu opening/closing functionality
 */

import type { Destroyable, EventCleanup } from "./types";

export class MobileMenuManager implements Destroyable {
  private menu: HTMLElement | null = null;
  private toggleButton: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private isOpen = false;
  private eventCleanups: EventCleanup[] = [];
  
  // DOM cache for improved performance
  private domCache = new Map<string, HTMLElement | null>();
  private cacheInitialized = false;

  constructor() {
    this.init();
  }

  private init(): void {
    // Use cached queries for better performance
    this.menu = this.getCachedElement("#mobile-menu");
    this.toggleButton = this.getCachedElement("#mobile-menu-toggle");
    this.overlay = this.getCachedElement("[data-menu-overlay]");

    if (!this.menu || !this.toggleButton) {
      console.warn("Mobile menu elements not found");
      return;
    }

    this.bindEventListeners();
  }

  /**
   * Get a cached element or query the DOM
   * Since mobile menu elements are typically static, we can cache them permanently
   */
  private getCachedElement(selector: string): HTMLElement | null {
    // Check cache first
    if (this.domCache.has(selector)) {
      const cached = this.domCache.get(selector);
      // Verify element is still in DOM
      if (cached && document.contains(cached)) {
        return cached;
      }
    }
    
    // Query DOM and cache result
    const element = document.querySelector<HTMLElement>(selector);
    this.domCache.set(selector, element);
    return element;
  }

  private bindEventListeners(): void {
    if (!this.toggleButton) return;

    // Toggle button click
    const toggleHandler = () => this.toggleMenu();
    this.toggleButton.addEventListener("click", toggleHandler);
    this.eventCleanups.push(() => this.toggleButton?.removeEventListener("click", toggleHandler));

    // Overlay click to close
    if (this.overlay) {
      const overlayHandler = () => this.closeMenu();
      this.overlay.addEventListener("click", overlayHandler);
      this.eventCleanups.push(() => this.overlay?.removeEventListener("click", overlayHandler));
    }

    // Escape key to close
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.closeMenu();
      }
    };
    document.addEventListener("keydown", escapeHandler);
    this.eventCleanups.push(() => document.removeEventListener("keydown", escapeHandler));
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

    // Use CSS classes for better performance - toggle the closed state
    this.menu.classList.toggle('mobile-menu-closed', !this.isOpen);

    // Update aria-hidden for accessibility
    this.menu.setAttribute('aria-hidden', String(!this.isOpen));

    // Optimize animations with will-change
    if (this.isOpen) {
      this.menu.style.willChange = 'transform';
      // Clean up after animation
      setTimeout(() => {
        if (this.menu) this.menu.style.willChange = 'auto';
      }, 300);
    } else {
      this.menu.style.willChange = 'auto';
    }

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

  /**
   * Clean up all event listeners and resources
   */
  public destroy(): void {
    this.eventCleanups.forEach(cleanup => cleanup());
    this.eventCleanups = [];
    
    // Reset menu state to closed
    if (this.menu) {
      this.menu.classList.add('mobile-menu-closed');
      this.menu.setAttribute('aria-hidden', 'true');
      this.menu.style.willChange = 'auto';
    }
    
    if (this.toggleButton) {
      this.toggleButton.classList.remove('menu-open');
      this.toggleButton.setAttribute("aria-expanded", "false");
    }
    
    // Reset body scroll
    document.body.style.overflow = "";
    
    // Clear references and cache
    this.menu = null;
    this.toggleButton = null;
    this.overlay = null;
    this.isOpen = false;
    this.domCache.clear();
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

export function destroyMobileMenuManager(): void {
  if (mobileMenuManager) {
    mobileMenuManager.destroy();
    mobileMenuManager = null;
  }
}
