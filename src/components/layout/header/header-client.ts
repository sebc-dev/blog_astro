/**
 * Header Client Module
 * Main module that initializes and coordinates all header functionality
 */

import { 
  initThemeManager, 
  destroyThemeManager,
  type ThemeManager 
} from "./theme-manager";
import { 
  initMobileMenuManager, 
  destroyMobileMenuManager,
  type MobileMenuManager 
} from "./mobile-menu";
import { 
  initDropdownManager, 
  destroyDropdownManager,
  type DropdownManager 
} from "./dropdown-manager";
import {
  initScrollEffectsManager,
  destroyScrollEffectsManager,
  type ScrollEffectsManager,
} from "./scroll-effects";
import type { Destroyable } from "./types";

export interface HeaderManagers {
  theme: ThemeManager;
  mobileMenu: MobileMenuManager;
  dropdown: DropdownManager;
  scrollEffects: ScrollEffectsManager;
}

export class HeaderClient implements Destroyable {
  private managers: Partial<HeaderManagers> = {};
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.initialized) return;

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.basicInitialization(),
      );
    } else {
      this.basicInitialization();
    }
  }

  private basicInitialization(): void {
    try {
      // Only initialize the most critical manager on startup - Theme Manager
      // This ensures the correct theme is applied immediately to prevent flash
      this.managers.theme = initThemeManager();

      // Other managers will be initialized on-demand via lazy loading getters
      // This improves initial page load performance
      
      this.initialized = true;
      
      // Set up preloading for likely user interactions
      this.setupPreloading();
    } catch (error) {
      console.error("Failed to initialize header client:", error);
    }
  }

  /**
   * Set up intelligent preloading of managers based on user behavior
   */
  private setupPreloading(): void {
    // Preload mobile menu manager on mobile devices
    if (window.matchMedia("(max-width: 768px)").matches) {
      // Use requestIdleCallback for non-blocking initialization
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          if (!this.managers.mobileMenu) {
            this.getMobileMenuManager();
          }
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          if (!this.managers.mobileMenu) {
            this.getMobileMenuManager();
          }
        }, 100);
      }
    }
    
    // Preload scroll effects after a short delay
    setTimeout(() => {
      if (!this.managers.scrollEffects) {
        this.getScrollEffectsManager();
      }
    }, 500);
    
    // Preload dropdown manager on hover over header
    const header = document.querySelector('header');
    if (header) {
      let preloadTimer: NodeJS.Timeout | null = null;
      const preloadHandler = () => {
        if (!this.managers.dropdown && !preloadTimer) {
          preloadTimer = setTimeout(() => {
            this.getDropdownManager();
          }, 150);
        }
      };
      
      header.addEventListener('mouseenter', preloadHandler, { once: true });
      // Also preload on focus for keyboard users
      header.addEventListener('focusin', preloadHandler, { once: true });
    }
  }

  // Lazy loading getters for managers
  public getThemeManager(): ThemeManager {
    if (!this.managers.theme) {
      this.managers.theme = initThemeManager();
    }
    return this.managers.theme;
  }

  public getMobileMenuManager(): MobileMenuManager {
    if (!this.managers.mobileMenu) {
      this.managers.mobileMenu = initMobileMenuManager();
    }
    return this.managers.mobileMenu;
  }

  public getDropdownManager(): DropdownManager {
    if (!this.managers.dropdown) {
      this.managers.dropdown = initDropdownManager();
    }
    return this.managers.dropdown;
  }

  public getScrollEffectsManager(): ScrollEffectsManager {
    if (!this.managers.scrollEffects) {
      this.managers.scrollEffects = initScrollEffectsManager(20, true);
    }
    return this.managers.scrollEffects;
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use individual getters instead (getThemeManager(), getMobileMenuManager(), etc.)
   */
  public getManagers(): HeaderManagers | null {
    // Ensure all managers are initialized
    return {
      theme: this.getThemeManager(),
      mobileMenu: this.getMobileMenuManager(),
      dropdown: this.getDropdownManager(),
      scrollEffects: this.getScrollEffectsManager(),
    };
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Clean up all managers and resources
   */
  public destroy(): void {
    // Destroy all initialized managers
    if (this.managers.theme) {
      destroyThemeManager();
    }
    if (this.managers.mobileMenu) {
      destroyMobileMenuManager();
    }
    if (this.managers.dropdown) {
      destroyDropdownManager();
    }
    if (this.managers.scrollEffects) {
      destroyScrollEffectsManager();
    }

    // Clear references
    this.managers = {};
    this.initialized = false;
  }

  /**
   * Reinitialize the header client
   */
  public reinitialize(): void {
    this.destroy();
    this.init();
  }
}

// Global instance
let headerClient: HeaderClient | null = null;

export function initHeaderClient(): HeaderClient {
  headerClient ??= new HeaderClient();
  return headerClient;
}

export function getHeaderClient(): HeaderClient | null {
  return headerClient;
}

export function destroyHeaderClient(): void {
  if (headerClient) {
    headerClient.destroy();
    headerClient = null;
  }
}

// Auto-initialize when module is loaded
initHeaderClient();
