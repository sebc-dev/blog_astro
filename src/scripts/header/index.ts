/**
 * Script Header simplifié - index.ts
 * Version épurée qui ne gère que le menu mobile et le thème
 * 
 * Remplace l'ancien système complexe de gestion des langues
 * par une approche plus simple et maintenable.
 */

/**
 * Gestionnaire simplifié pour le Header
 * Gère uniquement le menu mobile et la synchronisation des thèmes
 */
class SimplifiedHeaderManager {
  private mobileMenuToggle: HTMLElement | null;
  private mobileOverlay: HTMLElement | null;
  private mobileMenuContent: HTMLElement | null;
  private isMenuOpen = false;
  private abortController = new AbortController();

  constructor() {
    this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    this.mobileOverlay = document.getElementById('mobile-overlay');
    this.mobileMenuContent = document.getElementById('mobile-menu-content');
    
    this.init();
  }

  /**
   * Initialise le gestionnaire
   */
  private init(): void {
    this.bindMobileMenuEvents();
    this.bindThemeEvents();
    this.bindDropdownEvents();
    this.bindKeyboardEvents();
  }

  /**
   * Gestion du menu mobile
   */
  private bindMobileMenuEvents(): void {
    // Toggle du menu mobile
    this.mobileMenuToggle?.addEventListener('click', () => {
      this.toggleMobileMenu();
    }, { signal: this.abortController.signal });

    // Fermer le menu en cliquant sur l'overlay
    this.mobileOverlay?.addEventListener('click', (e) => {
      if (e.target === this.mobileOverlay) {
        this.closeMobileMenu();
      }
    }, { signal: this.abortController.signal });

    // Fermer le menu quand on clique sur un lien de navigation
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      }, { signal: this.abortController.signal });
    });
  }

  /**
   * Gestion des événements clavier
   */
  private bindKeyboardEvents(): void {
    document.addEventListener('keydown', (e) => {
      // Fermer le menu avec Escape
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
      
      // Gestion du focus trap dans le menu mobile
      if (this.isMenuOpen && e.key === 'Tab') {
        this.handleTabNavigation(e);
      }
    }, { signal: this.abortController.signal });
  }

  /**
   * Gestion du focus trap dans le menu mobile
   */
  private handleTabNavigation(e: KeyboardEvent): void {
    if (!this.mobileMenuContent) return;

    const focusableElements = this.mobileMenuContent.querySelectorAll(
      'a, button, input, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  /**
   * Synchronisation des contrôles de thème
   */
  private bindThemeEvents(): void {
    const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement;
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle') as HTMLInputElement;
    
    if (themeToggle && mobileThemeToggle) {
      // Synchroniser desktop -> mobile
      themeToggle.addEventListener('change', () => {
        mobileThemeToggle.checked = themeToggle.checked;
      }, { signal: this.abortController.signal });
      
      // Synchroniser mobile -> desktop
      mobileThemeToggle.addEventListener('change', () => {
        themeToggle.checked = mobileThemeToggle.checked;
      }, { signal: this.abortController.signal });

      // S'assurer que les deux sont synchronisés au démarrage
      this.syncThemeToggles(themeToggle, mobileThemeToggle);
    }
  }

  /**
   * Synchronise l'état initial des toggles de thème
   */
  private syncThemeToggles(desktop: HTMLInputElement, mobile: HTMLInputElement): void {
    // Récupérer le thème actuel depuis DaisyUI
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const isDark = currentTheme === 'dark';
    
    desktop.checked = isDark;
    mobile.checked = isDark;
  }

  /**
   * Gestion des dropdowns
   */
  private bindDropdownEvents(): void {
    // Fermer tous les dropdowns quand on clique ailleurs
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown')) {
        this.closeAllDropdowns();
      }
    }, { signal: this.abortController.signal });

    // Gestion ARIA des boutons dropdown
    const dropdownButtons = document.querySelectorAll('.dropdown > button[aria-controls]');
    dropdownButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        // Fermer tous les autres dropdowns
        this.closeAllDropdowns();
        
        // Toggle celui-ci
        button.setAttribute('aria-expanded', (!isExpanded).toString());
      }, { signal: this.abortController.signal });
    });
  }

  /**
   * Toggle du menu mobile
   */
  private toggleMobileMenu(): void {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  /**
   * Ouvre le menu mobile
   */
  private openMobileMenu(): void {
    this.isMenuOpen = true;
    
    // Mise à jour des classes et attributs
    this.mobileMenuToggle?.classList.add('menu-open');
    this.mobileMenuToggle?.setAttribute('aria-expanded', 'true');
    
    // Animation de l'overlay et du menu
    this.mobileOverlay?.classList.add('pointer-events-auto', 'opacity-100');
    this.mobileMenuContent?.classList.add('translate-x-0');
    this.mobileMenuContent?.classList.remove('translate-x-full');
    
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
    
    // Focus sur le premier élément du menu
    setTimeout(() => {
      const firstLink = this.mobileMenuContent?.querySelector('a, button') as HTMLElement;
      firstLink?.focus();
    }, 100);
  }

  /**
   * Ferme le menu mobile
   */
  private closeMobileMenu(): void {
    this.isMenuOpen = false;
    
    // Mise à jour des classes et attributs
    this.mobileMenuToggle?.classList.remove('menu-open');
    this.mobileMenuToggle?.setAttribute('aria-expanded', 'false');
    
    // Animation de fermeture
    this.mobileOverlay?.classList.remove('pointer-events-auto', 'opacity-100');
    this.mobileMenuContent?.classList.remove('translate-x-0');
    this.mobileMenuContent?.classList.add('translate-x-full');
    
    // Restaurer le scroll du body
    document.body.style.overflow = '';
    
    // Remettre le focus sur le bouton hamburger
    this.mobileMenuToggle?.focus();
  }

  /**
   * Ferme tous les dropdowns ouverts
   */
  private closeAllDropdowns(): void {
    const dropdowns = document.querySelectorAll('.dropdown [aria-expanded="true"]');
    dropdowns.forEach(dropdown => {
      dropdown.setAttribute('aria-expanded', 'false');
    });
  }

  /**
   * Nettoie les ressources
   */
  public destroy(): void {
    // AbortController va automatiquement nettoyer tous les event listeners
    this.abortController.abort();
    
    // Restaurer l'état initial si nécessaire
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    }
    
    document.body.style.overflow = '';
  }
}

/**
 * Auto-initialisation du gestionnaire
 */
let headerManager: SimplifiedHeaderManager | null = null;

function initializeHeader(): void {
  // Éviter les initialisations multiples
  if (headerManager) {
    headerManager.destroy();
  }
  
  headerManager = new SimplifiedHeaderManager();
}

// Initialisation automatique
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHeader);
  } else {
    // DOM déjà chargé
    initializeHeader();
  }
}

// Nettoyage à la fermeture de la page
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    headerManager?.destroy();
  });
}

// Export pour usage avancé si nécessaire
export { SimplifiedHeaderManager };

/**
 * Notes sur les changements par rapport à l'ancien système :
 * 
 * ✅ SUPPRIMÉ :
 * - LanguageManager (remplacé par l'i18n d'Astro)
 * - LanguageControls et classes complexes
 * - Gestion manuelle des traductions côté client
 * - localStorage pour la langue (géré par le routage Astro)
 * - Classes Value Objects pour Language
 * 
 * ✅ CONSERVÉ ET SIMPLIFIÉ :
 * - Gestion du menu mobile
 * - Synchronisation des contrôles de thème
 * - Gestion des dropdowns
 * - Support de l'accessibilité (ARIA, keyboard navigation)
 * - AbortController pour un nettoyage propre
 * 
 * ✅ AMÉLIORÉ :
 * - Focus trap dans le menu mobile
 * - Synchronisation automatique des thèmes
 * - Gestion d'erreur plus robuste
 * - Code plus lisible et maintenable
 */