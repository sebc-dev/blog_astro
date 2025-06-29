/**
 * Scroll Effects Manager Module
 * Handles header scroll effects and backdrop blur
 */

export class ScrollEffectsManager {
  private headers: NodeListOf<HTMLElement> | null = null;
  private scrollThreshold: number = 20;
  private ticking: boolean = false;

  constructor(threshold: number = 20) {
    this.scrollThreshold = threshold;
    this.init();
  }

  private init(): void {
    this.headers = document.querySelectorAll(".header-critical");

    if (!this.headers.length) {
      console.warn("No header elements found with class .header-critical");
      return;
    }

    this.bindEventListeners();
    // Initial check for page load
    this.updateHeaderState();
  }

  private bindEventListeners(): void {
    // Throttled scroll listener using requestAnimationFrame
    window.addEventListener(
      "scroll",
      () => {
        if (!this.ticking) {
          requestAnimationFrame(() => {
            this.updateHeaderState();
            this.ticking = false;
          });
          this.ticking = true;
        }
      },
      { passive: true },
    );

    // Update on resize to handle dynamic content
    window.addEventListener(
      "resize",
      () => {
        this.updateHeaderState();
      },
      { passive: true },
    );
  }

  private updateHeaderState(): void {
    if (!this.headers) return;

    const scrolled = window.scrollY > this.scrollThreshold;

    this.headers.forEach((header) => {
      header.classList.toggle("scrolled", scrolled);
    });
  }

  private addScrolledClass(): void {
    if (!this.headers) return;

    this.headers.forEach((header) => {
      header.classList.add("scrolled");
    });
  }

  private removeScrolledClass(): void {
    if (!this.headers) return;

    this.headers.forEach((header) => {
      header.classList.remove("scrolled");
    });
  }

  // Public API
  public setThreshold(threshold: number): void {
    this.scrollThreshold = threshold;
    this.updateHeaderState();
  }

  public getThreshold(): number {
    return this.scrollThreshold;
  }

  public forceScrolledState(scrolled: boolean): void {
    if (scrolled) {
      this.addScrolledClass();
    } else {
      this.removeScrolledClass();
    }
  }

  public getCurrentScrollPosition(): number {
    return window.scrollY;
  }

  public isScrolled(): boolean {
    return window.scrollY > this.scrollThreshold;
  }

  public refresh(): void {
    this.updateHeaderState();
  }
}

// Auto-initialize when loaded as a module
let scrollEffectsManager: ScrollEffectsManager | null = null;

export function initScrollEffectsManager(
  threshold?: number,
): ScrollEffectsManager {
  if (!scrollEffectsManager) {
    scrollEffectsManager = new ScrollEffectsManager(threshold);
  }
  return scrollEffectsManager;
}
