/**
 * Dropdown Manager Module
 * Handles dropdown menu functionality
 */

import type { Destroyable, EventCleanup } from "./types";

export class DropdownManager implements Destroyable {
  private dropdownButtons: HTMLElement[] = [];
  private eventCleanups: EventCleanup[] = [];
  
  // DOM cache for improved performance
  private domCache = new Map<string, HTMLElement>();
  private lastCacheTime = 0;
  private readonly CACHE_TTL = 5000; // 5 seconds cache TTL
  
  // WeakMap for element metadata to avoid memory leaks
  private elementMetadata = new WeakMap<HTMLElement, { 
    lastAccessed: number;
    selector: string;
  }>();

  constructor() {
    this.init();
  }

  private init(): void {
    // Use cached query if available and fresh
    const buttons = this.getCachedElements("[data-dropdown]");
    this.dropdownButtons = Array.from(buttons);

    if (!this.dropdownButtons.length) {
      console.warn("No dropdown buttons found");
      return;
    }

    // Cache all buttons for quick access
    this.dropdownButtons.forEach((btn, index) => {
      const selector = `[data-dropdown]:nth-of-type(${index + 1})`;
      this.cacheElement(selector, btn);
    });

    this.bindEventListeners();
  }

  /**
   * Get elements with caching for improved performance
   */
  private getCachedElements(selector: string): NodeListOf<HTMLElement> {
    const now = Date.now();
    
    // Check if we need to invalidate the entire cache
    if (now - this.lastCacheTime > this.CACHE_TTL) {
      this.domCache.clear();
      this.lastCacheTime = now;
    }
    
    // For querySelectorAll, we need to get fresh data but we can cache individual elements
    const elements = document.querySelectorAll<HTMLElement>(selector);
    return elements;
  }

  /**
   * Cache a single element for quick retrieval
   */
  private cacheElement(selector: string, element: HTMLElement): void {
    this.domCache.set(selector, element);
    this.elementMetadata.set(element, {
      lastAccessed: Date.now(),
      selector
    });
  }

  /**
   * Get a single cached element or query the DOM
   */
  private getCachedElement(selector: string): HTMLElement | null {
    const cached = this.domCache.get(selector);
    
    if (cached && document.contains(cached)) {
      // Update last accessed time
      const metadata = this.elementMetadata.get(cached);
      if (metadata) {
        metadata.lastAccessed = Date.now();
      }
      return cached;
    }
    
    // Cache miss or stale - query DOM
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      this.cacheElement(selector, element);
    }
    
    return element;
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
   * Find a dropdown button by selector using enhanced caching:
   * 1. Check DOM cache first (fastest)
   * 2. Check cached buttons array (fast)
   * 3. Fallback to DOM query for dynamic elements (slower)
   */
  private findButton(selector: string): HTMLElement | null {
    // Try DOM cache first (fastest)
    const cached = this.getCachedElement(selector);
    if (cached && this.dropdownButtons.includes(cached)) {
      return cached;
    }
    
    // Try cached buttons array
    const cachedButton = this.dropdownButtons.find(btn => btn.matches(selector));
    if (cachedButton) {
      // Add to cache for next time
      this.cacheElement(selector, cachedButton);
      return cachedButton;
    }
    
    // Fallback to DOM search for dynamic elements
    const element = document.querySelector<HTMLElement>(selector);
    if (element && element.hasAttribute("data-dropdown")) {
      this.cacheElement(selector, element);
      return element;
    }
    
    return null;
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
   * Refresh the dropdown buttons list to include any newly added elements.
   * ⚠️ WARNING: Use sparingly as this method has performance impact.
   * Only call after significant DOM changes that affect dropdown buttons.
   * For single dynamic additions, prefer addDynamicDropdown() instead.
   */
  public refreshDropdowns(): void {
    // Clean up existing listeners
    this.eventCleanups.forEach(cleanup => cleanup());
    this.eventCleanups = [];
    
    // Clear cache to force fresh DOM queries
    this.domCache.clear();
    this.lastCacheTime = Date.now();
    
    // Re-scan for all dropdown buttons
    const buttons = this.getCachedElements("[data-dropdown]");
    this.dropdownButtons = Array.from(buttons);
    
    // Re-cache all buttons
    this.dropdownButtons.forEach((btn, index) => {
      const selector = `[data-dropdown]:nth-of-type(${index + 1})`;
      this.cacheElement(selector, btn);
    });
    
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
    
    // Clear caches to free memory
    this.domCache.clear();
    // WeakMap will auto-cleanup when elements are garbage collected
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
