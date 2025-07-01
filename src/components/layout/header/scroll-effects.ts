/**
 * Scroll Effects Manager Module
 * Handles header scroll effects and backdrop blur
 */

import type { Destroyable, EventCleanup } from "./types";

export class ScrollEffectsManager implements Destroyable {
  private headers: HTMLElement[] = [];
  private scrollThreshold = 20;
  private ticking = false;
  private eventCleanups: EventCleanup[] = [];
  private observer: IntersectionObserver | null = null;
  private sentinel: HTMLElement | null = null;
  private useIntersectionObserver = false;

  constructor(threshold: number = 20, useIntersectionObserver: boolean = false) {
    this.scrollThreshold = threshold;
    this.useIntersectionObserver = useIntersectionObserver;
    this.init();
  }

  private init(): void {
    const headerElements = document.querySelectorAll<HTMLElement>(".header-critical");
    this.headers = Array.from(headerElements);

    if (!this.headers.length) {
      console.warn("No header elements found with class .header-critical");
      return;
    }

    if (this.useIntersectionObserver && 'IntersectionObserver' in window) {
      this.initWithIntersectionObserver();
    } else {
      this.bindEventListeners();
    }
    
    // Initial check for page load
    this.updateHeaderState();
  }

  private initWithIntersectionObserver(): void {
    // Create a sentinel element at the top of the page
    this.sentinel = document.createElement('div');
    this.sentinel.style.position = 'absolute';
    this.sentinel.style.top = '0';
    this.sentinel.style.height = `${this.scrollThreshold}px`;
    this.sentinel.style.width = '1px';
    this.sentinel.style.visibility = 'hidden';
    document.body.prepend(this.sentinel);

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const scrolled = !entry.isIntersecting;
          this.headers.forEach(header => {
            header.classList.toggle('scrolled', scrolled);
          });
        });
      },
      { 
        rootMargin: '0px',
        threshold: 0
      }
    );

    this.observer.observe(this.sentinel);
  }

  private bindEventListeners(): void {
    // Throttled scroll listener using requestAnimationFrame
    const scrollHandler = () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateHeaderState();
          this.ticking = false;
        });
        this.ticking = true;
      }
    };
    
    window.addEventListener("scroll", scrollHandler, { passive: true });
    this.eventCleanups.push(() => window.removeEventListener("scroll", scrollHandler));

    // Update on resize to handle dynamic content
    const resizeHandler = () => {
      this.updateHeaderState();
    };
    
    window.addEventListener("resize", resizeHandler, { passive: true });
    this.eventCleanups.push(() => window.removeEventListener("resize", resizeHandler));
  }

  private updateHeaderState(): void {
    const scrolled = window.scrollY > this.scrollThreshold;

    this.headers.forEach((header) => {
      header.classList.toggle("scrolled", scrolled);
    });
  }

  private addScrolledClass(): void {
    this.headers.forEach((header) => {
      header.classList.add("scrolled");
    });
  }

  private removeScrolledClass(): void {
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

  /**
   * Clean up all event listeners and resources
   */
  public destroy(): void {
    this.eventCleanups.forEach(cleanup => cleanup());
    this.eventCleanups = [];
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // Clean up sentinel element to prevent memory leak
    if (this.sentinel && this.sentinel.parentNode) {
      this.sentinel.parentNode.removeChild(this.sentinel);
      this.sentinel = null;
    }
    
    // Remove scrolled class from all headers
    this.removeScrolledClass();
    this.headers = [];
    this.ticking = false;
  }
}

// Auto-initialize when loaded as a module
let scrollEffectsManager: ScrollEffectsManager | null = null;

export function initScrollEffectsManager(
  threshold?: number,
  useIntersectionObserver?: boolean,
): ScrollEffectsManager {
  if (!scrollEffectsManager) {
    scrollEffectsManager = new ScrollEffectsManager(threshold, useIntersectionObserver);
  }
  return scrollEffectsManager;
}

export function destroyScrollEffectsManager(): void {
  if (scrollEffectsManager) {
    scrollEffectsManager.destroy();
    scrollEffectsManager = null;
  }
}
