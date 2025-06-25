/**
 * Header Client Module
 * Main module that initializes and coordinates all header functionality
 */

import { initThemeManager, type ThemeManager } from "./theme-manager";
import { initMobileMenuManager, type MobileMenuManager } from "./mobile-menu";
import { initDropdownManager, type DropdownManager } from "./dropdown-manager";
import {
  initScrollEffectsManager,
  type ScrollEffectsManager,
} from "./scroll-effects";

export interface HeaderManagers {
  theme: ThemeManager;
  mobileMenu: MobileMenuManager;
  dropdown: DropdownManager;
  scrollEffects: ScrollEffectsManager;
}

export class HeaderClient {
  private managers: HeaderManagers | null = null;
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.initialized) return;

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.initializeManagers(),
      );
    } else {
      this.initializeManagers();
    }
  }

  private initializeManagers(): void {
    try {
      this.managers = {
        theme: initThemeManager(),
        mobileMenu: initMobileMenuManager(),
        dropdown: initDropdownManager(),
        scrollEffects: initScrollEffectsManager(20),
      };

      this.initialized = true;
      console.log("Header client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize header client:", error);
    }
  }

  // Public API to access managers
  public getManagers(): HeaderManagers | null {
    return this.managers;
  }

  public getThemeManager(): ThemeManager | null {
    return this.managers?.theme || null;
  }

  public getMobileMenuManager(): MobileMenuManager | null {
    return this.managers?.mobileMenu || null;
  }

  public getDropdownManager(): DropdownManager | null {
    return this.managers?.dropdown || null;
  }

  public getScrollEffectsManager(): ScrollEffectsManager | null {
    return this.managers?.scrollEffects || null;
  }

  public isInitialized(): boolean {
    return this.initialized;
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

// Auto-initialize when module is loaded
initHeaderClient();
